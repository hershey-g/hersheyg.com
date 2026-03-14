# IntakeAgent: RAG Knowledge + Personality Overhaul

**Date:** 2026-03-14
**Status:** Draft
**Scope:** System prompt rewrite, structured knowledge base, smart injection, visitor classification, rotating suggestion chips

## Problem

The current IntakeAgent works as a functional intake form disguised as a chat. It has one mode for everyone, deflects real technical conversation ("Hershey will follow up"), and doesn't demonstrate expertise. It gathers info on a checklist and doesn't adapt to who it's talking to.

## Goals

1. **Personality with opinions** — the agent has real takes on tech, pushes back gently on bad ideas, and earns trust through demonstrated knowledge. Never makes non-technical visitors feel dumb.
2. **Room reading** — adapts language, depth, and generosity based on whether the visitor is technical or non-technical. Detects this from conversation signals within 1-2 messages.
3. **Structured knowledge** — a curated knowledge base about Hershey's portfolio, tech opinions, process, and capabilities, injected into the prompt based on relevance.
4. **Natural info gathering** — same intake fields (project, timeline, budget, name, email, phone) but woven into organic conversation, never feels like a checklist.
5. **Rotating suggestion chips** — contextual, personality-forward conversation starters from a larger pool.

## Approach: Structured Knowledge + Smart Injection

Build a structured knowledge base as categorized TypeScript files. At runtime, use keyword matching on the conversation to inject only relevant entries into the system prompt. No vector store, no embeddings pipeline — just smart prompt construction.

This gets 80% of RAG's benefit with 20% of the complexity. The knowledge base format migrates cleanly into a true vector store later if needed.

## Design

### 1. Knowledge Base Structure

New directory `src/lib/knowledge/` with categorized TypeScript files:

```
src/lib/knowledge/
  index.ts          — exports all knowledge, category matcher, injection builder
  portfolio.ts      — past projects with descriptions, tech used, outcomes
  opinions.ts       — tech opinions & preferences (why Next.js, why Postgres, etc.)
  process.ts        — engagement structure, pricing philosophy, what to expect
  capabilities.ts   — what Hershey builds (AI agents, web apps, automations, etc.)
  faq.ts            — common prospect questions and answers
```

Each knowledge entry follows this shape:

```ts
interface KnowledgeEntry {
  id: string;                              // e.g., "project-restaurant-app"
  category: "portfolio" | "opinions" | "process" | "capabilities" | "faq";
  keywords: string[];                      // trigger words for matching
  techLevel: "any" | "technical" | "non-technical";
  content: string;                         // the actual knowledge text
}
```

- `keywords` — used for matching against user messages
- `techLevel` — filters entries based on visitor classification: `"technical"` entries only surface for technical visitors, `"non-technical"` for non-technical, `"any"` for all
- `content` — written in the voice appropriate to its techLevel

### 2. Visitor Classification (Code-Level Heuristic)

The chat API route classifies the visitor as `"technical"` or `"non-technical"` using a lightweight code-level heuristic. This classification serves two purposes: (a) filtering knowledge entries by `techLevel`, and (b) being passed to the system prompt so the LLM knows how to adapt its tone.

**Classification function:**

```ts
function classifyVisitor(
  messages: { role: string; content: string }[]
): "technical" | "non-technical"
```

Scans all user messages in the conversation for technical signal words. Returns `"technical"` if the signal count exceeds a threshold (e.g., 3+ technical terms), otherwise `"non-technical"`.

**Technical signal words:** Framework/library names (React, Next.js, Django, Rails, etc.), infrastructure terms (API, GraphQL, microservices, Docker, Kubernetes, CI/CD), programming terms (endpoint, middleware, schema, migration, deploy, webhook, cron).

**Non-technical is the default.** The classifier only promotes to `"technical"` when there's strong evidence. This is intentional — it's better to be slightly too accessible than to alienate a non-technical prospect with jargon.

**How classification affects behavior:**

- **Code level:** Filters which `techLevel` knowledge entries get injected (see Section 3).
- **Prompt level:** The visitor classification is passed as a label in the system prompt (`Visitor type: technical` or `Visitor type: non-technical`), and the personality section tells the LLM how to adapt tone and depth for each type:
  - **Non-technical:** Plain language, outcomes over implementation, analogies instead of jargon. Example: "That's a really common pattern — we'd set it up so your team can update the menu themselves without touching code."
  - **Technical:** Match depth, use proper terminology, discuss architecture tradeoffs, share real opinions. Example: "Honestly I'd skip the SPA approach here — Next.js with server components gives you the same UX without the state management headache."

