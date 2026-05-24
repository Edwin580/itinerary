import React from "react";
import type { Stop, StopType } from "../types";
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
  stop: Stop;
  editing: boolean;
  onChange: (s: Stop) => void;
  onDelete: () => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  editing,
  onChange,
  onDelete,
}) => {
  const update = <K extends keyof Stop>(key: K, val: Stop[K]) =>
    onChange({ ...stop, [key]: val });

  const addChip = () => {
    const v = prompt("New chip text (e.g. 'DF FRIENDLY', 'CASH ONLY')");
    if (v?.trim()) update("chips", [...stop.chips, v.trim().toUpperCase()]);
  };
  const removeChip = (i: number) =>
    update("chips", stop.chips.filter((_, idx) => idx !== i));

  return (
    <div className="py-5 border-t border-ink/15 last:border-b last:border-ink/15">
      {/* Time / type row */}
      <div className="font-mono text-[10px] tracking-[0.1em] text-ink-soft uppercase mb-2 flex items-center gap-2 flex-wrap">
        {editing ? (
          <select
            value={stop.type}
            onChange={(e) => update("type", e.target.value as StopType)}
            className={`${badgeClass(stop.type)} border-none cursor-pointer`}
          >
            <option value="food">food</option>
            <option value="sight">sight</option>
            <option value="travel">travel</option>
          </select>
        ) : (
          <span className={badgeClass(stop.type)}>{stop.type}</span>
        )}

        <Editable
          value={stop.time}
          onChange={(v) => update("time", v)}
          editing={editing}
          placeholder="time"
        />

        {editing && (
          <button
            onClick={onDelete}
            className="ml-auto bg-red/15 text-red border border-red/30 font-mono text-[10px] px-1.5 py-0.5 cursor-pointer hover:bg-red hover:text-cream"
            title="Delete stop"
          >
            ×
          </button>
        )}
      </div>

      {/* Name */}
      <h3 className="font-display text-[24px] font-normal leading-[1.1] m-0 mb-1.5">
        {editing ? (
          <Editable
            value={stop.name}
            onChange={(v) => update("name", v)}
            editing
            placeholder="Stop name"
          />
        ) : stop.link ? (
          <a
            href={stop.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink no-underline border-b border-ink/15 transition-colors hover:border-red"
          >
            {stop.name}
          </a>
        ) : (
          stop.name
        )}
      </h3>

      {/* URL field (edit mode only) */}
      {editing && (
        <Editable
          value={stop.link ?? ""}
          onChange={(v) => update("link", v || undefined)}
          editing
          placeholder="URL (optional)"
          className="font-mono text-[11px] mb-2 block"
        />
      )}

      {/* Detail */}
      <Editable
        value={stop.detail}
        onChange={(v) => update("detail", v)}
        editing={editing}
        multiline
        placeholder="Details…"
        as="p"
        className="text-[14px] text-ink-soft m-0 mb-2.5"
      />

      {/* Chips */}
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {stop.chips.map((c, i) => (
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

      {/* Swaps */}
      <SwapPanel
        swaps={stop.swaps}
        editing={editing}
        onChange={(swaps) => update("swaps", swaps)}
      />
    </div>
  );
};
