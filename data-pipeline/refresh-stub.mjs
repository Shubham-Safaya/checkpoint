#!/usr/bin/env node
/** Stub: the fetch → normalize → JSON pattern for data refreshes.
 *  Extend per-source; only official government pages, respect robots.txt. */
import { readFileSync } from "node:fs";

const FILE = new URL("../src/data/travel-destinations.json", import.meta.url);

async function main() {
  const records = JSON.parse(readFileSync(FILE, "utf8"));
  const stale = records.filter((r) => {
    if (r.last_verified === "TODO") return true;
    const age = (Date.now() - new Date(r.last_verified).getTime()) / 86400_000;
    return age > 90; // travel cadence: quarterly
  });
  console.log(`${records.length} destination records; ${stale.length} due for re-verification:`);
  for (const r of stale) {
    console.log(`  - ${r.id.padEnd(12)} sources: ${r.sources.map((s) => s.url).join(", ")}`);
  }
  console.log("\nPattern for a real refresher:");
  console.log("  1. fetch(source.url)  2. extract the rule  3. diff vs record.claim");
  console.log("  4. update summary/last_verified/confidence  5. write JSON + commit");
}

main();
