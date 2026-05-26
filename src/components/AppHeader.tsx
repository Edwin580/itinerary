import React from "react";

export const AppHeader: React.FC = () => (
  <header className="border-b border-ink pb-5 mb-6">
    {/* Kicker */}
    <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-soft flex items-center gap-1.5 mb-4">
      <span className="inline-block w-1.5 h-1.5 bg-red rounded-full animate-pulse-dot" />
      YONK/NYC TRIP · 5 DAYS
    </div>

    {/* Main title */}
    <h1 className="font-display font-normal text-[clamp(40px,11vw,64px)] leading-[0.95] tracking-[-0.02em] m-0 mb-2">
      Edwin{" "}
      <span className="italic text-red font-serif font-light">&</span>{" "}
      Ayushi
      <span className="block italic text-[0.55em] text-ink-soft mt-1 font-display">
        in the Yonk/NYC.
      </span>
    </h1>

    {/* Trip meta */}
    <div className="font-mono text-[11px] text-ink-soft mt-3 leading-relaxed">
      <b className="text-ink font-semibold">MAY 26 → 30, 2026</b>
      <br />
      Base: bnb · 135 S 14th Ave, Mt Vernon
      <br />
      Flights: LGA (in Tue ~2pm · out Sat ~7:30pm)
      <br />
      <span className="text-red">●</span> Dairy-free
    </div>
  </header>
);
