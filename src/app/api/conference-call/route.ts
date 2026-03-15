import { z } from "zod";
import {
  createOutboundTransferCall,
  getConferenceName,
  sendTransferNotification,
  validateWebhookSecret,
  waitForCallToConnect,
} from "@/lib/conference-call";

export const runtime = "nodejs";

const requestSchema = z.object({
  conversation_id: z.string().trim().min(1, "conversation_id is required."),
});

export async function POST(request: Request) {
  if (!validateWebhookSecret(request)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "conversation_id is required.",
      },
      { status: 400 }
    );
  }

  const conferenceName = getConferenceName(parsed.data.conversation_id);

  try {
    sendTransferNotification();

    const call = await createOutboundTransferCall({
      request,
      conferenceName,
    });
    const result = await waitForCallToConnect(call.sid);

    if (!result.connected) {
      return Response.json({
        ok: false,
        error: "hershey_unavailable",
        conference_name: conferenceName,
        call_sid: call.sid,
        call_status: result.call.status,
        message_for_visitor:
          "Looks like Hershey is tied up right now. Want to leave your number and he will call you back?",
      });
    }

    return Response.json({
      ok: true,
      mode: "callback_v1",
      conference_name: conferenceName,
      call_sid: call.sid,
      call_status: result.call.status,
      message_for_visitor:
        "Hershey has been notified and called. Tell the visitor that Hershey will call them back in a moment on this number, or suggest they hang up and Hershey will call them directly.",
      implementation_note:
        "This v1 flow places a separate outbound call to Hershey and prepares a conference room, but it does not yet merge the existing ElevenLabs visitor call into the same conference.",
    });
  } catch (error) {
    console.error("Conference call transfer failed:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to initiate the conference call transfer.",
      },
      { status: 502 }
    );
  }
}
