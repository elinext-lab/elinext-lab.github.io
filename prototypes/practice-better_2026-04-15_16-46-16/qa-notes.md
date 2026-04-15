# QA Notes

Prepared: 2026-04-15

## Browser QA Status

Full screenshot-based browser QA could not run on this host.

Reason:

- local Chromium binary from Playwright is present
- but runtime libraries such as `libatk-1.0.so.0` and `libcairo.so.2` are missing
- user-level `sudo` access is not available, so those dependencies could not be installed

## Fallback Validation Completed

- `index.html` uses mobile-first CSS and responsive grid breakpoints only
- main page shell uses `width: min(..., calc(100% - ...))`
- `html, body` keep `overflow-x: hidden`
- all images use `max-width: 100%` and `height: auto`
- no section container uses a fixed width that exceeds small screens
- all sections render on opaque card backgrounds
- no absolute-positioned layout blocks are used for core content

## Remaining Risk

The page was validated statically, not with live screenshots at `390`, `768`, `1024`, and `1440` widths. The CSS was written to avoid the common overflow and overlap failures, but final visual confirmation still requires a machine with working browser dependencies.
