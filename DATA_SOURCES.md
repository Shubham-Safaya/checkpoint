# DATA_SOURCES.md

Only official government / institutional sources count as verification (spec §5.4).

| Fact file | Source(s) | What it verifies | Refresh cadence |
|---|---|---|---|
| `src/data/travel-destinations.json` | Destination-government immigration portals (ICA, IRCC, gov.uk, evisa.gov.tr, ICP UAE, migración portals…) | Entry verdicts per document set, apply-how, conditions | **Quarterly**, and before any trip |
| `src/data/checklists/c1-us-first-90-days.json` | ssa.gov, irs.gov, i94.cbp.dhs.gov | SSN process, withholding, I-94 practice | Yearly |
| `src/data/checklists/c2-india-nri-compliance.json` | rbi.org.in, incometax.gov.in, fincen.gov, irs.gov | NRO/NRE duties, FBAR $10k aggregate, Form 8938 thresholds, DTAA (10F/TRC) | Yearly (thresholds), FBAR/8938 each filing season |
| `src/data/checklists/c3-eb1a.json` | uscis.gov Policy Manual Vol. 6 Pt. F | The 10 criteria + two-step analysis framing | Yearly; on policy-manual updates |
| Visa Bulletin (never stored) | travel.state.gov Visa Bulletin | Priority-date movement | **Monthly link-out only** |
| Tuition tables (Phase 3) | Official bursar/program/employment-report pages | Fees, program facts | Yearly |
