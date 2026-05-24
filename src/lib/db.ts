import { supabase } from "./supabase";
import type { Day, CheckItem } from "../types";

// ── Days ──────────────────────────────────────────────────────────────────────

export async function getDays(): Promise<Day[]> {
  const { data, error } = await supabase
    .from("days")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Day[];
}

export async function updateDay(
  id: string,
  patch: Partial<Omit<Day, "id" | "sort_order">>
): Promise<void> {
  const { error } = await supabase.from("days").update(patch).eq("id", id);
  if (error) throw error;
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
