import React, { useState, useEffect, useRef } from "react";

// ============ TYPES ============
type StopType = "food" | "sight" | "travel";

interface Swap {
  id: string;
  name: string;
  desc: string;
}

interface Stop {
  id: string;
  time: string;
  type: StopType;
  name: string;
  detail: string;
  link?: string;
  chips: string[];
  swaps: Swap[];
}

interface Day {
  id: string;
  day: string;
  date: string;
  title: string;
  subtitle: string;
  blurb: string;
  stops: Stop[];
}

interface CheckItem {
  id: string;
  title: string;
  desc: string;
}

// ============ INITIAL DATA ============
const uid = () => Math.random().toString(36).slice(2, 9);

const INITIAL_DAYS: Day[] = [
  {
    id: uid(),
    day: "Tuesday",
    date: "May 26",
    title: "Arrival",
    subtitle: "tacos in Yonkers.",
    blurb: "Easy first night. She just flew in — keep it close to home, eat well, sleep early. Light Yonkers taco crawl: pick one, or split between two.",
    stops: [
      { id: uid(), time: "~2:00 PM", type: "travel", name: "Pickup at LGA", detail: "Drive ~30 min to Mt Vernon. Take I-678 N → I-95 N.", chips: [], swaps: [] },
      { id: uid(), time: "3:00 PM", type: "travel", name: "Check in", detail: "Cozy Studio Mt Vernon · 135 S 14th Ave", chips: [], swaps: [] },
      { id: uid(), time: "6:30 PM", type: "food", name: "Banquetes Doña Cheli", detail: "34 Park Hill Ave, Yonkers · right by Our Lady of Mt Carmel · the most authentic spot. Carnitas, lengua, oreja, chile relleno. 4.7★ · 480 reviews.", link: "https://maps.google.com/?cid=5572569484598247589", chips: ["AUTHENTIC", "DF FRIENDLY"], swaps: [
        { id: uid(), name: "La Cantina", desc: "38 Main St · birria tacos + churros. 4.7★." },
        { id: uid(), name: "Adobo Mexican Grill", desc: "Fast-casual birria. Open till 3am." },
        { id: uid(), name: "Taco Bahama (Tuckahoe)", desc: "Upscale, creative tacos. 4.9★." },
      ]},
      { id: uid(), time: "8:00 PM", type: "food", name: "Tacos El Poblano", detail: "122 Nepperhan Ave, Yonkers · second stop if she's down · 'best tacos in Westchester' · cheap, hidden gem · open till midnight", link: "https://maps.google.com/?cid=1617566099862518800", chips: ["OPTIONAL", "CHEAP", "DF FRIENDLY"], swaps: [
        { id: uid(), name: "Skip & sleep", desc: "She just flew in from across the country. No shame." },
        { id: uid(), name: "Taqueria Movil (138 S Broadway)", desc: "Cash-only late-night truck. 5★." },
      ]},
    ],
  },
  {
    id: uid(),
    day: "Wednesday",
    date: "May 27",
    title: "Natural History",
    subtitle: "Upper West Side.",
    blurb: "Met is closed today — perfect day for AMNH. Dinosaurs, blue whale, planetarium. Start with a real NYC bagel.",
    stops: [
      { id: uid(), time: "8:30 AM", type: "travel", name: "Metro-North in", detail: "Mt Vernon East → Grand Central (~30 min) → 1 train to 81st", chips: ["OFF-PEAK"], swaps: [] },
      { id: uid(), time: "9:30 AM", type: "food", name: "Absolute Bagels (or Barney Greengrass)", detail: "UWS bagel + coffee before the museum. Absolute is the no-frills classic; Greengrass is the sit-down deli legend on Amsterdam.", chips: ["AYUSHI MUST", "DF: skip schmear"], swaps: [
        { id: uid(), name: "Barney Greengrass", desc: "541 Amsterdam · sit-down · sturgeon king · iconic." },
        { id: uid(), name: "Tal Bagels (UWS)", desc: "Solid backup, less line." },
      ]},
      { id: uid(), time: "10:30 AM", type: "sight", name: "AMNH", detail: "American Museum of Natural History · Plan 3 hrs", link: "https://www.amnh.org/", chips: ["BUY TIX ONLINE", "AYUSHI MUST"], swaps: [] },
      { id: uid(), time: "1:30 PM", type: "food", name: "Jacob's Pickles", detail: "Southern comfort · Many DF options", chips: ["DF FRIENDLY"], swaps: [
        { id: uid(), name: "Shake Shack UWS", desc: "Burgers without cheese, fries are DF." },
        { id: uid(), name: "Joe's Pizza (Carmine)", desc: "Classic slice, quick stop." },
      ]},
      { id: uid(), time: "3:00 PM", type: "sight", name: "Central Park stroll", detail: "Bethesda Fountain → The Mall → Bow Bridge", chips: ["FREE"], swaps: [] },
      { id: uid(), time: "6:30 PM", type: "food", name: "Xi'an Famous Foods", detail: "UES · 78th & 2nd · Hand-ripped cumin lamb noodles", link: "https://maps.google.com/?cid=4601867186996529861", chips: ["DF", "CHEAP"], swaps: [
        { id: uid(), name: "Taste from Everest (Nepali)", desc: "102 Lexington Ave · authentic Nepali, jhol momo, chicken chowmein · 4.3★ · dairy-friendly · sit-down vibe." },
        { id: uid(), name: "Joe's Pizza Broadway", desc: "Classic slice. Times Sq adjacent." },
        { id: uid(), name: "Keens (move from Thu)", desc: "Old-school steakhouse, if you want big night." },
      ]},
      { id: uid(), time: "8:00 PM", type: "food", name: "Van Leeuwen", detail: "Vegan ice cream — flavors actually slap", chips: ["DF FLAVORS"], swaps: [] },
    ],
  },
  {
    id: uid(),
    day: "Thursday",
    date: "May 28",
    title: "Met + Chinatown",
    subtitle: "museum to dumplings.",
    blurb: "Big food day. Pace yourself. Cash before Chinatown.",
    stops: [
      { id: uid(), time: "10:00 AM", type: "sight", name: "The Met", detail: "Egyptian wing · Temple of Dendur · European paintings", link: "https://www.metmuseum.org/", chips: ["NY ID = PAY WHAT YOU WISH"], swaps: [] },
      { id: uid(), time: "1:00 PM", type: "food", name: "Katz's Delicatessen", detail: "205 E Houston · Pastrami on rye, the move", link: "https://katzsdelicatessen.com/", chips: ["DF", "NYC CLASSIC"], swaps: [] },
      { id: uid(), time: "2:30 PM", type: "food", name: "Joe's Shanghai", detail: "46 Bowery · Soup dumplings (XLB) — Chinatown dumpling stop", link: "https://maps.google.com/?cid=2082533386314007970", chips: ["AYUSHI MUST", "DF", "CASH ONLY"], swaps: [
        { id: uid(), name: "Shanghai 21", desc: "21 Mott · Also great XLB. Around the corner. Cash only." },
      ]},
      { id: uid(), time: "4:00 PM", type: "sight", name: "Chinatown walk", detail: "Mott · Mulberry · Little Italy · Nom Wah Tea Parlor for tea", chips: [], swaps: [] },
      { id: uid(), time: "7:30 PM", type: "food", name: "Keens Steakhouse", detail: "72 W 36th · Mutton chop + porterhouse · $$$$", link: "https://www.keens.com/", chips: ["DF (skip cream spinach)", "RESERVE"], swaps: [
        { id: uid(), name: "Double Zero", desc: "2nd Ave · Fully vegan pizza. Cheaper, lighter." },
        { id: uid(), name: "Wolfgang's Tribeca", desc: "Mid-tier steakhouse alternative." },
      ]},
      { id: uid(), time: "10:00 PM", type: "food", name: "Madame George", detail: "45 W 45th · 8 min walk from Keens · speakeasy lounge with live music · creative cocktails, dim & stylish · book ahead", link: "https://maps.google.com/?cid=8285716568322426789", chips: ["RESERVE", "NIGHTCAP"], swaps: [
        { id: uid(), name: "The Dickens (8th Ave)", desc: "Lively, less formal, no rez needed. Happy hour till 7." },
        { id: uid(), name: "Sir Henry's (8th Ave)", desc: "Cozy cocktail bar, great vibe, no rez." },
        { id: uid(), name: "Bemelmans Bar (UES)", desc: "Old-school Carlyle classic if you want iconic NYC." },
      ]},
    ],
  },
  {
    id: uid(),
    day: "Friday",
    date: "May 29",
    title: "Westchester",
    subtitle: "Hudson & home turf.",
    blurb: "You have the car. Untermyer in the morning, Tarrytown afternoon, Bronx Italian for dinner.",
    stops: [
      { id: uid(), time: "10:00 AM", type: "sight", name: "Untermyer Gardens", detail: "945 N Broadway, Yonkers · ~10 min from BnB · Persian walled garden, Hudson views", link: "http://www.untermyergardens.org/", chips: ["AYUSHI MUST", "FREE", "4.8★"], swaps: [] },
      { id: uid(), time: "12:30 PM", type: "food", name: "Lunch in Tarrytown", detail: "Drive ~25 min · Sweet Grass Grill or Mint Premium Foods on Main St", chips: [], swaps: [] },
      { id: uid(), time: "2:00 PM", type: "sight", name: "Lyndhurst Mansion", detail: "635 S Broadway, Tarrytown · Gothic Revival on the Hudson · ~1 hr tour", link: "https://www.lyndhurst.org/", chips: ["BOOK TOUR AHEAD", "KYKUIT CLOSED 2026"], swaps: [
        { id: uid(), name: "Sleepy Hollow Cemetery", desc: "Free, Washington Irving's grave, atmospheric." },
        { id: uid(), name: "Old Croton Aqueduct Trail", desc: "Walk part of the trail along the Hudson." },
      ]},
      { id: uid(), time: "6:00 PM", type: "food", name: "Arthur Avenue (Bronx)", detail: "Zero Otto Nove or Mario's · REAL Little Italy · ~30 min drive", chips: ["DF: marinara pasta"], swaps: [
        { id: uid(), name: "Tacos El Poblano (Yonkers)", desc: "If she wants round 2 of tacos · 122 Nepperhan · best in Westchester per locals." },
        { id: uid(), name: "Banquetes Doña Cheli (Yonkers)", desc: "If you skipped Tue or want repeat. Park Hill Ave." },
        { id: uid(), name: "Taco Bahama (Tuckahoe)", desc: "Upscale taco spot, 4.9★." },
      ]},
    ],
  },
  {
    id: uid(),
    day: "Saturday",
    date: "May 30",
    title: "MoMA + Bagel",
    subtitle: "one last morning.",
    blurb: "Check-out 11am, flight ~7:30pm. Bags in the car. Don't pack the day too tight.",
    stops: [
      { id: uid(), time: "9:00 AM", type: "travel", name: "Check out & drive in", detail: "Bags stay in the car all day · Park near MoMA", chips: [], swaps: [] },
      { id: uid(), time: "10:00 AM", type: "food", name: "Russ & Daughters", detail: "179 E Houston · Iconic bagel + lox · Ask for tofu spread", link: "https://www.russanddaughters.com/", chips: ["AYUSHI MUST", "DF: tofu cream cheese"], swaps: [
        { id: uid(), name: "Best Bagel & Coffee (W 35th)", desc: "Closer to MoMA. Has vegan cream cheese." },
      ]},
      { id: uid(), time: "11:30 AM", type: "sight", name: "MoMA", detail: "Van Gogh's Starry Night, Picasso, Dalí, Monet · ~2.5 hrs", link: "https://www.moma.org/", chips: ["BUY TIX ONLINE"], swaps: [] },
      { id: uid(), time: "2:30 PM", type: "food", name: "Joe's Pizza Broadway", detail: "One last classic slice · 1435 Broadway", link: "https://www.joespizzanyc.com/", chips: ["NYC CLASSIC"], swaps: [
        { id: uid(), name: "Xi'an Midtown", desc: "If she's still craving noodles." },
      ]},
      { id: uid(), time: "3:30 PM", type: "sight", name: "High Line + Chelsea Market", detail: "Or Bryant Park if you want quieter", chips: ["FREE"], swaps: [] },
      { id: uid(), time: "5:00 PM", type: "travel", name: "Drive to LGA", detail: "~30 min · Pad for traffic", chips: [], swaps: [] },
      { id: uid(), time: "7:30 PM", type: "travel", name: "Ayushi's flight", detail: "Departure from LGA", chips: [], swaps: [] },
    ],
  },
];

