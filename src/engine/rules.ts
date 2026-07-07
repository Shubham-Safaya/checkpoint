import questionsData from "../data/questions.json";
import pathwaysRules from "../data/rules/pathways.json";
import collegesRules from "../data/rules/colleges.json";
import immigrationRules from "../data/rules/immigration.json";
import travelRules from "../data/rules/travel.json";
import moneyRules from "../data/rules/money.json";
import housingRules from "../data/rules/housing.json";
import { evaluate as evalCore, flipConditions as flipCore } from "./evaluate.js";
import type { Confidence, Profile, Source } from "../lib/types";

export interface Cond { field: string; in?: string[]; gte?: string; lte?: string }
export interface Predicate { all?: Cond[]; any?: Cond[]; not?: Cond[] }

export interface VerdictCard {
  verdict: string;
  headline: string;
  why: string[];
  pros: string[];
  cons: string[];
  worst_case: { scenario: string; how_bad: "recoverable" | "expensive" | "status-risk"; mitigation: string };
  actions: { label: string; how: string; link?: string }[];
  fact_ids?: string[];
  sources: Source[];
  last_verified: string;
  confidence: Confidence;
}

export interface Rule { id: string; module: string; priority: number; if: Predicate; then: VerdictCard }
export interface LockedRule { rule: Rule; missing: string[] }

export const ALL_RULES: Rule[] = [
  ...(pathwaysRules as Rule[]),
  ...(collegesRules as Rule[]),
  ...(immigrationRules as Rule[]),
  ...(travelRules as Rule[]),
  ...(moneyRules as Rule[]),
  ...(housingRules as Rule[]),
];

/* ordinal orders + option labels derived from questions.json — single source of truth */
interface Q { id: string; label: string; type: string; ordinal?: boolean; options?: { value: string; label: string }[] }
const allQs: Q[] = (questionsData as { steps: { questions: Q[] }[] }).steps.flatMap((s) => s.questions);

export const ORDINALS: Record<string, string[]> = Object.fromEntries(
  allQs.filter((q) => q.ordinal && q.options).map((q) => [q.id, q.options!.map((o) => o.value)])
);

export const OPTIONS_BY_FIELD: Record<string, { value: string; label: string }[]> = Object.fromEntries(
  allQs.filter((q) => q.options && q.type === "select").map((q) => [q.id, q.options!])
);

export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  allQs.map((q) => [q.id, q.label.split("(")[0].split("—")[0].trim().toLowerCase()])
);

export function runRules(profile: Profile, module?: string): { matched: Rule[]; locked: LockedRule[] } {
  const rules = module ? ALL_RULES.filter((r) => r.module === module) : ALL_RULES;
  return evalCore(profile, rules, ORDINALS) as { matched: Rule[]; locked: LockedRule[] };
}

export function flipsFor(rule: Rule, profile: Profile): string[] {
  return flipCore(rule, profile, ALL_RULES, ORDINALS, OPTIONS_BY_FIELD, FIELD_LABELS, 3) as string[];
}
