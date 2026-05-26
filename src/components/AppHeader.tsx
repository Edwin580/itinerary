import React from "react";

interface AppHeaderProps {
  editing: boolean;
  onToggleEdit: () => void;
  showingOptions: boolean;
  onToggleOptions: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  editing,
  onToggleEdit,
  showingOptions,
  onToggleOptions,
}) => (
  <header className="border-b border-ink pb-5 mb-6">
    {/* Kicker row */}
    <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-soft flex justify-between items-center mb-4">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 bg-red rounded-full animate-pulse-dot" />
        NYC TRIP · 5 DAYS
      </span>

      {/* Right-side controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleOptions}
          className={`font-mono text-[10px] tracking-[0.15em] px-3 py-1.5 border cursor-pointer transition-colors duration-200 ${
            showingOptions
              ? "bg-ink text-cream border-ink"
              : "bg-transparent text-ink-soft border-ink/30 hover:border-ink hover:text-ink"
          }`}
        >
          {showingOptions ? "✕ OPTIONS" : "⊞ OPTIONS"}
        </button>
        <button
          onClick={onToggleEdit}
          className="bg-ink text-cream font-mono text-[10px] tracking-[0.15em] px-3 py-1.5 border-none cursor-pointer transition-colors duration-200 hover:bg-red"
        >
          {editing ? "✓ DONE" : "✎ EDIT"}
        </button>
      </div>
    </div>

    {/* Main title */}
    <h1 className="font-display font-normal text-[clamp(40px,11vw,64px)] leading-[0.95] tracking-[-0.02em] m-0 mb-2">
      Edwin{" "}
      <span className="italic text-red font-serif font-light">&</span>{" "}
      Ayushi
      <span className="block italic text-[0.55em] text-ink-soft mt-1 font-display">
        in the city.
      </span>
    </h1>

    {/* Trip meta */}
    <div className="font-mono text-[11px] text-ink-soft mt-3 leading-relaxed">
      <b className="text-ink font-semibold">MAY 26 → 30, 2026</b>
      <br />
      Base: Cozy Studio · 135 S 14th Ave, Mt Vernon
      <br />
      Flights: LGA (in Tue ~2pm · out Sat ~7:30pm)
      <br />
      <span className="text-red">●</span> Dairy-free
    </div>
  </header>
);
