import { validateTwilioSignature } from "@/lib/conference-call";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.formData().catch(() => null);

  if (!body) {
    return Response.json({ ok: false, error: "Invalid Twilio status payload." }, { status: 400 });
  }

  // Convert FormData to a plain object for Twilio signature validation.
  const params: Record<string, string> = {};
  body.forEach((value, key) => {
    params[key] = String(value);
  });

  if (!validateTwilioSignature(request, params)) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  console.log("Twilio conference-call status callback", {
    conferenceName: new URL(request.url).searchParams.get("conference_name"),
    callSid: params["CallSid"],
    callStatus: params["CallStatus"],
    callDuration: params["CallDuration"],
    from: params["From"],
    to: params["To"],
    timestamp: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
