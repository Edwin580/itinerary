import React from "react";
import type { Day, Stop } from "../types";
import { Editable } from "./Editable";
import { StopCard } from "./StopCard";

interface DayViewProps {
  day: Day;
  editing: boolean;
  onUpdateDay: (patch: Partial<Day>) => void;
  onUpdateStop: (stopIdx: number, stop: Stop) => void;
  onDeleteStop: (stopIdx: number) => void;
  onAddStop: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  day,
  editing,
  onUpdateDay,
  onUpdateStop,
  onDeleteStop,
  onAddStop,
}) => (
  <article className="animate-fade-in">
    {/* Day header */}
    <div className="mb-6">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-red mb-2">
        <Editable
          value={day.day}
          onChange={(v) => onUpdateDay({ day: v })}
          editing={editing}
        />
        {" · "}
        <Editable
          value={day.date}
          onChange={(v) => onUpdateDay({ date: v })}
          editing={editing}
        />
      </div>

      <h2 className="font-display font-normal text-[clamp(32px,8vw,44px)] leading-none tracking-[-0.01em] m-0 mb-3">
        <Editable
          value={day.title}
          onChange={(v) => onUpdateDay({ title: v })}
          editing={editing}
          placeholder="Title"
        />{" "}
        <em className="font-serif font-light italic text-ink-soft">
          <Editable
            value={day.subtitle}
            onChange={(v) => onUpdateDay({ subtitle: v })}
            editing={editing}
            placeholder="subtitle"
          />
        </em>
      </h2>

      <Editable
        value={day.blurb}
        onChange={(v) => onUpdateDay({ blurb: v })}
        editing={editing}
        multiline
        placeholder="Day blurb…"
        as="p"
        className="text-[15px] text-ink-soft italic border-l-2 border-red pl-3 m-0 mb-6"
      />
    </div>

    {/* Stops */}
    {day.stops.map((s, i) => (
      <StopCard
        key={s.id}
        stop={s}
        editing={editing}
        onChange={(ns) => onUpdateStop(i, ns)}
        onDelete={() => onDeleteStop(i)}
      />
    ))}

    {editing && (
      <button
        onClick={onAddStop}
        className="w-full mt-5 py-3.5 bg-transparent border-2 border-dashed border-ink/15 text-ink-soft font-mono text-[11px] tracking-[0.15em] cursor-pointer transition-all hover:border-ink hover:text-ink hover:bg-white/30"
      >
        + ADD STOP
      </button>
    )}
  </article>
);
