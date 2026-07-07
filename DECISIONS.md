# DECISIONS.md

Ambiguities resolved with the simpler option, per spec instructions.

| # | Decision | Why |
|---|---|---|
| 1 | `cat_pool` flattened to three fields (`cat_pool_category`, `cat_pool_gender`, `cat_pool_background`) | Keeps the profile a flat key→value map; rules reference them as plain fields (spec's `cat_pool.category` path maps 1:1). |
| 2 | BrowserRouter + `404.html` copy of `index.html` | Real URL paths (needed for §11 SEO later) on GitHub Pages without a server. |
| 3 | Resume prefill shipped as ROADMAP item, not built | Spec allows it explicitly ("if this costs more than a few hours"); the wizard is the primary path. |
| 4 | "Make one for someone else" = `?fresh=1` link that clears/skips local profile | Recipients on their own devices already have empty storage; the flag guarantees a clean wizard even on a shared device, and never transmits the sender's data. |
| 5 | Travel docs selector (`none / us_visa / green_card`) inferred from `us_status`, overridable inline | A visa *stamp* can be expired while status is valid; the selector keeps the user in control. Inference: any nonimmigrant status → `us_visa`, GC/citizen/GC-EAD → `green_card`. |
| 6 | Phase 1 ships all 20 travel records as `needs_verification` with `last_verified: "TODO"` except those verified via official sources during the session (see end-of-phase report) | Spec §5.3: never present memory as current. |
| 7 | Wizard "skips" = unanswered stays `null`; no required fields | §7: partial profiles pull people forward. |
| 8 | Checklist state model: one storage key with `done` map + `eb1a` sub-object | Single key = simpler migration story (`checkpoint.checklists.v1`). |
| 9 | EB1A criteria file carries one badge for the criteria list as a whole | The 10 criteria are statutory and stable; per-criterion facts arrive in Phase 2 guides. |
| 10 | Chips with `max`: selecting beyond the cap replaces the oldest selection | Friendlier than blocking; matches "pick up to 2" phrasing. |
| 11 | Engine core lives in plain JS (`src/engine/evaluate.js`) with a TS wrapper | `npm run check` runs the exact shipped logic in Node with zero build step. |
| 12 | Flip conditions skip chips (array) fields | Varying multi-selects explodes combinations; scalar selects carry the signal. One flip line per field, cap 3. |
| 13 | R8–R12 travel rules gate on nonimmigrant `us_status` values; GC/citizen profiles route via `travel.us-visa-unlocks` + destination records | Satisfies "GC holders never see visa-gated cards" while keeping their grid verdicts correct. |
| 14 | R15 housing card renders via engine but /housing module is Phase 3 | Spec sequences housing UI in Phase 3; the rule content ships now. |
| 15 | Guides are JSON-driven through one GuidePage component | Six guides, one renderer — copy edits never touch code. |
| 16 | All Phase-3 tuition rows ship `sample_data` under the watermark; zero rows claimed verified this session | Spec: "do not fill twenty rows from memory". Bursar verification is the owner's refresh workflow. |
| 17 | Housing mini-calculator uses price-to-rent multiples as the price/rent bands | Currency-neutral (works for Bengaluru and Bentonville), and it's the ratio that carries the signal, not absolute prices. |
| 18 | "First crore" is two engine rules split on `long_term_base` | Flip conditions come free from the engine — undecided users see what choosing a base would change. |
| 19 | SEO: SPA meta via usePageMeta hook + FAQ JSON-LD on guides + build-time sitemap.xml | No SSR on GitHub Pages; crawlers executing JS get full meta, sitemap covers all 35 routes for discovery. |
