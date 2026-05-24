import { useState, useEffect, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Day, CheckItem, TimeSlot, StopEvent } from "../types";
import * as db from "../lib/db";
import { INITIAL_DAYS, INITIAL_CHECKS } from "../lib/initialData";

const uid = () => Math.random().toString(36).slice(2, 9);

export function useItinerary() {
  const [days, setDays] = useState<Day[]>([]);
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayActive, setTodayActive] = useState<number | null>(null);

  // Detect which trip day is "today" (active only during May 26–30 2026)
  useEffect(() => {
    const now = new Date();
    const start = new Date("2026-05-26");
    const end = new Date("2026-05-30T23:59");
    if (now >= start && now <= end) {
      setTodayActive(
        Math.floor((now.getTime() - start.getTime()) / 86400000)
      );
    }
  }, []);

  // Load from Supabase; auto-seed on first run (empty DB)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [daysData, checksData, dayIdxStr, editingStr] = await Promise.all([
          db.getDays(),
          db.getChecks(),
          db.getAppState("day_idx"),
          db.getAppState("editing"),
        ]);

        if (cancelled) return;

        if (daysData.length === 0) {
          // Empty DB — attempt to seed. If the schema is missing the `slots`/`events`
          // columns (PGRST204), seeding will fail. We catch that separately so the
          // app still renders with in-memory defaults instead of hard-crashing.
          // → Run the migration SQL in supabase/schema.sql to fix persistence.
          try {
            await Promise.all([
              db.seedDays(INITIAL_DAYS),
              db.seedChecks(INITIAL_CHECKS),
            ]);
          } catch {
            // Seed failed (likely schema mismatch). Fall through — setDays below
            // still runs so the UI is usable; changes just won't persist to DB.
          }
          // Always set local state, even if the DB seed failed.
          setDays(INITIAL_DAYS);
          setChecks(INITIAL_CHECKS);
        } else {
          setDays(daysData);
          setChecks(checksData);
        }

        if (dayIdxStr !== null) setDayIdx(parseInt(dayIdxStr, 10));
        if (editingStr !== null) setEditing(editingStr === "true");
      } catch (e) {
        // The initial fetch itself failed (network error, auth error, etc.).
        // Explicitly clear days so currentDay is null and DayView never renders.
        if (!cancelled) {
          setDays([]);
          setChecks([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const currentDay = days[dayIdx] ?? null;

  // ── Navigation ─────────────────────────────────────────────────────────────

  const showDay = useCallback((i: number) => {
    setDayIdx(i);
    void db.setAppState("day_idx", String(i));
  }, []);

  const toggleEditing = useCallback(() => {
    setEditing((prev) => {
      const next = !prev;
      void db.setAppState("editing", String(next));
      return next;
    });
  }, []);

  // ── Day-level mutations ─────────────────────────────────────────────────────

  const updateCurrentDay = useCallback(
    (patch: Partial<Day>) => {
      if (!currentDay) return;
      const updated = { ...currentDay, ...patch };
      setDays((prev) => prev.map((d) => (d.id === currentDay.id ? updated : d)));
      void db.updateDay(currentDay.id, patch);
    },
    [currentDay]
  );

  // ── Slot mutations (time grid — position only) ──────────────────────────────

  /** Update a slot's time string. The grid position (id) never changes. */
  const updateSlot = useCallback(
    (slotId: string, patch: Partial<TimeSlot>) => {
      if (!currentDay) return;
      const newSlots = currentDay.slots.map((s) =>
        s.id === slotId ? { ...s, ...patch } : s
      );
      updateCurrentDay({ slots: newSlots });
    },
    [currentDay, updateCurrentDay]
  );

  // ── Event mutations (content payload — moves independently of slots) ────────

  /** Replace the event payload sitting at a given slot. */
  const updateEvent = useCallback(
    (slotId: string, event: StopEvent) => {
      if (!currentDay) return;
      updateCurrentDay({ events: { ...currentDay.events, [slotId]: event } });
    },
    [currentDay, updateCurrentDay]
  );

  /**
   * Swap the event payloads between two slots.
   * The slots themselves (time grid) stay locked — only the content moves.
   * Not wired to UI yet; exported so drag-and-drop can call it directly.
   */
  const swapEvents = useCallback(
    (slotIdA: string, slotIdB: string) => {
      if (!currentDay) return;
      const { events } = currentDay;
      updateCurrentDay({
        events: {
          ...events,
          [slotIdA]: events[slotIdB],
          [slotIdB]: events[slotIdA],
        },
      });
    },
    [currentDay, updateCurrentDay]
  );

  /**
   * Insert a new slot + event pair at the given index in the slot array.
   * Pass `currentDay.slots.length` to append at the end.
   */
  const insertStop = useCallback(
    (atIndex: number) => {
      if (!currentDay) return;
      const slotId = uid();
      const newSlot: TimeSlot = { id: slotId, time: "TBD" };
      const newEvent: StopEvent = {
        id: uid(),
        type: "sight",
        name: "New stop",
        detail: "",
        chips: [],
        swaps: [],
      };
      const newSlots = [
        ...currentDay.slots.slice(0, atIndex),
        newSlot,
        ...currentDay.slots.slice(atIndex),
      ];
      updateCurrentDay({
        slots: newSlots,
        events: { ...currentDay.events, [slotId]: newEvent },
      });
    },
    [currentDay, updateCurrentDay]
  );

  /**
   * Reorder events by moving the event at oldIndex to newIndex.
   * The slots (time grid) stay fixed; only the mapping of events to slots changes.
   */
  const reorderEvents = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!currentDay || oldIndex === newIndex) return;
      const { slots, events } = currentDay;

      // Build ordered list of event IDs (one per slot)
      const eventIds = slots.map((s) => events[s.id]?.id).filter((id): id is string => !!id);
      const newEventIds = arrayMove(eventIds, oldIndex, newIndex);

      // Index events by their own id for quick lookup
      const eventById: Record<string, StopEvent> = {};
      Object.values(events).forEach((ev) => { eventById[ev.id] = ev; });

      // Reassign: slot[i] gets the event that ended up at position i
      const newEvents: Record<string, StopEvent> = {};
      slots.forEach((slot, i) => {
        const ev = eventById[newEventIds[i]];
        if (ev) newEvents[slot.id] = ev;
      });

      updateCurrentDay({ events: newEvents });
    },
    [currentDay, updateCurrentDay]
  );

  /** Remove a slot and its event from the current day. */
  const deleteStop = useCallback(
    (slotId: string) => {
      if (!currentDay) return;
      if (!confirm("Delete this stop?")) return;
      const newEvents = { ...currentDay.events };
      delete newEvents[slotId];
      updateCurrentDay({
        slots: currentDay.slots.filter((s) => s.id !== slotId),
        events: newEvents,
      });
    },
    [currentDay, updateCurrentDay]
  );

  // ── Check mutations ─────────────────────────────────────────────────────────

  const toggleCheck = useCallback((id: string) => {
    setChecks((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c
      );
      const item = updated.find((c) => c.id === id);
      if (item) void db.updateCheck(id, { completed: item.completed });
      return updated;
    });
  }, []);

  const addCheck = useCallback(
    (title: string, description: string) => {
      const newItem: CheckItem = {
        id: uid(),
        sort_order: checks.length,
        title,
        description,
        completed: false,
      };
      setChecks((prev) => [...prev, newItem]);
      void db.insertCheck(newItem);
    },
    [checks.length]
  );

  const removeCheck = useCallback((id: string) => {
    setChecks((prev) => prev.filter((c) => c.id !== id));
    void db.deleteCheck(id);
  }, []);

  // ── Reset ───────────────────────────────────────────────────────────────────

  const resetAll = useCallback(async () => {
    if (!confirm("Reset all edits to defaults? This cannot be undone.")) return;
    await Promise.all([
      db.seedDays(INITIAL_DAYS),
      db.seedChecks(INITIAL_CHECKS),
    ]);
    setDays(INITIAL_DAYS);
    setChecks(INITIAL_CHECKS);
    setDayIdx(0);
    setEditing(false);
    void db.setAppState("day_idx", "0");
    void db.setAppState("editing", "false");
  }, []);

  return {
    days,
    checks,
    dayIdx,
    editing,
    loading,
    error,
    currentDay,
    todayActive,
    showDay,
    toggleEditing,
    updateCurrentDay,
    // slot/event mutations
    updateSlot,
    updateEvent,
    swapEvents,
    reorderEvents,
    insertStop,
    deleteStop,
    // check mutations
    toggleCheck,
    addCheck,
    removeCheck,
    resetAll,
  };
}
