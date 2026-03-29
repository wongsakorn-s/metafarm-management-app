import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

test("login and complete write flows", async ({ page }) => {
  const uniqueSuffix = Date.now().toString();
  const hiveId = `HIVE-E2E-${uniqueSuffix}`;
  const inspectionNote = `Inspection ${uniqueSuffix}`;
  const uploadImagePath = fileURLToPath(new URL("../src/assets/logo2.png", import.meta.url));

  await page.goto("/login");
  await page.getByTestId("login-username").fill("admin");
  await page.getByTestId("login-password").fill("metafarm_admin_2026");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/$/);

  await page.goto("/hives");
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
  await expect(page.getByText(/55/)).toBeVisible();

  await page.getByTestId("open-inspection-dialog").click();
  await page.getByTestId("inspection-status").selectOption("Weak");
  await page.getByTestId("inspection-notes").fill(inspectionNote);
  await page.getByTestId("inspection-image").setInputFiles(uploadImagePath);
  await page.getByTestId("submit-inspection").click();

  await expect(page.getByText(inspectionNote)).toBeVisible();
  await expect(page.locator('img[src*="/static/uploads/"]').first()).toBeVisible();

  await page.getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);
});
