#!/usr/bin/env node
/** Rules-engine assertions (spec §7): wrong logic here misleads real people.
 *  Runs the SAME evaluate/flip code the browser ships (src/engine/evaluate.js). */
import { readFileSync } from "node:fs";
import { evaluate, flipConditions } from "../src/engine/evaluate.js";

const read = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), "utf8"));

const questions = read("questions.json");
const RULES = [
  ...read("rules/pathways.json"), ...read("rules/colleges.json"),
  ...read("rules/immigration.json"), ...read("rules/travel.json"),
  ...read("rules/money.json"), ...read("rules/housing.json"),
];

const allQs = questions.steps.flatMap((s) => s.questions);
const ORD = Object.fromEntries(allQs.filter((q) => q.ordinal && q.options).map((q) => [q.id, q.options.map((o) => o.value)]));
const OPTS = Object.fromEntries(allQs.filter((q) => q.options && q.type === "select").map((q) => [q.id, q.options]));
const LABELS = Object.fromEntries(allQs.map((q) => [q.id, q.id]));

let pass = 0, fail = 0;
function assert(name, cond) {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`FAIL  ${name}`); }
}

const ids = (r) => r.matched.map((x) => x.id);

/* 1. The founder profile (R1 canonical) MUST trigger exam.cat-retake-reality */
const founder = {
  goal: ["mba_india_vs_abroad"], cat_attempts: "3+", cat_best_band: "95-98",
  prep_hours: "5-10", cat_pool_category: "general", cat_pool_background: "engineer",
};
assert("R1 triggers for the founder profile", ids(evaluate(founder, RULES, ORD)).includes("exam.cat-retake-reality"));

/* 2. Higher prep hours flip R1 off */
const grinder = { ...founder, prep_hours: "15+" };
assert("R1 does NOT trigger at 15+ prep hours", !ids(evaluate(grinder, RULES, ORD)).includes("exam.cat-retake-reality"));

/* 3. Reserved-category profile does not get the GEM-math card */
const obc = { ...founder, cat_pool_category: "obc" };
assert("R1 does NOT trigger for OBC-NC pool", !ids(evaluate(obc, RULES, ORD)).includes("exam.cat-retake-reality"));

/* 4. Missing prep_hours -> R1 is LOCKED with the missing field named */
const partial = { ...founder }; delete partial.prep_hours;
const res4 = evaluate(partial, RULES, ORD);
const lockedR1 = res4.locked.find((l) => l.rule.id === "exam.cat-retake-reality");
assert("R1 locks (not errors) on missing prep_hours", !!lockedR1 && lockedR1.missing.includes("prep_hours"));

/* 5. exam.fork matches any MBA/MS goal */
assert("R2 fork matches MS goal", ids(evaluate({ goal: ["ms_mem_abroad"] }, RULES, ORD)).includes("exam.fork"));

/* 6. Budget ordinal: <25L is lte 25-50L -> no-crore-loan matches */
const tight = { budget_band: "<25L", loan_access: "no_collateral" };
assert("R3 matches sub-50L budget without collateral", ids(evaluate(tight, RULES, ORD)).includes("college.no-crore-loan"));

/* 7. ...and does not match a >1Cr budget */
assert("R3 does NOT match >1Cr budget", !ids(evaluate({ budget_band: ">1Cr", loan_access: "no_collateral" }, RULES, ORD)).includes("college.no-crore-loan"));

/* 8. H-1B + not started -> next-checkpoint card */
assert("R5 triggers for H-1B with GC not started",
  ids(evaluate({ us_status: "h1b", gc_stage: "not_started" }, RULES, ORD)).includes("immigration.next-checkpoint-h1b"));

/* 9. OPT profile gets the Day-1 CPT warning */
assert("R7 triggers on OPT", ids(evaluate({ us_status: "opt" }, RULES, ORD)).includes("immigration.day1-cpt-warning"));

/* 10. A green-card holder must never see visa-status-gated travel cards */
const gc = { citizenship: "indian", us_status: "green_card" };
const gcMatched = ids(evaluate(gc, RULES, ORD));
assert("GC holder sees no visa-gated Mexico/Canada/UK/Schengen cards",
  !gcMatched.some((id) => ["travel.mexico", "travel.canada", "travel.uk-transit", "travel.schengen"].includes(id)));

/* 11. ...but does see the us-visa-unlocks card (GC included there) */
assert("GC holder still sees us-visa-unlocks", gcMatched.includes("travel.us-visa-unlocks"));

/* 12. Money rules for a US-based money goal */
const money = { location_now: "usa", goal: ["money"] };
const m = ids(evaluate(money, RULES, ORD));
assert("R13 + R14 trigger for US money goal", m.includes("money.first-90-days") && m.includes("money.india-compliance"));

/* 13. Property goal -> housing fork */
assert("R15 triggers on property goal", ids(evaluate({ goal: ["property"] }, RULES, ORD)).includes("housing.fork"));

/* 14. Flip conditions produce at least one line for R1 on the founder profile */
const r1 = RULES.find((r) => r.id === "exam.cat-retake-reality");
const flips = flipConditions(r1, founder, RULES, ORD, OPTS, LABELS, 3);
assert("R1 flip conditions produced (≥1, ≤3)", flips.length >= 1 && flips.length <= 3);

/* 15. Rule priority ordering: matched list sorted ascending */
const many = evaluate({ ...founder, hassle_tolerance: "minimal" }, RULES, ORD).matched;
assert("matched rules sorted by priority", many.every((r, i) => i === 0 || many[i - 1].priority <= r.priority));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
