import { test, expect } from "@playwright/test";
import {
  mockChatAPI,
  mockChatAPIError,
  sendChatMessage,
} from "./helpers/intake";

/**
 * Scroll to the inline contact section.
 */
async function scrollToContact(page: import("@playwright/test").Page) {
  await page.evaluate(() =>
    document.getElementById("contact")?.scrollIntoView({ behavior: "instant" })
  );
}

// ---------------------------------------------------------------------------
// 1. Desktop: inline chat shows greeting and accepts user input
// ---------------------------------------------------------------------------
test("Desktop: inline chat sends message", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  const requests = await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  // No terminal chrome should be present
  await expect(page.getByText("~/intake-agent")).toHaveCount(0);

  // Send a message
  await sendChatMessage(page, "I want to build an AI agent for customer support");

  // User message should appear
  await expect(
    page.getByText("I want to build an AI agent for customer support")
  ).toBeVisible();

  // API should have been called
  expect(requests.length).toBeGreaterThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// 2. Suggestion chips render in 2x2 grid
// ---------------------------------------------------------------------------
test("Suggestion chips render 4 in a 2x2 grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  // Chips container should use grid layout with exactly 4 buttons
  const chipsGrid = page.locator(".grid.grid-cols-1");
  await expect(chipsGrid).toBeVisible({ timeout: 5000 });
  const chipButtons = chipsGrid.locator("button");
  await expect(chipButtons).toHaveCount(4);

  // Each chip should have non-empty text
  for (let i = 0; i < 4; i++) {
    const text = await chipButtons.nth(i).innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  }
});

// ---------------------------------------------------------------------------
// 3. API error shows fallback email
// ---------------------------------------------------------------------------
test("API error shows fallback email", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockChatAPIError(page);
  await page.goto("/");

  await scrollToContact(page);

  // Send a message that will trigger the error
  await sendChatMessage(page, "Hello, I need help");

  // Should show fallback email (scoped to contact section to avoid footer match)
  await expect(
    page.locator('#contact a[href="mailto:hello@hersheyg.com"]')
  ).toBeVisible({ timeout: 10000 });
});

// ---------------------------------------------------------------------------
// 4. Empty input cannot submit
// ---------------------------------------------------------------------------
test("Empty input cannot submit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  const sendBtn = page.getByRole("button", { name: "Send message" });
  await expect(sendBtn).toBeVisible();

  // Should be disabled when input is empty
  await expect(sendBtn).toBeDisabled();

  // Spaces-only should stay disabled
  const input = page.getByPlaceholder("Type a message...");
  await input.fill("   ");
  await expect(sendBtn).toBeDisabled();

  // Real text should enable
  await input.fill("Hello");
  await expect(sendBtn).toBeEnabled();
});

// ---------------------------------------------------------------------------
// 5. Mobile: chat is inline (no modal)
// ---------------------------------------------------------------------------
test("Mobile: chat is inline", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  // Chat input should be visible inline (no modal needed)
  await expect(page.getByPlaceholder("Type a message...")).toBeVisible({ timeout: 5000 });

  // No "Tap to start" button should exist
  await expect(page.locator("button:has-text('Tap to start')")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 6. No horizontal overflow on mobile
// ---------------------------------------------------------------------------
test("No horizontal overflow on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile only");

  await page.goto("/");

  // Scroll full page to trigger all lazy content
  await page.evaluate(async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const step = window.innerHeight;
    let y = 0;
    while (y < document.body.scrollHeight) {
      window.scrollTo(0, y);
      y += step;
      await delay(100);
    }
    window.scrollTo(0, document.body.scrollHeight);
    await delay(300);
  });

  const hasOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });

  expect(hasOverflow).toBe(false);
});
