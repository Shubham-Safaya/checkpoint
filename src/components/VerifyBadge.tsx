import { STALE_DAYS } from "../siteConfig";
import type { Confidence, Source } from "../lib/types";

export default function VerifyBadge({
  confidence,
  lastVerified,
  sources,
}: {
  confidence: Confidence;
  lastVerified: string;
  sources?: Source[];
}) {
  const stale =
    lastVerified !== "TODO" &&
    Date.now() - new Date(lastVerified).getTime() > STALE_DAYS * 86400_000;
  const effective: Confidence =
    confidence === "verified" && stale ? "needs_verification" : confidence;

  if (effective === "verified") {
    const inner = <span className="stamp stamp-verified">VERIFIED {lastVerified}</span>;
    return sources && sources[0] ? (
      <a href={sources[0].url} target="_blank" rel="noopener noreferrer" title={sources[0].title}>
        {inner}
      </a>
    ) : inner;
  }
  if (effective === "sample_data") {
    return <span className="stamp stamp-sample">SAMPLE DATA</span>;
  }
  return (
    <span className="stamp stamp-verify">
      VERIFY BEFORE ACTING{lastVerified !== "TODO" ? ` · last checked ${lastVerified}` : " · not yet checked"}
    </span>
  );
}
