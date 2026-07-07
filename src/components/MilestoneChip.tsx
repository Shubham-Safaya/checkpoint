/** The signature element: a milestone-stone chip with distance-style microcopy. */
export default function MilestoneChip({
  top,
  bottom,
  small,
  tone = "marigold",
}: {
  top: string;
  bottom?: string;
  small?: boolean;
  tone?: "marigold" | "green" | "red" | "neutral";
}) {
  const tones: Record<string, string> = {
    marigold: "",
    green: "!bg-cleargreen !text-white",
    red: "!bg-signalred !text-white",
    neutral: "!bg-ink/10 !text-ink",
  };
  return (
    <span className={`milestone ${small ? "milestone-sm" : ""} ${tones[tone]}`}>
      <span>{top}</span>
      {bottom && <span className="opacity-80 font-normal">{bottom}</span>}
    </span>
  );
}
