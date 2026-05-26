import { useState, useEffect, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Day, CheckItem, TimeSlot, StopEvent } from "../types";
import * as db from "../lib/db";
import { INITIAL_DAYS, INITIAL_CHECKS } from "../lib/initialData";
import { OPTIONS_BANK } from "../data/optionsBank";

const uid = () => Math.random().toString(36).slice(2, 9);

export function useItinerary() {
  const [days, setDays] = useState<Day[]>([]);
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [bankEvents, setBankEvents] = useState<StopEvent[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayActive, setTodayActive] = useState<number | null>(null);

  // Detect which trip day is "today" (active only during May 26–30 2026)
  useEffect(() => {
    const now = new Date();
    const start = new Date("2026-05-26T00:00:00");
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
        const [daysData, checksData, bankData, dayIdxStr, editingStr] = await Promise.all([
          db.getDays(),
          db.getChecks(),
          db.getBankEvents(), // null = table missing or row not seeded yet
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
          // INITIAL_DAYS never contains OPTIONS_BANK IDs — full bank is available.
          // Do NOT call saveBankEvents here — load() must be read-only.
          // The bank_state row is created on the first moveToItinerary/returnToBank call.
          setBankEvents(OPTIONS_BANK);
        } else {
          setDays(daysData);
          setChecks(checksData);

          if (bankData !== null) {
            // Trust the database for existing entries, but also merge in any NEW
            // OPTIONS_BANK entries whose IDs aren't tracked yet (not in the saved
            // bank and not live in any day). This handles the case where new entries
            // are added to optionsBank.ts after the bank_state row was first written.
            const trackedIds = new Set([
              ...bankData.map((e) => e.id),
              ...daysData.flatMap((d) =>
                Object.values(d.events ?? {}).map((e) => (e as StopEvent).id)
              ),
            ]);
            const newEntries = OPTIONS_BANK.filter((e) => !trackedIds.has(e.id));
            const mergedBank = newEntries.length > 0 ? [...bankData, ...newEntries] : bankData;
            if (newEntries.length > 0) {
              // Persist the merged bank so future loads don't need to re-merge.
              void db.saveBankEvents(mergedBank);
            }
            setBankEvents(mergedBank);
          } else {
            // bank_state row not found: table newly created or row missing.
            // Set correct in-memory state but do NOT auto-save here — that caused
            // the bank to be overwritten with defaults on every refresh when the
            // bank_state table/row was absent. The row is created on the first
            // explicit moveToItinerary() or returnToBank() call instead.
            const activeIds = new Set(
              daysData.flatMap((d) =>
                Object.values(d.events ?? {}).map((e) => (e as StopEvent).id)
              )
            );
            const initialBank = OPTIONS_BANK.filter((e) => !activeIds.has(e.id));
            setBankEvents(initialBank);
          }
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

  // ── Bank ↔ Itinerary transfers ──────────────────────────────────────────────

  /**
   * Move an event from the staging bank into the current day's itinerary.
   * Removes it from bankEvents (optimistic), appends a new TBD slot, and
   * persists both slots + events to Supabase via updateCurrentDay.
   * The event keeps its original ID — this is a move, not a copy.
   */
  const moveToItinerary = useCallback(
    (eventId: string) => {
      if (!currentDay) return;
      const event = bankEvents.find((e) => e.id === eventId);
      if (!event) return;

      // Remove from bank and persist the new bank state
      const newBank = bankEvents.filter((e) => e.id !== eventId);
      setBankEvents(newBank);
      void db.saveBankEvents(newBank);

      // Append a new slot with a blank time; keep event's original ID
      const slotId = uid();
      const newSlot: TimeSlot = { id: slotId, time: "TBD" };
      const slots = currentDay.slots ?? [];
      const events = currentDay.events ?? {};
      updateCurrentDay({
        slots: [...slots, newSlot],
        events: { ...events, [slotId]: event },
      });
    },
    [currentDay, bankEvents, updateCurrentDay]
  );

  /**
   * Return an active itinerary event back to the staging bank.
   * Finds the slot holding that event ID, removes it from the current day,
   * persists the change to Supabase, then appends the event to bankEvents.
   */
  const returnToBank = useCallback(
    (eventId: string) => {
      if (!currentDay) return;
      const slots = currentDay.slots ?? [];
      const events = currentDay.events ?? {};

      // Locate the slot that owns this event
      const slot = slots.find((s) => events[s.id]?.id === eventId);
      if (!slot) return;
      const event = events[slot.id];
      if (!event) return;

      // Remove the slot + event from the day and persist
      const newEvents = { ...events };
      delete newEvents[slot.id];
      updateCurrentDay({
        slots: slots.filter((s) => s.id !== slot.id),
        events: newEvents,
      });

      // Return the event to the bank and persist.
      // NOTE: bankEvents must be in the dep array (below) — without it this
      // callback closes over the stale initial [] and overwrites the bank with
      // only the single returned event, corrupting Supabase on every call.
      const newBank = [...bankEvents, event];
      setBankEvents(newBank);
      void db.saveBankEvents(newBank);
    },
    [currentDay, bankEvents, updateCurrentDay]
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
    setBankEvents(OPTIONS_BANK);
    void db.saveBankEvents(OPTIONS_BANK);
    setDayIdx(0);
    setEditing(false);
    void db.setAppState("day_idx", "0");
    void db.setAppState("editing", "false");
  }, []);

  return {
    days,
    checks,
    bankEvents,
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
    // bank ↔ itinerary transfers
    moveToItinerary,
    returnToBank,
    // check mutations
    toggleCheck,
    addCheck,
    removeCheck,
    resetAll,
  };
}
