# Data pipeline

How to refresh Checkpoint's data. Everything is JSON in `src/data/`; the site
has no runtime network calls, so freshness = editing these files.

## Workflow
1. Open `DATA_SOURCES.md`, pick the file due for refresh.
2. For each record: open its `sources[].url`, confirm or correct the claim.
3. Update `last_verified` to today (ISO) and `confidence` to `verified`.
4. If a rule changed: update `claim`/`summary`, keep the old text in the git history.
5. `npm run build` + commit with message `data: refresh <file> (<n> records verified)`.

## Stub script
`refresh-stub.mjs` shows the fetch → normalize → JSON pattern to extend with
real scrapers (official pages only; respect robots.txt):

```bash
node data-pipeline/refresh-stub.mjs
```
