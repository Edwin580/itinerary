import React from "react";
import type { Day } from "../types";

interface TodayPillProps {
  days: Day[];
  dayIdx: number;
  todayActive: number | null;
  onShowDay: (i: number) => void;
}

export const TodayPill: React.FC<TodayPillProps> = ({
  days,
  dayIdx,
  todayActive,
  onShowDay,
}) => {
  if (todayActive === null || todayActive === dayIdx) return null;

  return (
    <button
      onClick={() => onShowDay(todayActive)}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-ink text-cream px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] uppercase z-20 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex items-center gap-2 cursor-pointer border-none"
    >
      <span className="w-1.5 h-1.5 bg-red rounded-full" />
      Today · {days[todayActive]?.day}
    </button>
  );
};
