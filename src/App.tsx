import { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useItinerary } from "./hooks/useItinerary";
import { AppHeader } from "./components/AppHeader";
import { DayNav } from "./components/DayNav";
import { DayView } from "./components/DayView";
import { Checklist } from "./components/Checklist";
import { TodayPill } from "./components/TodayPill";
import { OptionsBank } from "./components/OptionsBank";
import { FloatingBar } from "./components/FloatingBar";

export default function App() {
  const {
    days,
    checks,
    dayIdx,
    editing,
    loading,
    error,
    currentDay,
    todayActive,
    showDay,
    toggleEditing,
    updateCurrentDay,
    bankEvents,
    updateSlot,
    updateEvent,
    swapEvents,
    reorderEvents,
    insertStop,
    deleteStop,
    moveToItinerary,
    returnToBank,
    toggleCheck,
    addCheck,
    removeCheck,
    resetAll,
  } = useItinerary();

  const contentRef = useRef<HTMLDivElement>(null);
  const [showOptionsBank, setShowOptionsBank] = useState(false);

  const handleShowDay = (i: number) => {
    showDay(i);
    setTimeout(
      () =>
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  };

  // ── dnd-kit sensors ──────────────────────────────────────────────────────────
  // PointerSensor with a small distance threshold prevents accidental drags on
  // click. KeyboardSensor lets keyboard users reorder with arrow keys.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (dragEvent: DragEndEvent) => {
    const { active, over } = dragEvent;
    if (!over || active.id === over.id || !currentDay) return;

    // Guard against null JSONB columns (same defensive pattern as DayView)
    const slots = currentDay.slots ?? [];
    const events = currentDay.events ?? {};

    // active.id and over.id are event IDs (not slot IDs)
    const eventIds = slots.map((s) => events[s.id]?.id);
    const oldIndex = eventIds.indexOf(active.id as string);
    const newIndex = eventIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    reorderEvents(oldIndex, newIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-soft animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4 p-8">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-red">
          Failed to connect
        </span>
        <p className="font-mono text-[12px] text-ink-soft text-center max-w-sm break-all">
          {error}
        </p>
        <p className="font-mono text-[11px] text-ink-soft/60 text-center">
          Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-5 pt-[max(env(safe-area-inset-top),_1.5rem)] pb-[140px] relative">
      <AppHeader />

      <DayNav days={days} dayIdx={dayIdx} onShowDay={handleShowDay} />

      <main ref={contentRef}>
        {currentDay && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <DayView
              day={currentDay}
              editing={editing}
              onUpdateDay={updateCurrentDay}
              onUpdateSlot={updateSlot}
              onUpdateEvent={updateEvent}
              onSwapEvents={swapEvents}
              onInsertStop={insertStop}
              onDeleteStop={deleteStop}
              onReturnToBank={returnToBank}
            />
          </DndContext>
        )}
      </main>

      <Checklist
        checks={checks}
        editing={editing}
        onToggle={toggleCheck}
        onAdd={addCheck}
        onRemove={removeCheck}
      />

      {editing && (
        <button
          onClick={() => void resetAll()}
          className="w-full mt-5 py-3 bg-transparent border border-red/30 text-red font-mono text-[10px] tracking-[0.15em] cursor-pointer transition-colors hover:bg-red hover:text-cream hover:border-red"
        >
          ↺ RESET ALL TO DEFAULTS
        </button>
      )}

      <footer className="mt-10 pt-5 border-t border-ink/15 text-center font-mono text-[9px] tracking-[0.15em] uppercase text-ink-soft">
        Made <span className="text-red">♥</span> for Ayushi · all edits syced, trust
      </footer>

      <TodayPill
        days={days}
        dayIdx={dayIdx}
        todayActive={todayActive}
        onShowDay={handleShowDay}
      />

      {/* Options bank — fixed panel; moves events between bank and itinerary */}
      <OptionsBank
        open={showOptionsBank}
        onClose={() => setShowOptionsBank(false)}
        bankEvents={bankEvents}
        onMove={moveToItinerary}
      />

      {/* Floating action bar — persists through all scroll positions */}
      <FloatingBar
        editing={editing}
        onToggleEdit={toggleEditing}
        showingOptions={showOptionsBank}
        onToggleOptions={() => setShowOptionsBank((v) => !v)}
        bankCount={bankEvents.length}
      />
    </div>
  );
}
