/**
 * Options Bank
 *
 * A curated list of pre-vetted NYC stops that can be slotted into any day.
 * Each entry is a plain StopEvent — same shape as a live itinerary event —
 * but without a time slot or a day assignment.  The UI will let you drag/drop
 * (or tap) one of these into an open slot on any day's schedule.
 *
 * Chip conventions (see src/lib/chipClass.ts):
 *   "MUST"          → chip-must  (bold/ink)
 *   "DF FRIENDLY"   → chip-df    (teal, dairy-free)
 *   "CASH ONLY"     → chip-cash  (red)
 *   "RESERVE"       → chip-rez   (mustard, booking needed)
 *   anything else   → chip-default
 */

import type { StopEvent } from "../types";

export const OPTIONS_BANK: StopEvent[] = [
  // ── Food ────────────────────────────────────────────────────────────────────

  {
    id: "opt-joe-coffee",
    type: "food",
    name: "Joe Coffee",
    detail:
      "Neighbourhood specialty roaster with a no-fuss espresso bar. The cortado is excellent and the space is calm enough to linger over a pastry before the day starts.",
    link: "https://joecoffeecompany.com",
    chips: ["DF FRIENDLY", "~30 MIN"],
    swaps: [],
  },

  {
    id: "opt-superiority-burger",
    type: "food",
    name: "Superiority Burger",
    detail:
      "Tiny East Village counter serving creative vegetarian burgers and sides. Everything on the menu is plant-based — great for a low-key lunch that won't slow you down.",
    link: "https://www.superiorityburger.com",
    chips: ["DF FRIENDLY", "CASH ONLY", "~45 MIN"],
    swaps: [],
  },

  {
    id: "opt-via-carota",
    type: "food",
    name: "Via Carota",
    detail:
      "Beloved West Village trattoria with a rotating seasonal menu. The insalata verde and cacio e pepe are West Village staples — go at an off-peak hour or expect a wait.",
    link: "https://www.viacarota.com",
    chips: ["RESERVE", "~1.5 HRS"],
    swaps: [],
  },

  // ── Sights ──────────────────────────────────────────────────────────────────

  {
    id: "opt-frick-collection",
    type: "sight",
    name: "The Frick Collection",
    detail:
      "Intimate fine-art museum in a Gilded Age mansion on the Upper East Side. Vermeer, Rembrandt, and El Greco in mansion-scale rooms — never feels crowded, even on weekends.",
    link: "https://www.frick.org",
    chips: ["RESERVE", "~1.5 HRS"],
    swaps: [],
  },

  {
    id: "opt-high-line",
    type: "sight",
    name: "The High Line",
    detail:
      "Elevated park built on a former freight rail line, running from Gansevoort St to 34th St through Chelsea and Hudson Yards. Best in the late afternoon when the light hits the Hudson.",
    link: "https://www.thehighline.org",
    chips: ["FREE", "~1 HR", "DF FRIENDLY"],
    swaps: [],
  },

  {
    id: "opt-tenement-museum",
    type: "sight",
    name: "Tenement Museum",
    detail:
      "Guided tours through preserved Lower East Side tenement apartments that tell the story of immigrant families from the 1860s to 1930s. Book the 'Under One Roof' or 'Hard Times' tour.",
    link: "https://www.tenement.org",
    chips: ["RESERVE", "MUST", "~1.5 HRS"],
    swaps: [],
  },
];
