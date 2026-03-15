import { execFile } from "node:child_process";
import { timingSafeEqual, createHmac } from "node:crypto";
import { existsSync } from "node:fs";

const PUSHOVER_SCRIPT =
  "/root/.openclaw/shared-memory/skills/pushover/scripts/pushover-send.sh";
const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";
const DEFAULT_FROM_NUMBER = "+19294292921";
const DEFAULT_TIMEOUT_SECONDS = 30;
const MAX_CALL_DURATION_SECONDS = 30 * 60;
const POLL_INTERVAL_MS = 2_000;

type TwilioCreateCallResponse = {
  sid: string;
  status: string;
};

type TwilioCallInstance = {
  sid: string;
  status: string;
  duration: string | null;
  to: string | null;
  from: string | null;
};

function getTwilioCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio is not configured on the server.");
  }

  return { accountSid, authToken };
}

function getTwilioAuthHeader() {
  const { accountSid, authToken } = getTwilioCredentials();
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  return `Basic ${auth}`;
}

export function getConferenceName(conversationId: string) {
  return `demo-transfer-${conversationId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function getPublicBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";

  if (!host) {
    throw new Error("Unable to determine public base URL for Twilio callbacks.");
  }

  return `${protocol}://${host}`;
}

export function validateWebhookSecret(request: Request) {
  const expected = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const actual = request.headers.get("x-webhook-secret");

  if (!expected || !actual) return false;

  const expectedBuf = Buffer.from(expected, "utf-8");
  const actualBuf = Buffer.from(actual, "utf-8");

  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function sendTransferNotification() {
  // The Pushover script only exists on the self-hosted server, not on Vercel.
  // Use non-blocking execFile and silently skip if the script is absent.
  if (!existsSync(PUSHOVER_SCRIPT)) {
    console.warn("Pushover script not found — skipping transfer notification.");
    return;
  }

  execFile(
    PUSHOVER_SCRIPT,
    [
      "AI Demo Transfer",
      "A website visitor wants to talk to you. Picking up your phone now.",
      "1",
    ],
    (error) => {
      if (error) {
        console.error("Pushover notification failed:", error);
      }
    },
  );
}

export async function createOutboundTransferCall(opts: {
  request: Request;
  conferenceName: string;
}) {
  const { accountSid } = getTwilioCredentials();
  const hersheyPhone = process.env.HERSHEY_PHONE ?? "+19176489364";
  const fromNumber = process.env.TWILIO_DEMO_FROM_NUMBER ?? DEFAULT_FROM_NUMBER;
  const baseUrl = getPublicBaseUrl(opts.request);
  const twimlUrl = new URL("/api/conference-call/twiml", baseUrl);
  twimlUrl.searchParams.set("conference_name", opts.conferenceName);

  const statusUrl = new URL("/api/conference-call/status", baseUrl);
  statusUrl.searchParams.set("conference_name", opts.conferenceName);

  const body = new URLSearchParams();
  body.set("To", hersheyPhone);
  body.set("From", fromNumber);
  body.set("Url", twimlUrl.toString());
  body.set("Method", "GET");
  body.set("Timeout", String(DEFAULT_TIMEOUT_SECONDS));
  body.set("TimeLimit", String(MAX_CALL_DURATION_SECONDS));
  body.set("StatusCallback", statusUrl.toString());
  body.set("StatusCallbackMethod", "POST");
  body.append("StatusCallbackEvent", "initiated");
  body.append("StatusCallbackEvent", "ringing");
  body.append("StatusCallbackEvent", "answered");
  body.append("StatusCallbackEvent", "completed");

  const response = await fetch(
    `${TWILIO_API_BASE}/Accounts/${accountSid}/Calls.json`,
    {
      method: "POST",
      headers: {
        Authorization: getTwilioAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio call creation failed: ${errorText}`);
  }

  return (await response.json()) as TwilioCreateCallResponse;
}

async function fetchCall(callSid: string) {
  const { accountSid } = getTwilioCredentials();
  const response = await fetch(
    `${TWILIO_API_BASE}/Accounts/${accountSid}/Calls/${callSid}.json`,
    {
      headers: {
        Authorization: getTwilioAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio call fetch failed: ${errorText}`);
  }

  return (await response.json()) as TwilioCallInstance;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForCallToConnect(callSid: string) {
  const deadline = Date.now() + DEFAULT_TIMEOUT_SECONDS * 1_000;

  while (Date.now() < deadline) {
    const call = await fetchCall(callSid);

    const durationSeconds = Number(call.duration ?? "0");

    if (call.status === "in-progress" || (call.status === "completed" && durationSeconds > 0)) {
      return { connected: true as const, call };
    }

    if (["busy", "failed", "no-answer", "canceled"].includes(call.status)) {
      return { connected: false as const, call };
    }

    await sleep(POLL_INTERVAL_MS);
  }

  const call = await fetchCall(callSid);
  const durationSeconds = Number(call.duration ?? "0");
  const connected =
    call.status === "in-progress" || (call.status === "completed" && durationSeconds > 0);

  return connected
    ? { connected: true as const, call }
    : { connected: false as const, call };
}

/**
 * Validate an incoming Twilio request signature.
 * See https://www.twilio.com/docs/usage/security#validating-requests
 */
export function validateTwilioSignature(
  request: Request,
  params: Record<string, string>,
) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false; // Twilio not configured

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;

  // Reconstruct the full URL Twilio used (without any port mangling).
  const url = request.url;

  // Sort POST params alphabetically and concatenate key+value
  const sortedKeys = Object.keys(params).sort();
  const data = url + sortedKeys.map((k) => k + params[k]).join("");

  const expected = createHmac("sha1", authToken)
    .update(data, "utf-8")
    .digest("base64");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const actualBuf = Buffer.from(signature, "utf-8");

  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function buildConferenceTwiml(conferenceName: string) {
  const escapedConferenceName = conferenceName
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Incoming demo transfer. You are being connected to a website visitor.</Say>
  <Dial>
    <Conference
      beep="false"
      endConferenceOnExit="true"
      maxParticipants="2"
      startConferenceOnEnter="true">${escapedConferenceName}</Conference>
  </Dial>
</Response>`;
}
