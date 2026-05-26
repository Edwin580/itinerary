import React from "react";

interface FloatingBarProps {
  editing: boolean;
  onToggleEdit: () => void;
  showingOptions: boolean;
  onToggleOptions: () => void;
  bankCount: number;
}

export const FloatingBar: React.FC<FloatingBarProps> = ({
  editing,
  onToggleEdit,
  showingOptions,
  onToggleOptions,
  bankCount,
}) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-20 border-t border-ink/12 pb-[max(env(safe-area-inset-bottom),_1rem)]"
    style={{
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      background: "rgba(244, 237, 224, 0.82)",
      boxShadow: "0 -8px 40px rgba(26, 22, 18, 0.09)",
    }}
  >
    <div className="max-w-[720px] mx-auto px-5 py-3 flex items-center justify-between">

      {/* Left — passive label so the bar doesn't feel naked on one side */}
      <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-ink-soft/50 select-none">
        {editing ? "editing mode" : "NYC · May 26–30"}
      </span>

      {/* Right — action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleOptions}
          className={[
            "font-mono text-[10px] tracking-[0.14em] px-3 py-1.5 border cursor-pointer transition-colors duration-200",
            showingOptions
              ? "bg-ink text-cream border-ink"
              : "bg-transparent text-ink-soft border-ink/30 hover:border-ink hover:text-ink",
          ].join(" ")}
        >
          {showingOptions ? "✕ BANK" : `⊞ BANK ${bankCount > 0 ? `· ${bankCount}` : ""}`}
        </button>

        <button
          onClick={onToggleEdit}
          className={[
            "font-mono text-[10px] tracking-[0.14em] px-3 py-1.5 border-none cursor-pointer transition-colors duration-200",
            editing
              ? "bg-teal text-cream hover:bg-ink"
              : "bg-ink text-cream hover:bg-red",
          ].join(" ")}
        >
          {editing ? "✓ DONE" : "✎ EDIT"}
        </button>
      </div>
    </div>
  </div>
);
