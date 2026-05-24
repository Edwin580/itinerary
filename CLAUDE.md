# NYC Itinerary

A single-page React + TypeScript app: a 5-day NYC trip itinerary (May 26–30, 2026)
for Edwin & Ayushi. Built with Vite, styled with Tailwind CSS v4, persisted to Supabase.

## Stack

- React 18 + TypeScript (strict)
- Vite 6 + `@tailwindcss/vite` (Tailwind v4 — no config file, plugin-based)
- Supabase (Postgres) for persistence via `@supabase/supabase-js`
- No additional UI library

## Project structure

```
src/
  vite-env.d.ts          — Vite/ImportMeta type declarations
  index.css              — Tailwind @import, @theme tokens, @layer components
  main.tsx               — React entry point
  App.tsx                — Root component; orchestrates layout + passes props down
  types/
    index.ts             — Day, Stop, Swap, CheckItem, StopType
  lib/
    supabase.ts          — createClient (reads VITE_SUPABASE_URL / ANON_KEY)
    db.ts                — typed CRUD helpers (getDays, updateDay, seedDays, …)
    initialData.ts       — INITIAL_DAYS + INITIAL_CHECKS seed constants
    chipClass.ts         — chip label → CSS class mapping (chip-must, chip-df, …)
  hooks/
    useItinerary.ts      — all app state: loads from Supabase, auto-seeds if empty,
                           exposes mutations (updateStop, toggleCheck, resetAll, …)
  components/
    Editable.tsx         — inline-editable text (input/textarea ↔ static element)
    AppHeader.tsx        — site header (title, kicker, edit button)
    DayNav.tsx           — sticky horizontal day tabs
    DayView.tsx          — day article (header + stop list)
    StopCard.tsx         — individual stop (badge, name, chips, SwapPanel)
    SwapPanel.tsx        — collapsible swap alternatives per stop
    Checklist.tsx        — pre-trip checklist section
    TodayPill.tsx        — fixed "Today · {day}" pill (visible during trip dates)
supabase/
  schema.sql             — CREATE TABLE + RLS config; run once in Supabase SQL editor
.env.local.example       — env var template; copy → .env.local and fill in credentials
```

## Tailwind conventions

- Design tokens live in `src/index.css` under `@theme { … }`. Custom colors
  (`--color-cream`, `--color-ink`, `--color-red`, etc.) and font families
  (`--font-serif`, `--font-mono`, `--font-display`) become Tailwind utilities
  automatically (`bg-cream`, `text-ink`, `font-display`, …).
- Opacity modifiers work on custom colors: `border-ink/15`, `bg-red/12`, etc.
- Custom animations (`animate-pulse-dot`, `animate-fade-in`) are declared in
  `@theme` and `@keyframes` in `index.css`.
- Component-level CSS classes (`chip-must`, `chip-df`, `editable-input`, …) live
  in `@layer components` — use these when utility composition would be too verbose
  or when you need `font: inherit` / `letter-spacing: inherit` (which Tailwind can't express).
- Google Fonts are loaded via `<link>` in `index.html` (not @import in CSS).

## Data model — slots vs events

The schedule uses a **decoupled grid model**:

| Concept | Type | Stored in | What it is |
|---|---|---|---|
| `TimeSlot` | `{ id, time }` | `Day.slots: TimeSlot[]` | A fixed grid anchor. Order never changes. |
| `StopEvent` | `{ id, type, name, detail, … }` | `Day.events: Record<slotId, StopEvent>` | The content payload sitting at a slot. |

**Why:** when events are swapped (future drag-and-drop), only the `events` map is
mutated — the keys stay the same but the values switch. `slots` is never reordered.

```
// Swapping event A with event B:
events[slotA] = eventB
events[slotB] = eventA   // slots themselves are untouched
```

`useItinerary` exposes `swapEvents(slotIdA, slotIdB)` for this; drag-and-drop can
call it directly when wired up.

Mutations:
- `updateSlot(slotId, patch)` — edit a slot's `time` string only
- `updateEvent(slotId, event)` — replace the payload at a slot
- `swapEvents(slotIdA, slotIdB)` — swap payloads between two slots (exported, not yet wired to UI)
- `addStop()` — appends a new slot+event pair
- `deleteStop(slotId)` — removes slot from array AND its key from events map

## Database schema

Three Supabase tables:
- **`days`** — `id text PK`, `sort_order int`, `day`, `date`, `title`, `subtitle`,
  `blurb`, `slots jsonb` (TimeSlot[]), `events jsonb` (Record<slotId, StopEvent>).
- **`check_items`** — `id text PK`, `sort_order int`, `title`, `description`,
  `completed bool`.
- **`app_state`** — `key text PK`, `value text`. Stores `day_idx` and `editing`.
- RLS is disabled — this is a private personal app using the anon key directly.

**Auto-seed:** on first load, if `days` table is empty, `useItinerary` inserts
`INITIAL_DAYS` + `INITIAL_CHECKS` automatically. The "↺ RESET ALL" button
re-seeds too.

**Migration:** if you ran an older schema with `stops jsonb`, drop and recreate
`days` — see the note at the bottom of `supabase/schema.sql`.

## Other data conventions

- `CheckItem.description` (not `desc`) — matches the DB column name.
- `Day.sort_order` / `CheckItem.sort_order` — integer, 0-indexed. Used by
  `.order("sort_order")` queries. Increment when adding new rows.
- Chips auto-style via `chipClass()` in `src/lib/chipClass.ts`: "must", "df"/"dairy",
  "cash", "reserve"/"book"/"buy tix"/"nightcap" each map to a CSS class variant.
  Add new variants there + a matching `.chip-X` rule in `index.css @layer components`.
- Dairy-free trip — food stops should note DF options.

## Env setup

```bash
cp .env.local.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from
# Supabase Dashboard → Project Settings → API
```

## Commands

- `npm run dev`   — start Vite dev server
- `npm run build` — typecheck + production build
- `npm run lint`  — typecheck only (tsc --noEmit)

## When making changes

- Run `npm run lint` after edits to catch type errors.
- **No localStorage version keys to bump** — the DB schema owns data versioning.
  If you change the `INITIAL_DAYS` / `INITIAL_CHECKS` shape, update the
  `supabase/schema.sql` accordingly and migrate the live DB.
- Keep components in `src/components/`. If a component grows past ~200 lines,
  split it further.
