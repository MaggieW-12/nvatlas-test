const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:8765";
const outputDir = path.join(__dirname, "..", "tmp", "qa");

async function countRows(page) {
  const text = await page.locator("#resultsCount").innerText();
  const match = text.match(/\d+/);
  assert.ok(match, `Could not read result count from: ${text}`);
  return Number(match[0]);
}

async function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

  await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#heroEntries").innerText(), "500");
  assert.equal(await page.locator("#heroTerms").innerText(), "243");
  assert.equal(await page.locator("#heroVerbs").innerText(), "309");
  assert.equal(await countRows(page), 500);
  assert.ok((await page.locator("#networkChart svg").count()) === 1);
  assert.ok((await page.locator("#scatterChart svg").count()) === 1);
  assert.ok((await page.locator(".kwic-item").count()) > 0);
  assert.ok((await page.locator("#corpusRows tr").count()) === 25);

  await page.locator("#searchInput").fill("attention");
  await page.waitForURL(/q=attention/);
  assert.equal(await countRows(page), 29);
  assert.ok((await page.locator("#networkChart svg").count()) === 1);

  await page.locator("#resetFilters").click();
  await page.locator("#categoryFilter").selectOption("Institutions & rules");
  await page.waitForURL(/category=Institutions/);
  assert.equal(await countRows(page), 36);

  await page.locator("#resetFilters").click();
  await page.locator('.node.english[aria-label*="attention"] circle').click();
  assert.match(page.url(), /q=attention/);
  assert.ok((await page.locator("#searchInput").inputValue()) === "attention");

  await page.locator("#resetFilters").click();
  await page.locator('button[data-lang="zh"]').click();
  assert.equal(await page.locator('.site-nav a[href="report.html"]').innerText(), "學習報告");
  assert.equal(await page.locator("#searchForm button[type=submit]").innerText(), "更新畫面");

  await page.screenshot({
    path: path.join(outputDir, "explorer-desktop.png"),
    fullPage: true,
  });

  for (const [file, expectedHeading] of [
    ["report.html", "When English nouns return to action in Chinese"],
    ["codebook.html", "Codebook"],
    ["ai-use.html", "AI use declaration"],
  ]) {
    await page.goto(`${baseUrl}/${file}`, { waitUntil: "networkidle" });
    await page.locator('button[data-lang="en"]').click();
    assert.equal((await page.locator("h1").first().innerText()).trim(), expectedHeading);
    await page.screenshot({
      path: path.join(outputDir, file.replace(".html", ".png")),
      fullPage: true,
    });
  }

  await page.goto(`${baseUrl}/report.html`, { waitUntil: "networkidle" });
  await page.locator('button[data-lang="zh"]').click();
  assert.equal(
    (await page.locator('[data-page-lang="zh"] h1').innerText()).trim(),
    "當英語名詞在中文裏重新變成行動",
  );
  await page.screenshot({
    path: path.join(outputDir, "report-zh.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(outputDir, "explorer-mobile.png"),
    fullPage: true,
  });
  assert.ok((await page.locator(".menu-toggle").isVisible()) === true);

  await browser.close();
  assert.deepEqual(errors, []);
  process.stdout.write(`QA passed. Screenshots: ${outputDir}\n`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
