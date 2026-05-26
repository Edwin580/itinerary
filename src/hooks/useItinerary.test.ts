/**
 * useItinerary.test.ts — integration tests for the itinerary hook
 *
 * Key scenarios tested:
 *  1. Load path is strictly read-only  (saveBankEvents never fires on load)
 *  2. returnToBank preserves ALL existing bank events (stale-closure regression)
 *  3. moveToItinerary removes event from bank, adds slot+event to current day
 *  4. Bootstrap logic when bank_state row is absent
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Day, StopEvent } from "../types";

// ── Mock db module (must come before importing the hook) ───────────────────────
vi.mock("../lib/db", () => ({
  getDays:        vi.fn(),
  getChecks:      vi.fn(),
  getBankEvents:  vi.fn(),
  getAppState:    vi.fn(),
  setAppState:    vi.fn().mockResolvedValue(undefined),
  updateDay:      vi.fn().mockResolvedValue(undefined),
  seedDays:       vi.fn().mockResolvedValue(undefined),
  seedChecks:     vi.fn().mockResolvedValue(undefined),
  saveBankEvents: vi.fn().mockResolvedValue(undefined),
  updateCheck:    vi.fn().mockResolvedValue(undefined),
  insertCheck:    vi.fn().mockResolvedValue(undefined),
  deleteCheck:    vi.fn().mockResolvedValue(undefined),
}));

// ── Minimal fixtures for INITIAL_DAYS and OPTIONS_BANK ────────────────────────
vi.mock("../lib/initialData", () => ({
  INITIAL_DAYS: [
    {
      id: "day-seed", sort_order: 0, day: "Day 1", date: "May 26",
      title: "Seed", subtitle: "seed", blurb: "seed blurb",
      slots: [{ id: "slot-seed", time: "9:00 AM" }],
      events: {
        "slot-seed": {
          id: "evt-seed", type: "sight", name: "Seeded Park",
          detail: "", chips: [], swaps: [],
        },
      },
    },
  ] as Day[],
  INITIAL_CHECKS: [],
}));

vi.mock("../data/optionsBank", () => ({
  OPTIONS_BANK: [
    { id: "opt-1", type: "food",  name: "Joe Coffee", detail: "", chips: [], swaps: [] },
    { id: "opt-2", type: "sight", name: "High Line",  detail: "", chips: [], swaps: [] },
    { id: "opt-3", type: "food",  name: "Via Carota", detail: "", chips: [], swaps: [] },
  ] as StopEvent[],
}));

import { useItinerary } from "./useItinerary";
import * as db from "../lib/db";

// ── Typed helpers ──────────────────────────────────────────────────────────────

const mockGetDays       = vi.mocked(db.getDays);
const mockGetChecks     = vi.mocked(db.getChecks);
const mockGetBankEvents = vi.mocked(db.getBankEvents);
const mockGetAppState   = vi.mocked(db.getAppState);
const mockSaveBankEvents = vi.mocked(db.saveBankEvents);
const mockUpdateDay     = vi.mocked(db.updateDay);
const mockSeedDays      = vi.mocked(db.seedDays);

// ── Shared test data ───────────────────────────────────────────────────────────

/** A fully-formed day with one slot and one event */
const makeDay = (overrides: Partial<Day> = {}): Day => ({
  id: "day-1",
  sort_order: 0,
  day: "Day 1",
  date: "May 26",
  title: "Arrivals",
  subtitle: "& Brooklyn",
  blurb: "Test day blurb",
  slots: [{ id: "slot-A", time: "9:00 AM" }],
  events: {
    "slot-A": {
      id: "evt-A",
      type: "sight",
      name: "Central Park",
      detail: "",
      chips: [],
      swaps: [],
    },
  },
  ...overrides,
});

const bankEvents: StopEvent[] = [
  { id: "bank-1", type: "food",  name: "Museum Café",  detail: "", chips: [], swaps: [] },
  { id: "bank-2", type: "sight", name: "Brooklyn Br.", detail: "", chips: [], swaps: [] },
];

/** Sets all db mocks to "normal loaded state" defaults */
function setupLoadedState(opts: {
  days?: Day[];
  bankData?: StopEvent[] | null;
} = {}) {
  mockGetDays.mockResolvedValue(opts.days ?? [makeDay()]);
  mockGetChecks.mockResolvedValue([]);
  mockGetBankEvents.mockResolvedValue(opts.bankData !== undefined ? opts.bankData : bankEvents);
  mockGetAppState.mockResolvedValue(null);
}

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// ── Load path — read-only guarantee ───────────────────────────────────────────

