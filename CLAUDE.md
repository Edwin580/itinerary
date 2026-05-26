# NYC Itinerary — Project Context & Rules

5-day NYC trip planner (May 26–30, 2026) for Edwin & Ayushi.
Single-page React app, persisted to Supabase, no external UI lib.

---

## 1. Stack

- **React 18** + **TypeScript** (strict mode — no `any`, no implicit returns)
- **Vite 6** dev server + build
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js`; all tokens live in `src/index.css @theme {}`
- **Supabase** (Postgres + PostgREST) via `@supabase/supabase-js` — RLS disabled, anon key used directly
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`) — drag-and-drop for future slot reordering and bank-to-itinerary transfers
- **Vitest** + `@testing-library/react` + jsdom — test runner, configured in `vite.config.ts`

Commands:
- `npm run dev` — Vite dev server
- `npm run build` — tsc + Vite production build
- `npm run lint` — `tsc --noEmit` only
- `npm test` — `vitest run`

---

## 2. Architecture Rules

### File layout
```
src/
  types/index.ts          — Day, TimeSlot, StopEvent, CheckItem, StopType, Swap
  lib/
    supabase.ts           — createClient (throws if env vars missing)
    db.ts                 — typed async CRUD helpers; all Supabase calls live here
    initialData.ts        — INITIAL_DAYS + INITIAL_CHECKS seed data
    chipClass.ts          — chip label string → CSS class name
  hooks/
    useItinerary.ts       — single source of truth for ALL app state
  components/             — presentational only; no direct Supabase calls
  data/
    optionsBank.ts        — OPTIONS_BANK: StopEvent[] (static seed list)
```

### Dual-list state model
The app has two parallel event lists managed by `useItinerary`:

| State | Type | What it is |
|---|---|---|
| `days[].events` | `Record<slotId, StopEvent>` | Live itinerary — events pinned to time slots |
| `bankEvents` | `StopEvent[]` | Options bank — staging pool not yet on the schedule |

- `moveToItinerary(eventId)` — pulls an event from `bankEvents` into the current day's next open slot. Updates both lists + persists both to Supabase.
- `returnToBank(slotId)` — removes an event from a day slot and appends it back to `bankEvents`. Updates both lists + persists both.
- An event lives in exactly one place at a time — never duplicated across lists.

### Slot vs Event decoupling
- `TimeSlot { id, time }` — fixed grid anchor. `Day.slots: TimeSlot[]` is ordered and **never reordered**.
- `StopEvent` — content payload. Lives in `Day.events: Record<slotId, StopEvent>`.
- To swap two events: mutate `events[slotA]` and `events[slotB]` only. Slots stay untouched.
- `swapEvents(slotIdA, slotIdB)` is exported from `useItinerary` for drag-and-drop wiring.

### Editing mode
- `editing: boolean` in `useItinerary` — persisted to `app_state` table.
- When `editing === true`: show inline `<Editable>` fields, add-stop buttons, delete controls, return-to-bank buttons on StopCards.
- When `editing === false`: read-only view. No mutation controls visible.

### Load path is strictly read-only
- The load `useEffect` in `useItinerary` **only reads** from Supabase and sets React state.
- It **never calls** `saveBankEvents`, `updateDay`, or any write function.
- Exception: when new `OPTIONS_BANK` entries (new IDs not yet tracked) are detected after the bank_state row exists, they are merged in and saved — this is the only write permitted in load, because it only fires when there's genuinely new data to sync.
- All other writes happen exclusively inside explicit user-triggered callbacks (`moveToItinerary`, `returnToBank`, `addStop`, `deleteStop`, `resetAll`, etc.).

---

## 3. Database Rules — Read Before Every DB Change

### Tables
| Table | Key columns | Notes |
|---|---|---|
| `days` | `id text PK`, `sort_order int`, `slots jsonb`, `events jsonb` | `slots` = `TimeSlot[]`, `events` = `Record<slotId, StopEvent>` |
| `check_items` | `id text PK`, `sort_order int`, `completed bool`, `description text` | Column is `description`, not `desc` |
| `app_state` | `key text PK`, `value text` | Stores `day_idx` and `editing` as strings |
| `bank_state` | `id int PK` (always `1`), `events jsonb` | Single-row table; upsert with `onConflict: "id"` |

### Hard rules
- **Always snake_case for Supabase payloads.** Column names are snake_case (`sort_order`, `bank_events`). camelCase keys silently fail — PostgREST ignores unknown columns and returns 400 or inserts nothing.
- **Never auto-save from a load `useEffect`.** Unconditional `saveBankEvents` calls inside the initial load caused a race condition that overwrote user bank state on every refresh. Don't reintroduce this.
- **Verify schema columns before writing a upsert payload.** The 400 "column does not exist" error is silent in the UI — always cross-check column names against the schema before adding a new field to an insert/update.
- **`getBankEvents` returns `null`, never throws.** A missing `bank_state` table or row is a valid first-run state — the load path depends on null being returned gracefully.
- **`maybeSingle()`** instead of `.single()` when a row may not exist (bank_state lookup). `.single()` throws on no rows.
- **Normalize JSONB on read.** `getDays()` guards against null slots/events from pre-migration rows: `slots: Array.isArray(row.slots) ? row.slots : []`.
- If schema changes are needed, update `supabase/schema.sql` AND `supabase/schema_update.sql` (migration SQL), then run `NOTIFY pgrst, 'reload schema'` to flush the PostgREST schema cache immediately.

