import { Page, Locator, expect } from "@playwright/test";

interface CapturedPayload {
  type?: string;
  describe?: string;
  timeline?: string;
  budget?: string;
  name?: string;
  contact?: string;
  ref?: string;
}

/** Intercept POST /api/intake → 200, capture the request body. */
export async function mockIntakeAPI(page: Page) {
  const payloads: CapturedPayload[] = [];

  await page.route("**/api/intake", async (route) => {
    const body = route.request().postDataJSON();
    payloads.push(body);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  return payloads;
}

/** Intercept POST /api/intake → 500. */
export async function mockIntakeAPIError(page: Page) {
  await page.route("**/api/intake", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Failed to send" }),
    });
  });
}

/**
 * Walk all 6 steps of the intake form.
 * Playwright auto-retry handles the 600-1800ms typing delays between steps.
 *
 * @param scope - Optional locator to scope interactions (e.g. dialog for mobile modal).
 *                On mobile, both the embedded terminal and modal render the same state,
 *                so scoping avoids strict-mode violations from duplicate elements.
 */
export async function completeIntakeFlow(page: Page, scope?: Locator) {
  const ctx = scope ?? page;

  // Step 1 — type (options)
  await ctx.getByRole("button", { name: "AI agent" }).click();

  // Step 2 — describe (textarea)
  const textarea = ctx.locator("textarea");
  await expect(textarea).toBeVisible();
  await textarea.fill("Test project: an AI agent for e2e testing");
  await ctx.getByRole("button", { name: "→" }).click();

  // Step 3 — timeline (options)
  await ctx.getByRole("button", { name: "This quarter" }).click();

  // Step 4 — budget (options)
  await ctx.getByRole("button", { name: "$25-50k" }).click();

  // Step 5 — name (input)
  const nameInput = ctx.getByPlaceholder("Your name");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Test User");
  await ctx.getByRole("button", { name: "→" }).click();

  // Step 6 — contact (input)
  const contactInput = ctx.getByPlaceholder("email or phone");
  await expect(contactInput).toBeVisible();
  await contactInput.fill("test@example.com");
  await ctx.getByRole("button", { name: "→" }).click();
}
