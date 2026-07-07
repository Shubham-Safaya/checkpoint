import { useState } from "react";
import c3 from "../../data/checklists/c3-eb1a.json";
import { loadLists, saveLists } from "../../lib/storage";
import MilestoneChip from "../../components/MilestoneChip";
import VerifyBadge from "../../components/VerifyBadge";
import type { Confidence, Source } from "../../lib/types";

interface Criterion { id: string; title: string; hint: string }
const data = c3 as unknown as {
  title: string; banner: string; criteria: Criterion[];
  sources: Source[]; last_verified: string; confidence: Confidence;
};

const STRENGTHS = ["none", "building", "strong"] as const;

export default function EB1ATracker() {
  const [state, setState] = useState(loadLists());

  function getC(id: string) {
    return state.eb1a[id] || { strength: "none", artifacts: [] };
  }

  function setStrength(id: string, strength: string) {
    const next = { ...state, eb1a: { ...state.eb1a, [id]: { ...getC(id), strength } } };
    setState(next); saveLists(next);
  }

  function addArtifact(id: string, text: string) {
    if (!text.trim()) return;
    const c = getC(id);
    const next = { ...state, eb1a: { ...state.eb1a, [id]: { ...c, artifacts: [...c.artifacts, text.trim()] } } };
    setState(next); saveLists(next);
  }

  function removeArtifact(id: string, idx: number) {
    const c = getC(id);
    const next = {
      ...state,
      eb1a: { ...state.eb1a, [id]: { ...c, artifacts: c.artifacts.filter((_, i) => i !== idx) } },
    };
    setState(next); saveLists(next);
  }

  const strong = data.criteria.filter((c) => getC(c.id).strength === "strong").length;
  const building = data.criteria.filter((c) => getC(c.id).strength === "building").length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="text-2xl">{data.title}</h1>
        <MilestoneChip top="EB1A" bottom={`${strong} of 10 strong`} tone={strong >= 3 ? "green" : "marigold"} />
      </div>
      <p className="banner-caution mb-2">{data.banner}</p>
      <p className="text-sm text-ink/70 mb-4">
        The pick-3 framing: you need at least <strong>3 of 10</strong> criteria, argued well, then a final-merits
        story that ties them together. Aim for 3 strong + 2 building as buffer.
        {" "}<VerifyBadge confidence={data.confidence} lastVerified={data.last_verified} sources={data.sources} />
      </p>
      <p className="text-xs text-ink/50 mb-4">
        {strong} strong · {building} building. This worksheet allows typing — it's your private evidence log,
        saved only in this browser. Print it before attorney calls.
      </p>

      <div className="space-y-4">
        {data.criteria.map((c) => {
          const cur = getC(c.id);
          return (
            <div key={c.id} className="card reveal">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-base font-semibold">{c.title}</h2>
                  <p className="text-xs text-ink/60">{c.hint}</p>
                </div>
                <div className="flex gap-1 no-print" role="group" aria-label={`Strength for ${c.title}`}>
                  {STRENGTHS.map((s) => (
                    <button key={s}
                      className={`chip !px-2.5 !py-1 text-xs capitalize ${cur.strength === s ? "chip-on" : ""}`}
                      aria-pressed={cur.strength === s}
                      onClick={() => setStrength(c.id, s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <span className="hidden print:inline font-mono text-xs uppercase">{cur.strength}</span>
              </div>
              {cur.artifacts.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {cur.artifacts.map((a, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="font-mono text-ink/40">·</span>
                      <span className="flex-1">{a}</span>
                      <button className="text-signalred text-xs no-print" onClick={() => removeArtifact(c.id, i)}
                        aria-label="remove artifact">×</button>
                    </li>
                  ))}
                </ul>
              )}
              <form className="mt-2 flex gap-2 no-print"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem("artifact") as HTMLInputElement;
                  addArtifact(c.id, input.value);
                  input.value = "";
                }}>
                <input name="artifact" className="field text-sm" placeholder="Log evidence: what, where, date…" maxLength={200} />
                <button className="btn btn-secondary !py-1.5 text-xs" type="submit">Add</button>
              </form>
            </div>
          );
        })}
      </div>

      <button className="btn btn-secondary mt-5 no-print" onClick={() => window.print()}>
        Print my evidence log
      </button>
    </div>
  );
}