### Known bugs — do not reintroduce
- **Stale closure in `returnToBank`**: `bankEvents` was missing from the `useCallback` dep array. Without it, the callback captures a stale `bankEvents = []` and overwrites the bank with only the returned event. Always include all state variables that a callback reads in its dep array.
- **Auto-save overwrite**: calling `saveBankEvents(OPTIONS_BANK)` inside the load effect (in the `daysData.length === 0` branch) caused the default seed to overwrite any existing bank state on every page load when the DB appeared empty.

---

## 4. Design System

### Tokens (`src/index.css @theme`)
| Token | Value | Usage |
|---|---|---|
| `--color-cream` | `#f4ede0` | Page background |
| `--color-cream-2` | `#ebe1cf` | Subtle surface tint |
| `--color-ink` | `#1a1612` | Primary text |
| `--color-ink-soft` | `#3d342a` | Secondary text |
| `--color-red` | `#d63a2f` | Food badge, cash chip, accents |
| `--color-mustard` | `#e0a13a` | Travel badge, reserve chip |
| `--color-teal` | `#2d6363` | Sight badge, DF chip |

Fonts:
- `font-serif` → Fraunces (body, stop names)
- `font-mono` → JetBrains Mono (labels, chips, metadata)
- `font-display` → Instrument Serif (large display text)

Body background: two subtle radial gradients (red top-left, mustard bottom-right) over cream — keep this intact.

### Glassmorphism — active and dragged cards
When a stop card is being dragged or is in an "active" state, apply:
- `backdrop-blur` (e.g. `backdrop-blur-sm` or `backdrop-blur-md`)
- Subtle background transparency (`bg-white/60` or `bg-cream/70`)
- Elevated shadow (`shadow-lg` or a custom `drop-shadow`)
- Slight border highlight (`border-ink/20` → `border-ink/40`)

This is the required aesthetic for drag-and-drop interaction states. Do not use flat opaque cards for active/dragged states.

### Chip system
Chips are rendered via `chipClass(label: string)` in `src/lib/chipClass.ts`:
| Label match | CSS class | Color |
|---|---|---|
| `"must"` | `chip-must` | Ink background, cream text |
| `"df"`, `"dairy"` | `chip-df` | Teal tint |
| `"cash"` | `chip-cash` | Red tint |
| `"reserve"`, `"book"`, `"buy tix"`, `"nightcap"` | `chip-rez` | Mustard tint |
| anything else | `chip-default` | Cream-2, ink-soft |

To add a new chip variant: add the keyword match in `chipClass.ts` + add the `.chip-X` rule in `@layer components` in `index.css`.

### Component-level CSS
Use `@layer components` classes (`editable-input`, `chip-*`) when:
- You need `font: inherit` or `letter-spacing: inherit` (Tailwind can't express these relative to a parent)
- The utility composition would be repeated across 3+ elements

### Layout rules
- Max content width: constrained per component (no global `max-w` on body)
- DayNav is sticky; OptionsBank slides in from the right as a fixed panel (z-40)
- Keep components under ~200 lines — split if they grow past that

---

## 5. Git Workflow

- **Branch for every feature.** Never commit directly to `main` for feature work. Use `git checkout -b feature/name`.
- **Atomic commits.** One logical change per commit. If you're tempted to write "and also" in the message, it's two commits.
- **Conventional commit messages:**
  ```
  feat: add drag-and-drop to OptionsBank
  fix: stale closure in returnToBank dep array
  refactor: extract SlotGrid from DayView
  chore: update OPTIONS_BANK with 23 new entries
  test: add useItinerary hook tests for bank persistence
  ```
- **Always run `npm run lint` before committing.** No TypeScript errors go to remote.
- **Merge with `--no-ff`** to keep branch history readable on main.
- **Push the feature branch first**, confirm it's clean, then merge to main.

---

## 6. Communication Style

- Talk to me directly. Short sentences. No preamble.
- Don't say: *"Certainly! I'd be happy to help you with that. Let me take a look at the codebase and analyze the situation before formulating a comprehensive solution."*
- Do say: *"Found it — the stale closure is on line 248. Adding `bankEvents` to the dep array fixes it."*
- When something is wrong, say what's wrong and what the fix is. Don't hedge.
- When you don't know something, say so — don't fabricate plausible-sounding answers.
- Use markdown tables and code blocks freely — they render well in this terminal.
- Match the energy of the message. Short question = short answer. Big feature request = structured plan.
