const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({
    executablePath: '/home/emase/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
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
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => {
      const brokenImages = Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));
      const offenders = Array.from(document.querySelectorAll('body *'))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: String(el.className || ''),
            text: (el.textContent || '').trim().slice(0, 80),
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        })
        .filter((el) => el.right > window.innerWidth + 1 || el.left < -1)
        .slice(0, 30);
      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        brokenImages,
        offenders,
      };
    });
    const screenshot = path.join(__dirname, `screenshot-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    metrics.screenshot = screenshot;
    report.push(metrics);
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'metrics.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

