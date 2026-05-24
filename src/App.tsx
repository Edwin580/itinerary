import { useRef } from "react";
import { useItinerary } from "./hooks/useItinerary";
import { AppHeader } from "./components/AppHeader";
import { DayNav } from "./components/DayNav";
import { DayView } from "./components/DayView";
import { Checklist } from "./components/Checklist";
import { TodayPill } from "./components/TodayPill";

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
    updateStop,
    deleteStop,
    addStop,
    toggleCheck,
    addCheck,
    removeCheck,
    resetAll,
  } = useItinerary();

  const contentRef = useRef<HTMLDivElement>(null);

  const handleShowDay = (i: number) => {
    showDay(i);
    setTimeout(
      () =>
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
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
    <div className="max-w-[720px] mx-auto px-5 pt-6 pb-[120px] relative">
      <AppHeader editing={editing} onToggleEdit={toggleEditing} />

      <DayNav days={days} dayIdx={dayIdx} onShowDay={handleShowDay} />

      <main ref={contentRef}>
        {currentDay && (
          <DayView
            day={currentDay}
            editing={editing}
            onUpdateDay={updateCurrentDay}
            onUpdateStop={updateStop}
            onDeleteStop={deleteStop}
            onAddStop={addStop}
          />
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
        Made <span className="text-red">♥</span> for Edwin · all edits synced to cloud
      </footer>

      <TodayPill
        days={days}
        dayIdx={dayIdx}
        todayActive={todayActive}
        onShowDay={handleShowDay}
      />
    </div>
  );
}
