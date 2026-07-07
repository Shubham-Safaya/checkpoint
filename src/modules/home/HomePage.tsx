import { Link } from "react-router-dom";
import { SITE_NAME } from "../../siteConfig";
import { freshUrl } from "../../lib/share";
import { useState } from "react";
import MilestoneChip from "../../components/MilestoneChip";

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <section className="py-8">
        <div className="flex gap-2 mb-5 flex-wrap">
          <MilestoneChip top="EXAM" bottom="pick honestly" />
          <MilestoneChip top="VISA" bottom="next checkpoint" />
          <MilestoneChip top="LIST" bottom="actually finish" />
        </div>
        <h1 className="text-3xl sm:text-4xl leading-tight mb-3">
          Pick your exam honestly.<br />Know your next immigration checkpoint.<br />Get a checklist you can actually finish.
        </h1>
        <p className="text-ink/70 max-w-xl mb-6">
          {SITE_NAME} is the honest senior nobody had: base rates, opportunity costs, and the forks you
          actually have — for Indians going abroad or already there. No chatbot, no accounts, no tracking.
          You answer dropdowns; it shows its work.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/profile" className="btn">Answer 6 questions</Link>
          <Link to="/travel" className="btn btn-secondary">Where can I travel?</Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 py-6">
        <Link to="/travel" className="card reveal hover:border-ink/40">
          <h2 className="text-lg mb-1">Travel finder</h2>
          <p className="text-sm text-ink/70">20 destinations, verdicts computed for YOUR passport + documents. Every rule badged with its verification date.</p>
        </Link>
        <Link to="/money" className="card reveal hover:border-ink/40">
          <h2 className="text-lg mb-1">Money checklists</h2>
          <p className="text-sm text-ink/70">US first-90-days and India NRI compliance — each step with the why, the official link, and a checkbox that persists.</p>
        </Link>
        <Link to="/immigration/eb1a-tracker" className="card reveal hover:border-ink/40">
          <h2 className="text-lg mb-1">EB1A tracker</h2>
          <p className="text-sm text-ink/70">The 10 USCIS criteria, pick-3 framing, and a private evidence log you can print for attorney calls.</p>
        </Link>
      </section>

      <section className="card my-6 border-marigold/70 bg-marigold/5">
        <h2 className="text-lg mb-1">Make one for someone else</h2>
        <p className="text-sm text-ink/70 mb-3">
          A sibling starting CAT prep, a friend landing in the US next month — send them a fresh link.
          They answer ~6 dropdowns and get their own list. No account, no AI, nothing to install,
          and it never sees your data.
        </p>
        <button className="btn"
          onClick={async () => { await navigator.clipboard.writeText(freshUrl()); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
          {copied ? "Link copied — send it!" : "Copy a fresh link"}
        </button>
      </section>
    </div>
  );
}
