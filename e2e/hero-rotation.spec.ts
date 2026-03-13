import { test, expect } from "@playwright/test";

test("Hero shows static headline and CTA", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await page.goto("/");

  const h1 = page.locator("h1");
  await expect(h1).toBeVisible();
  await expect(h1).toContainText("I build AI that runs");

  // CTA button should exist
  const cta = page.getByRole("button", { name: "Start a conversation" });
  await expect(cta).toBeVisible();

  // No terminal element should be present
  await expect(page.locator('[data-testid="terminal"]')).toHaveCount(0);
  await expect(page.getByText("~/projects")).toHaveCount(0);
});
