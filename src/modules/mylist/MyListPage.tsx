import { useState } from "react";
import { Link } from "react-router-dom";
import c1 from "../../data/checklists/c1-us-first-90-days.json";
import c2 from "../../data/checklists/c2-india-nri-compliance.json";
import c4 from "../../data/checklists/c4-nri-property.json";
import type { Checklist } from "../../lib/types";
import { loadLists, loadProfile } from "../../lib/storage";
import { shareUrl, freshUrl } from "../../lib/share";
import ChecklistView from "../../components/ChecklistView";
import MilestoneChip from "../../components/MilestoneChip";

export default function MyListPage() {
  const profile = loadProfile();
  const lists = loadLists();
  const [copied, setCopied] = useState<string | null>(null);

  const goals = Array.isArray(profile.goal) ? (profile.goal as string[]) : [];
  const inUS = profile.location_now === "usa";

  const included: Checklist[] = [];
  if (inUS || goals.includes("money")) included.push(c1 as unknown as Checklist);
  if (inUS || goals.includes("money") || goals.includes("next_checkpoint"))
    included.push(c2 as unknown as Checklist);
  if (goals.includes("property")) included.push(c4 as unknown as Checklist);

  const eb1aRelevant = goals.includes("green_card") || goals.includes("next_checkpoint");
  const eb1aStrong = Object.values(lists.eb1a).filter((c) => c.strength === "strong").length;

  const totalItems = included.reduce((s, l) => s + l.items.length, 0);
  const doneItems = included.reduce(
    (s, l) => s + l.items.filter((i) => lists.done[`${l.id}.${i.id}`]).length, 0);
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  async function copy(url: string, tag: string) {
    await navigator.clipboard.writeText(url);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1600);
  }

  if (!profile.citizenship && !goals.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl mb-2">Answer 6 questions to unlock your map</h1>
        <p className="text-ink/70 mb-4">Your checklist is compiled from your answers — nothing generic.</p>
        <Link to="/profile" className="btn">Start the wizard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h1 className="text-2xl">
          {profile.name ? `${profile.name}'s` : "Your"} checklist
        </h1>
        <MilestoneChip top="PROGRESS" bottom={`${pct}% done`} tone={pct === 100 ? "green" : "marigold"} />
      </div>

      <div className="flex gap-2 flex-wrap mb-6 no-print">
        <button className="btn btn-secondary" onClick={() => window.print()}>Print one-pager</button>
        <button className="btn btn-secondary" onClick={() => copy(shareUrl(profile), "mine")}>
          {copied === "mine" ? "Link copied!" : "Share my list (read-only)"}
        </button>
        <button className="btn" onClick={() => copy(freshUrl(), "fresh")}>
          {copied === "fresh" ? "Link copied!" : "Make one for someone else"}
        </button>
      </div>

      {eb1aRelevant && (
        <section className="card reveal mb-6">
          <h2 className="text-lg mb-1">Immigration</h2>
          <p className="text-sm text-ink/70 mb-2">
            EB1A evidence: <span className="font-mono">{eb1aStrong} of 10</span> criteria rated strong.
            You need 3, argued well.
          </p>
          <Link to="/immigration/eb1a-tracker" className="text-linkblue underline text-sm">Open the tracker →</Link>
        </section>
      )}

      <div className="space-y-6">
        {included.map((l) => <ChecklistView key={l.id} list={l} />)}
        {!included.length && (
          <p className="text-ink/70 text-sm">
            No checklists match your goals yet — open <Link className="text-linkblue underline" to="/money">Money</Link>{" "}
            or <Link className="text-linkblue underline" to="/travel">Travel</Link> to add some.
          </p>
        )}
      </div>

      <section className="card mt-6">
        <h2 className="text-lg mb-1">Travel prep</h2>
        <p className="text-sm text-ink/70">
          Check verdicts for your documents on the <Link className="text-linkblue underline" to="/travel">travel finder</Link>.
          Anything amber: verify at the official source before booking.
        </p>
      </section>
    </div>
  );
}
