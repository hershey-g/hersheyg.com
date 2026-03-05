import { Resend } from "resend";
import { NextResponse } from "next/server";

interface IntakeBody {
  type?: string;
  describe?: string;
  timeline?: string;
  budget?: string;
  name?: string;
  contact?: string;
  ref?: string;
}

function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function truncateField(val: string | undefined, max: number): string | undefined {
  if (!val) return val;
  return val.slice(0, max);
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body: IntakeBody = await request.json();
    const type = truncateField(body.type, 100);
    const describe = truncateField(body.describe, 2000);
    const timeline = truncateField(body.timeline, 100);
    const budget = truncateField(body.budget, 100);
    const name = truncateField(body.name, 200);
    const contact = truncateField(body.contact, 200);
    const ref = truncateField(body.ref, 20);

    // Send brief to Hershey
    await resend.emails.send({
      from: "Intake Agent <onboarding@resend.dev>",
      to: "hello@hersheyg.com",
      subject: `New project inquiry ${ref ?? ""}`.trim(),
      text: [
        `New intake submission ${ref ?? ""}`,
        "",
        `Project type: ${type ?? "—"}`,
        `Description: ${describe ?? "—"}`,
        `Timeline: ${timeline ?? "—"}`,
        `Budget: ${budget ?? "—"}`,
        "",
        `Name: ${name ?? "—"}`,
        `Contact: ${contact ?? "—"}`,
      ].join("\n"),
    });

    // Send confirmation to visitor if they provided an email
    if (contact && isEmail(contact)) {
      await resend.emails.send({
        from: "Hershey Goldberger <onboarding@resend.dev>",
        to: contact,
        subject: `Got it — ref ${ref ?? ""}`.trim(),
        text: [
          `Hey ${name ?? "there"},`,
          "",
          "Your brief just landed. Hershey will follow up personally within a few hours.",
          "",
          `Reference: ${ref ?? "—"}`,
          "",
          "— The Intake Agent",
          "hersheyg.com",
        ].join("\n"),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Intake API error:", error);
    return NextResponse.json(
      { error: "Failed to send" },
      { status: 500 }
    );
  }
}
