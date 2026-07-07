import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import destinations from "../../data/travel-destinations.json";
import type { DestinationRecord } from "../../lib/types";
import { docsFromProfile, verdictFor, VERDICT_LABEL, VERDICT_TONE, type Docs } from "./TravelPage";
import MilestoneChip from "../../components/MilestoneChip";
import VerifyBadge from "../../components/VerifyBadge";
import { usePageMeta } from "../../lib/usePageMeta";

export default function DestinationPage() {
  const { id } = useParams();
  const d = (destinations as DestinationRecord[]).find((x) => x.id === id);
  const [docs, setDocs] = useState<Docs>(docsFromProfile());
  usePageMeta(d ? `${d.name} visa for Indian passport holders` : "Destination", d ? `Do Indians need a visa for ${d.name}? With a US visa or green card? Verdicts with official sources and verification dates.` : "");

  if (!d) {
    return (
      <div className="max-w-2xl mx-auto">
        <p>Destination not found.</p>
        <Link className="text-linkblue underline" to="/travel">← all destinations</Link>
      </div>
    );
  }

  const v = verdictFor(d, docs);

  return (
    <div className="max-w-2xl mx-auto">
      <Link className="text-linkblue text-sm underline no-print" to="/travel">← all destinations</Link>
      <div className="flex items-center gap-3 mt-2 mb-4 flex-wrap">
        <h1 className="text-3xl">{d.flag} {d.name}</h1>
        <MilestoneChip top={d.name.split(" ")[0]} bottom={VERDICT_LABEL[v.verdict]} tone={VERDICT_TONE[v.verdict]} />
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 no-print">
          <span className="text-sm font-semibold">For:</span>
          <select className="field !w-auto" value={docs} onChange={(e) => setDocs(e.target.value as Docs)}>
            <option value="none">Indian passport only</option>
            <option value="us_visa">+ valid US visa</option>
            <option value="green_card">+ US green card</option>
          </select>
        </div>
        <p className="font-semibold">{v.summary}</p>
        <div className="mt-2">
          <VerifyBadge confidence={d.confidence} lastVerified={d.last_verified} sources={d.sources} />
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="text-lg mb-2">How to apply, for your case</h2>
        <ol className="list-decimal ml-5 space-y-1.5 text-sm">
          {d.apply_how.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        {d.processing_note && <p className="text-sm text-ink/70 mt-2"><strong>Processing:</strong> {d.processing_note}</p>}
        {d.notes && <p className="banner-caution mt-2 text-xs">{d.notes}</p>}
      </div>

      <div className="card">
        <h2 className="text-lg mb-1">Sources</h2>
        <ul className="text-sm space-y-1">
          {d.sources.map((s) => (
            <li key={s.url}>
              <a className="text-linkblue underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/50 mt-2">
          Only official government sources count as verification here. If this page and an official source
          disagree, the official source wins — and please tell us.
        </p>
      </div>
    </div>
  );
}
