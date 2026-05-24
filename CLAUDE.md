# NYC Itinerary

A single-page React + TypeScript app: a 5-day NYC trip itinerary (May 26–30, 2026)
for Edwin & Ayushi. Built with Vite. Editable in-browser with state persisted to
localStorage.

## Stack

- React 18 + TypeScript
- Vite (dev server + build)
- No CSS framework — styles live in a single template string in `Itinerary.tsx`
- No backend — all data is in `INITIAL_DAYS` / `INITIAL_CHECKS` constants, with
  user edits saved to localStorage

## Project structure

- `src/Itinerary.tsx` — the entire app: types, data, components, styles
- `src/main.tsx` — React entry point
- `index.html` — HTML shell

## Conventions

- Keep everything in `Itinerary.tsx` unless a file grows past ~1000 lines — it's a
  small project and the single-file layout is intentional.
- Itinerary data is typed: `Day` → `Stop[]` → each stop has `chips: string[]` and
  `swaps: Swap[]`.
- Chips auto-style by keyword (see the `chipClass` function): "must", "df"/"dairy",
  "cash", "reserve"/"book"/"nightcap" each map to a CSS class. Add new chip styles
  there + a matching `.chip.X` CSS rule.
- The `localStorage` keys are versioned (`nyc_days_v3`, etc). **Bump the version
  suffix whenever you change `INITIAL_DAYS` or `INITIAL_CHECKS`**, otherwise stale
  saved data shadows the new defaults.
- Dairy-free trip — food stops should note DF options.

## Commands

- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm run lint` — typecheck only (no emit)

## When making changes

Run `npm run lint` after edits to catch type errors before committing.