describe("load path — read-only (saveBankEvents must never fire on load)", () => {
  it("does NOT call saveBankEvents when days exist and bankData is not null", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSaveBankEvents).not.toHaveBeenCalled();
  });

  it("does NOT call saveBankEvents when days exist and bankData is null (bootstrap path)", async () => {
    setupLoadedState({ bankData: null });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSaveBankEvents).not.toHaveBeenCalled();
  });

  it("does NOT call saveBankEvents when days table is empty (first-run seed path)", async () => {
    mockGetDays.mockResolvedValue([]);
    mockGetChecks.mockResolvedValue([]);
    mockGetBankEvents.mockResolvedValue(null);
    mockGetAppState.mockResolvedValue(null);

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSaveBankEvents).not.toHaveBeenCalled();
  });

  it("seeds days and checks (but not bank) on first run", async () => {
    mockGetDays.mockResolvedValue([]);
    mockGetChecks.mockResolvedValue([]);
    mockGetBankEvents.mockResolvedValue(null);
    mockGetAppState.mockResolvedValue(null);

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSeedDays).toHaveBeenCalledOnce();
    expect(mockSaveBankEvents).not.toHaveBeenCalled();
  });

  it("sets bankEvents from DB when bankData is not null", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bankEvents).toEqual(bankEvents);
  });

  it("bootstraps bankEvents from OPTIONS_BANK (minus active IDs) when bankData is null", async () => {
    // Day has evt-A in the itinerary; opt-1, opt-2, opt-3 are all in OPTIONS_BANK
    setupLoadedState({ bankData: null });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // evt-A is in the itinerary, not OPTIONS_BANK — so all 3 OPTIONS_BANK items appear
    expect(result.current.bankEvents).toHaveLength(3);
    expect(result.current.bankEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(["opt-1", "opt-2", "opt-3"])
    );
  });

  it("filters out active itinerary IDs from the bootstrap bank", async () => {
    // Day already contains opt-1 in the itinerary (moved there before this load)
    const dayWithOpt1 = makeDay({
      slots: [{ id: "slot-A", time: "9:00 AM" }],
      events: {
        "slot-A": { id: "opt-1", type: "food", name: "Joe Coffee", detail: "", chips: [], swaps: [] },
      },
    });
    setupLoadedState({ days: [dayWithOpt1], bankData: null });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // opt-1 is in the itinerary, so only opt-2 and opt-3 should be in the bank
    expect(result.current.bankEvents).toHaveLength(2);
    expect(result.current.bankEvents.map((e) => e.id)).not.toContain("opt-1");
  });

  it("sets error state and empty days when the initial fetch throws", async () => {
    mockGetDays.mockRejectedValue(new Error("Network error"));
    mockGetChecks.mockResolvedValue([]);
    mockGetBankEvents.mockResolvedValue(null);
    mockGetAppState.mockResolvedValue(null);

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network error");
    expect(result.current.days).toEqual([]);
  });
});

// ── returnToBank ───────────────────────────────────────────────────────────────

describe("returnToBank", () => {
  it("removes the event's slot from currentDay.slots", async () => {
    setupLoadedState();   // day has slot-A / evt-A; bank has bank-1, bank-2

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.returnToBank("evt-A"); });

    await waitFor(() => expect(result.current.currentDay?.slots).toHaveLength(0));
  });

  it("removes the event from currentDay.events", async () => {
    setupLoadedState();

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.returnToBank("evt-A"); });

    await waitFor(() => {
      expect(result.current.currentDay?.events).not.toHaveProperty("slot-A");
    });
  });

  it("adds the returned event to bankEvents", async () => {
    setupLoadedState();   // bank starts with 2 items

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.returnToBank("evt-A"); });

    await waitFor(() => expect(result.current.bankEvents).toHaveLength(3));
    expect(result.current.bankEvents.map((e) => e.id)).toContain("evt-A");
  });

  it("preserves ALL existing bank events — not just the returned one (stale-closure regression)", async () => {
    // This is the critical regression test.
    // Before the fix, returnToBank closed over the stale initial bankEvents=[]
    // and saved only [returnedEvent], overwriting the 2 existing bank items.
    setupLoadedState({ bankData: bankEvents });  // bank has bank-1, bank-2

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Confirm bank loaded correctly
    expect(result.current.bankEvents).toHaveLength(2);

    act(() => { result.current.returnToBank("evt-A"); });

    await waitFor(() => expect(result.current.bankEvents).toHaveLength(3));

    // saveBankEvents must receive ALL 3 events, not just [evt-A]
    expect(mockSaveBankEvents).toHaveBeenCalledOnce();
    const savedBank = mockSaveBankEvents.mock.calls[0][0] as StopEvent[];
    expect(savedBank).toHaveLength(3);
    expect(savedBank.map((e) => e.id)).toEqual(
      expect.arrayContaining(["bank-1", "bank-2", "evt-A"])
    );
  });

  it("calls updateDay to remove the slot+event from the day in Supabase", async () => {
    setupLoadedState();

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.returnToBank("evt-A"); });

    await waitFor(() => expect(mockUpdateDay).toHaveBeenCalled());
    const [dayId, patch] = mockUpdateDay.mock.calls[0];
    expect(dayId).toBe("day-1");
    // slots should be empty, events should not contain the removed event
    expect((patch as Partial<Day>).slots).toHaveLength(0);
    expect((patch as Partial<Day>).events).not.toHaveProperty("slot-A");
  });

  it("does nothing when the event ID is not found in any slot", async () => {
    setupLoadedState();

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.returnToBank("does-not-exist"); });

    // State should be unchanged
    expect(result.current.currentDay?.slots).toHaveLength(1);
    expect(mockSaveBankEvents).not.toHaveBeenCalled();
    expect(mockUpdateDay).not.toHaveBeenCalled();
  });

  it("handles multiple successive returnToBank calls correctly (no stale closure on repeat)", async () => {
    // Two events in the itinerary; bank starts empty
    const dayWithTwo = makeDay({
      slots: [
        { id: "slot-A", time: "9:00 AM" },
        { id: "slot-B", time: "11:00 AM" },
      ],
      events: {
        "slot-A": { id: "evt-A", type: "sight", name: "Park",   detail: "", chips: [], swaps: [] },
        "slot-B": { id: "evt-B", type: "food",  name: "Bistro", detail: "", chips: [], swaps: [] },
      },
    });
    setupLoadedState({ days: [dayWithTwo], bankData: [] }); // bank is empty initially

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Return first event
    act(() => { result.current.returnToBank("evt-A"); });
    await waitFor(() => expect(result.current.bankEvents).toHaveLength(1));

    // Return second event — if stale closure bug existed, bank would be [evt-B] not [evt-A, evt-B]
    act(() => { result.current.returnToBank("evt-B"); });
    await waitFor(() => expect(result.current.bankEvents).toHaveLength(2));

    expect(result.current.bankEvents.map((e) => e.id)).toEqual(
      expect.arrayContaining(["evt-A", "evt-B"])
    );

    // Second call should have saved both events
    const calls = mockSaveBankEvents.mock.calls;
    const lastSaveCall = calls[calls.length - 1][0] as StopEvent[];
    expect(lastSaveCall).toHaveLength(2);
  });
});

