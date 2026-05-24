import React from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Day, TimeSlot, StopEvent } from "../types";
import { Editable } from "./Editable";
import { StopCard } from "./StopCard";

// ── Insert divider ─────────────────────────────────────────────────────────────
const InsertDivider: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex items-center gap-2 py-1 group">
    <div className="flex-1 border-t border-dashed border-ink/10 transition-colors group-hover:border-ink/25" />
    <button
      onClick={onClick}
      className="font-mono text-[9px] tracking-[0.1em] text-ink/25 hover:text-ink-soft px-2 py-0.5 border border-dashed border-ink/10 hover:border-ink/30 bg-transparent cursor-pointer transition-all whitespace-nowrap"
    >
      + insert
    </button>
    <div className="flex-1 border-t border-dashed border-ink/10 transition-colors group-hover:border-ink/25" />
  </div>
);

// ── Sortable wrapper ───────────────────────────────────────────────────────────
// Wraps one StopCard with dnd-kit's useSortable. The sortable ID is event.id —
// not slot.id — so dnd-kit tracks the content payload that moves, not the fixed
// time-grid anchor.
interface SortableStopCardProps {
  slot: TimeSlot;
  event: StopEvent;
  editing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeSlot: (patch: Partial<TimeSlot>) => void;
  onChangeEvent: (ev: StopEvent) => void;
  onDelete: () => void;
  onReturnToBank: () => void;
}

const SortableStopCard: React.FC<SortableStopCardProps> = ({
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
  onReturnToBank,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Only expose drag handle props when in edit mode
  const dragHandleProps = editing
    ? ({ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>)
    : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <StopCard
        slot={slot}
        event={event}
        editing={editing}
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onChangeSlot={onChangeSlot}
        onChangeEvent={onChangeEvent}
        onDelete={onDelete}
        onReturnToBank={onReturnToBank}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface DayViewProps {
  day: Day;
  editing: boolean;
  onUpdateDay: (patch: Partial<Day>) => void;
  /** Update the time string on a slot (grid position stays fixed). */
  onUpdateSlot: (slotId: string, patch: Partial<TimeSlot>) => void;
  /** Replace the event payload sitting at a slot (content moves). */
  onUpdateEvent: (slotId: string, event: StopEvent) => void;
  /** Swap the event payloads between two slots. */
  onSwapEvents: (slotIdA: string, slotIdB: string) => void;
  /** Insert a blank stop at the given index in the slots array. */
  onInsertStop: (atIndex: number) => void;
  onDeleteStop: (slotId: string) => void;
  /** Return the event at a given slot back to the staging bank. */
  onReturnToBank: (eventId: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const DayView: React.FC<DayViewProps> = ({
  day,
  editing,
  onUpdateDay,
  onUpdateSlot,
  onUpdateEvent,
  onSwapEvents,
  onInsertStop,
  onDeleteStop,
  onReturnToBank,
}) => {
  // Guard against null/undefined from Supabase rows that pre-date the
  // slots/events migration — getDays normalizes these too, but belt-and-suspenders.
  const slots = day.slots ?? [];
  const events: Record<string, StopEvent> = day.events ?? {};

  // Build ordered list of event IDs for SortableContext.
  // Must use event IDs (not slot IDs) so dnd-kit animations follow the content
  // payload that moves, not the fixed time-grid anchors.
  const sortableItems = slots
    .map((s) => events[s.id]?.id)
    .filter((id): id is string => !!id);

  return (
    <article className="animate-fade-in">

      {/* ── Day header ──────────────────────────────────────────────────── */}
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

      {/* ── Stop list ───────────────────────────────────────────────────────
          SortableContext holds event IDs (not slot IDs) so dnd-kit tracks the
          content payload that moves, not the fixed time-grid anchors.

          Each React.Fragment is keyed by event.id — not slot.id — so React's
          reconciler moves the DOM node with the content that moved.

          ↑/↓ arrow guards: prevSlot/nextSlot can be undefined at boundaries;
          onMoveUp/onMoveDown are no-ops there, and isFirst/isLast disables buttons.
      ──────────────────────────────────────────────────────────────────── */}
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        {slots.map((slot, i) => {
          const event = events[slot.id];
          if (!event) return null;

          const prevSlot = slots[i - 1];
          const nextSlot = slots[i + 1];

          return (
            <React.Fragment key={event.id}>
              <SortableStopCard
                slot={slot}
                event={event}
                editing={editing}
                isFirst={i === 0}
                isLast={i === slots.length - 1}
                onChangeSlot={(patch) => onUpdateSlot(slot.id, patch)}
                onChangeEvent={(ev) => onUpdateEvent(slot.id, ev)}
                onMoveUp={prevSlot ? () => onSwapEvents(prevSlot.id, slot.id) : () => undefined}
                onMoveDown={nextSlot ? () => onSwapEvents(slot.id, nextSlot.id) : () => undefined}
                onDelete={() => onDeleteStop(slot.id)}
                onReturnToBank={() => onReturnToBank(event.id)}
              />

              {/* Insert divider after every card; last one = "add at end" */}
              {editing && (
                <InsertDivider onClick={() => onInsertStop(i + 1)} />
              )}
            </React.Fragment>
          );
        })}
      </SortableContext>

    </article>
  );
};
