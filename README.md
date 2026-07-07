# Checkpoint

*A pathway navigator for Indians going abroad (or already abroad). Static site, dropdown-driven, brutally honest.*

**Live:** https://shubham-safaya.github.io/checkpoint/

Pick your exam honestly · Know your next immigration checkpoint · Get a checklist you can actually finish.

No chatbot, no accounts, no cookies, no trackers. Answers live in your browser's
localStorage; sharing is a URL-encoded profile. Every externally-checkable fact
carries `last_verified`, `sources[]`, and a confidence badge — amber means
verify before acting.

## Local dev
```bash
npm install
npm run dev        # http://localhost:5173/checkpoint/
npm run build      # type-check + production build
npm run check      # rules-engine assertions (Phase 2)
```

## Deploy
Push to `main` → GitHub Actions builds and deploys to GitHub Pages
(`.github/workflows/deploy.yml`). First-time setup: repo Settings → Pages →
Source = "GitHub Actions" (the workflow API call in the repo history did this).

## Renaming the site
Edit `SITE_NAME` in `src/siteConfig.ts` — one edit.

## Custom domain later
1. Set Vite `base: "/"` in `vite.config.ts`.
2. Add a `CNAME` file to `public/` with your domain.
3. Point DNS (CNAME → `shubham-safaya.github.io`) and set the domain in repo Settings → Pages.

## Updating data
All facts live in `src/data/**/*.json` — nothing checkable is hardcoded in JSX.
- `questions.json` — the wizard. Edit questions/options without touching code.
- `travel-destinations.json` — per-destination records with per-document verdicts.
- `checklists/*.json` — C1 (US first 90 days), C2 (India NRI compliance), C3 (EB1A criteria).
Change a fact → update its `last_verified` + `sources` → badge updates automatically.
See `DATA_SOURCES.md` for what verifies what, and `data-pipeline/README.md` for refresh workflow.

## Phase status
- **Phase 1 (this)**: wizard, travel finder (20 destinations), checklists C1–C3, /my-list, share links, disclaimers.
- Phase 2: rules engine + verdict cards (R1–R15), pathways + immigration modules.
- Phase 3: colleges/tuition explorer, housing, SEO pass.
