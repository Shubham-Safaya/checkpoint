import { useState } from "react";
import { Link } from "react-router-dom";
import examsData from "../../data/facts/exams.json";
import { runRules } from "../../engine/rules";
import { loadProfile } from "../../lib/storage";
import { formatINR } from "../../lib/currency";
import VerdictCardView, { LockedCardView } from "../../components/VerdictCardView";
import VerifyBadge from "../../components/VerifyBadge";
import MilestoneChip from "../../components/MilestoneChip";

const exams = examsData as unknown as {
  matrix: {
    columns: string[]; names: Record<string, string>;
    rows: ({ label: string } & Record<string, string>)[];
    choose_if: Record<string, string>;
  };
  facts: { id: string; claim: string; sources: { title: string; url: string }[]; last_verified: string; confidence: "verified" | "needs_verification" | "sample_data" }[];
  salary_bands: { value: string; label: string; mid: number }[];
};

function highlightColumn(profile: ReturnType<typeof loadProfile>): string | null {
  const budget = profile.budget_band as string | null;
  const loans = profile.loan_access as string | null;
  const goal = Array.isArray(profile.goal) ? (profile.goal as string[]) : [];
  if (goal.includes("ms_mem_abroad")) return "gre";
  if (!budget || !loans) return null;
  const lowBudget = budget === "<25L" || budget === "25-50L";
  if (lowBudget && loans !== "collateral") return "cat";
  return "gmat";
}

export default function PathwaysPage() {
  const profile = loadProfile();
  const { matched, locked } = runRules(profile, "pathways");
  const hl = highlightColumn(profile);
  const [attempts, setAttempts] = useState(1);
  const [band, setBand] = useState(exams.salary_bands[1].value);
  const mid = exams.salary_bands.find((b) => b.value === band)?.mid || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-end gap-3 mb-3 overflow-x-auto" aria-hidden>
          <MilestoneChip top="CAT" bottom="IIMs · India" tone={hl === "cat" ? "marigold" : "neutral"} />
          <MilestoneChip top="GMAT" bottom="ISB · global MBA" tone={hl === "gmat" ? "marigold" : "neutral"} />
          <MilestoneChip top="GRE" bottom="MS · MEM · optionality" tone={hl === "gre" ? "marigold" : "neutral"} />
        </div>
        <h1 className="text-2xl mb-1">The exam fork, honestly</h1>
        <p className="text-sm text-ink/70">
          Three lanes, different doors, different price tags. Your profile is applied — highlighted cells
          and the reality-check cards below are computed, not generic.
        </p>
      </div>

      {/* 1. Reality-check slot — R1-style cards render FIRST */}
      {matched.length > 0 && (
        <section className="space-y-4">
          {matched.map((r) => <VerdictCardView key={r.id} rule={r} />)}
        </section>
      )}
      {locked.length > 0 && (
        <section className="space-y-2">
          {locked.map((l) => <LockedCardView key={l.rule.id} rule={l.rule} missing={l.missing} />)}
        </section>
      )}
      {matched.length === 0 && locked.length === 0 && (
        <p className="text-sm text-ink/60">Answer the wizard to unlock reality-check cards for your exact situation.</p>
      )}

      {/* 2. Comparison matrix */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg mb-3">CAT vs GMAT vs GRE</h2>
        <table className="w-full text-sm border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="text-left font-mono text-xs uppercase text-ink/50 p-2"></th>
              {exams.matrix.columns.map((c) => (
                <th key={c} className={`text-left p-2 font-display ${hl === c ? "bg-marigold/20 rounded-t-lg" : ""}`}>
                  {exams.matrix.names[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.matrix.rows.map((row) => (
              <tr key={row.label} className="border-t border-ink/10 align-top">
                <td className="p-2 font-semibold text-xs">{row.label}</td>
                {exams.matrix.columns.map((c) => (
                  <td key={c} className={`p-2 ${hl === c ? "bg-marigold/10" : ""}`}>{row[c]}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-ink/20 align-top">
              <td className="p-2 font-semibold text-xs">Choose this if…</td>
              {exams.matrix.columns.map((c) => (
                <td key={c} className={`p-2 text-xs italic ${hl === c ? "bg-marigold/10" : ""}`}>
                  {exams.matrix.choose_if[c]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="flex gap-2 flex-wrap mt-3">
          {exams.facts.map((f) => (
            <VerifyBadge key={f.id} confidence={f.confidence} lastVerified={f.last_verified} sources={f.sources} />
          ))}
        </div>
      </section>

      {/* 4. The years question */}
      <section className="card">
        <h2 className="text-lg mb-1">The years question</h2>
        <p className="text-sm text-ink/70 mb-3">
          Each retake season costs a year. What does a year cost <em>you</em>? Educational and clearly
          approximate — but the number deserves to be looked at, not felt.
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <label className="text-sm font-semibold">
            Retake years
            <select className="field !w-auto" value={attempts} onChange={(e) => setAttempts(Number(e.target.value))}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Current salary band
            <select className="field !w-auto" value={band} onChange={(e) => setBand(e.target.value)}>
              {exams.salary_bands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          <MilestoneChip top={formatINR(attempts * mid, true)} bottom="foregone earnings (approx.)" tone="red" />
        </div>
        <p className="text-xs text-ink/50 mt-2">
          Band midpoint × years. Ignores raises, promotions, and compounding — the true number is larger.
        </p>
      </section>

      <p className="text-sm">
        Next: <Link className="text-linkblue underline" to="/colleges">price the destinations</Link> (Phase 3) or{" "}
        <Link className="text-linkblue underline" to="/my-list">build your checklist</Link>.
      </p>
    </div>
  );
}
