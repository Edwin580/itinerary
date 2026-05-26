import { supabase } from "./supabase";
import type { Day, CheckItem, StopEvent } from "../types";

// ── Days ──────────────────────────────────────────────────────────────────────

export async function getDays(): Promise<Day[]> {
  const { data, error } = await supabase
    .from("days")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  // Normalize JSONB columns: Supabase may return null for rows that pre-date
  // the slots/events migration. Ensure every Day has valid arrays/objects.
  return (data ?? []).map((row) => ({
    ...row,
    slots: Array.isArray(row.slots) ? row.slots : [],
    events: (row.events && typeof row.events === "object" && !Array.isArray(row.events))
      ? row.events
      : {},
  })) as Day[];
}

export async function updateDay(
  id: string,
  patch: Partial<Omit<Day, "id" | "sort_order">>
): Promise<void> {
  console.log("[db] updateDay — patching day:", id, "fields:", Object.keys(patch));
  const { error } = await supabase.from("days").update(patch).eq("id", id);
  if (error) {
    console.error("[db] updateDay — FAILED:", error.code, error.message, "| patch keys:", Object.keys(patch));
    throw error;
  }
  console.log("[db] updateDay — success ✓");
}

/** Delete all rows then insert fresh — used for first-run seed and reset. */
export async function seedDays(days: Day[]): Promise<void> {
  // Supabase requires a filter; neq against an impossible value deletes all rows.
  await supabase.from("days").delete().neq("id", "");
  const { error } = await supabase.from("days").insert(days);
  if (error) throw error;
}

// ── Check items ───────────────────────────────────────────────────────────────

export async function getChecks(): Promise<CheckItem[]> {
  const { data, error } = await supabase
    .from("check_items")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as CheckItem[];
}

export async function updateCheck(
  id: string,
  patch: Partial<CheckItem>
): Promise<void> {
  const { error } = await supabase
    .from("check_items")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function insertCheck(item: CheckItem): Promise<void> {
  const { error } = await supabase.from("check_items").insert(item);
  if (error) throw error;
}

export async function deleteCheck(id: string): Promise<void> {
  const { error } = await supabase.from("check_items").delete().eq("id", id);
  if (error) throw error;
}

export async function seedChecks(checks: CheckItem[]): Promise<void> {
  await supabase.from("check_items").delete().neq("id", "");
  const { error } = await supabase.from("check_items").insert(checks);
  if (error) throw error;
}

// ── Bank state (global staging pool, single row id = 1) ──────────────────────

/**
 * Returns the current bank events, or null if the row doesn't exist yet
 * (table not created, or first run before seeding).  Errors from a missing
 * table are swallowed and returned as null so they don't break the load path.
 */
export async function getBankEvents(): Promise<StopEvent[] | null> {
  console.log("[db] getBankEvents — fetching from bank_state…");
  const { data, error } = await supabase
    .from("bank_state")
    .select("events")
    .eq("id", 1)
    .maybeSingle(); // null instead of error when no row found
  if (error) {
    // Table not created yet (migration not run) — treat as not seeded.
    console.warn("[db] getBankEvents — error (table missing or auth issue):", error.code, error.message);
    return null;
  }
  const result = data !== null ? (data.events as StopEvent[]) : null;
  console.log(
    "[db] getBankEvents →",
    result === null ? "null (no row found — will bootstrap)" : `${result.length} event(s) loaded`
  );
  return result;
}

/** Upsert the full bank array into the single bank_state row. */
export async function saveBankEvents(events: StopEvent[]): Promise<void> {
  console.log(
    `[db] saveBankEvents — saving ${events.length} event(s):`,
    events.map((e) => e.id)
  );
  const { error } = await supabase
    .from("bank_state")
    .upsert({ id: 1, events }, { onConflict: "id" });
  if (error) {
    console.error("[db] saveBankEvents — FAILED:", error.code, error.message);
    throw error;
  }
  console.log("[db] saveBankEvents — success ✓");
}

// ── App state (day index, editing mode) ───────────────────────────────────────

export async function getAppState(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

export async function setAppState(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("app_state")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}
