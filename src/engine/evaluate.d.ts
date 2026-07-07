/** Type declarations for the plain-JS engine core (shared with npm run check). */
export function normField(field: string): string;
export function evaluate(
  profile: Record<string, unknown>,
  rules: unknown[],
  ordinals: Record<string, string[]>
): { matched: unknown[]; locked: { rule: unknown; missing: string[] }[] };
export function flipConditions(
  rule: unknown,
  profile: Record<string, unknown>,
  rules: unknown[],
  ordinals: Record<string, string[]>,
  optionsByField: Record<string, { value: string; label: string }[]>,
  labels: Record<string, string>,
  cap?: number
): string[];
