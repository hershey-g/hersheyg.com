import { buildConferenceTwiml } from "@/lib/conference-call";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
