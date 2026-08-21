# go.fortworthapartmentreviews.com

One-page apartment short-list site served by GitHub Pages, matching the
design of [FortWorthApartmentReviews.com](https://fortworthapartmentreviews.com).

## What's here

- `index.html` — landing page: light purple editorial theme with Newsreader
  serif headings mirroring the main site; five-step reveal funnel form in a
  card with a dark purple header; comparison table, Fort Worth-specific copy,
  and accordion FAQ
- `thank-you/index.html` — no-JS fallback destination (the form normally
  shows an inline success panel)
- `css/` — the main site's compiled stylesheets, self-hosted, plus inline
  scoped form CSS and a small utility supplement
- `images/` — self-hosted logo and favicon
- `CNAME`, `404.html`, `robots.txt`

## How the form works

The funnel reveals steps as fields are answered (budget → area → rental →
background → credit → finish) and posts a structured JSON lead to the n8n
webhook, with a FormSubmit email mirror and a funnel-analytics beacon.
Field names, step logic, conditionals, the neighborhood chip picker, the
honeypot, and validation are carried over unchanged — except one fix: the
validation guard's stale block flag, which used to falsely reject the first
resubmit after a corrected validation error.

## Deploying changes

GitHub Pages serves the `main` branch root. Merge to `main` and the site
updates in about a minute.
