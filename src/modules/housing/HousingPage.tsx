import { useState } from "react";
import c4 from "../../data/checklists/c4-nri-property.json";
import type { Checklist } from "../../lib/types";
import { runRules } from "../../engine/rules";
import { loadProfile } from "../../lib/storage";
import VerdictCardView, { LockedCardView } from "../../components/VerdictCardView";
import ChecklistView from "../../components/ChecklistView";
import MilestoneChip from "../../components/MilestoneChip";
import { usePageMeta } from "../../lib/usePageMeta";

const PRICE_BANDS = [
  { value: "p1", label: "Home ≈ 15× annual rent (cheap-to-buy market)", ratio: 15 },
  { value: "p2", label: "Home ≈ 20× annual rent", ratio: 20 },
  { value: "p3", label: "Home ≈ 25× annual rent", ratio: 25 },
  { value: "p4", label: "Home ≈ 30×+ annual rent (expensive-to-buy market)", ratio: 30 },
];
const HORIZONS = [
  { value: "lt3", label: "<3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "5+ years" },
];
const DOWN_SOURCES = [
  { value: "savings", label: "Own savings" },
  { value: "family", label: "Family support" },
  { value: "loan_top", label: "Stretching with extra borrowing" },
];

function frameworkVerdict(ratio: number, horizon: string, down: string) {
  if (horizon === "lt3") return { v: "RENT", tone: "red" as const, why: "Under 3 years, ~8–10% round-trip transaction costs almost always beat any appreciation you'd capture. This isn't close." };
  if (ratio >= 25) return { v: "LEAN RENT", tone: "marigold" as const, why: "At 25×+ price-to-rent, the landlord is subsidizing you. Invest the difference; revisit if the ratio or your horizon changes." };
  if (horizon === "5+" && ratio <= 20 && down !== "loan_top") return { v: "BUY CASE EXISTS", tone: "green" as const, why: "5+ year horizon, sane price-to-rent, and a real down payment — this is the profile where buying works. Now apply the visa-stability test below." };
  return { v: "DEPENDS", tone: "marigold" as const, why: "Middle territory: the ratio and horizon don't decide it. Job stability, visa stage, and how much you value not moving decide it. Be honest about all three." };
}

export default function HousingPage() {
  usePageMeta("Rent vs buy, for visa holders", "The 5-year test, price-to-rent framing, the H-1B 60-day-clock honesty card, and the NRI purchase-in-India checklist.");
  const profile = loadProfile();
  const { matched, locked } = runRules(profile, "housing");
  const [ratio, setRatio] = useState("p2");
  const [horizon, setHorizon] = useState("3-5");
  const [down, setDown] = useState("savings");
  const r = PRICE_BANDS.find((x) => x.value === ratio)!.ratio;
  const verdict = frameworkVerdict(r, horizon, down);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Housing, without the pom-poms</h1>
        <p className="banner-caution">Educational framework, not financial or legal advice. Property decisions deserve a CPA/CA and, on a visa, an immigration-aware lens.</p>
      </div>

      {matched.map((rule) => <VerdictCardView key={rule.id} rule={rule} />)}
      {locked.map((l) => <LockedCardView key={l.rule.id} rule={l.rule} missing={l.missing} />)}

      <section className="card">
        <h2 className="text-lg mb-1">The 5-year test, as a calculator</h2>
        <p className="text-sm text-ink/70 mb-3">Dropdown bands only — a framework verdict, explicitly not a promise.</p>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <label className="text-sm font-semibold">Your market's price-to-rent
            <select className="field" value={ratio} onChange={(e) => setRatio(e.target.value)}>
              {PRICE_BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Honest horizon in this city
            <select className="field" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
              {HORIZONS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Down payment source
            <select className="field" value={down} onChange={(e) => setDown(e.target.value)}>
              {DOWN_SOURCES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MilestoneChip top={verdict.v} bottom="framework verdict" tone={verdict.tone} />
          <p className="text-sm flex-1 min-w-[14rem]">{verdict.why}</p>
        </div>
      </section>

      <section className="card border-signalred/40">
        <h2 className="text-lg mb-1">The visa-stability card, said plainly</h2>
        <p className="text-sm">
          Buying in the US on H-1B means a layoff starts a <strong>60-day clock while you hold a mortgage</strong>.
          Forced job search and forced sale/landlording at the same time is the real worst case — it happens to
          real people every layoff cycle. Mitigations that actually work: 6+ months of full carrying costs banked,
          a spouse with independent status or income, and checking the specific neighborhood's resale/rental
          liquidity before you buy, not after.
        </p>
      </section>

      <ChecklistView list={c4 as unknown as Checklist} />
    </div>
  );
}
