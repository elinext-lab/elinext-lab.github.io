# QA Notes

## Browser QA

Live browser QA was completed with Playwright and a local Chromium binary.

Tested widths:

- `390px`
- `768px`
- `1024px`
- `1440px`

Saved screenshots:

- `prototype/qa/390.png`
- `prototype/qa/768.png`
- `prototype/qa/1024.png`
- `prototype/qa/1440.png`

## Automated Layout Checks

For each tested width:

- horizontal scroll: `false`
- broken images: `0`
- detected overflow elements beyond viewport: `0`

Viewport and screenshot dimensions:

- `390.png` → `390 x 5159`
- `768.png` → `768 x 3489`
- `1024.png` → `1024 x 3465`
- `1440.png` → `1440 x 3392`

## Content And Meta Checks

- visible body-text word count from browser `innerText`: `546`
- canonical URL points to `https://elinext-lab.github.io/prototypes/harnham_2026-04-15_18-03-52/`
- `og:url` points to the same timestamped path
- `og:image` points to `https://elinext-lab.github.io/prototypes/harnham_2026-04-15_18-03-52/og-image.jpg`
- `html, body { overflow-x: hidden; }` is present
- the page uses mobile-first responsive grids
- all images use `max-width: 100%; height: auto;`
- proof cards render without case-study images because source fetches were blocked; no placeholder images were inserted

## Lighthouse Snapshot

Local Lighthouse CLI audits on `2026-04-15`:

- Harnham: Performance `32`, Accessibility `84`, Best Practices `57`, SEO `85`
- Aspire: Performance `51`, Accessibility `93`, Best Practices `61`, SEO `100`
- Understanding Recruitment: Performance `54`, Accessibility `79`, Best Practices `61`, SEO `85`

## Outcome

No layout fixes were required after the first browser QA pass.
