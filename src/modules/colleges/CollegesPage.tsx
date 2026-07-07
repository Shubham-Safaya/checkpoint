import { useState } from "react";
import collegesData from "../../data/colleges/programs.json";
import { runRules } from "../../engine/rules";
import { loadProfile } from "../../lib/storage";
import { formatINR } from "../../lib/currency";
import VerdictCardView, { LockedCardView } from "../../components/VerdictCardView";
import VerifyBadge from "../../components/VerifyBadge";
import MilestoneChip from "../../components/MilestoneChip";
import { usePageMeta } from "../../lib/usePageMeta";

interface ProgramRow {
  country: string; domain: string; school: string; program: string; duration: string;
  tuition_local: string; all_in_inr: number; living_band: string;
  confidence: "verified" | "needs_verification" | "sample_data"; last_verified: string;
  sources: { title: string; url: string }[];
}
const data = collegesData as unknown as {
  countries: Record<string, { name: string; post_study: string; post_study_confidence: string }>;
  domains: Record<string, string>;
  programs: ProgramRow[];
};

const BUDGET_MAX: Record<string, number> = {
  "<25L": 2500000, "25-50L": 5000000, "50-75L": 7500000, "75L-1Cr": 10000000, ">1Cr": 15000000,
};

export function affordability(allIn: number, budget: string | null, loans: string | null):
  { tag: string; tone: "green" | "marigold" | "red" | "neutral" } {
  if (!budget) return { tag: "set your budget →", tone: "neutral" };
  const max = BUDGET_MAX[budget] || 0;
  if (allIn <= max) return { tag: "Affordable", tone: "green" };
  if (allIn <= max * 1.35) return { tag: "Stretch", tone: "marigold" };
  if (loans === "collateral") return { tag: "Needs collateral loan", tone: "marigold" };
  return { tag: "Out of range", tone: "red" };
}

export default function CollegesPage() {
  usePageMeta("Colleges & tuition explorer", "Tuition, living costs, post-study work rules, and an affordability verdict computed for your budget — the ₹1-crore-loan problem, productized.");
  const profile = loadProfile();
  const budget = profile.budget_band as string | null;
  const loans = profile.loan_access as string | null;
  const [country, setCountry] = useState("germany");
  const [domain, setDomain] = useState("ms_cs_data");
  const { matched, locked } = runRules(profile, "colleges");

  const rows = data.programs.filter((p) => p.country === country && p.domain === domain);
  const meta = data.countries[country];
  const anySample = rows.some((r) => r.confidence === "sample_data");

  // calculator state
  const [calcBudget, setCalcBudget] = useState(budget || "25-50L");
  const [calcLoans, setCalcLoans] = useState(loans || "no_collateral");
  const cheapest = [...rows].sort((a, b) => a.all_in_inr - b.all_in_inr)[0];
  const calc = cheapest ? affordability(cheapest.all_in_inr, calcBudget, calcLoans) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Colleges & tuition, priced honestly</h1>
        <p className="text-sm text-ink/70">
          Every table shows its verification status. SAMPLE means the structure is real, the numbers are
          placeholders — an honest half-empty table beats a confident invented one.
        </p>
      </div>

      {matched.map((r) => <VerdictCardView key={r.id} rule={r} />)}
      {locked.map((l) => <LockedCardView key={l.rule.id} rule={l.rule} missing={l.missing} />)}

      <div className="card flex flex-wrap gap-3 items-end no-print">
        <label className="text-sm font-semibold">Country
          <select className="field !w-auto" value={country} onChange={(e) => setCountry(e.target.value)}>
            {Object.entries(data.countries).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Domain
          <select className="field !w-auto" value={domain} onChange={(e) => setDomain(e.target.value)}>
            {Object.entries(data.domains).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      <section className={`card overflow-x-auto ${anySample ? "sample-wrap" : ""}`}>
        {anySample && (
          <p className="banner-caution mb-3 relative z-10">
            SAMPLE structure — real, bursar-verified rows are being added per the refresh workflow in
            DATA_SOURCES.md. Do not plan on these numbers.
          </p>
        )}
        <h2 className="text-lg mb-2">{data.countries[country].name} · {data.domains[domain]}</h2>
        {rows.length ? (
          <table className="w-full text-sm border-collapse min-w-[640px] relative z-10">
            <thead>
              <tr className="text-left font-mono text-xs uppercase text-ink/50">
                <th className="p-2">School</th><th className="p-2">Program</th><th className="p-2">Duration</th>
                <th className="p-2">Tuition</th><th className="p-2">Living</th><th className="p-2">All-in (₹)</th>
                <th className="p-2">For you</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = affordability(r.all_in_inr, budget, loans);
                return (
                  <tr key={r.school + r.program} className="border-t border-ink/10 align-top">
                    <td className="p-2 font-semibold">{r.school}</td>
                    <td className="p-2">{r.program}</td>
                    <td className="p-2 font-mono text-xs">{r.duration}</td>
                    <td className="p-2">{r.tuition_local}</td>
                    <td className="p-2">{r.living_band}</td>
                    <td className="p-2 font-mono">{formatINR(r.all_in_inr, true)}</td>
                    <td className="p-2"><MilestoneChip small top={a.tag} tone={a.tone} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-ink/60 relative z-10">
            No rows for this combination yet — honestly empty rather than invented. The refresh pipeline
            (data-pipeline/README.md) is how rows get added.
          </p>
        )}
        <div className="mt-3 relative z-10 space-y-1">
          <p className="text-sm"><strong>Post-study work rule:</strong> {meta.post_study}{" "}
            <VerifyBadge confidence="needs_verification" lastVerified="TODO" /></p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg mb-1">Affordability calculator</h2>
        <p className="text-sm text-ink/70 mb-3">Cost band vs funding band — the ₹1-crore-loan question, answered before the loan.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-sm font-semibold">Budget (no loans)
            <select className="field !w-auto" value={calcBudget} onChange={(e) => setCalcBudget(e.target.value)}>
              {Object.keys(BUDGET_MAX).map((b) => <option key={b} value={b}>{b.replace("L", "L ₹")}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Loan access
            <select className="field !w-auto" value={calcLoans} onChange={(e) => setCalcLoans(e.target.value)}>
              <option value="collateral">Collateral-backed</option>
              <option value="no_collateral">No-collateral only</option>
              <option value="no_loans">Prefer no loans</option>
            </select>
          </label>
          {calc && cheapest && (
            <MilestoneChip top={calc.tag.toUpperCase()} bottom={`cheapest here: ${formatINR(cheapest.all_in_inr, true)}`} tone={calc.tone} />
          )}
        </div>
        {cheapest && (
          <div className="banner-caution mt-3 text-sm">
            <strong>Worst case for {data.countries[country].name}:</strong> loan taken, and no job lands within
            the post-study window ({meta.post_study.split(";")[0].toLowerCase()}). Then the loan follows you to a
            home-country salary — price THAT EMI before signing, not the best case.
          </div>
        )}
      </section>
    </div>
  );
}
