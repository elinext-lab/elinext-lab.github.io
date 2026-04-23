const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  process.env.LD_LIBRARY_PATH = [
    '/srv/emase/lead-proto-service/.playwright-libs/usr/lib/x86_64-linux-gnu',
    '/srv/emase/lead-proto-service/.local-libs/usr/lib/x86_64-linux-gnu',
    '/srv/emase/lead-proto-service/.chrome-libs/root/usr/lib/x86_64-linux-gnu',
    process.env.LD_LIBRARY_PATH || '',
  ].filter(Boolean).join(':');

  const root = __dirname;
  const browser = await chromium.launch({
    executablePath: '/home/emase/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const url = 'file://' + path.join(root, 'index.html');
  const widths = [390, 768, 1024, 1440];
  const report = [];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const brokenImages = Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));

      const offenders = Array.from(document.querySelectorAll('body *'))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: typeof el.className === 'string' ? el.className : '',
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
            left: rect.left,
            right: rect.right,
          };
        })
        .filter((el) => el.right > window.innerWidth + 1 || el.left < -1)
        .slice(0, 25);

      const bodyText = (document.body.innerText || '').replace(/\s+/g, ' ').trim();

      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        brokenImages,
        offenders,
        bodyWordCount: bodyText ? bodyText.split(' ').length : 0,
      };
    });

    const screenshotPath = path.join(root, `qa-${width}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    metrics.screenshot = screenshotPath;
    report.push(metrics);
  }

  await browser.close();
  fs.writeFileSync(path.join(root, 'qa-metrics.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
