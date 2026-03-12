import { test, expect } from "@playwright/test";

test("Hero headline rotates after interval", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(30_000);

  await page.goto("/");

  // Wait for scramble to finish
  await page.waitForTimeout(2000);
  const h1 = page.locator("h1");
  const initialText = await h1.getAttribute("aria-label") ?? await h1.innerText();

  // Wait for rotation (10s interval + scramble time)
  await page.waitForTimeout(12_000);

  const newText = await h1.getAttribute("aria-label") ?? await h1.innerText();
  expect(newText).not.toBe(initialText);
});
