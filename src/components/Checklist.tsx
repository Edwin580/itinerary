import React from "react";
import type { CheckItem } from "../types";

interface ChecklistProps {
  checks: CheckItem[];
  editing: boolean;
  onToggle: (id: string) => void;
  onAdd: (title: string, description: string) => void;
  onRemove: (id: string) => void;
}

export const Checklist: React.FC<ChecklistProps> = ({
  checks,
  editing,
  onToggle,
  onAdd,
  onRemove,
}) => {
  const handleAdd = () => {
    const title = prompt("Checklist item title");
    if (!title) return;
    const description = prompt("Description (optional)") ?? "";
    onAdd(title, description);
  };

  return (
    <section className="mt-8 p-5 bg-ink text-cream relative">
      {/* "BEFORE SHE LANDS" badge */}
      <span className="absolute -top-2 left-4 bg-red text-cream font-mono text-[9px] tracking-[0.15em] px-2 py-0.5">
        BEFORE SHE LANDS
      </span>

      <h3 className="font-display text-[26px] font-normal mt-1 mb-1">
        Pre-trip checklist.
      </h3>
      <p className="font-mono text-[10px] tracking-[0.1em] opacity-60 m-0 mb-4 uppercase">
        Tap to mark done{editing && " · tap × to remove"}
      </p>

      {checks.map((c) => (
        <div
          key={c.id}
          className="flex gap-3 py-2.5 border-b border-cream/15 last:border-b-0 items-start"
        >
          {/* Checkbox */}
          <div
            onClick={() => onToggle(c.id)}
            className={[
              "w-4 h-4 border border-cream flex-shrink-0 mt-0.5 relative cursor-pointer transition-all",
              c.completed ? "bg-cream" : "",
            ].join(" ")}
          >
            {c.completed && (
              <span className="absolute text-ink text-sm font-bold leading-none top-[-1px] left-[2px]">
                ✓
              </span>
            )}
          </div>

          {/* Text */}
          <div
            className={[
              "text-[13px] leading-[1.4] cursor-pointer flex-1",
              c.completed ? "opacity-40 line-through" : "",
            ].join(" ")}
            onClick={() => onToggle(c.id)}
          >
            <b className="font-display text-[15px] font-normal block mb-0.5">
              {c.title}
            </b>
            {c.description}
          </div>

          {editing && (
            <button
              onClick={() => onRemove(c.id)}
              className="self-start mt-0.5 bg-transparent border border-cream/30 text-cream/70 font-mono text-[10px] px-1.5 py-0.5 cursor-pointer hover:bg-cream hover:text-ink"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {editing && (
        <button
          onClick={handleAdd}
          className="w-full mt-4 py-3.5 bg-transparent border-2 border-dashed border-cream/30 text-cream/70 font-mono text-[11px] tracking-[0.15em] cursor-pointer hover:border-cream hover:text-cream hover:bg-cream/5"
        >
          + ADD ITEM
        </button>
      )}
    </section>
  );
};
