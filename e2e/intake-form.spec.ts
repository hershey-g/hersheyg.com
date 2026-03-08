import { test, expect } from "@playwright/test";
import {
  mockIntakeAPI,
  mockIntakeAPIError,
  completeIntakeFlow,
} from "./helpers/intake";

/**
 * Scroll the contact section heading into the viewport center.
 * This reliably triggers framer-motion's useInView (margin: -100px)
 * which auto-starts the intake flow on desktop.
 */
async function scrollToContact(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const h = document.querySelector("#contact");
    h?.scrollIntoView({ behavior: "instant", block: "center" });
  });
}

// ---------------------------------------------------------------------------
// 1. Desktop: completes full 6-step flow and submits
// ---------------------------------------------------------------------------
test("Desktop: completes full 6-step flow and submits", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  const payloads = await mockIntakeAPI(page);
  await page.goto("/");
  await scrollToContact(page);

  await completeIntakeFlow(page);

  await expect(page.getByText("Brief sent")).toBeVisible();
  expect(payloads).toHaveLength(1);
  expect(payloads[0]).toMatchObject({
    type: "AI agent",
    describe: "Test project: an AI agent for e2e testing",
    timeline: "This quarter",
    budget: "$25-50k",
    name: "Test User",
    contact: "test@example.com",
  });
  expect(payloads[0].ref).toMatch(/^#PRJ-\d{4}$/);
});

// ---------------------------------------------------------------------------
// 2. Mobile: modal opens and flow completes
// ---------------------------------------------------------------------------
test("Mobile: modal opens and flow completes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile only");
  test.setTimeout(60_000);

  await mockIntakeAPI(page);
  await page.goto("/");

  // Clicking "Open chat →" auto-scrolls and starts the flow
  await page.getByText("Open chat →").click();
  const dialog = page.getByRole("dialog", { name: "Project intake form" });
  await expect(dialog).toBeVisible();

  // Scope to dialog — embedded terminal also renders the same state
  await completeIntakeFlow(page, dialog);

  await expect(dialog.getByText("Brief sent")).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. API failure shows fallback email
// ---------------------------------------------------------------------------
test("API failure shows fallback email", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockIntakeAPIError(page);
  await page.goto("/");
  await scrollToContact(page);

  await completeIntakeFlow(page);

  await expect(
    page.getByText("just email hello@hersheyg.com")
  ).toBeVisible();
  await expect(page.getByText("Brief sent")).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// 4. Empty input cannot submit
// ---------------------------------------------------------------------------
test("Empty input cannot submit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");

  await mockIntakeAPI(page);
  await page.goto("/");
  await scrollToContact(page);

  // Get past step 1 to reach the textarea step
  await page.getByRole("button", { name: "AI agent" }).click();

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  const submitBtn = page.getByRole("button", { name: "→" });
  await expect(submitBtn).toBeDisabled();

  // Spaces-only should stay disabled
  await textarea.fill("   ");
  await expect(submitBtn).toBeDisabled();

  // Real text should enable
  await textarea.fill("Real project description");
  await expect(submitBtn).toBeEnabled();
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
