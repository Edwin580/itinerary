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

  // ── Drinks & Nightlife ───────────────────────────────────────────────────────

  {
    id: "opt-find-drink-options",
    type: "sight",
    name: "Scout Drink Options",
    detail:
      "Placeholder — find a good cocktail bar, wine bar, or sake spot to bookmark for evenings during the trip. Ask locals or check Resy/Eater for current picks.",
    chips: ["TBD"],
    swaps: [],
  },

  {
    id: "opt-nbetween-bar",
    type: "sight",
    name: "Nbetween Bar",
    detail:
      "Neighbourhood cocktail bar — good for an evening wind-down drink after a full day of sightseeing.",
    chips: ["NIGHTCAP", "~1 HR"],
    swaps: [],
  },

  {
    id: "opt-tomi-jazz",
    type: "sight",
    name: "Tomi Jazz NYC",
    detail:
      "Intimate Midtown jazz club on E 53rd St with nightly live sets and Japanese-influenced small plates. No cover for bar seating; table cover applies for the full show experience.",
    link: "https://tomijazz.com",
    chips: ["NIGHTCAP", "~1.5 HRS"],
    swaps: [],
  },

  // ── Coffee & Quick Bites ─────────────────────────────────────────────────────

  {
    id: "opt-coffee-tbd",
    type: "food",
    name: "Coffee Stop (TBD)",
    detail:
      "Pin a good specialty coffee shop near wherever you're starting the day — think Cafe Grumpy, Partners Coffee, or Prodigal. Replace with a specific spot once pinned.",
    chips: ["~15 MIN", "DF FRIENDLY"],
    swaps: [],
  },

  {
    id: "opt-bagel",
    type: "food",
    name: "NYC Bagel Run",
    detail:
      "Classic everything bagel with lox and capers (ask for no cream cheese) or just toasted with olive oil. Try Ess-a-Bagel, Russ & Daughters, or a corner bodega for the full experience.",
    chips: ["~20 MIN", "DF FRIENDLY"],
    swaps: [],
  },

  // ── Korean ───────────────────────────────────────────────────────────────────

  {
    id: "opt-kbbq-tbd",
    type: "food",
    name: "KBBQ (TBD)",
    detail:
      "Korean BBQ dinner — Koreatown on W 32nd St has a full block of solid options. Great for a big, celebratory group meal with grilled meats and banchan.",
    chips: ["~2 HRS", "RESERVE"],
    swaps: [],
  },

  {
    id: "opt-korean-ayce-330-7th",
    type: "food",
    name: "Korean AYCE @ 330 7th Ave",
    detail:
      "All-you-can-eat Korean BBQ at 330 7th Ave — a solid Koreatown spot for unlimited grilled meats, pork belly, and banchan. Great value for a full meal.",
    chips: ["RESERVE", "~2 HRS"],
    swaps: [],
  },

  {
    id: "opt-korean-ayce-32nd",
    type: "food",
    name: "All-You-Can-Eat Korean @ 39 W 32nd St",
    detail:
      "KBBQ all-you-can-eat on floor 2 of 39 W 32nd St, deep in the heart of Koreatown. Grilled meats at the table, full banchan spread, and Korean pancakes — a classic K-town feast.",
    chips: ["RESERVE", "~2 HRS"],
    swaps: [],
  },

  {
    id: "opt-dubu-haus",
    type: "food",
    name: "Dubu Haus",
    detail:
      "Korean tofu hot pot restaurant. Sundubu jjigae (soft tofu stew) served bubbling in stone bowls — warm, hearty, and filling. Great lighter alternative to KBBQ.",
    chips: ["~1 HR", "DF FRIENDLY"],
    swaps: [],
  },

  // ── Chinese & Dumplings ──────────────────────────────────────────────────────

  {
    id: "opt-chinatown-food-crawl",
    type: "food",
    name: "Chinatown Food Crawl",
    detail:
      "Self-guided eating tour through Manhattan Chinatown. Hit Nom Wah Tea Parlor for dim sum, Xi'an Famous Foods for spicy noodles, Hing Won for roast duck, and finish with a pineapple bun from a bakery on Mott St.",
    chips: ["CASH ONLY", "~2 HRS", "DF FRIENDLY"],
    swaps: [],
  },

  {
    id: "opt-shu-jiao-fu-zhou",
    type: "food",
    name: "Shu Jiao Fu Zhou",
    detail:
      "No-frills Chinatown institution famous for hand-folded dumplings and Fujianese noodle soups. The pork-and-chive dumplings and the beef noodle soup are the moves. Cash only, tiny tables.",
    chips: ["CASH ONLY", "MUST", "~45 MIN"],
    swaps: [],
  },

  {
    id: "opt-shanghai-garden",
    type: "food",
    name: "Shanghai Garden",
    detail:
      "Cantonese and Shanghai-style Chinese restaurant. Known for soup dumplings (xiao long bao), scallion pancakes, and classic rice dishes.",
    chips: ["~1 HR"],
    swaps: [],
  },

  // ── Japanese ─────────────────────────────────────────────────────────────────

  {
    id: "opt-cocoron",
    type: "food",
    name: "Cocoron",
    detail:
      "Tiny, beloved Japanese soba restaurant on Delancey St in the Lower East Side. Hand-cut buckwheat noodles in broth — try the duck soba or the cold zaru with dipping sauce. No reservations, cash only.",
    link: "https://cocoronnyc.com",
    chips: ["CASH ONLY", "DF FRIENDLY", "~1 HR"],
    swaps: [],
  },

  // ── Hot Pot ──────────────────────────────────────────────────────────────────

  {
    id: "opt-hot-pot-chongqing",
    type: "food",
    name: "Hot Pot — Chongqing Lao Zao",
    detail:
      "Sichuan-style hot pot restaurant. Numbing mala broth, thinly sliced meats, tofu skins, enoki mushrooms, and fish balls — a serious, sweat-inducing hot pot experience. Bring an appetite and come hungry.",
    chips: ["RESERVE", "~2 HRS"],
    swaps: [],
  },

  // ── Other Food ───────────────────────────────────────────────────────────────

  {
    id: "opt-buntopia",
    type: "food",
    name: "Buntopia",
    detail:
      "NYC bánh mì and Vietnamese sandwich spot. Quick, affordable, and flavour-packed — great for a grab-and-go lunch between sightseeing stops.",
    chips: ["DF FRIENDLY", "~30 MIN"],
    swaps: [],
  },

  {
    id: "opt-nepali-food",
    type: "food",
    name: "Nepali Food (TBD)",
    detail:
      "Momos (steamed dumplings), dal bhat, and thukpa noodle soup. Jackson Heights in Queens has excellent Nepali options — confirm specific restaurant before going.",
    chips: ["DF FRIENDLY", "~1 HR"],
    swaps: [],
  },

  // ── Queens ───────────────────────────────────────────────────────────────────

  {
    id: "opt-para-market-queens",
    type: "food",
    name: "Para Market (Queens) — Mango Sticky Rice",
    detail:
      "Thai market in Queens serving fresh mango sticky rice made to order. Warm coconut cream poured over glutinous rice with ripe mango — a perfect afternoon snack.",
    chips: ["DF FRIENDLY", "~30 MIN"],
    swaps: [],
  },

  {
    id: "opt-bangkok-avenue-queens",
    type: "food",
    name: "Bangkok Avenue (Queens) — Mango Sticky Rice",
    detail:
      "Queens Thai spot with excellent mango sticky rice and classic Thai street dishes. Good stop if you're already out in Flushing or Jackson Heights.",
    chips: ["DF FRIENDLY", "~45 MIN"],
    swaps: [],
  },

  // ── Sights & Activities ──────────────────────────────────────────────────────

  {
    id: "opt-little-island",
    type: "sight",
    name: "Little Island",
    detail:
      "Free public park floating on the Hudson River at Pier 55 in the West Village. Tulip-shaped concrete piles, wild plantings, and open-air performance spaces with sweeping Hudson views.",
    link: "https://littleisland.org",
    chips: ["FREE", "~45 MIN", "DF FRIENDLY"],
    swaps: [],
  },

  {
    id: "opt-museums-tbd",
    type: "sight",
    name: "Museum Day (TBD)",
    detail:
      "Open slot for a museum visit. Options: The Met (pay-what-you-wish), MoMA, Whitney Museum of American Art, New Museum on the Lower East Side, or the Brooklyn Museum.",
    chips: ["RESERVE", "~2 HRS"],
    swaps: [],
  },

  {
    id: "opt-photobooth-les",
    type: "sight",
    name: "Photobooth — Something Soft (LES)",
    detail:
      "Vintage-style analogue photo booth at Something Soft on the Lower East Side. Fun keepsake from the trip — strips come out warm and slightly dreamy.",
    chips: ["~20 MIN"],
    swaps: [],
  },

  {
    id: "opt-gatsby-broadway",
    type: "sight",
    name: "Free Broadway: Great Gatsby (May 28, 12–1 pm)",
    detail:
      "Free outdoor live performance from the Broadway production of The Great Gatsby — Thursday May 28, 12:00–1:00 pm. Check the venue location closer to the date (likely Times Square or Bryant Park area).",
    chips: ["FREE", "MUST", "1 HR"],
    swaps: [],
  },

  {
    id: "opt-bedkraft",
    type: "sight",
    name: "Bedkraft",
    detail: "NYC stop — confirm exact location and what to see/do before visiting.",
    chips: ["~30 MIN"],
    swaps: [],
  },
];
