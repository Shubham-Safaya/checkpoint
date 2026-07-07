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