// ── moveToItinerary ────────────────────────────────────────────────────────────

describe("moveToItinerary", () => {
  it("removes the event from bankEvents", async () => {
    setupLoadedState({ bankData: bankEvents }); // bank has bank-1, bank-2

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("bank-1"); });

    await waitFor(() => expect(result.current.bankEvents).toHaveLength(1));
    expect(result.current.bankEvents[0].id).toBe("bank-2");
  });

  it("adds a new TBD slot to currentDay.slots", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const slotsBefore = result.current.currentDay!.slots.length;

    act(() => { result.current.moveToItinerary("bank-1"); });

    await waitFor(() =>
      expect(result.current.currentDay!.slots).toHaveLength(slotsBefore + 1)
    );

    const slotsArr = result.current.currentDay!.slots;
    const newSlot = slotsArr[slotsArr.length - 1];
    expect(newSlot.time).toBe("TBD");
  });

  it("places the moved event into currentDay.events at the new slot", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("bank-1"); });

    await waitFor(() =>
      Object.values(result.current.currentDay!.events).some((e) => e.id === "bank-1")
    );

    const placedEvent = Object.values(result.current.currentDay!.events).find(
      (e) => e.id === "bank-1"
    );
    expect(placedEvent?.name).toBe("Museum Café");
  });

  it("calls saveBankEvents with the bank MINUS the moved event", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("bank-1"); });

    await waitFor(() => expect(mockSaveBankEvents).toHaveBeenCalled());

    const savedBank = mockSaveBankEvents.mock.calls[0][0] as StopEvent[];
    expect(savedBank).toHaveLength(1);
    expect(savedBank[0].id).toBe("bank-2");
    expect(savedBank.map((e) => e.id)).not.toContain("bank-1");
  });

  it("calls updateDay to persist the new slot and event to Supabase", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("bank-1"); });

    await waitFor(() => expect(mockUpdateDay).toHaveBeenCalled());

    const [dayId, patch] = mockUpdateDay.mock.calls[0];
    expect(dayId).toBe("day-1");
    const p = patch as Partial<Day>;
    // New slot should have been appended
    expect(p.slots!.length).toBeGreaterThan(0);
    // The moved event should exist in the events map
    const hasMovedEvent = Object.values(p.events ?? {}).some((e) => e.id === "bank-1");
    expect(hasMovedEvent).toBe(true);
  });

  it("does nothing when the event ID is not in bankEvents", async () => {
    setupLoadedState({ bankData: bankEvents });

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("does-not-exist"); });

    expect(mockSaveBankEvents).not.toHaveBeenCalled();
    expect(mockUpdateDay).not.toHaveBeenCalled();
    expect(result.current.bankEvents).toHaveLength(2);
  });

  it("does nothing when there is no current day", async () => {
    // Load with empty days so currentDay is null
    mockGetDays.mockResolvedValue([]);
    mockGetChecks.mockResolvedValue([]);
    mockGetBankEvents.mockResolvedValue(bankEvents);
    mockGetAppState.mockResolvedValue(null);

    const { result } = renderHook(() => useItinerary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.moveToItinerary("bank-1"); });

    expect(mockSaveBankEvents).not.toHaveBeenCalled();
  });
});
