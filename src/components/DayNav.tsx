import React from "react";
import type { Day } from "../types";

interface DayNavProps {
  days: Day[];
  dayIdx: number;
  onShowDay: (i: number) => void;
}

export const DayNav: React.FC<DayNavProps> = ({ days, dayIdx, onShowDay }) => (
  <nav className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-5 mb-6 px-5 py-3 sticky top-0 bg-cream z-10 border-b border-ink/15">
    {days.map((d, i) => (
      <button
        key={d.id}
        onClick={() => onShowDay(i)}
        className={[
          "flex-shrink-0 flex flex-col items-center gap-0.5 min-w-[68px]",
          "font-mono text-[10px] tracking-[0.1em] uppercase py-2 px-3",
          "border cursor-pointer transition-all duration-200",
          i === dayIdx
            ? "bg-ink text-cream border-ink"
            : "bg-transparent text-ink border-ink/15 hover:border-ink",
        ].join(" ")}
      >
        <span>{d.day.slice(0, 3).toUpperCase()}</span>
        <span className="font-display text-[18px] tracking-normal normal-case">
          {d.date.split(" ")[1]}
        </span>
      </button>
    ))}
  </nav>
);
