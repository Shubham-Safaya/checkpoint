import { Link } from "react-router-dom";
import type { Rule } from "../engine/rules";
import { flipsFor } from "../engine/rules";
import { loadProfile } from "../lib/storage";
import VerifyBadge from "./VerifyBadge";
import MilestoneChip from "./MilestoneChip";

const HOW_BAD_TONE: Record<string, "green" | "marigold" | "red"> = {
  recoverable: "green",
  expensive: "marigold",
  "status-risk": "red",
};

export default function VerdictCardView({ rule }: { rule: Rule }) {
  const card = rule.then;
  const flips = flipsFor(rule, loadProfile());

  return (
    <article className="card reveal space-y-3">
      <div className="flex items-start gap-3 flex-wrap">
        <MilestoneChip top={card.verdict.split(" ").slice(0, 2).join(" ").toUpperCase()} bottom={rule.module} small />
        <div className="flex-1 min-w-[12rem]">
          <h3 className="text-lg font-bold leading-snug">{card.verdict}</h3>
          <p className="text-sm text-ink/80">{card.headline}</p>
        </div>
      </div>

      <div>
        <h4 className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">Why</h4>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {card.why.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-cleargreen mb-1">Pros</h4>
          <ul className="list-disc ml-5 space-y-1">{card.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wide text-signalred mb-1">Cons</h4>
          <ul className="list-disc ml-5 space-y-1">{card.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      </div>

      <div className="border border-ink/15 rounded-lg p-3 bg-paper">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-mono text-xs uppercase tracking-wide text-ink/60">Worst case</h4>
          <MilestoneChip small top={card.worst_case.how_bad.toUpperCase()} tone={HOW_BAD_TONE[card.worst_case.how_bad]} />
        </div>
        <p className="text-sm">{card.worst_case.scenario}</p>
        <p className="text-sm mt-1"><strong>Mitigation:</strong> {card.worst_case.mitigation}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {card.actions.map((a) =>
          a.link?.startsWith("/") ? (
            <Link key={a.label} to={a.link} className="btn btn-secondary !py-1.5 text-xs" title={a.how}>{a.label}</Link>
          ) : (
            <a key={a.label} href={a.link} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary !py-1.5 text-xs" title={a.how}>{a.label}</a>
          )
        )}
      </div>

      {flips.length > 0 && (
        <div className="border-t border-dashed border-ink/15 pt-2">
          <h4 className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">What would change this answer</h4>
          <ul className="text-xs text-ink/70 space-y-0.5">
            {flips.map((f, i) => <li key={i}>↳ {f}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <VerifyBadge confidence={card.confidence} lastVerified={card.last_verified} sources={card.sources} />
        {card.sources.filter((s) => s.url !== "TODO" && s.url.startsWith("http")).map((s) => (
          <a key={s.url} className="text-linkblue text-xs underline" href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title}
          </a>
        ))}
      </div>
    </article>
  );
}

export function LockedCardView({ rule, missing }: { rule: Rule; missing: string[] }) {
  return (
    <div className="card border-dashed opacity-80">
      <p className="text-sm">
        <span className="font-semibold">“{rule.then.verdict}”</span> is waiting on{" "}
        <span className="font-mono">{missing.length}</span> more answer{missing.length > 1 ? "s" : ""} ({missing.join(", ")}).
      </p>
      <Link to="/profile" className="text-linkblue text-sm underline">Answer them →</Link>
    </div>
  );
}