### 3. Knowledge Injection Logic

Lives in `src/lib/knowledge/index.ts`. A function that:

1. Takes the current message + last 2-3 messages from history
2. Scans for keyword hits against all knowledge entries (case-insensitive, whole-word matching)
3. Scores entries by count of unique keyword hits
4. Filters by `techLevel` based on the code-level visitor classification from Section 2
5. Returns the top 4 entries as a formatted text block

```ts
function getRelevantKnowledge(
  messages: { role: string; content: string }[],
  visitorType: "technical" | "non-technical"
): string
```

**Filtering rules:** Entries with `techLevel: "any"` are always eligible. Entries with `techLevel: "technical"` are only eligible when `visitorType` is `"technical"`. Entries with `techLevel: "non-technical"` are only eligible when `visitorType` is `"non-technical"`.

Returns a string block that gets injected into the system prompt as a `## Relevant Context` section. If no entries match, returns empty string (no context injected).

The matching is deliberately simple — ~50 lines of code. Case-insensitive, whole-word keyword scanning scored by unique keyword hit count. No stemming, no embeddings. Good enough for a knowledge base of 30-50 entries.

### 4. System Prompt Personality Rewrite

The system prompt personality section gets overhauled. The core character:

> Warm and direct, with real opinions. The agent has seen a lot of projects and isn't shy about sharing what works and what doesn't — but always in a way that educates rather than intimidates.

**Behavioral rules:**

1. **Has opinions, gives them gently.** Will push back on ideas when there's a better approach, but frames it as sharing experience, not correcting. "I'd actually push back on the mobile app idea — for what you're describing, a really good responsive web app would get you to market in half the time and you wouldn't need to deal with app store approval."

2. **Never talks down.** If someone uses the wrong term, the agent just uses the right term naturally without correcting. Never says "actually..." in a condescending way. Never uses jargon without context for non-technical visitors.

3. **Generous with serious prospects.** When someone is describing a real problem and seems genuinely interested, the agent shares real thinking — initial architecture direction, what the hard parts would be, what to watch out for. This is the "show, don't tell" approach to selling expertise.

4. **Redirects advice-seekers gracefully.** If someone is clearly fishing for free consulting (lots of detailed technical questions, no interest in engagement), the agent redirects warmly: "These are great questions — honestly this is getting into territory where I'd want to really dig in properly. Want me to set up a call so Hershey can give you a proper answer?"

5. **Matches energy.** Short messages get short responses. Detailed messages get detailed responses. Never over-explains.

6. **Third person stays** — "Hershey" not "Mr. Goldberger." The agent positions itself as someone who knows Hershey's work deeply.

7. **No markdown, no em dashes** — stays. Natural texting style is preserved.

### 5. System Prompt Assembly (Runtime)

`src/lib/intake-system-prompt.ts` changes from exporting a static string to exporting a builder function:

```ts
// Before (current):
export const INTAKE_SYSTEM_PROMPT: string = "..."
export const INTAKE_GREETINGS: string[] = [...]

// After:
export function buildSystemPrompt(opts: {
  visitorType: "technical" | "non-technical";
  knowledgeBlock: string;   // from getRelevantKnowledge(), may be empty
  nearLimit: boolean;       // true when message count >= 25
}): string

export const INTAKE_GREETINGS: string[] = [...]  // stays as-is
```

The builder composes the prompt in this order:

```
[Base personality + behavioral rules — static]
[Visitor type label — "Visitor type: technical" or "non-technical"]
[## Relevant Knowledge — knowledgeBlock param, omitted if empty]
[Info gathering instructions — same fields, natural weaving — static]
[Tool definitions — complete_intake unchanged — static]
[Wrap-up urgency — appended only when nearLimit is true]
```

The chat API route calls the builder instead of reading a static string:

```ts
const visitorType = classifyVisitor(messages);
const knowledgeBlock = getRelevantKnowledge(messages, visitorType);
const systemPrompt = buildSystemPrompt({
  visitorType,
  knowledgeBlock,
  nearLimit: messages.length >= 25,
});
```

