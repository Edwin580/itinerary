/**
 * db.test.ts â€” unit tests for the Supabase helper layer
 *
 * Strategy: mock the `supabase` singleton so no real network calls are made.
 * Each function builds the minimal fluent chain its target path exercises.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { StopEvent } from "../types";

// â”€â”€ Mock the Supabase client BEFORE importing db â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
vi.mock("./supabase", () => ({
  supabase: { from: vi.fn() },
}));

import { getBankEvents, saveBankEvents, updateDay, getDays, seedDays } from "./db";
import { supabase } from "./supabase";

const mockFrom = vi.mocked(supabase.from);

// â”€â”€ Silence console output â€” tests inspect calls via spies, not stdout â”€â”€â”€â”€â”€â”€â”€â”€â”€
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// â”€â”€ Shared fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const sampleEvents: StopEvent[] = [
  { id: "evt-1", type: "food",  name: "Joe Coffee",   detail: "Great espresso", chips: ["DF FRIENDLY"], swaps: [] },
  { id: "evt-2", type: "sight", name: "High Line",    detail: "Elevated park",  chips: ["FREE"],        swaps: [] },
  { id: "evt-3", type: "sight", name: "Tenement Mus", detail: "History tour",   chips: ["MUST"],        swaps: [] },
];

// â”€â”€ getBankEvents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("getBankEvents", () => {
  it("returns the events array when the bank_state row exists", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { events: sampleEvents }, error: null });
    const eq     = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select } as unknown as ReturnType<typeof mockFrom>);

    const result = await getBankEvents();

    expect(result).toEqual(sampleEvents);
    expect(mockFrom).toHaveBeenCalledWith("bank_state");
    expect(select).toHaveBeenCalledWith("events");
    expect(eq).toHaveBeenCalledWith("id", 1);
    expect(maybeSingle).toHaveBeenCalledOnce();
  });

  it("returns null when the row does not exist (empty bank_state)", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
    } as unknown as ReturnType<typeof mockFrom>);

    expect(await getBankEvents()).toBeNull();
  });

  it("returns null (does NOT throw) when Supabase returns an error", async () => {
    const dbError = { code: "42P01", message: 'relation "bank_state" does not exist' };
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: dbError });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
    } as unknown as ReturnType<typeof mockFrom>);

    // Must NOT throw â€” the load path depends on this returning null gracefully
    await expect(getBankEvents()).resolves.toBeNull();
  });

  it("logs a warning that includes the error code when Supabase errors", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const dbError = { code: "42P01", message: "table missing" };
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: dbError });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
    } as unknown as ReturnType<typeof mockFrom>);

    await getBankEvents();

    expect(warnSpy).toHaveBeenCalledOnce();
    const [msg, code] = warnSpy.mock.calls[0];
    expect(msg).toContain("[db] getBankEvents");
    expect(code).toBe("42P01");
  });

  it("returns an empty array (not null) when row exists but events column is []", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { events: [] }, error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
    } as unknown as ReturnType<typeof mockFrom>);

    const result = await getBankEvents();
    // [] is not null â€” valid state where all events are in the itinerary
    expect(result).toEqual([]);
    expect(result).not.toBeNull();
  });
});

// â”€â”€ saveBankEvents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("saveBankEvents", () => {
  it("calls upsert with the correct payload structure", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await saveBankEvents(sampleEvents);

    expect(mockFrom).toHaveBeenCalledWith("bank_state");
    expect(upsert).toHaveBeenCalledWith(
      { id: 1, events: sampleEvents },
      { onConflict: "id" }
    );
  });

  it("resolves without throwing on success", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await expect(saveBankEvents(sampleEvents)).resolves.toBeUndefined();
  });

  it("throws the Supabase error when upsert fails", async () => {
    const dbError = { code: "PGRST204", message: "Column not found" };
    const upsert = vi.fn().mockResolvedValue({ error: dbError });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await expect(saveBankEvents(sampleEvents)).rejects.toEqual(dbError);
  });

  it("logs the error (code + message) before rethrowing on failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const dbError = { code: "PGRST204", message: "Column not found" };
    const upsert = vi.fn().mockResolvedValue({ error: dbError });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await expect(saveBankEvents([])).rejects.toBeDefined();

    expect(errorSpy).toHaveBeenCalledOnce();
    const args = errorSpy.mock.calls[0];
    expect(args[0]).toContain("[db] saveBankEvents");
    expect(args[1]).toBe("PGRST204");
    expect(args[2]).toBe("Column not found");
  });

  it("saves an empty array without error (all events moved to itinerary)", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await expect(saveBankEvents([])).resolves.toBeUndefined();
    expect(upsert).toHaveBeenCalledWith({ id: 1, events: [] }, { onConflict: "id" });
  });

  it("logs success after a successful upsert", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert } as unknown as ReturnType<typeof mockFrom>);

    await saveBankEvents(sampleEvents);

    const successLog = logSpy.mock.calls.find(([msg]) =>
      typeof msg === "string" && msg.includes("success")
    );
    expect(successLog).toBeDefined();
  });
});

// â”€â”€ updateDay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("updateDay", () => {
  it("calls update with the patch and eq with the correct id", async () => {
    const eq     = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update } as unknown as ReturnType<typeof mockFrom>);

    const patch = { slots: [], events: {} };
    await updateDay("day-abc", patch);

    expect(mockFrom).toHaveBeenCalledWith("days");
    expect(update).toHaveBeenCalledWith(patch);
    expect(eq).toHaveBeenCalledWith("id", "day-abc");
  });

  it("resolves without throwing on success", async () => {
    const eq     = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update } as unknown as ReturnType<typeof mockFrom>);

    await expect(updateDay("day-abc", { title: "New Title" })).resolves.toBeUndefined();
  });

  it("throws the Supabase error when update fails", async () => {
    const dbError = { code: "42703", message: 'column "slots" does not exist' };
    const eq     = vi.fn().mockResolvedValue({ error: dbError });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update } as unknown as ReturnType<typeof mockFrom>);

    await expect(updateDay("day-abc", { slots: [] })).rejects.toEqual(dbError);
  });

  it("logs the error code, message, and patch keys before rethrowing on failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const dbError  = { code: "42703", message: 'column "events" does not exist' };
    const eq     = vi.fn().mockResolvedValue({ error: dbError });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update } as unknown as ReturnType<typeof mockFrom>);

    await expect(updateDay("day-abc", { events: {} })).rejects.toBeDefined();

    expect(errorSpy).toHaveBeenCalledOnce();
    const args = errorSpy.mock.calls[0];
    expect(args[0]).toContain("[db] updateDay");
    expect(args[1]).toBe("42703");
    expect(args[3]).toContain("patch keys:");
    expect(args[4]).toContain("events");
  });

  it("logs the day id and field names before executing the update", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const eq     = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update } as unknown as ReturnType<typeof mockFrom>);

    await updateDay("day-xyz", { slots: [], events: {} });

    const patchLog = logSpy.mock.calls.find(([msg]) =>
      typeof msg === "string" && msg.includes("[db] updateDay")
    );
    expect(patchLog).toBeDefined();
    expect(patchLog![1]).toBe("day-xyz");
  });
});

// â”€â”€ getDays (normalization) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("getDays â€” JSONB normalization", () => {
  it("normalizes null slots to [] and null events to {}", async () => {
    const rawRow = {
      id: "day-1", sort_order: 0, day: "Day 1", date: "May 26",
      title: "T", subtitle: "s", blurb: "b",
      slots: null, events: null,
    };
    const order = vi.fn().mockResolvedValue({ data: [rawRow], error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ order }),
    } as unknown as ReturnType<typeof mockFrom>);

    const [day] = await getDays();
    expect(day.slots).toEqual([]);
    expect(day.events).toEqual({});
  });

  it("preserves valid slots and events arrays from the database", async () => {
    const slots  = [{ id: "s1", time: "9:00 AM" }];
    const events = { s1: { id: "e1", type: "food", name: "CafÃ©", detail: "", chips: [], swaps: [] } };
    const rawRow = {
      id: "day-1", sort_order: 0, day: "Day 1", date: "May 26",
      title: "T", subtitle: "s", blurb: "b", slots, events,
    };
    const order = vi.fn().mockResolvedValue({ data: [rawRow], error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ order }),
    } as unknown as ReturnType<typeof mockFrom>);

    const [day] = await getDays();
    expect(day.slots).toEqual(slots);
    expect(day.events).toEqual(events);
  });

  it("throws when Supabase returns an error", async () => {
    const dbError = { code: "42P01", message: "table missing" };
    const order   = vi.fn().mockResolvedValue({ data: null, error: dbError });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ order }),
    } as unknown as ReturnType<typeof mockFrom>);

    await expect(getDays()).rejects.toEqual(dbError);
  });
});

// â”€â”€ seedDays â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("seedDays", () => {
  it("deletes all rows then inserts the provided days", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockNeq    = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ neq: mockNeq });
    mockFrom.mockReturnValue({
      delete: mockDelete,
      insert: mockInsert,
    } as unknown as ReturnType<typeof mockFrom>);

    const days = [
      { id: "d1", sort_order: 0, day: "Day 1", date: "May 26", title: "T", subtitle: "s", blurb: "b", slots: [], events: {} },
    ];

    await seedDays(days);

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockNeq).toHaveBeenCalledWith("id", "");
    expect(mockInsert).toHaveBeenCalledWith(days);
  });
});
