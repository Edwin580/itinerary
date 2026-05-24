export type StopType = "food" | "sight" | "travel";

export interface Swap {
  id: string;
  name: string;
  desc: string;
}

// ── Time grid ──────────────────────────────────────────────────────────────────
// A slot is a fixed anchor in the day schedule. Its position never changes —
// only the event payload sitting inside it moves (e.g. when items are swapped).
export interface TimeSlot {
  id: string;
  time: string;
}

// ── Event payload ──────────────────────────────────────────────────────────────
// All content fields, decoupled from when they happen.
// An event lives in a slot via Day.events[slotId].
export interface StopEvent {
  id: string;
  type: StopType;
  name: string;
  detail: string;
  link?: string;
  chips: string[];
  swaps: Swap[];
}

// ── Day ────────────────────────────────────────────────────────────────────────
export interface Day {
  id: string;
  sort_order: number;
  day: string;
  date: string;
  title: string;
  subtitle: string;
  blurb: string;
  /** Ordered time grid. Always rendered in this order; never reordered. */
  slots: TimeSlot[];
  /** slotId → event payload. Reassign values here to "move" events between slots. */
  events: Record<string, StopEvent>;
}

export interface CheckItem {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  completed: boolean;
}
