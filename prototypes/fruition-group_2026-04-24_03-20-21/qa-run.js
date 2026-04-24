const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const root = __dirname;
  const expectedUrl = 'https://elinext-lab.github.io/prototypes/fruition-group_2026-04-24_03-20-21/';
  const widths = [390, 768, 1024, 1440];
  const libraryPath = [
    '/srv/emase/lead-proto-service/.chrome-libs/rootfs/usr/lib/x86_64-linux-gnu',
    '/srv/emase/lead-proto-service/.chrome-libs/rootfs/lib/x86_64-linux-gnu',
    process.env.LD_LIBRARY_PATH || '',
  ].filter(Boolean).join(':');

  const browser = await chromium.launch({
    executablePath: '/home/emase/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    env: {
      ...process.env,
      LD_LIBRARY_PATH: libraryPath,
    },
  });

  const page = await browser.newPage();
  const fileUrl = 'file://' + path.join(root, 'index.html');
  const report = [];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(1400);

    const metrics = await page.evaluate((targetUrl) => {
      const brokenImages = Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));

      const offenders = Array.from(document.querySelectorAll('body *'))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: el.className || '',
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          };
        })
        .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
        .slice(0, 20);

      const bodyText = (document.body.innerText || '').replace(/\s+/g, ' ').trim();
      const meta = {
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        ogUrl: document.querySelector('meta[property="og:url"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
      };

      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        brokenImages,
        overflowOffenders: offenders,
        wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
        meta,
        metaOk:
          meta.canonical === targetUrl &&
          meta.ogUrl === targetUrl &&
          meta.ogImage === targetUrl + 'og-image.jpg',
      };
    }, expectedUrl);

    const shot = path.join(root, `qa-${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    report.push({ shot, metrics });
  }

  await browser.close();
  fs.writeFileSync(path.join(root, 'qa-report.json'), JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
