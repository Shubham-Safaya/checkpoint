import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import questionsData from "../../data/questions.json";
import type { Profile } from "../../lib/types";
import { loadProfile, saveProfile } from "../../lib/storage";
import MilestoneChip from "../../components/MilestoneChip";

interface Option { value: string; label: string }
interface ShowIf { field?: string; in?: string[]; contains?: string; anyOf?: ShowIf[] }
interface Question {
  id: string; label: string; type: "text" | "select" | "chips";
  options?: Option[]; max?: number; ordinal?: boolean; showIf?: ShowIf;
}
interface Step { id: string; title: string; questions: Question[]; showIf?: ShowIf }

const steps = (questionsData as { steps: Step[] }).steps;

function condMet(c: ShowIf | undefined, p: Profile): boolean {
  if (!c) return true;
  if (c.anyOf) return c.anyOf.some((x) => condMet(x, p));
  const v = c.field ? p[c.field] : null;
  if (c.in) return typeof v === "string" && c.in.includes(v);
  if (c.contains) return Array.isArray(v) && v.includes(c.contains);
  return true;
}

export default function Wizard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const visibleSteps = useMemo(() => steps.filter((s) => condMet(s.showIf, profile)), [profile]);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const step = visibleSteps[Math.min(stepIdx, visibleSteps.length - 1)];
  const visibleQs = step.questions.filter((q) => condMet(q.showIf, profile));

  function set(id: string, value: string | string[] | null) {
    const next = { ...profile, [id]: value };
    setProfile(next);
    saveProfile(next); // auto-save on every answer
  }

  function toggleChip(q: Question, value: string) {
    const cur = Array.isArray(profile[q.id]) ? (profile[q.id] as string[]) : [];
    let next: string[];
    if (cur.includes(value)) next = cur.filter((x) => x !== value);
    else if (q.max && cur.length >= q.max) next = [...cur.slice(1), value]; // replace oldest
    else next = [...cur, value];
    set(q.id, next);
  }

  const goals = Array.isArray(profile.goal) ? (profile.goal as string[]) : [];

  if (done) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-1">Your profile</h1>
        <p className="text-ink/70 mb-4 text-sm">Tap any chip to change that answer. Everything stays in your browser.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {visibleSteps.flatMap((s) =>
            s.questions.filter((q) => condMet(q.showIf, profile)).map((q) => {
              const v = profile[q.id];
              const text = Array.isArray(v)
                ? v.map((x) => q.options?.find((o) => o.value === x)?.label || x).join(" + ")
                : q.options?.find((o) => o.value === v)?.label || (v as string) || "—";
              return (
                <button
                  key={q.id}
                  className="chip"
                  onClick={() => { setDone(false); setStepIdx(visibleSteps.indexOf(s)); }}
                  title={q.label}
                >
                  <span className="font-mono text-xs mr-1.5 text-ink/50">{q.id}</span>{text}
                </button>
              );
            })
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(goals.includes("green_card") || goals.includes("next_checkpoint")) && (
            <Link to="/immigration/eb1a-tracker" className="btn">Open my checkpoints</Link>
          )}
          <button className="btn" onClick={() => navigate("/my-list")}>Build my checklist</button>
          <button className="btn btn-secondary" onClick={() => navigate("/travel")}>Where can I travel?</button>
          {!goals.includes("green_card") && !goals.includes("next_checkpoint") && (
            <Link to="/money" className="btn btn-secondary">Money setup</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* progress: milestone markers */}
      <div className="flex items-end gap-2 mb-6 overflow-x-auto no-print" aria-hidden>
        {visibleSteps.map((s, i) => (
          <MilestoneChip key={s.id} small top={`${i + 1}/${visibleSteps.length}`} bottom={s.title.split(" ")[0]}
            tone={i < stepIdx ? "green" : i === stepIdx ? "marigold" : "neutral"} />
        ))}
      </div>

      <h1 className="text-2xl mb-4">{step.title}</h1>
      <div className="space-y-5">
        {visibleQs.map((q) => (
          <div key={q.id}>
            <label className="block font-semibold text-sm mb-1.5" htmlFor={q.id}>{q.label}</label>
            {q.type === "text" && (
              <input id={q.id} className="field" maxLength={40} value={(profile[q.id] as string) || ""}
                onChange={(e) => set(q.id, e.target.value || null)} />
            )}
            {q.type === "select" && (
              <select id={q.id} className="field" value={(profile[q.id] as string) || ""}
                onChange={(e) => set(q.id, e.target.value || null)}>
                <option value="">— select —</option>
                {q.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {q.type === "chips" && (
              <div className="flex flex-wrap gap-2" role="group" aria-label={q.label}>
                {q.options?.map((o) => {
                  const on = Array.isArray(profile[q.id]) && (profile[q.id] as string[]).includes(o.value);
                  return (
                    <button key={o.value} type="button" className={`chip ${on ? "chip-on" : ""}`}
                      aria-pressed={on} onClick={() => toggleChip(q, o.value)}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button className="btn btn-secondary" disabled={stepIdx === 0} onClick={() => setStepIdx(stepIdx - 1)}>
          ← Back
        </button>
        {stepIdx < visibleSteps.length - 1 ? (
          <button className="btn" onClick={() => setStepIdx(stepIdx + 1)}>Next →</button>
        ) : (
          <button className="btn" onClick={() => setDone(true)}>Finish</button>
        )}
      </div>
      <p className="text-xs text-ink/50 mt-4">Unanswered questions are fine — they just lock the cards that need them.</p>
    </div>
  );
}
