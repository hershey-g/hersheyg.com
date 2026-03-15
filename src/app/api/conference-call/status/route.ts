export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.formData().catch(() => null);

  if (!body) {
    return Response.json({ ok: false, error: "Invalid Twilio status payload." }, { status: 400 });
  }

  console.log("Twilio conference-call status callback", {
    conferenceName: new URL(request.url).searchParams.get("conference_name"),
    callSid: body.get("CallSid"),
    callStatus: body.get("CallStatus"),
    callDuration: body.get("CallDuration"),
    from: body.get("From"),
    to: body.get("To"),
    timestamp: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
