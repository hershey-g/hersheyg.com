import { z } from "zod";
import { getRateLimiter } from "@/lib/rate-limit";

const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const PHONE_DAILY_LIMIT = 10;
const IP_WINDOW_LIMIT = 5;
const ELEVENLABS_URL =
  "https://api.elevenlabs.io/v1/convai/twilio/outbound-call";

type CounterEntry = {
  count: number;
  expiresAt: number;
};

const phoneCounters = new Map<string, CounterEntry>();

const requestSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Phone number must be valid E.164 format."),
});

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    const expectedHosts = [
      host,
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter((value): value is string => Boolean(value));

    for (const expected of expectedHosts) {
      const expectedUrl = expected.includes("://")
        ? new URL(expected)
        : new URL(`https://${expected}`);

      if (originUrl.host === expectedUrl.host) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getNextUtcMidnight(now = new Date()) {
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
}

function cleanupExpiredEntries(store: Map<string, CounterEntry>, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function incrementWithLimit(
  store: Map<string, CounterEntry>,
  key: string,
  limit: number,
  expiresAt: number
) {
  const current = store.get(key);
  if (current && current.count >= limit) {
    return false;
  }

  store.set(key, {
    count: (current?.count ?? 0) + 1,
    expiresAt,
  });

  return true;
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Origin not allowed." }, { status: 403 });
  }

  try {
    const limiter = getRateLimiter({
      limit: IP_WINDOW_LIMIT,
      window: "10 m",
      prefix: "demo-call",
    });

    if (limiter) {
      const { success } = await limiter.limit(getClientIp(request));
      if (!success) {
        return Response.json(
          { error: "Too many demo call attempts. Try again later." },
          { status: 429 }
        );
      }
    }
  } catch {
    // Fail open if Redis is unavailable.
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid phone number." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

  if (!apiKey || !agentId || !phoneNumberId) {
    return Response.json(
      { error: "Demo call is not configured on the server." },
      { status: 500 }
    );
  }

  const now = Date.now();
  cleanupExpiredEntries(phoneCounters, now);

  const expiresAt = getNextUtcMidnight();
  const dayKey = getDayKey();
  const phoneKey = `${dayKey}:${parsed.data.phoneNumber}`;

  if (
    !incrementWithLimit(phoneCounters, phoneKey, PHONE_DAILY_LIMIT, expiresAt)
  ) {
    return Response.json(
      {
        error: "This number has already requested the maximum calls for today.",
      },
      { status: 429 }
    );
  }

  try {
    const response = await fetch(ELEVENLABS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: phoneNumberId,
        to_number: parsed.data.phoneNumber,
      }),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: { message?: string } | string; message?: string }
        | null;

      const message =
        typeof errorPayload?.detail === "string"
          ? errorPayload.detail
          : errorPayload?.detail?.message ??
            errorPayload?.message ??
            "Unable to initiate the demo call.";

      throw new Error(message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    const phoneEntry = phoneCounters.get(phoneKey);
    if (phoneEntry) {
      phoneEntry.count = Math.max(0, phoneEntry.count - 1);
      if (phoneEntry.count === 0) {
        phoneCounters.delete(phoneKey);
      }
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initiate the demo call.",
      },
      { status: 502 }
    );
  }
}
