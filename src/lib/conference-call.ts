import { execFileSync } from "node:child_process";

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

  return Boolean(expected && actual && actual === expected);
}

export function sendTransferNotification() {
  try {
    execFileSync(PUSHOVER_SCRIPT, [
      "AI Demo Transfer",
      "A website visitor wants to talk to you. Picking up your phone now.",
      "1",
    ]);
  } catch (error) {
    console.error("Pushover notification failed:", error);
  }
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

  return {
    connected:
      call.status === "in-progress" || (call.status === "completed" && durationSeconds > 0),
    call,
  };
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
