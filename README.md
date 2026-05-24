# NYC Itinerary

A 5-day NYC trip planner (May 26–30, 2026) — React + TypeScript + Vite.
Tap a day to view stops, expand "swaps" for alternatives, check off the pre-trip list.
Edits autosave to your browser's localStorage.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Build

```bash
npm run build      # typecheck + bundle to dist/
npm run preview    # serve the production build locally
```

## Editing the itinerary

All trip data lives in `src/Itinerary.tsx` in the `INITIAL_DAYS` and `INITIAL_CHECKS`
constants. If you edit those defaults, bump the `_v3` suffix on the `LS_*` localStorage
keys so the new data isn't shadowed by previously saved edits.
