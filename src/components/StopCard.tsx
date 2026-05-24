import React from "react";
import type { TimeSlot, StopEvent, StopType } from "../types";
import { Editable } from "./Editable";
import { SwapPanel } from "./SwapPanel";
import { chipClass } from "../lib/chipClass";

function badgeClass(type: StopType): string {
  const base =
    "px-2 py-0.5 text-[9px] tracking-[0.12em] font-mono inline-block";
  switch (type) {
    case "food":
      return `${base} bg-red text-cream`;
    case "sight":
      return `${base} bg-teal text-cream`;
    case "travel":
      return `${base} bg-mustard text-ink`;
    default:
      return `${base} bg-ink text-cream`;
  }
}

interface StopCardProps {
  /** The time-grid anchor — only `time` is ever mutated here. */
  slot: TimeSlot;
  /** The content payload — moves independently of the slot. */
  event: StopEvent;
  editing: boolean;
  /** True when this card is the first in the day's slot list. */
  isFirst: boolean;
  /** True when this card is the last in the day's slot list. */
  isLast: boolean;
  /** Swap this event with the one above (slot grid stays fixed). */
  onMoveUp: () => void;
  /** Swap this event with the one below (slot grid stays fixed). */
  onMoveDown: () => void;
  /** Called when the user edits the slot's time string. */
  onChangeSlot: (patch: Partial<TimeSlot>) => void;
  /** Called when any content field on the event changes. */
  onChangeEvent: (event: StopEvent) => void;
  onDelete: () => void;
  /** If provided, rendered as a drag handle (passed from dnd-kit's useSortable). */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  /** Visual feedback when the card is being dragged. */
  isDragging?: boolean;
}

export const StopCard: React.FC<StopCardProps> = ({
  slot,
  event,
  editing,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChangeSlot,
  onChangeEvent,
  onDelete,
  dragHandleProps,
  isDragging = false,
}) => {
  const updateEvent = <K extends keyof StopEvent>(key: K, val: StopEvent[K]) =>
    onChangeEvent({ ...event, [key]: val });

  const addChip = () => {
    const v = prompt("New chip text (e.g. 'DF FRIENDLY', 'CASH ONLY')");
    if (v?.trim()) updateEvent("chips", [...event.chips, v.trim().toUpperCase()]);
  };
  const removeChip = (i: number) =>
    updateEvent("chips", event.chips.filter((_, idx) => idx !== i));

  return (
    <div className={`py-5 border-t border-ink/15 last:border-b last:border-ink/15 transition-opacity${isDragging ? " opacity-40" : ""}`}>

      {/* ── Meta row: [badge · time] ·············· [↑ ↓ ×] ──────────────── */}
      <div className="font-mono text-[10px] tracking-[0.1em] text-ink-soft uppercase mb-2 flex items-center justify-between gap-2">

        {/* Left: type badge + time */}
        <div className="flex items-center gap-2 min-w-0">
          {editing ? (
            <select
              value={event.type}
              onChange={(e) => updateEvent("type", e.target.value as StopType)}
              className={`${badgeClass(event.type)} border-none cursor-pointer flex-shrink-0`}
            >
              <option value="food">food</option>
              <option value="sight">sight</option>
              <option value="travel">travel</option>
            </select>
          ) : (
            <span className={`${badgeClass(event.type)} flex-shrink-0`}>{event.type}</span>
          )}

          {/* Time lives on the slot — swapping events leaves this unchanged */}
          <Editable
            value={slot.time}
            onChange={(v) => onChangeSlot({ time: v })}
            editing={editing}
            placeholder="time"
          />
        </div>

        {/* Right: drag handle (edit-only) + reorder arrows (always visible) + delete (edit-only) */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {editing && dragHandleProps && (
            <button
              {...dragHandleProps}
              title="Drag to reorder"
              className="font-mono text-[15px] leading-none text-ink/20 hover:text-ink/50 transition-colors bg-transparent border-none cursor-grab active:cursor-grabbing p-0.5 select-none touch-none"
            >
              ⠿
            </button>
          )}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="Move up"
            className="font-mono text-[13px] leading-none text-ink/25 hover:text-ink-soft disabled:opacity-0 disabled:pointer-events-none transition-colors bg-transparent border-none cursor-pointer p-0.5"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="Move down"
            className="font-mono text-[13px] leading-none text-ink/25 hover:text-ink-soft disabled:opacity-0 disabled:pointer-events-none transition-colors bg-transparent border-none cursor-pointer p-0.5"
          >
            ↓
          </button>

          {editing && (
            <button
              onClick={onDelete}
              title="Delete stop"
              className="ml-1 bg-red/15 text-red border border-red/30 font-mono text-[10px] px-1.5 py-0.5 cursor-pointer hover:bg-red hover:text-cream transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── Name ──────────────────────────────────────────────────────────── */}
      <h3 className="font-display text-[24px] font-normal leading-[1.1] m-0 mb-1.5">
        {editing ? (
          <Editable
            value={event.name}
            onChange={(v) => updateEvent("name", v)}
            editing
            placeholder="Stop name"
          />
        ) : event.link ? (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink no-underline border-b border-ink/15 transition-colors hover:border-red"
          >
            {event.name}
          </a>
        ) : (
          event.name
        )}
      </h3>

      {/* URL field (edit mode only) */}
      {editing && (
        <Editable
          value={event.link ?? ""}
          onChange={(v) => updateEvent("link", v || undefined)}
          editing
          placeholder="URL (optional)"
          className="font-mono text-[11px] mb-2 block"
        />
      )}

      {/* ── Detail ────────────────────────────────────────────────────────── */}
      <Editable
        value={event.detail}
        onChange={(v) => updateEvent("detail", v)}
        editing={editing}
        multiline
        placeholder="Details…"
        as="p"
        className="text-[14px] text-ink-soft m-0 mb-2.5"
      />

      {/* ── Chips ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {event.chips.map((c, i) => (
          <span
            key={i}
            className={chipClass(c)}
            onClick={editing ? () => removeChip(i) : undefined}
            style={editing ? { cursor: "pointer" } : undefined}
          >
            {c}
            {editing && " ×"}
          </span>
        ))}
        {editing && (
          <button
            onClick={addChip}
            className="bg-cream-2 border border-ink/15 text-ink font-mono text-[10px] tracking-[0.05em] px-2 py-0.5 cursor-pointer uppercase ml-1 hover:bg-ink hover:text-cream"
          >
            + chip
          </button>
        )}
      </div>

      {/* ── Swaps ─────────────────────────────────────────────────────────── */}
      <SwapPanel
        swaps={event.swaps}
        editing={editing}
        onChange={(swaps) => updateEvent("swaps", swaps)}
      />
    </div>
  );
};
