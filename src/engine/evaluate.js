/**
 * Checkpoint rules engine — pure JS core so both the browser bundle and
 * `npm run check` (plain Node) can run the exact same logic.
 *
 * Semantics (spec §7):
 * - A rule matches only if EVERY field it references is answered AND the
 *   predicate is satisfied.
 * - Rules referencing unanswered fields go to `locked` with the missing
 *   fields listed, so the UI can pull people back into the wizard.
 * - gte/lte compare positions in the ordinal order declared in questions.json.
 * - Array answers (chips): `in` matches when the intersection is non-empty.
 * - Field ids may use dots ("cat_pool.category"); profiles store them
 *   flattened ("cat_pool_category").
 */

export function normField(field) {
  return field.replace(/\./g, "_");
}

function answered(v) {
  return v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
}

function condFields(pred) {
  const out = [];
  for (const key of ["all", "any", "not"]) {
    for (const c of pred?.[key] || []) out.push(normField(c.field));
  }
  return [...new Set(out)];
}

function condTrue(cond, profile, ordinals) {
  const field = normField(cond.field);
  const v = profile[field];
  if (cond.in) {
    if (Array.isArray(v)) return v.some((x) => cond.in.includes(x));
    return cond.in.includes(v);
  }
  if (cond.gte !== undefined || cond.lte !== undefined) {
    const order = ordinals[field];
    if (!order || Array.isArray(v)) return false;
    const iv = order.indexOf(v);
    if (iv === -1) return false;
    if (cond.gte !== undefined && iv < order.indexOf(cond.gte)) return false;
    if (cond.lte !== undefined && iv > order.indexOf(cond.lte)) return false;
    return true;
  }
  return true;
}

function predTrue(pred, profile, ordinals) {
  if (pred.all && !pred.all.every((c) => condTrue(c, profile, ordinals))) return false;
  if (pred.any && !pred.any.some((c) => condTrue(c, profile, ordinals))) return false;
  if (pred.not && pred.not.some((c) => condTrue(c, profile, ordinals))) return false;
  return true;
}

/**
 * @returns {{ matched: any[], locked: {rule: any, missing: string[]}[] }}
 */
export function evaluate(profile, rules, ordinals) {
  const matched = [];
  const locked = [];
  for (const rule of rules) {
    const fields = condFields(rule.if);
    const missing = fields.filter((f) => !answered(profile[f]));
    if (missing.length) {
      locked.push({ rule, missing });
      continue;
    }
    if (predTrue(rule.if, profile, ordinals)) matched.push(rule);
  }
  matched.sort((a, b) => a.priority - b.priority);
  return { matched, locked };
}

/**
 * Flip conditions (spec §7 signature feature): for a matched rule, vary one
 * scalar field at a time and report up to `cap` changes that would flip the
 * verdict — either "no longer applies" or "flips to <other rule's verdict>".
 * `optionsByField` maps field -> [{value,label}]; chips fields are skipped.
 */
export function flipConditions(rule, profile, rules, ordinals, optionsByField, labels, cap = 3) {
  const lines = [];
  const before = new Set(evaluate(profile, rules, ordinals).matched.map((r) => r.id));
  for (const field of condFields(rule.if)) {
    if (lines.length >= cap) break;
    if (Array.isArray(profile[field])) continue; // chips: skip (DECISIONS #11)
    const opts = optionsByField[field];
    if (!opts) continue;
    for (const opt of opts) {
      if (opt.value === profile[field]) continue;
      const alt = { ...profile, [field]: opt.value };
      const after = evaluate(alt, rules, ordinals).matched;
      const afterIds = new Set(after.map((r) => r.id));
      if (!afterIds.has(rule.id)) {
        const gained = after.find((r) => !before.has(r.id) && r.module === rule.module);
        const fieldLabel = labels[field] || field;
        lines.push(
          gained
            ? `At ${fieldLabel} = ${opt.label}, this flips to “${gained.then.verdict}”.`
            : `At ${fieldLabel} = ${opt.label}, this card no longer applies.`
        );
        break; // one flip per field
      }
    }
  }
  return lines;
}
