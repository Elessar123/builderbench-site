# Agent Builds — BuilderBench

A five-page website presenting Claude Code Agent's construction results, method comparisons, successful build videos, and edited strategy summaries.

The original task set records **45/51** completions. A separate additional set records **7/16**. Results use the experimental conditions described on the website; revision labels are not exact trial counts.

## Files

- `site/`: website text, presentation data, figures, and videos.
- `scripts/build.mjs`: adapts links, assets, and routing to a GitHub Pages project path.
- `scripts/validate.mjs`: verifies routes, results, asset links, and content boundaries.
- `.github/workflows/pages.yml`: manual GitHub Pages deployment.

No raw experiment documents, original JSON records, private logs, or author byline are included. Only presentation values and edited strategy summaries are shipped to the browser.

## Local preview

Requires Node.js 24 or later. There are no packages to install.

```sh
node scripts/build.mjs /builderbench-site/
node --experimental-vm-modules scripts/validate.mjs /builderbench-site/
node scripts/preview.mjs /builderbench-site/
```

Open the local URL printed by the preview server. Build with `/` to host at a domain root instead.

## Publish

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. Then run **Deploy website to GitHub Pages** from the **Actions** tab.

The workflow reads the project path from GitHub Pages, builds the site, validates it, and uploads only `_site/`. Deployments run only when manually requested. Edit `site/` to update the content, then run the workflow again.
