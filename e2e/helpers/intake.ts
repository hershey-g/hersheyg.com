import { Page, Locator, expect } from "@playwright/test";

/**
 * Mock the /api/chat streaming endpoint.
 * Returns a static assistant response as a UI message stream.
 */
export async function mockChatAPI(page: Page, responseText?: string) {
  const requests: { messages: unknown[] }[] = [];
  const text = responseText ?? "Thanks for sharing that! Tell me more about what you're building.";

  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);

    // Simulate a UI message stream response
    const parts = [
      // Start step
      formatStreamPart("start-step", { messageId: "mock-1" }),
      // Text part
      formatStreamPart("text", text),
      // Finish step
      formatStreamPart("finish-step", {
        messageId: "mock-1",
        finishReason: "stop",
      }),
      // Finish message
      formatStreamPart("finish-message", {
        finishReason: "stop",
      }),
    ];

    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
      body: parts.join(""),
    });
  });

  return requests;
}

/**
 * Mock the /api/chat endpoint to return an error.
 */
export async function mockChatAPIError(page: Page) {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Internal server error" }),
    });
  });
}

/**
 * Mock the /api/chat endpoint to return a 429 rate limit error.
 */
export async function mockChatAPIRateLimit(page: Page) {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "Too many messages. Try again in a moment." }),
    });
  });
}

/**
 * Send a message in the chat UI.
 */
export async function sendChatMessage(
  page: Page,
  text: string,
  scope?: Locator
) {
  const ctx = scope ?? page;
  const input = ctx.getByPlaceholder("Type a message...");
  await expect(input).toBeVisible();
  await input.fill(text);
  await ctx.getByRole("button", { name: "Send message" }).click();
}

/**
 * Format a stream part for the AI SDK UI message stream protocol.
 */
function formatStreamPart(type: string, value: unknown): string {
  return `d:${JSON.stringify({ type, value })}\n`;
}
