import { test, expect } from "@playwright/test";
import {
  mockChatAPI,
  mockChatAPIError,
  sendChatMessage,
} from "./helpers/intake";

/**
 * Scroll the contact section heading into the viewport center.
 * This reliably triggers framer-motion's useInView (margin: -100px)
 * which shows the intake chat on desktop.
 */
async function scrollToContact(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const h = document.querySelector("#contact");
    h?.scrollIntoView({ behavior: "instant", block: "center" });
  });
}

// ---------------------------------------------------------------------------
// 1. Desktop: shows initial greeting and accepts user input
// ---------------------------------------------------------------------------
test("Desktop: shows greeting and sends message", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  const requests = await mockChatAPI(page);
  await page.goto("/");
  await scrollToContact(page);

  // Initial greeting should be visible (static, no API call)
  await expect(
    page.locator('[aria-label="Agent is typing"]').or(
      page.locator(".intake-animate-in").first()
    )
  ).toBeVisible();

  // Wait for the desktop terminal title to appear
  await expect(
    page.getByText("~/intake-agent")
  ).toBeVisible({ timeout: 5000 });

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
// 2. Mobile: modal opens with greeting and chat input
// ---------------------------------------------------------------------------
test("Mobile: modal opens and shows chat", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  // Clicking "Open chat →" opens the modal
  await page.getByText("Open chat →").click();
  const dialog = page.getByRole("dialog", { name: "Project intake form" });
  await expect(dialog).toBeVisible();

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
  await scrollToContact(page);

  // Send a message that will trigger the error
  await sendChatMessage(page, "Hello, I need help");

  // Should show fallback email (use exact href to distinguish from footer link)
  await expect(
    page.locator('a[href="mailto:hello@hersheyg.com"]')
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
