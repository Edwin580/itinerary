import React from "react";
import type { StopEvent, StopType } from "../types";
import { chipClass } from "../lib/chipClass";

// ── Type badge (mirrors StopCard's badgeClass) ─────────────────────────────────
function badgeClass(type: StopType): string {
  const base = "px-2 py-0.5 text-[9px] tracking-[0.12em] font-mono inline-block flex-shrink-0";
  switch (type) {
    case "food":   return `${base} bg-red text-cream`;
    case "sight":  return `${base} bg-teal text-cream`;
    case "travel": return `${base} bg-mustard text-ink`;
    default:       return `${base} bg-ink text-cream`;
  }
}

// ── Option card ────────────────────────────────────────────────────────────────
interface OptionCardProps {
  event: StopEvent;
  /** Called with the event's ID — parent removes it from bankEvents state. */
  onMove: (eventId: string) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ event, onMove }) => (
  <div className="px-4 py-3.5 border-b border-ink/10 last:border-b-0 hover:bg-cream-2/60 transition-colors">

    {/* Top row: badge + name + Move button */}
    <div className="flex items-start gap-2 mb-1.5">
      <span className={badgeClass(event.type)}>{event.type}</span>

      <span className="font-display text-[18px] leading-[1.1] flex-1 min-w-0">
        {event.name}
      </span>

      <button
        onClick={() => onMove(event.id)}
        title="Add to current day's itinerary"
        className="flex-shrink-0 font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-1 border border-ink/25 text-ink-soft bg-transparent cursor-pointer transition-colors hover:bg-ink hover:text-cream hover:border-ink"
      >
        + ADD
      </button>
    </div>

    {/* Detail — capped at 2 lines */}
    <p
      className="font-mono text-[11px] text-ink-soft leading-[1.55] mb-2 overflow-hidden"
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}
    >
      {event.detail}
    </p>

    {/* Chips */}
    {event.chips.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {event.chips.map((c) => (
          <span key={c} className={chipClass(c)}>
            {c}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyBank: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full px-6 pb-16 gap-3 text-center">
    <span className="font-mono text-[28px] opacity-20">✓</span>
    <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-soft/60 m-0">
      All stops added
    </p>
    <p className="font-mono text-[10px] text-ink-soft/40 m-0 leading-relaxed">
      Return a stop to the bank from the itinerary to see it here again.
    </p>
  </div>
);

// ── Panel ──────────────────────────────────────────────────────────────────────
interface OptionsBankProps {
  open: boolean;
  onClose: () => void;
  /** Dynamic list driven by useItinerary's bankEvents state. */
  bankEvents: StopEvent[];
  /** Moves an event (by ID) from the bank into the current day's itinerary. */
  onMove: (eventId: string) => void;
}

export const OptionsBank: React.FC<OptionsBankProps> = ({
  open,
  onClose,
  bankEvents,
  onMove,
}) => (
  <>
    {/* ── Backdrop ──────────────────────────────────────────────────────────── */}
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-ink/20 z-30 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden="true"
    />

    {/* ── Slide-in panel ────────────────────────────────────────────────────── */}
    <aside
      aria-label="Options bank"
      className={`fixed top-0 right-0 h-full w-[300px] bg-cream border-l border-ink/20 flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-[-8px_0_32px_rgba(26,22,18,0.12)] ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-ink/15 flex-shrink-0">
        <div>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink font-semibold">
            Options Bank
          </span>
          <span className="font-mono text-[9px] text-ink-soft ml-2">
            {bankEvents.length} available
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close options bank"
          className="font-mono text-[16px] leading-none text-ink/30 hover:text-ink bg-transparent border-none cursor-pointer p-1 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Sub-header hint */}
      <div className="px-4 py-2 border-b border-ink/10 flex-shrink-0">
        <p className="font-mono text-[9px] tracking-[0.08em] text-ink-soft/70 m-0">
          Staging area · + ADD moves a stop into the current day
        </p>
      </div>

      {/* Scrollable list or empty state */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {bankEvents.length > 0 ? (
          bankEvents.map((event) => (
            <OptionCard key={event.id} event={event} onMove={onMove} />
          ))
        ) : (
          <EmptyBank />
        )}
      </div>
    </aside>
  </>
);
