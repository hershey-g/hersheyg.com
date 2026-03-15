import { buildConferenceTwiml, validateTwilioSignature } from "@/lib/conference-call";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Twilio sends a signature on all webhook requests — reject unsigned calls
  // to prevent external abuse of this endpoint.
  if (!validateTwilioSignature(request, {})) {
    return new Response("Forbidden.", { status: 403 });
  }

  const conferenceName = new URL(request.url).searchParams.get("conference_name");

  if (!conferenceName) {
    return new Response("Missing conference_name.", { status: 400 });
  }

  return new Response(buildConferenceTwiml(conferenceName), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
