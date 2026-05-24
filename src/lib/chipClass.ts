export type ChipVariant = "chip-must" | "chip-df" | "chip-cash" | "chip-rez" | "chip-default";

export function chipClass(text: string): ChipVariant {
  const t = text.toLowerCase();
  if (t.includes("must")) return "chip-must";
  if (t.includes("df") || t.includes("dairy")) return "chip-df";
  if (t.includes("cash")) return "chip-cash";
  if (
    t.includes("reserve") ||
    t.includes("book") ||
    t.includes("buy tix") ||
    t.includes("ahead") ||
    t.includes("nightcap")
  )
    return "chip-rez";
  return "chip-default";
}
