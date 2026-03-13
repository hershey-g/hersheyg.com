import { test, expect } from "@playwright/test";
import {
  mockChatAPI,
  mockChatAPIError,
  sendChatMessage,
} from "./helpers/intake";

/**
 * Open the intake overlay by clicking the hero CTA button.
 * Scoped to #hero to avoid matching the contact section CTA.
 */
async function openOverlay(page: import("@playwright/test").Page) {
  const ctaButton = page.locator('#hero button:has-text("Start a conversation")');
  await ctaButton.click();
  // Wait for dialog to appear
  await expect(page.getByRole("dialog", { name: "Project intake form" })).toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Desktop: overlay opens with greeting and accepts user input
// ---------------------------------------------------------------------------
test("Desktop: overlay opens and sends message", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  const requests = await mockChatAPI(page);
  await page.goto("/");

  await openOverlay(page);

  const dialog = page.getByRole("dialog", { name: "Project intake form" });

  // Terminal title should be visible on desktop
  await expect(dialog.getByText("~/intake-agent")).toBeVisible({ timeout: 5000 });

  // Send a message
  await sendChatMessage(page, "I want to build an AI agent for customer support", dialog);

  // User message should appear
  await expect(
    dialog.getByText("I want to build an AI agent for customer support")
  ).toBeVisible();

  // API should have been called
  expect(requests.length).toBeGreaterThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// 2. Mobile: overlay opens with greeting and chat input
// ---------------------------------------------------------------------------
test("Mobile: overlay opens and shows chat", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  await openOverlay(page);
  const dialog = page.getByRole("dialog", { name: "Project intake form" });

  // Chat input should be visible in the modal
  await expect(dialog.getByPlaceholder("Type a message...")).toBeVisible();

  // Send a message within the modal
  await sendChatMessage(page, "Need a WhatsApp bot", dialog);

  // User message should appear in dialog
  await expect(dialog.getByText("Need a WhatsApp bot")).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. API error shows fallback email
// ---------------------------------------------------------------------------
test("API error shows fallback email", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockChatAPIError(page);
  await page.goto("/");

  await openOverlay(page);
  const dialog = page.getByRole("dialog", { name: "Project intake form" });

  // Send a message that will trigger the error
  await sendChatMessage(page, "Hello, I need help", dialog);

  // Should show fallback email
  await expect(
    dialog.locator('a[href="mailto:hello@hersheyg.com"]')
  ).toBeVisible({ timeout: 10000 });
});

// ---------------------------------------------------------------------------
// 4. Empty input cannot submit
// ---------------------------------------------------------------------------
test("Empty input cannot submit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await mockChatAPI(page);
  await page.goto("/");

  await openOverlay(page);
  const dialog = page.getByRole("dialog", { name: "Project intake form" });

  const sendBtn = dialog.getByRole("button", { name: "Send message" });
  await expect(sendBtn).toBeVisible();

  // Should be disabled when input is empty
  await expect(sendBtn).toBeDisabled();

  // Spaces-only should stay disabled
  const input = dialog.getByPlaceholder("Type a message...");
  await input.fill("   ");
  await expect(sendBtn).toBeDisabled();

  // Real text should enable
  await input.fill("Hello");
  await expect(sendBtn).toBeEnabled();
});

// ---------------------------------------------------------------------------
// 5. No horizontal overflow on mobile
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

// ---------------------------------------------------------------------------
// 6. ESC closes overlay
// ---------------------------------------------------------------------------
test("ESC closes overlay", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await mockChatAPI(page);
  await page.goto("/");

  await openOverlay(page);
  const dialog = page.getByRole("dialog", { name: "Project intake form" });
  await expect(dialog).toBeVisible();

  // Press ESC
  await page.keyboard.press("Escape");

  // Dialog should be gone
  await expect(dialog).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// 7. Backdrop click closes overlay
// ---------------------------------------------------------------------------
test("Backdrop click closes overlay", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await mockChatAPI(page);
  await page.goto("/");

  await openOverlay(page);
  const dialog = page.getByRole("dialog", { name: "Project intake form" });
  await expect(dialog).toBeVisible();

  // Click the backdrop element directly (bypasses z-order stacking)
  await page.locator('.overlay-backdrop').dispatchEvent('click');

  // Dialog should be gone
  await expect(dialog).not.toBeVisible();
});
