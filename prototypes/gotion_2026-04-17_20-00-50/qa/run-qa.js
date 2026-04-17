const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '..');
  const qaDir = __dirname;
  const publicUrl = 'https://elinext-lab.github.io/prototypes/gotion_2026-04-17_20-00-50/';
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

    const metrics = await page.evaluate((expectedUrl) => {
      const brokenImages = Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));

      const offenders = Array.from(document.querySelectorAll('body *'))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: typeof el.className === 'string' ? el.className : '',
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        })
        .filter((el) => el.right > window.innerWidth + 1 || el.left < -1)
        .slice(0, 25);

      const blocks = Array.from(document.querySelectorAll('[data-qa-block]')).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          name: el.getAttribute('data-qa-block'),
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      const overlaps = [];
      for (let i = 1; i < blocks.length; i += 1) {
        const prev = blocks[i - 1];
        const curr = blocks[i];
        if (curr.top < prev.bottom - 1) {
          overlaps.push({
            previous: prev.name,
            current: curr.name,
            delta: Number((prev.bottom - curr.top).toFixed(2)),
          });
        }
      }

      const sectionTransparency = Array.from(document.querySelectorAll('.section, .cta'))
        .map((el) => {
          const styles = window.getComputedStyle(el);
          return {
            className: el.className,
            backgroundColor: styles.backgroundColor,
            backgroundImage: styles.backgroundImage,
          };
        })
        .filter((item) => item.backgroundColor === 'rgba(0, 0, 0, 0)' && item.backgroundImage === 'none');

      const meta = {
        canonical: document.querySelector('link[rel="canonical"]')?.href || null,
        ogUrl: document.querySelector('meta[property="og:url"]')?.content || null,
        ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
      };

      const bodyText = (document.body.innerText || '').replace(/\s+/g, ' ').trim();

      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        brokenImages,
        offenders,
        overlaps,
        sectionTransparency,
        bodyWordCount: bodyText ? bodyText.split(' ').length : 0,
        meta,
        metaOk:
          meta.canonical === expectedUrl &&
          meta.ogUrl === expectedUrl &&
          meta.ogImage === expectedUrl + 'og-image.jpg',
      };
    }, publicUrl);

    const screenshot = path.join(qaDir, `screenshot-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    metrics.screenshot = screenshot;
    report.push(metrics);
  }

  await browser.close();
  fs.writeFileSync(path.join(qaDir, 'metrics.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
