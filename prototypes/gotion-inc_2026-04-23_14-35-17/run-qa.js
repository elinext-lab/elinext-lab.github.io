const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const base = __dirname;
  const url = "file://" + path.join(base, "index.html");
  const widths = [390, 768, 1024, 1440];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const results = {};
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const offenders = [...document.querySelectorAll("*")]
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || "").slice(0, 120),
            left: Number(rect.left.toFixed(2)),
            right: Number(rect.right.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            position: style.position,
          };
        })
        .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
        .slice(0, 20);

      return {
        innerWidth: window.innerWidth,
        scrollWidth: doc.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        scrollOverflow: doc.scrollWidth > window.innerWidth + 1,
        bodyOverflow: body.scrollWidth > window.innerWidth + 1,
        pageHeight: Math.max(doc.scrollHeight, body.scrollHeight),
        offenders,
      };
    });

    results[String(width)] = metrics;
    await page.screenshot({
      path: path.join(base, "qa-" + width + ".png"),
      fullPage: true,
    });
  }

  fs.writeFileSync(
    path.join(base, "qa-metrics.json"),
    JSON.stringify(results, null, 2),
  );

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