const INITIAL_CHECKS: CheckItem[] = [
  { id: uid(), title: "Reserve Keens (Thu dinner)", desc: "keens.com or 212-947-3636" },
  { id: uid(), title: "Reserve Madame George (Thu nightcap)", desc: "45 W 45th · resy or 646-423-9081 · weekends book up fast" },
  { id: uid(), title: "Book Lyndhurst tour (Fri 2pm)", desc: "lyndhurst.org · advance tix recommended" },
  { id: uid(), title: "Buy AMNH, Met, MoMA tickets online", desc: "Met = pay-what-you-wish w/ NY ID" },
  { id: uid(), title: "Pull $80 cash before Thursday", desc: "Joe's Shanghai, Shanghai 21, Nom Wah, Taqueria Movil = cash only" },
  { id: uid(), title: "Confirm tofu spread @ Russ & Daughters", desc: "They have it but verify day-of" },
  { id: uid(), title: "Check Levain for vegan options", desc: "Regular cookies have butter — verify day-of" },
  { id: uid(), title: "Charge MetroCard / set up OMNY", desc: "Wed + Thu = Metro-North + subway" },
];

const LS_DAYS = "nyc_days_v3";
const LS_CHECKS = "nyc_checks_v3";
const LS_DONE = "nyc_done_v3";
const LS_DAY_IDX = "nyc_day_idx_v3";
const LS_EDIT = "nyc_edit_mode_v3";

