const path = require("path");
const fs = require("fs");

process.env.LD_LIBRARY_PATH = [
  "/srv/emase/lead-proto-service/.local-libs/usr/lib/x86_64-linux-gnu",
  "/srv/emase/lead-proto-service/.playwright-libs/usr/lib/x86_64-linux-gnu",
  process.env.LD_LIBRARY_PATH || "",
]
  .filter(Boolean)
  .join(":");

const { chromium } = require("playwright");

const prototypeDir = path.resolve(__dirname);
const fileUrl = `file://${path.join(prototypeDir, "index.html")}`;
const widths = [390, 768, 1024, 1440];

(async () => {
  const browser = await chromium.launch({
    executablePath:
      "/home/emase/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const results = [];

  try {
    for (const width of widths) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });

      await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 60000 });
      await page.screenshot({
        path: path.join(prototypeDir, "qa", `qa-${width}.png`),
        fullPage: true,
      });

      const metrics = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const scrollWidth = Math.max(
          body ? body.scrollWidth : 0,
          html ? html.scrollWidth : 0
        );
        const clientWidth = html ? html.clientWidth : 0;
        return {
          title: document.title,
          scrollWidth,
          clientWidth,
          hasHorizontalScroll: scrollWidth > clientWidth + 1,
          imageCount: document.images.length,
          missingImages: Array.from(document.images)
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.getAttribute("src")),
        };
      });

      results.push({ width, ...metrics });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(prototypeDir, "qa", "qa-report.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
