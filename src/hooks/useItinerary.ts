import { useState, useEffect, useCallback } from "react";
import type { Day, CheckItem, Stop } from "../types";
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
          // First run — seed the DB with initial itinerary data
          await Promise.all([
            db.seedDays(INITIAL_DAYS),
            db.seedChecks(INITIAL_CHECKS),
          ]);
          setDays(INITIAL_DAYS);
          setChecks(INITIAL_CHECKS);
        } else {
          setDays(daysData);
          setChecks(checksData);
        }

        if (dayIdxStr !== null) setDayIdx(parseInt(dayIdxStr, 10));
        if (editingStr !== null) setEditing(editingStr === "true");
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : String(e));
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

  // ── Day / stop mutations ────────────────────────────────────────────────────

  const updateCurrentDay = useCallback(
    (patch: Partial<Day>) => {
      if (!currentDay) return;
      const updated = { ...currentDay, ...patch };
      setDays((prev) => prev.map((d) => (d.id === currentDay.id ? updated : d)));
      void db.updateDay(currentDay.id, patch);
    },
    [currentDay]
  );

  const updateStop = useCallback(
    (stopIdx: number, newStop: Stop) => {
      if (!currentDay) return;
      const newStops = currentDay.stops.map((s, i) =>
        i === stopIdx ? newStop : s
      );
      updateCurrentDay({ stops: newStops });
    },
    [currentDay, updateCurrentDay]
  );

  const deleteStop = useCallback(
    (stopIdx: number) => {
      if (!currentDay) return;
      if (!confirm("Delete this stop?")) return;
      updateCurrentDay({
        stops: currentDay.stops.filter((_, i) => i !== stopIdx),
      });
    },
    [currentDay, updateCurrentDay]
  );

  const addStop = useCallback(() => {
    if (!currentDay) return;
    const newStop: Stop = {
      id: uid(),
      time: "TBD",
      type: "sight",
      name: "New stop",
      detail: "",
      chips: [],
      swaps: [],
    };
    updateCurrentDay({ stops: [...currentDay.stops, newStop] });
  }, [currentDay, updateCurrentDay]);

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
    updateStop,
    deleteStop,
    addStop,
    toggleCheck,
    addCheck,
    removeCheck,
    resetAll,
  };
}