// ============ HOOKS ============
function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {}
    return initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

// ============ EDITABLE TEXT COMPONENT ============
interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
}

const Editable: React.FC<EditableProps> = ({ value, onChange, editing, multiline, placeholder, className, style, as = "span" }) => {
  if (editing) {
    const InputTag = multiline ? "textarea" : "input";
    return (
      <InputTag
        // @ts-ignore — type prop doesn't apply to textarea
        type={multiline ? undefined : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.6)",
          border: "1px dashed var(--ink)",
          borderRadius: 0,
          padding: "4px 6px",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontStyle: "inherit",
          fontWeight: "inherit",
          color: "inherit",
          letterSpacing: "inherit",
          lineHeight: "inherit",
          resize: multiline ? "vertical" : "none",
          minHeight: multiline ? 60 : "auto",
          ...style,
        }}
      />
    );
  }
  const Tag = as as any;
  return <Tag className={className} style={style}>{value || <em style={{ opacity: 0.4 }}>{placeholder}</em>}</Tag>;
};

// ============ STOP CARD ============
interface StopCardProps {
  stop: Stop;
  editing: boolean;
  onChange: (s: Stop) => void;
  onDelete: () => void;
}

const StopCard: React.FC<StopCardProps> = ({ stop, editing, onChange, onDelete }) => {
  const [swapsOpen, setSwapsOpen] = useState(false);

  const update = <K extends keyof Stop>(key: K, val: Stop[K]) => onChange({ ...stop, [key]: val });

  const addChip = () => {
    const v = prompt("New chip text (e.g. 'DF FRIENDLY', 'CASH ONLY')");
    if (v && v.trim()) update("chips", [...stop.chips, v.trim().toUpperCase()]);
  };
  const removeChip = (i: number) => update("chips", stop.chips.filter((_, idx) => idx !== i));

  const addSwap = () => update("swaps", [...stop.swaps, { id: uid(), name: "New swap", desc: "Description" }]);
  const updateSwap = (idx: number, patch: Partial<Swap>) => update("swaps", stop.swaps.map((s, i) => i === idx ? { ...s, ...patch } : s));
  const removeSwap = (idx: number) => update("swaps", stop.swaps.filter((_, i) => i !== idx));

  const chipClass = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("must")) return "chip must";
    if (t.includes("df") || t.includes("dairy")) return "chip df";
    if (t.includes("cash")) return "chip cash";
    if (t.includes("reserve") || t.includes("book") || t.includes("buy tix") || t.includes("ahead") || t.includes("nightcap")) return "chip rez";
    return "chip";
  };

  return (
    <div className="stop">
      <div className="stop-time">
        {editing ? (
          <select value={stop.type} onChange={(e) => update("type", e.target.value as StopType)} className={`badge ${stop.type}`} style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}>
            <option value="food">food</option>
            <option value="sight">sight</option>
            <option value="travel">travel</option>
          </select>
        ) : (
          <span className={`badge ${stop.type}`}>{stop.type}</span>
        )}
        <Editable value={stop.time} onChange={(v) => update("time", v)} editing={editing} placeholder="time" />
        {editing && <button className="mini-btn delete" onClick={onDelete} title="Delete stop">×</button>}
      </div>

      <h3 className="stop-name">
        {editing ? (
          <Editable value={stop.name} onChange={(v) => update("name", v)} editing placeholder="Stop name" />
        ) : stop.link ? (
          <a href={stop.link} target="_blank" rel="noopener noreferrer">{stop.name}</a>
        ) : stop.name}
      </h3>

      {editing && (
        <Editable value={stop.link || ""} onChange={(v) => update("link", v || undefined)} editing placeholder="URL (optional)" style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", marginBottom: 8, display: "block" }} />
      )}

      <Editable
        value={stop.detail}
        onChange={(v) => update("detail", v)}
        editing={editing}
        multiline
        placeholder="Details..."
        as="p"
        className="stop-detail"
      />

      <div className="stop-meta">
        {stop.chips.map((c, i) => (
          <span key={i} className={chipClass(c)} onClick={editing ? () => removeChip(i) : undefined} style={editing ? { cursor: "pointer" } : undefined}>
            {c}{editing && " ×"}
          </span>
        ))}
        {editing && <button className="mini-btn" onClick={addChip}>+ chip</button>}
      </div>

      {(stop.swaps.length > 0 || editing) && (
        <div className={`swap ${swapsOpen ? "open" : ""}`}>
          <button className="swap-toggle" onClick={() => setSwapsOpen(!swapsOpen)}>
            <span>⇄ {stop.swaps.length} swap{stop.swaps.length !== 1 ? "s" : ""}</span>
            <span className="arrow">+</span>
          </button>
          {swapsOpen && (
            <div className="swap-body">
              {stop.swaps.map((sw, i) => (
                <div key={sw.id} className="swap-item">
                  {editing ? (
                    <>
                      <Editable value={sw.name} onChange={(v) => updateSwap(i, { name: v })} editing as="b" placeholder="Swap name" />
                      <Editable value={sw.desc} onChange={(v) => updateSwap(i, { desc: v })} editing as="span" placeholder="Description" multiline />
                      <button className="mini-btn delete" onClick={() => removeSwap(i)} style={{ marginTop: 4 }}>remove</button>
                    </>
                  ) : (
                    <>
                      <b>{sw.name}</b>
                      <span>{sw.desc}</span>
                    </>
                  )}
                </div>
              ))}
              {editing && <button className="mini-btn" onClick={addSwap} style={{ marginTop: 8 }}>+ add swap</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============ MAIN APP ============
export default function App() {
  const [days, setDays] = usePersistedState<Day[]>(LS_DAYS, INITIAL_DAYS);
  const [checks, setChecks] = usePersistedState<CheckItem[]>(LS_CHECKS, INITIAL_CHECKS);
  const [done, setDone] = usePersistedState<string[]>(LS_DONE, []);
  const [dayIdx, setDayIdx] = usePersistedState<number>(LS_DAY_IDX, 0);
  const [editing, setEditing] = usePersistedState<boolean>(LS_EDIT, false);
  const [todayActive, setTodayActive] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date("2026-05-26");
    const end = new Date("2026-05-30T23:59");
    if (now >= start && now <= end) {
      setTodayActive(Math.floor((now.getTime() - start.getTime()) / 86400000));
    }
  }, []);

  const currentDay = days[dayIdx];

  const updateDay = (patch: Partial<Day>) => {
    setDays(days.map((d, i) => i === dayIdx ? { ...d, ...patch } : d));
  };
  const updateStop = (stopIdx: number, newStop: Stop) => {
    updateDay({ stops: currentDay.stops.map((s, i) => i === stopIdx ? newStop : s) });
  };
  const deleteStop = (stopIdx: number) => {
    if (!confirm("Delete this stop?")) return;
    updateDay({ stops: currentDay.stops.filter((_, i) => i !== stopIdx) });
  };
  const addStop = () => {
    const newStop: Stop = { id: uid(), time: "TBD", type: "sight", name: "New stop", detail: "", chips: [], swaps: [] };
    updateDay({ stops: [...currentDay.stops, newStop] });
  };

  const toggleCheck = (id: string) => {
    setDone(done.includes(id) ? done.filter((d) => d !== id) : [...done, id]);
  };
  const addCheck = () => {
    const title = prompt("Checklist item title");
    if (!title) return;
    const desc = prompt("Description (optional)") || "";
    setChecks([...checks, { id: uid(), title, desc }]);
  };
  const removeCheck = (id: string) => {
    setChecks(checks.filter((c) => c.id !== id));
    setDone(done.filter((d) => d !== id));
  };

  const resetAll = () => {
    if (!confirm("Reset all edits to defaults? This cannot be undone.")) return;
    setDays(INITIAL_DAYS);
    setChecks(INITIAL_CHECKS);
    setDone([]);
  };

  const showDay = (i: number) => {
    setDayIdx(i);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="wrap">
        <header>
          <div className="kicker">
            <span><span className="kdot"></span>NYC TRIP · 5 DAYS</span>
            <button className="edit-btn" onClick={() => setEditing(!editing)}>
              {editing ? "✓ DONE" : "✎ EDIT"}
            </button>
          </div>
          <h1>
            {editing ? (
              <Editable value="Edwin & Ayushi" onChange={() => {}} editing={false} />
            ) : (
              <>Edwin <span className="amp">&</span> Ayushi</>
            )}
            <span className="city">in the city.</span>
          </h1>
          <div className="meta">
            <b>MAY 26 → 30, 2026</b><br />
            Base: Cozy Studio · 135 S 14th Ave, Mt Vernon<br />
            Flights: LGA (in Tue ~2pm · out Sat ~7:30pm)<br />
            <span style={{ color: "var(--red)" }}>●</span> Dairy-free
          </div>
        </header>

        <nav className="daynav">
          {days.map((d, i) => (
            <button key={d.id} className={i === dayIdx ? "active" : ""} onClick={() => showDay(i)}>
              <span>{d.day.slice(0, 3).toUpperCase()}</span>
              <span className="num">{d.date.split(" ")[1]}</span>
            </button>
          ))}
        </nav>

        <main ref={contentRef}>
          {currentDay && (
            <article className="day">
              <div className="day-header">
                <div className="day-tag">
                  <Editable value={currentDay.day} onChange={(v) => updateDay({ day: v })} editing={editing} />
                  {" · "}
                  <Editable value={currentDay.date} onChange={(v) => updateDay({ date: v })} editing={editing} />
                </div>
                <h2 className="day-title">
                  <Editable value={currentDay.title} onChange={(v) => updateDay({ title: v })} editing={editing} placeholder="Title" />
                  {" "}
                  <em><Editable value={currentDay.subtitle} onChange={(v) => updateDay({ subtitle: v })} editing={editing} placeholder="subtitle" /></em>
                </h2>
                <Editable
                  value={currentDay.blurb}
                  onChange={(v) => updateDay({ blurb: v })}
                  editing={editing}
                  multiline
                  placeholder="Day blurb..."
                  as="p"
                  className="day-blurb"
                />
              </div>

              {currentDay.stops.map((s, i) => (
                <StopCard
                  key={s.id}
                  stop={s}
                  editing={editing}
                  onChange={(ns) => updateStop(i, ns)}
                  onDelete={() => deleteStop(i)}
                />
              ))}

              {editing && (
                <button className="add-stop-btn" onClick={addStop}>+ ADD STOP</button>
              )}
            </article>
          )}
        </main>

        <div className="checklist">
          <h3 className="checklist-title">Pre-trip checklist.</h3>
          <p className="checklist-sub">Tap to mark done{editing && " · tap × to remove"}</p>
          {checks.map((c) => (
            <div key={c.id} className={`check-item ${done.includes(c.id) ? "done" : ""}`}>
              <div className="check-box" onClick={() => toggleCheck(c.id)} />
              <div className="check-text" onClick={() => toggleCheck(c.id)}>
                <b>{c.title}</b>{c.desc}
              </div>
              {editing && (
                <button className="mini-btn delete" onClick={() => removeCheck(c.id)} style={{ alignSelf: "flex-start", marginTop: 2 }}>×</button>
              )}
            </div>
          ))}
          {editing && <button className="add-stop-btn dark" onClick={addCheck}>+ ADD ITEM</button>}
        </div>

        {editing && (
          <button className="reset-btn" onClick={resetAll}>↺ RESET ALL TO DEFAULTS</button>
        )}

        <footer>
          Made <span className="heart">♥</span> for Edwin · all edits autosaved
        </footer>
      </div>

      {todayActive !== null && todayActive !== dayIdx && (
        <button className="today-pill" onClick={() => showDay(todayActive)}>
          <span className="dot"></span>
          Today · {days[todayActive]?.day}
        </button>
      )}
    </>
  );
}

// ============ STYLES ============
const styles = `
  :root {
    --cream: #f4ede0;
    --cream-2: #ebe1cf;
    --ink: #1a1612;
    --ink-soft: #3d342a;
    --red: #d63a2f;
    --mustard: #e0a13a;
    --teal: #2d6363;
    --line: rgba(26,22,18,0.15);
    --line-2: rgba(26,22,18,0.08);
  }

  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap');

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  body {
    background: var(--cream);
    color: var(--ink);
    font-family: 'Fraunces', Georgia, serif;
    font-optical-sizing: auto;
    line-height: 1.45;
    margin: 0;
    background-image:
      radial-gradient(circle at 20% 10%, rgba(214, 58, 47, 0.06) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(224, 161, 58, 0.08) 0%, transparent 40%);
    min-height: 100vh;
  }

  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 120px;
    position: relative;
  }

  header { border-bottom: 1px solid var(--ink); padding-bottom: 20px; margin-bottom: 24px; }

  .kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-soft);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .kdot {
    width: 6px; height: 6px;
    background: var(--red);
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .edit-btn {
    background: var(--ink);
    color: var(--cream);
    border: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .edit-btn:hover { background: var(--red); }

  h1 {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    font-size: clamp(40px, 11vw, 64px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }
  h1 .amp { font-style: italic; color: var(--red); font-family: 'Fraunces', serif; font-weight: 300; }
  h1 .city { display: block; font-style: italic; font-size: 0.55em; color: var(--ink-soft); margin-top: 4px; }

  .meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 12px;
    line-height: 1.6;
  }
  .meta b { color: var(--ink); font-weight: 600; }

  .daynav {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    margin: 0 -20px 24px;
    padding: 12px 20px;
    scrollbar-width: none;
    position: sticky;
    top: 0;
    background: var(--cream);
    z-index: 10;
    border-bottom: 1px solid var(--line);
  }
  .daynav::-webkit-scrollbar { display: none; }

  .daynav button {
    flex-shrink: 0;
    background: transparent;
    border: 1px solid var(--line);
    color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 68px;
  }
  .daynav button .num {
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
    letter-spacing: 0;
    text-transform: none;
  }
  .daynav button.active {
    background: var(--ink);
    color: var(--cream);
    border-color: var(--ink);
  }

  .day { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .day-header { margin-bottom: 24px; }
  .day-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 8px;
  }
  .day-title {
    font-family: 'Instrument Serif', serif;
    font-weight: 400;
    font-size: clamp(32px, 8vw, 44px);
    line-height: 1;
    letter-spacing: -0.01em;
    margin: 0 0 12px;
  }
  .day-title em {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 300;
    color: var(--ink-soft);
  }
  .day-blurb {
    font-size: 15px;
    color: var(--ink-soft);
    font-style: italic;
    border-left: 2px solid var(--red);
    padding-left: 12px;
    margin: 0 0 24px;
  }

  .stop {
    padding: 20px 0;
    border-top: 1px solid var(--line);
  }
  .stop:last-of-type { border-bottom: 1px solid var(--line); }

  .stop-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--ink-soft);
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    background: var(--ink);
    color: var(--cream);
    padding: 3px 8px;
    font-size: 9px;
    letter-spacing: 0.12em;
    display: inline-block;
  }
  .badge.food { background: var(--red); }
  .badge.sight { background: var(--teal); }
  .badge.travel { background: var(--mustard); color: var(--ink); }

  .stop-name {
    font-family: 'Instrument Serif', serif;
    font-size: 24px;
    font-weight: 400;
    line-height: 1.1;
    margin: 0 0 6px;
  }
  .stop-name a {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--line);
    transition: border-color 0.2s;
  }
  .stop-name a:hover { border-color: var(--red); }

  .stop-detail {
    font-size: 14px;
    color: var(--ink-soft);
    margin: 0 0 10px;
  }

  .stop-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    background: var(--cream-2);
    color: var(--ink-soft);
    border: 1px solid var(--line);
  }
  .chip.df { background: rgba(45, 99, 99, 0.15); color: var(--teal); border-color: rgba(45, 99, 99, 0.3); }
  .chip.cash { background: rgba(214, 58, 47, 0.12); color: var(--red); border-color: rgba(214, 58, 47, 0.25); }
  .chip.rez { background: rgba(224, 161, 58, 0.2); color: #8a5d10; border-color: rgba(224, 161, 58, 0.4); }
  .chip.must { background: var(--ink); color: var(--cream); border-color: var(--ink); font-weight: 600; }

  .swap {
    margin-top: 14px;
    border: 1px dashed var(--line);
    background: rgba(255, 255, 255, 0.3);
  }
  .swap-toggle {
    width: 100%;
    background: none;
    border: none;
    padding: 10px 14px;
    text-align: left;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .swap-toggle:hover { color: var(--ink); }
  .swap-toggle .arrow {
    transition: transform 0.25s ease;
    font-size: 14px;
  }
  .swap.open .swap-toggle .arrow { transform: rotate(45deg); }

  .swap-body { padding: 0 14px 14px; }
  .swap-item {
    padding: 10px 0;
    border-top: 1px solid var(--line-2);
    font-size: 13px;
  }
  .swap-item:first-child { border-top: none; }
  .swap-item b {
    font-family: 'Instrument Serif', serif;
    font-size: 16px;
    font-weight: 400;
    display: block;
    margin-bottom: 2px;
  }
  .swap-item span { color: var(--ink-soft); font-size: 12px; display: block; }

  .checklist {
    margin-top: 32px;
    padding: 20px;
    background: var(--ink);
    color: var(--cream);
    position: relative;
  }
  .checklist::before {
    content: 'BEFORE SHE LANDS';
    position: absolute;
    top: -8px;
    left: 16px;
    background: var(--red);
    color: var(--cream);
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    padding: 3px 8px;
  }
  .checklist-title {
    font-family: 'Instrument Serif', serif;
    font-size: 26px;
    font-weight: 400;
    margin: 4px 0 4px;
  }
  .checklist-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    opacity: 0.6;
    margin: 0 0 16px;
    text-transform: uppercase;
  }

  .check-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(244, 237, 224, 0.15);
    align-items: flex-start;
  }
  .check-item:last-child { border-bottom: none; }

  .check-box {
    width: 16px; height: 16px;
    border: 1px solid var(--cream);
    flex-shrink: 0;
    margin-top: 2px;
    position: relative;
    transition: all 0.2s;
    cursor: pointer;
  }
  .check-item.done .check-box { background: var(--cream); }
  .check-item.done .check-box::after {
    content: '✓';
    position: absolute;
    color: var(--ink);
    font-size: 14px;
    line-height: 14px;
    top: -1px;
    left: 2px;
    font-weight: bold;
  }
  .check-item.done .check-text { opacity: 0.4; text-decoration: line-through; }

  .check-text { font-size: 13px; line-height: 1.4; cursor: pointer; flex: 1; }
  .check-text b {
    font-family: 'Instrument Serif', serif;
    font-size: 15px;
    font-weight: 400;
    display: block;
    margin-bottom: 2px;
  }

  .mini-btn {
    background: var(--cream-2);
    border: 1px solid var(--line);
    color: var(--ink);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    cursor: pointer;
    text-transform: uppercase;
    margin-left: 4px;
  }
  .mini-btn:hover { background: var(--ink); color: var(--cream); }
  .mini-btn.delete { background: rgba(214, 58, 47, 0.15); color: var(--red); border-color: rgba(214, 58, 47, 0.3); }
  .mini-btn.delete:hover { background: var(--red); color: var(--cream); }

  .add-stop-btn {
    width: 100%;
    margin-top: 20px;
    padding: 14px;
    background: transparent;
    border: 2px dashed var(--line);
    color: var(--ink-soft);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.2s;
  }
  .add-stop-btn:hover { border-color: var(--ink); color: var(--ink); background: rgba(255,255,255,0.3); }
  .add-stop-btn.dark { border-color: rgba(244, 237, 224, 0.3); color: rgba(244, 237, 224, 0.7); margin-top: 16px; }
  .add-stop-btn.dark:hover { border-color: var(--cream); color: var(--cream); background: rgba(244, 237, 224, 0.05); }

  .reset-btn {
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    background: transparent;
    border: 1px solid rgba(214, 58, 47, 0.3);
    color: var(--red);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    cursor: pointer;
  }
  .reset-btn:hover { background: var(--red); color: var(--cream); border-color: var(--red); }

  footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  footer .heart { color: var(--red); }

  .today-pill {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: var(--cream);
    padding: 10px 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 20;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border: none;
  }
  .today-pill .dot {
    width: 6px; height: 6px;
    background: var(--red);
    border-radius: 50%;
  }
`;