### 6. Rotating Suggestion Chips

Replace the current 4 static chips with a pool of ~16-20 organized by category. The component selects 4 at render time.

**Rotation strategy:** Time-of-day buckets + random selection within each bucket. Each render picks one chip from each of 4 categories to ensure variety.

**Chip pool by category:**

| Category | Examples |
|----------|----------|
| Project starters | "I've got a project idea", "I need something built fast", "I'm looking for a technical partner" |
| Curiosity | "What kind of projects do you take on?", "What's your tech stack?", "Walk me through how you work" |
| AI-specific | "I want to build an AI agent", "Can you add AI to my existing app?", "I have an automation idea" |
| Opinionated | "What would you never build?", "What tech is overhyped right now?", "Convince me to hire you" |

The "opinionated" category chips are personality teasers — they hint that this agent has real takes, differentiating it from a generic contact form bot.

**Implementation:** Chip pool lives in `src/lib/intake-system-prompt.ts` alongside the existing `INTAKE_GREETINGS` array (both are agent personality content, not knowledge base data). Exported as a categorized object. Client component selects 4 (one per category) using a seeded random based on date + time-of-day bucket (morning/afternoon/evening).

### 7. Chat API Route Changes

`src/app/api/chat/route.ts` changes:

1. **Import knowledge module** — `getRelevantKnowledge()` from `src/lib/knowledge/`
2. **Import classifier** — `classifyVisitor()` from `src/lib/knowledge/`
3. **Import prompt builder** — `buildSystemPrompt()` from `src/lib/intake-system-prompt.ts`
4. **Replace static prompt usage** — current `let systemPrompt = INTAKE_SYSTEM_PROMPT` + manual wrap-up append becomes a single `buildSystemPrompt()` call (see Section 5 for call site example)

The `complete_intake` tool, rate limiting, message validation, and streaming all remain unchanged.

### 8. File Changes Summary

| File | Change |
|------|--------|
| `src/lib/knowledge/index.ts` | **New** — knowledge types, matcher, injection builder, visitor classifier |
| `src/lib/knowledge/portfolio.ts` | **New** — portfolio entries (placeholder until extraction) |
| `src/lib/knowledge/opinions.ts` | **New** — tech opinion entries (placeholder until extraction) |
| `src/lib/knowledge/process.ts` | **New** — process/engagement entries (placeholder until extraction) |
| `src/lib/knowledge/capabilities.ts` | **New** — capabilities entries (placeholder until extraction) |
| `src/lib/knowledge/faq.ts` | **New** — FAQ entries (placeholder until extraction) |
| `src/lib/intake-system-prompt.ts` | **Modified** — personality rewrite, export builder function, expand chip pool |
| `src/app/api/chat/route.ts` | **Modified** — import knowledge, classify visitor, build dynamic prompt |
| `src/components/IntakeAgent.tsx` | **Modified** — rotating chip selection logic |

### 9. What Stays the Same

- `complete_intake` tool — same schema, same DB write, same email flow
- Rate limiting — same Upstash Redis setup
- UI/layout — chat container, message bubbles, animations, scroll behavior unchanged
- Streaming — same AI SDK `useChat` pattern
- Error handling — same graceful degradation
- Database schema — no changes

### 10. Knowledge Extraction (Separate Phase)

The knowledge base ships with 2-3 representative sample entries per file so the injection system is testable during development. These samples should cover different `techLevel` values and keyword patterns to exercise the matcher. Sample content can be based on what's already visible on the site (services section, proof section) — it doesn't need to be deeply accurate, just structurally correct.

A separate conversation session after implementation does a structured interview to replace samples with real content from Hershey:

1. Past projects (3-5 most interesting/representative)
2. Tech opinions (stack preferences, what you recommend and why)
3. Process documentation (how engagements work, pricing philosophy, timeline ranges)
4. Common prospect FAQs

Output gets structured into the TypeScript knowledge files. This is content authoring, not engineering — happens after the code is built.

## Out of Scope

- Vector store / embeddings pipeline — not needed at current knowledge base size
- UI redesign — the chat interface visual design is solid
- New tools — no additional LLM tools beyond existing `complete_intake`
- Analytics / conversation tracking beyond existing DB storage
- Multi-language support
