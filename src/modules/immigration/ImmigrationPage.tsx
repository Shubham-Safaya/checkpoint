import { Link } from "react-router-dom";
import { runRules } from "../../engine/rules";
import { loadProfile } from "../../lib/storage";
import VerdictCardView, { LockedCardView } from "../../components/VerdictCardView";
import MilestoneChip from "../../components/MilestoneChip";
import { usePageMeta } from "../../lib/usePageMeta";

const STAGES = [
  { id: "f1", label: "F-1", sub: "student" },
  { id: "opt", label: "OPT/STEM", sub: "work authorization" },
  { id: "h1b", label: "H-1B", sub: "sponsored work" },
  { id: "i140", label: "PERM · I-140", sub: "the checkpoint" },
  { id: "pd", label: "PD WAIT", sub: "the queue" },
  { id: "gc", label: "GREEN CARD", sub: "permanent" },
  { id: "citizen", label: "CITIZEN", sub: "the end of the road" },
];

function stageFromProfile(p: ReturnType<typeof loadProfile>): string | null {
  const s = p.us_status as string | null;
  const g = p.gc_stage as string | null;
  if (!s) return null;
  if (s === "citizen") return "citizen";
  if (s === "green_card") return "gc";
  if (g === "pd_waiting" || g === "i140_approved") return "pd";
  if (g === "perm_filed") return "i140";
  if (s === "h1b" || s === "l1" || s === "h4_ead" || s === "gc_ead") return "h1b";
  if (s === "opt" || s === "stem_opt") return "opt";
  if (s === "f1") return "f1";
  return null;
}

const GUIDES = [
  { slug: "priority-dates", title: "How to read the Visa Bulletin", blurb: "Final Action vs Dates for Filing, and why Indian-born EB2/EB3 waits run to decades." },
  { slug: "perm-niw-eb1a", title: "PERM vs EB2-NIW vs EB1A", blurb: "Who controls each, rough timelines, and what job changes do to them." },
  { slug: "eb1a-tracker", title: "EB1A evidence tracker", blurb: "The 10 criteria, pick-3 framing, your private evidence log." },
  { slug: "day1-cpt", title: "Day-1 CPT, honestly", blurb: "Where the risk actually bites — extensions, transfers, and stamping." },
  { slug: "h1b-clock", title: "The H-1B six-year clock", blurb: "Recapture, cap-gap, and extensions beyond year six." },
  { slug: "legal-income", title: "What income is legal on your visa", blurb: "Fine / not authorized / attorney-territory — the matrix everyone whispers about." },
];

export default function ImmigrationPage() {
  usePageMeta("US immigration checkpoints", "F-1 to citizenship as a checkpoint timeline, with YOU ARE HERE pinned from your profile — and the guides for the forks: PERM vs NIW vs EB1A, the H-1B clock, Day-1 CPT, legal income.");
  const profile = loadProfile();
  const here = stageFromProfile(profile);
  const { matched, locked } = runRules(profile, "immigration");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl mb-1">Your immigration checkpoints</h1>
        <p className="banner-caution mb-4">Outcomes depend on the facts of your case — verify with an immigration attorney.</p>
        <div className="flex items-end gap-2 overflow-x-auto pb-2" role="img" aria-label="Immigration checkpoint timeline">
          {STAGES.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1 shrink-0">
              {here === s.id && <span className="font-mono text-[10px] font-bold text-signalred">YOU ARE HERE ▾</span>}
              <MilestoneChip top={s.label} bottom={s.sub} tone={here === s.id ? "marigold" : "neutral"} />
            </div>
          ))}
        </div>
        {!here && (
          <p className="text-sm text-ink/60 mt-2">
            <Link className="text-linkblue underline" to="/profile">Answer the US-status questions</Link> to pin “you are here.”
          </p>
        )}
      </div>

      {matched.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg">Your next checkpoints</h2>
          {matched.map((r) => <VerdictCardView key={r.id} rule={r} />)}
        </section>
      )}
      {locked.length > 0 && (
        <section className="space-y-2">
          {locked.map((l) => <LockedCardView key={l.rule.id} rule={l.rule} missing={l.missing} />)}
        </section>
      )}

      <section>
        <h2 className="text-lg mb-3">Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {GUIDES.map((g) => (
            <Link key={g.slug} to={`/immigration/${g.slug}`} className="card reveal hover:border-ink/40">
              <h3 className="font-semibold">{g.title}</h3>
              <p className="text-sm text-ink/70">{g.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
