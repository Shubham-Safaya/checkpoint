import { useState } from "react";
import { Link } from "react-router-dom";
import destinations from "../../data/travel-destinations.json";
import type { DestinationRecord, TravelVerdict } from "../../lib/types";
import { loadProfile } from "../../lib/storage";
import MilestoneChip from "../../components/MilestoneChip";
import { usePageMeta } from "../../lib/usePageMeta";

const all = destinations as DestinationRecord[];

export type Docs = "none" | "us_visa" | "green_card";

export function docsFromProfile(): Docs {
  const p = loadProfile();
  const s = p.us_status as string | null;
  if (!s) return "none";
  if (s === "green_card" || s === "citizen" || s === "gc_ead") return "green_card";
  return "us_visa"; // nonimmigrant status — assumes a valid visa stamp
}

export function verdictFor(d: DestinationRecord, docs: Docs) {
  if (docs === "green_card" && d.modifiers?.green_card) return d.modifiers.green_card;
  if ((docs === "us_visa" || docs === "green_card") && d.modifiers?.us_visa) return d.modifiers.us_visa;
  return d.base;
}

export const VERDICT_LABEL: Record<TravelVerdict, string> = {
  none: "no visa needed",
  evisa: "eVisa",
  voa: "visa on arrival",
  required: "visa required",
  transit: "transit rules apply",
};

export const VERDICT_TONE: Record<TravelVerdict, "green" | "marigold" | "red" | "neutral"> = {
  none: "green",
  evisa: "marigold",
  voa: "marigold",
  transit: "marigold",
  required: "red",
};

export default function TravelPage() {
  usePageMeta("Travel visa finder for Indian passports", "Where can you go with an Indian passport plus a US visa or green card? 20 destinations, verdicts computed for your documents, every rule badged with its verification date.");
  const [docs, setDocs] = useState<Docs>(docsFromProfile());
  const hasProfile = !!loadProfile().us_status || !!loadProfile().citizenship;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl mb-1">Where can you go, with what you hold?</h1>
      <p className="text-sm text-ink/70 mb-4">
        Verdicts below are computed for an <strong>Indian passport</strong> plus the documents you select.
        Every record shows its verification status — amber means check the official source before booking.
      </p>

      <div className="card mb-5 flex flex-wrap items-center gap-3 no-print">
        <span className="font-semibold text-sm">Your documents:</span>
        <select className="field !w-auto" value={docs} onChange={(e) => setDocs(e.target.value as Docs)}
          aria-label="Documents you hold">
          <option value="none">Indian passport only</option>
          <option value="us_visa">+ valid US visa (any category)</option>
          <option value="green_card">+ US green card</option>
        </select>
        {!hasProfile && (
          <Link to="/profile" className="text-linkblue text-sm underline">or answer 6 questions once →</Link>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {all.map((d) => {
          const v = verdictFor(d, docs);
          return (
            <Link key={d.id} to={`/travel/${d.id}`}
              className="card reveal hover:border-ink/40 transition-colors flex flex-col gap-2">
              <span className="text-lg font-semibold">{d.flag} {d.name}</span>
              <MilestoneChip small top={d.name.split(" ")[0]} bottom={VERDICT_LABEL[v.verdict]} tone={VERDICT_TONE[v.verdict]} />
              <span className="text-xs text-ink/60 line-clamp-2">{v.summary}</span>
            </Link>
          );
        })}
      </div>

      <div className="card mt-6 border-vamber/60">
        <h2 className="text-lg">Visa renewal / stamping trips</h2>
        <p className="text-sm text-ink/70 mt-1">
          Dropbox (interview-waiver) eligibility changes often and is decided by the consulate, not by blogs.
          Check the current criteria on{" "}
          <a className="text-linkblue underline" href="https://travel.state.gov" target="_blank" rel="noopener noreferrer">
            travel.state.gov
          </a>{" "}
          and your consulate's site before booking a stamping trip. <span className="stamp stamp-verify">VOLATILE — link only</span>
        </p>
      </div>
    </div>
  );
}
