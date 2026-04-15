# QA Notes

## Browser status

Visual browser QA could not run in this environment.

Reason:

- Playwright Chromium download succeeded
- runtime launch failed because required shared libraries are missing, including `libatk-1.0.so.0`
- local Lighthouse failed for the same reason

## Static validation completed

- visible body-text word count: `520`
- canonical URL points to `https://elinext-lab.github.io/prototypes/harnham_2026-04-15_17-31-10/`
- `og:url` points to the same timestamped path
- `og:image` points to `https://elinext-lab.github.io/prototypes/harnham_2026-04-15_17-31-10/og-image.jpg`
- page uses mobile-first CSS with one main shell width and responsive grids
- `html, body { overflow-x: hidden; }` is present
- all images use `max-width: 100%; height: auto;`
- section cards use opaque backgrounds
- no fixed pixel widths are used on main page containers
- no absolute-positioned content blocks are used in the page layout

## Residual risk

Because no live browser was available, final layout was validated by source inspection only. The markup and CSS were written to avoid the common 390px failures listed in the task prompt.
