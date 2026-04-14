const path = require("node:path");

const { chromium, expect, test } = require("@playwright/test");

const FRONTEND_URL = "http://127.0.0.1:4174";

test("login and complete write flows", async () => {
  const uniqueSuffix = Date.now().toString();
  const hiveId = `HIVE-E2E-${uniqueSuffix}`;
  const inspectionNote = `Inspection ${uniqueSuffix}`;
  const uploadImagePath = path.resolve(__dirname, "../src/assets/logo2.png");

  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const page = context.pages()[0] ?? (await context.newPage());

  try {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState("networkidle");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("metafarm_admin_2026");
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.status() === 200),
      page.getByTestId("login-submit").click(),
    ]);
    await page.waitForURL(`${FRONTEND_URL}/`, { timeout: 15_000 });

    await page.goto(`${FRONTEND_URL}/hives`);
    await page.getByTestId("open-add-hive-dialog").click();
    await page.getByTestId("add-hive-id").fill(hiveId);
    await page.getByTestId("add-hive-name").fill("E2E Hive");
    await page.getByTestId("add-hive-species").fill("Tetragonula");
    await page.getByTestId("add-hive-location").fill("Zone E2E");
    await page.getByTestId("submit-add-hive").click();

    await expect(page.getByText(hiveId)).toBeVisible();
    await page.getByText(hiveId).first().click();

    await expect(page).toHaveURL(new RegExp(`/hives/${hiveId}$`));

    await page.getByTestId("open-harvest-dialog").click();
    await page.getByTestId("harvest-honey").fill("55");
    await page.getByTestId("harvest-propolis").fill("4");
    await page.getByTestId("submit-harvest").click();
    await expect(page.getByText("55 ml")).toBeVisible();

    await page.getByTestId("open-inspection-dialog").click();
    await page.getByTestId("inspection-status").selectOption("Weak");
    await page.getByTestId("inspection-notes").fill(inspectionNote);
    await page.getByTestId("inspection-image").setInputFiles(uploadImagePath);
    await page.getByTestId("submit-inspection").click();

    await expect(page.getByText(inspectionNote)).toBeVisible();

    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL(/\/login$/);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
});
