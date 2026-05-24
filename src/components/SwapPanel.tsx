import React, { useState } from "react";
import type { Swap } from "../types";
import { Editable } from "./Editable";

const uid = () => Math.random().toString(36).slice(2, 9);

interface SwapPanelProps {
  swaps: Swap[];
  editing: boolean;
  onChange: (swaps: Swap[]) => void;
}

export const SwapPanel: React.FC<SwapPanelProps> = ({
  swaps,
  editing,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  if (swaps.length === 0 && !editing) return null;

  const addSwap = () =>
    onChange([...swaps, { id: uid(), name: "New swap", desc: "Description" }]);
  const updateSwap = (idx: number, patch: Partial<Swap>) =>
    onChange(swaps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSwap = (idx: number) =>
    onChange(swaps.filter((_, i) => i !== idx));

  return (
    <div className="mt-3.5 border border-dashed border-ink/15 bg-white/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-transparent border-none px-3.5 py-2.5 text-left cursor-pointer font-mono text-[10px] tracking-[0.1em] uppercase text-ink-soft flex justify-between items-center hover:text-ink"
      >
        <span>
          ⇄ {swaps.length} swap{swaps.length !== 1 ? "s" : ""}
        </span>
        <span
          className="text-sm transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5">
          {swaps.map((sw, i) => (
            <div
              key={sw.id}
              className="py-2.5 border-t border-ink/8 text-[13px] first:border-t-0"
            >
              {editing ? (
                <>
                  <Editable
                    value={sw.name}
                    onChange={(v) => updateSwap(i, { name: v })}
                    editing
                    as="b"
                    placeholder="Swap name"
                    className="font-display text-[16px] font-normal block mb-0.5"
                  />
                  <Editable
                    value={sw.desc}
                    onChange={(v) => updateSwap(i, { desc: v })}
                    editing
                    multiline
                    placeholder="Description"
                    className="text-ink-soft text-[12px] block"
                  />
                  <button
                    onClick={() => removeSwap(i)}
                    className="mt-1 bg-red/15 text-red border border-red/30 font-mono text-[10px] tracking-[0.05em] px-2 py-0.5 cursor-pointer uppercase hover:bg-red hover:text-cream"
                  >
                    remove
                  </button>
                </>
              ) : (
                <>
                  <b className="font-display text-[16px] font-normal block mb-0.5">
                    {sw.name}
                  </b>
                  <span className="text-ink-soft text-[12px] block">
                    {sw.desc}
                  </span>
                </>
              )}
            </div>
          ))}

          {editing && (
            <button
              onClick={addSwap}
              className="mt-2 bg-cream-2 border border-ink/15 text-ink font-mono text-[10px] tracking-[0.05em] px-2 py-0.5 cursor-pointer uppercase hover:bg-ink hover:text-cream"
            >
              + add swap
            </button>
          )}
        </div>
      )}
    </div>
  );
};
