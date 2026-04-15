# QA Notes

## Browser QA Status

I attempted the required Playwright screenshot pass on 2026-04-15.

- `npx playwright install chromium` succeeded
- launching Chromium failed because shared libraries such as `libatk-1.0.so.0` are missing on this host
- `npx playwright install-deps chromium` then failed because root access is required and unavailable

Because of that, I could not complete the four browser screenshots at 390, 768, 1024, and 1440.

## Fallback Validation Completed

- confirmed `index.html`, case-study images, and `og-image.jpg` all load over a local HTTP server
- confirmed visible body text is within the 350 to 550 target range
- checked the CSS for overflow risk and found no large fixed-width section containers
- confirmed `html, body` use `overflow-x: hidden`
- confirmed images use `max-width: 100%; height: auto;`
- confirmed case study media uses `object-fit: cover` with responsive width
- confirmed there are no large `min-width` values or wide fixed-pixel content blocks

## Files Checked

- `prototype/index.html`
- `prototype/assets/case-handsfree.jpg`
- `prototype/assets/case-router.jpg`
- `prototype/og-image.jpg`
