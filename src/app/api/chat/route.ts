import { streamText, convertToModelMessages, consumeStream, stepCountIs, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { Resend } from "resend";
import { buildSystemPrompt } from "@/lib/intake-system-prompt";
import { classifyVisitor, getRelevantKnowledge, ALL_KNOWLEDGE } from "@/lib/knowledge";
import { insertConversation, ensureTable } from "@/lib/db";
import { getRateLimiter } from "@/lib/rate-limit";

const MAX_MESSAGES = 30;
const MAX_INPUT_LENGTH = 2000;
const MODEL = process.env.CHAT_MODEL ?? "claude-sonnet-4-6";

function generateRef() {
  return "#PRJ-" + Math.floor(1000 + Math.random() * 9000);
}

function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function extractTextMessages(messages: UIMessage[]): { role: string; content: string }[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(""),
    }));
}

export async function POST(request: Request) {
  // Rate limiting (fail open if Redis unavailable)
  try {
    const limiter = getRateLimiter();
    if (limiter) {
      const ip = getClientIp(request);
      const { success } = await limiter.limit(ip);
      if (!success) {
        return new Response(
          JSON.stringify({ error: "Too many messages. Try again in a moment." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  } catch {
    // Fail open — allow request through if rate limiter errors
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as Record<string, unknown>).messages)) {
    return new Response(
      JSON.stringify({ error: "Invalid request: messages array required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: UIMessage[] = (body as { messages: UIMessage[] }).messages;

  // Enforce max conversation length
  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({
        error: "Conversation limit reached. Email hello@hersheyg.com to continue.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Sanitize: truncate all user messages to max length
  messages = messages.map((msg) => {
    if (msg.role === "user") {
      return {
        ...msg,
        parts: msg.parts.map((part) =>
          part.type === "text"
            ? { ...part, text: part.text.slice(0, MAX_INPUT_LENGTH) }
            : part
        ),
      };
    }
    return msg;
  });

  const textMessages = extractTextMessages(messages);
  const visitorType = classifyVisitor(textMessages);
  const knowledgeBlock = getRelevantKnowledge(textMessages, visitorType, ALL_KNOWLEDGE);
  const systemPrompt = buildSystemPrompt({
    visitorType,
    knowledgeBlock,
    nearLimit: messages.length >= 25,
  });

  const result = streamText({
    model: anthropic(MODEL),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
    maxOutputTokens: 1024,
    tools: {
      complete_intake: {
        description:
          "Call this when you have gathered enough information about the project and the visitor's contact details (or they've declined to share). This hands off the brief to Hershey.",
        inputSchema: z.object({
          project_type: z.string().describe("Type of project (e.g., AI agent, full-stack product)"),
          description: z.string().describe("What they want built — summary of the conversation"),
          timeline: z.string().optional().describe("When they need it"),
          budget: z.string().optional().describe("Budget range if mentioned"),
          name: z.string().optional().describe("Visitor's name if provided"),
          email: z.string().optional().describe("Visitor's email address"),
          phone: z.string().optional().describe("Visitor's phone number"),
        }),
        execute: async (args) => {
          const ref = generateRef();

          // Write to database
          try {
            await ensureTable();
            await insertConversation(ref, messages, args);
          } catch (err) {
            console.error("DB write failed:", err);
            // Continue even if DB fails — email is the critical path
          }

          // Send emails via Resend
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);

            // Email to Hershey
            await resend.emails.send({
              from: "Intake Agent <onboarding@resend.dev>",
              to: "hello@hersheyg.com",
              subject: `New intake conversation ${ref}`,
              text: [
                `New intake conversation ${ref}`,
                "",
                `Project type: ${args.project_type ?? "—"}`,
                `Description: ${args.description ?? "—"}`,
                `Timeline: ${args.timeline ?? "—"}`,
                `Budget: ${args.budget ?? "—"}`,
                "",
                `Name: ${args.name ?? "—"}`,
                `Email: ${args.email ?? "—"}`,
                `Phone: ${args.phone ?? "—"}`,
                "",
                "---",
                "Full conversation:",
                ...messages.map((m) => {
                  const text = m.parts
                    .filter((p): p is { type: "text"; text: string } => p.type === "text")
                    .map((p) => p.text)
                    .join("");
                  return `[${m.role}] ${text}`;
                }),
              ].join("\n"),
            });

            // Confirmation to visitor if they provided an email
            if (args.email && isEmail(args.email)) {
              await resend.emails.send({
                from: "Hershey Goldberger <onboarding@resend.dev>",
                to: args.email,
                subject: `Got your brief — ref ${ref}`,
                text: [
                  `Hey ${args.name ?? "there"},`,
                  "",
                  "Your brief just landed. Hershey will follow up personally within a few hours.",
                  "",
                  `Reference: ${ref}`,
                  "",
                  "— The Intake Agent",
                  "hersheyg.com",
                ].join("\n"),
              });
            }
          } catch (err) {
            console.error("Email send failed:", err);
          }

          return `Brief sent to Hershey (ref ${ref}). He'll follow up shortly.`;
        },
      },
    },
    stopWhen: stepCountIs(2), // Allow tool call + follow-up response
  });

  // Ensure stream completes server-side even if client disconnects
  consumeStream({ stream: result.textStream });

  return result.toUIMessageStreamResponse();
}
