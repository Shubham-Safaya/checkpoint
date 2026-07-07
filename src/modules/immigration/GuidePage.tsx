import { Link, useParams } from "react-router-dom";
import guides from "../../data/guides/immigration-guides.json";
import VerifyBadge from "../../components/VerifyBadge";
import type { Confidence, Source } from "../../lib/types";
import { usePageMeta, useFaqJsonLd } from "../../lib/usePageMeta";

interface Guide {
  title: string;
  banner: string;
  sections: { h: string; p: string; link?: { label: string; url: string } }[];
  facts: { id: string; claim: string; sources: Source[]; last_verified: string; confidence: Confidence }[];
}

export default function GuidePage() {
  const { slug } = useParams();
  const guide = (guides as Record<string, Guide>)[slug || ""];
  usePageMeta(guide?.title || "Guide", guide ? guide.sections[0].p.slice(0, 155) : "");
  useFaqJsonLd(guide ? guide.sections.map((s) => ({ q: s.h, a: s.p })) : []);

  if (!guide) {
    return (
      <div className="max-w-2xl mx-auto">
        <p>Guide not found.</p>
        <Link className="text-linkblue underline" to="/immigration">← immigration checkpoints</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link className="text-linkblue text-sm underline no-print" to="/immigration">← immigration checkpoints</Link>
      <h1 className="text-2xl">{guide.title}</h1>
      <p className="banner-caution">{guide.banner}</p>

      {guide.sections.map((s) => (
        <section key={s.h} className="card reveal">
          <h2 className="text-lg mb-1">{s.h}</h2>
          <p className="text-sm text-ink/85">{s.p}</p>
          {s.link && (
            <a className="text-linkblue text-sm underline mt-2 inline-block" href={s.link.url}
              target="_blank" rel="noopener noreferrer">{s.link.label} →</a>
          )}
        </section>
      ))}

      <section className="card">
        <h2 className="text-lg mb-2">The facts behind this guide</h2>
        <ul className="space-y-2">
          {guide.facts.map((f) => (
            <li key={f.id} className="text-sm">
              {f.claim}{" "}
              <VerifyBadge confidence={f.confidence} lastVerified={f.last_verified} sources={f.sources} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
