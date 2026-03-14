# IntakeAgent RAG + Personality Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the IntakeAgent with structured knowledge injection, code-level visitor classification, an opinionated personality, and rotating suggestion chips.

**Architecture:** Knowledge base as categorized TypeScript files in `src/lib/knowledge/`. A keyword matcher selects relevant entries per conversation turn. A visitor classifier determines technical vs non-technical mode. A prompt builder composes the system prompt dynamically. The IntakeAgent component picks 4 chips from a categorized pool using seeded rotation.

**Tech Stack:** TypeScript, Next.js App Router, Vitest (new, for unit testing pure functions), Playwright (existing e2e)

**Spec:** `docs/superpowers/specs/2026-03-14-intake-agent-rag-personality-design.md`

---

## Chunk 1: Knowledge Infrastructure

### Task 1: Add Vitest for Unit Testing

The knowledge module has pure functions (classifier, matcher) that need unit tests. No test runner exists for unit tests — only Playwright for e2e.

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest dev dependency + script)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test:unit script to package.json**

Add to `"scripts"` in `package.json`:

```json
"test:unit": "vitest run"
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

```bash
npx vitest run
```

Expected: exits cleanly with "no test files found" or similar.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

### Task 2: Knowledge Base Types and Sample Data

Create the knowledge base structure with the `KnowledgeEntry` type and sample entries across all 5 category files. Sample content is derived from what's already on the site (services, proof sections in `src/lib/constants.ts`).

**Files:**
- Create: `src/lib/knowledge/types.ts`
- Create: `src/lib/knowledge/portfolio.ts`
- Create: `src/lib/knowledge/opinions.ts`
- Create: `src/lib/knowledge/process.ts`
- Create: `src/lib/knowledge/capabilities.ts`
- Create: `src/lib/knowledge/faq.ts`

- [ ] **Step 1: Create the KnowledgeEntry type**

Create `src/lib/knowledge/types.ts`:

```ts
export interface KnowledgeEntry {
  id: string;
  category: "portfolio" | "opinions" | "process" | "capabilities" | "faq";
  keywords: string[];
  techLevel: "any" | "technical" | "non-technical";
  content: string;
}
```

- [ ] **Step 2: Create portfolio.ts with 2 sample entries**

Create `src/lib/knowledge/portfolio.ts`:

```ts
import type { KnowledgeEntry } from "./types";

export const PORTFOLIO_ENTRIES: KnowledgeEntry[] = [
  {
    id: "project-ticketing-platform",
    category: "portfolio",
    keywords: ["ticketing", "events", "stadium", "attendees", "transactions", "scale", "high-traffic"],
    techLevel: "any",
    content:
      "Hershey built a custom ticketing platform from scratch that processed 180,000+ attendees across venues including MetLife Stadium and Wells Fargo Center. About $9.2M in transaction volume. Zero downtime. He architected it for failure modes, not just the happy path.",
  },
  {
    id: "project-openclaw",
    category: "portfolio",
    keywords: ["open source", "voice", "telephony", "openclaw", "contributions", "PR"],
    techLevel: "technical",
    content:
      "Hershey contributes to OpenClaw, an open source voice/telephony project. When a client hits a wall with vendor tools, he reads the source, writes the fix, and pushes it upstream. Merged PRs in core voice infrastructure.",
  },
];
```

- [ ] **Step 3: Create opinions.ts with 2 sample entries**

Create `src/lib/knowledge/opinions.ts`:

```ts
import type { KnowledgeEntry } from "./types";

export const OPINIONS_ENTRIES: KnowledgeEntry[] = [
  {
    id: "opinion-nextjs",
    category: "opinions",
    keywords: ["next", "nextjs", "react", "framework", "frontend", "ssr", "server components"],
    techLevel: "technical",
    content:
      "Hershey's go-to for web apps is Next.js with the App Router. Server components mean less client-side JavaScript and better performance out of the box. He prefers it over standalone React SPAs because you get routing, SSR, and API routes without bolting on extra tooling.",
  },
  {
    id: "opinion-simple-stack",
    category: "opinions",
    keywords: ["stack", "technology", "tools", "simple", "postgres", "database"],
    techLevel: "any",
    content:
      "Hershey keeps his stack simple on purpose. TypeScript, Next.js, Postgres, Vercel. He'd rather master fewer tools than juggle a dozen. Simpler stacks mean fewer things that can break at 3am.",
  },
];
```

- [ ] **Step 4: Create process.ts with 2 sample entries**

Create `src/lib/knowledge/process.ts`:

```ts
import type { KnowledgeEntry } from "./types";

export const PROCESS_ENTRIES: KnowledgeEntry[] = [
  {
    id: "process-engagement",
    category: "process",
    keywords: ["work", "process", "engagement", "retainer", "project", "hire", "pricing", "cost"],
    techLevel: "any",
    content:
      "Hershey takes on 2-3 projects at a time. Engagements are either monthly retainer or project-based, depending on what makes sense. He works remote-first, solo, and production-focused. No big team overhead, no account managers in between.",
  },
  {
    id: "process-timeline",
    category: "process",
    keywords: ["timeline", "how long", "deadline", "delivery", "speed", "fast", "quick"],
    techLevel: "any",
    content:
      "Timelines depend on scope, but Hershey is a single engineer who moves fast without the overhead of a team. He'll scope it properly on a call rather than guess over chat. That said, he's built production systems in weeks, not months.",
  },
];
```

- [ ] **Step 5: Create capabilities.ts with 3 sample entries**

Create `src/lib/knowledge/capabilities.ts`:

```ts
import type { KnowledgeEntry } from "./types";

export const CAPABILITIES_ENTRIES: KnowledgeEntry[] = [
  {
    id: "capability-ai-agents",
    category: "capabilities",
    keywords: ["agent", "ai", "chatbot", "whatsapp", "slack", "telegram", "voice", "bot", "automation"],
    techLevel: "any",
    content:
      "Hershey builds AI agents that work on WhatsApp, Slack, Telegram, and voice. These aren't chatbot demos. They book appointments, answer customer questions, close orders, and handle real edge cases in production.",
  },
  {
    id: "capability-ai-systems",
    category: "capabilities",
    keywords: ["llm", "rag", "orchestration", "autonomous", "workflow", "pipeline", "data"],
    techLevel: "technical",
    content:
      "On the AI systems side, Hershey builds LLM orchestration pipelines, RAG systems, and autonomous workflows. Systems that read data, make decisions, and take action, with human-in-the-loop when the stakes are high. Not chatbot wrappers.",
  },
  {
    id: "capability-fullstack",
    category: "capabilities",
    keywords: ["website", "web app", "app", "full-stack", "fullstack", "product", "build", "platform", "saas"],
    techLevel: "non-technical",
    content:
      "Hershey builds complete web applications and platforms from the ground up. One engineer handling everything from the database to the user interface to deployment. He's built products that handle thousands of users and millions in transactions.",
  },
];
```

- [ ] **Step 6: Create faq.ts with 2 sample entries**

Create `src/lib/knowledge/faq.ts`:

```ts
import type { KnowledgeEntry } from "./types";

export const FAQ_ENTRIES: KnowledgeEntry[] = [
  {
    id: "faq-why-solo",
    category: "faq",
    keywords: ["team", "solo", "alone", "one person", "agency", "why"],
    techLevel: "any",
    content:
      "Hershey works solo by choice. One engineer means one person who understands every layer of the system, from database to deploy. No hand-offs, no lost context, no meetings about meetings. It's not a limitation, it's a feature.",
  },
  {
    id: "faq-availability",
    category: "faq",
    keywords: ["available", "availability", "start", "when", "capacity", "open", "free"],
    techLevel: "any",
    content:
      "Hershey takes on a limited number of projects at a time to give each one proper attention. Best to have a conversation about timing. He'll be straight with you about availability.",
  },
];
```

- [ ] **Step 7: Run type-check**

```bash
npx tsc --noEmit
```

Expected: PASS (no errors)

- [ ] **Step 8: Commit**

```bash
git add src/lib/knowledge/
git commit -m "feat: add knowledge base types and sample entries"
```

---

### Task 3: Visitor Classifier (TDD)

Build `classifyVisitor` — scans user messages for technical signal words, returns `"technical"` if 3+ signals detected, otherwise `"non-technical"`.

**Files:**
- Create: `src/lib/knowledge/classifier.ts`
- Create: `src/lib/knowledge/__tests__/classifier.test.ts`

- [ ] **Step 1: Write failing tests for the classifier**

Create `src/lib/knowledge/__tests__/classifier.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { classifyVisitor } from "../classifier";

describe("classifyVisitor", () => {
  it("returns non-technical for empty messages", () => {
    expect(classifyVisitor([])).toBe("non-technical");
  });

  it("returns non-technical for generic business language", () => {
    const messages = [
      { role: "user", content: "I need an app for my restaurant" },
      { role: "user", content: "Something that lets customers order online" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });

  it("returns technical when 3+ technical terms are used", () => {
    const messages = [
      { role: "user", content: "I need a Next.js app with a GraphQL API and Docker deployment" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("ignores assistant messages", () => {
    const messages = [
      { role: "assistant", content: "We use React and Next.js with GraphQL and Docker" },
      { role: "user", content: "Sounds good, I need a website" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });

  it("accumulates signals across multiple user messages", () => {
    const messages = [
      { role: "user", content: "I'm using React right now" },
      { role: "user", content: "We need a REST API" },
      { role: "user", content: "Deploying on Kubernetes" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("is case-insensitive", () => {
    const messages = [
      { role: "user", content: "We use REACT with GRAPHQL and need CI/CD" },
    ];
    expect(classifyVisitor(messages)).toBe("technical");
  });

  it("returns non-technical for borderline cases (fewer than 3 signals)", () => {
    const messages = [
      { role: "user", content: "I have a React app" },
    ];
    expect(classifyVisitor(messages)).toBe("non-technical");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/knowledge/__tests__/classifier.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement the classifier**

Create `src/lib/knowledge/classifier.ts`:

```ts
const TECHNICAL_SIGNALS: string[] = [
  // Frameworks & libraries
  "react", "next\\.js", "nextjs", "vue", "angular", "svelte", "django",
  "flask", "rails", "laravel", "express", "fastapi", "spring",
  // Infrastructure
  "api", "graphql", "rest", "grpc", "microservices", "docker",
  "kubernetes", "k8s", "aws", "gcp", "azure", "vercel", "ci/cd",
  "terraform", "nginx",
  // Programming terms
  "endpoint", "middleware", "schema", "migration", "deploy", "webhook",
  "cron", "database", "postgres", "mongodb", "redis", "sql",
  "typescript", "python", "node", "backend", "frontend",
  "repository", "git", "branch", "pipeline", "serverless",
  "websocket", "oauth", "jwt", "sdk", "orm",
];

// Build a single regex that matches any signal as a whole word (case-insensitive)
const SIGNAL_PATTERN = new RegExp(
  `\\b(?:${TECHNICAL_SIGNALS.join("|")})\\b`,
  "gi"
);

const TECHNICAL_THRESHOLD = 3;

export function classifyVisitor(
  messages: { role: string; content: string }[]
): "technical" | "non-technical" {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const matches = userText.match(SIGNAL_PATTERN);
  // Count unique signals (case-insensitive)
  const uniqueSignals = new Set(
    (matches ?? []).map((m) => m.toLowerCase())
  );

  return uniqueSignals.size >= TECHNICAL_THRESHOLD
    ? "technical"
    : "non-technical";
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/knowledge/__tests__/classifier.test.ts
```

Expected: all 7 tests PASS

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/knowledge/classifier.ts src/lib/knowledge/__tests__/
git commit -m "feat: add visitor classifier with tests"
```

---

### Task 4: Knowledge Matcher (TDD)

Build `getRelevantKnowledge` — scans recent messages for keyword hits against all knowledge entries, filters by techLevel, returns top 4 as a formatted string.

**Files:**
- Create: `src/lib/knowledge/matcher.ts`
- Create: `src/lib/knowledge/__tests__/matcher.test.ts`
- Create: `src/lib/knowledge/index.ts` (re-exports)

- [ ] **Step 1: Write failing tests for the matcher**

Create `src/lib/knowledge/__tests__/matcher.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getRelevantKnowledge, scoreEntry } from "../matcher";
import type { KnowledgeEntry } from "../types";

const TEST_ENTRIES: KnowledgeEntry[] = [
  {
    id: "test-ai",
    category: "capabilities",
    keywords: ["ai", "agent", "chatbot"],
    techLevel: "any",
    content: "We build AI agents.",
  },
  {
    id: "test-react",
    category: "opinions",
    keywords: ["react", "nextjs", "frontend"],
    techLevel: "technical",
    content: "We prefer Next.js for frontend.",
  },
  {
    id: "test-app",
    category: "capabilities",
    keywords: ["app", "website", "platform"],
    techLevel: "non-technical",
    content: "We build web apps and platforms.",
  },
  {
    id: "test-pricing",
    category: "process",
    keywords: ["pricing", "cost", "retainer"],
    techLevel: "any",
    content: "Engagements are retainer or project-based.",
  },
];

describe("scoreEntry", () => {
  it("scores by unique keyword hits", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I want an AI agent chatbot");
    expect(score).toBe(3); // ai, agent, chatbot
  });

  it("returns 0 for no matches", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I need a website");
    expect(score).toBe(0);
  });

  it("is case-insensitive", () => {
    const score = scoreEntry(TEST_ENTRIES[0], "I want an AI AGENT");
    expect(score).toBe(2);
  });

  it("matches whole words only", () => {
    const score = scoreEntry(TEST_ENTRIES[3], "I need repricing analysis");
    expect(score).toBe(0); // "repricing" should NOT match "pricing"
  });
});

describe("getRelevantKnowledge", () => {
  it("returns empty string when no messages match", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "hello" }],
      "non-technical",
      TEST_ENTRIES
    );
    expect(result).toBe("");
  });

  it("returns matching entries formatted as text", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I want to build an AI agent" }],
      "non-technical",
      TEST_ENTRIES
    );
    expect(result).toContain("We build AI agents.");
    // Should NOT include technical-only entry
    expect(result).not.toContain("We prefer Next.js");
  });

  it("includes technical entries for technical visitors", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I need a React frontend with nextjs" }],
      "technical",
      TEST_ENTRIES
    );
    expect(result).toContain("We prefer Next.js");
  });

  it("filters out non-technical entries for technical visitors", () => {
    const result = getRelevantKnowledge(
      [{ role: "user", content: "I need a website app platform" }],
      "technical",
      TEST_ENTRIES
    );
    // non-technical entry should be excluded for technical visitors
    expect(result).not.toContain("We build web apps and platforms.");
  });

  it("caps at 4 entries", () => {
    // Create 6 entries that all match
    const manyEntries: KnowledgeEntry[] = Array.from({ length: 6 }, (_, i) => ({
      id: `test-${i}`,
      category: "faq" as const,
      keywords: ["test"],
      techLevel: "any" as const,
      content: `Entry ${i} content.`,
    }));
    const result = getRelevantKnowledge(
      [{ role: "user", content: "test" }],
      "non-technical",
      manyEntries
    );
    const entryCount = (result.match(/Entry \d content\./g) ?? []).length;
    expect(entryCount).toBeLessThanOrEqual(4);
  });

  it("uses last 3 messages for context", () => {
    const messages = [
      { role: "user", content: "some old message about unrelated things" },
      { role: "user", content: "another old message" },
      { role: "user", content: "more old stuff" },
      { role: "assistant", content: "assistant reply" },
      { role: "user", content: "I want an AI agent" },
    ];
    const result = getRelevantKnowledge(messages, "non-technical", TEST_ENTRIES);
    expect(result).toContain("We build AI agents.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/knowledge/__tests__/matcher.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement the matcher**

Create `src/lib/knowledge/matcher.ts`:

```ts
import type { KnowledgeEntry } from "./types";

const MAX_RESULTS = 4;
const CONTEXT_MESSAGES = 3; // last N messages to scan (per spec)

/**
 * Score a knowledge entry against a text string.
 * Returns the count of unique keyword matches (case-insensitive, whole-word).
 */
export function scoreEntry(entry: KnowledgeEntry, text: string): number {
  const lowerText = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const keyword of entry.keywords) {
    const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lowerText)) {
      hits++;
    }
  }
  return hits;
}

/**
 * Get relevant knowledge entries for the current conversation.
 * Scans the last few messages, matches against knowledge entries,
 * filters by techLevel, and returns the top entries as a formatted string.
 */
export function getRelevantKnowledge(
  messages: { role: string; content: string }[],
  visitorType: "technical" | "non-technical",
  entries: KnowledgeEntry[]
): string {
  // Take last N messages for context
  const recentMessages = messages.slice(-CONTEXT_MESSAGES);
  const contextText = recentMessages.map((m) => m.content).join(" ");

  // Filter by techLevel
  const eligible = entries.filter((e) => {
    if (e.techLevel === "any") return true;
    return e.techLevel === visitorType;
  });

  // Score and sort
  const scored = eligible
    .map((entry) => ({ entry, score: scoreEntry(entry, contextText) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  if (scored.length === 0) return "";

  return scored.map(({ entry }) => `- ${entry.content}`).join("\n\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/knowledge/__tests__/matcher.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Create the index.ts barrel export**

Create `src/lib/knowledge/index.ts`:

```ts
export type { KnowledgeEntry } from "./types";
export { classifyVisitor } from "./classifier";
export { getRelevantKnowledge } from "./matcher";

import { PORTFOLIO_ENTRIES } from "./portfolio";
import { OPINIONS_ENTRIES } from "./opinions";
import { PROCESS_ENTRIES } from "./process";
import { CAPABILITIES_ENTRIES } from "./capabilities";
import { FAQ_ENTRIES } from "./faq";
import type { KnowledgeEntry } from "./types";

export const ALL_KNOWLEDGE: KnowledgeEntry[] = [
  ...PORTFOLIO_ENTRIES,
  ...OPINIONS_ENTRIES,
  ...PROCESS_ENTRIES,
  ...CAPABILITIES_ENTRIES,
  ...FAQ_ENTRIES,
];
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 7: Run all unit tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/knowledge/
git commit -m "feat: add knowledge matcher with tests and barrel export"
```

---

## Chunk 2: System Prompt, Integration, and Chips

### Task 5: System Prompt Rewrite + Chat API Route Integration

Rewrite `src/lib/intake-system-prompt.ts` with the new personality, `buildSystemPrompt` function, and chip pool. Then update the chat API route to use the classifier, knowledge matcher, and prompt builder. These are committed together to avoid a broken intermediate state.

**Files:**
- Modify: `src/lib/intake-system-prompt.ts`
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Rewrite intake-system-prompt.ts**

Replace the entire content of `src/lib/intake-system-prompt.ts` with:

```ts
// System prompt builder, greetings, and chip pool for the intake agent

export const INTAKE_GREETINGS: string[] = [
  "Hey! Tell me what you're working on. I'm curious.",
  "Hey, tell me what you're building. I love hearing about new projects.",
  "Hey there. Got something you're trying to build? I'm all ears.",
  "Hey! Whether you've got a detailed brief or just a rough idea, what's on your mind?",
  "Hey. What brings you here? Working on something interesting?",
  "Hey! I'm here to chat about your project. No forms, no hoops. What are you building?",
  "Hey there, what are you thinking about building? Happy to dig into it.",
  "Hey! Tell me about your project. Even if it's just an idea, that's a great place to start.",
];

export const INTAKE_CHIP_POOL = {
  starters: [
    "I've got a project idea",
    "I need something built fast",
    "I'm looking for a technical partner",
    "I need help with an existing product",
  ],
  curiosity: [
    "What kind of projects do you take on?",
    "What's your tech stack?",
    "Walk me through how you work",
    "What makes you different from an agency?",
  ],
  ai: [
    "I want to build an AI agent",
    "Can you add AI to my existing app?",
    "I have an automation idea",
    "I need a chatbot that actually works",
  ],
  opinionated: [
    "What would you never build?",
    "What tech is overhyped right now?",
    "Convince me to hire you",
    "What's the biggest mistake clients make?",
  ],
} as const;

const BASE_PERSONALITY = `You are the intake agent on hersheyg.com, the personal portfolio of Hershey Goldberger, an AI engineer. Your job is to have a natural conversation with someone interested in working with Hershey, understand what they need, and gather enough information to hand off a useful brief.

## Tone & Style
- Warm, direct, and opinionated. You've seen a lot of projects and you're not shy about sharing what works and what doesn't.
- You're friendly and confident. You feel like texting a senior engineer friend who gives you real advice, not polite deflections.
- Refer to "Hershey" in third person. You represent Hershey. Be the kind of first impression he'd want to make.
- Keep things moving without being pushy. Ask good follow-up questions.
- Match the visitor's energy. If they're brief, be brief. If they want to go deep, go deep.
- Use short paragraphs. No bullet-point walls. Keep responses to 2-4 sentences typically.
- Never use markdown formatting (no **, no #, no bullet lists). Write plain text like a human in a chat.
- Never use em dashes. Write like a human texting, not like AI.

## Personality Rules
1. Have opinions and give them gently. Push back on ideas when there's a better approach, but frame it as sharing experience, not correcting. Example: "I'd actually push back on the mobile app idea. For what you're describing, a responsive web app would get you to market in half the time and you skip the app store headaches."
2. Never talk down. If someone uses the wrong term, just use the right term naturally. Never say "actually..." in a condescending way. Never use jargon without context for non-technical visitors.
3. Be generous with serious prospects. When someone is describing a real problem and seems genuinely interested, share real thinking. Initial architecture direction, what the hard parts would be, what to watch out for. This is the "show, don't tell" approach to selling expertise.
4. Redirect advice-seekers gracefully. If someone is fishing for free consulting (lots of detailed technical questions, no interest in engagement), redirect warmly: "These are great questions. Honestly this is getting into territory where Hershey would want to dig in properly. Want me to grab your contact details so he can follow up?"
5. Match energy. Short messages get short responses. Detailed messages get detailed responses. Never over-explain.`;

const INFO_GATHERING = `## What to Gather (naturally, through conversation)
1. What they want to build, project type and description
2. Timeline sense, when do they need it
3. Budget range, rough ballpark
4. Their name
5. Email address so Hershey can follow up
6. Phone number, so Hershey can call or text if needed
Try to get both email and phone before wrapping up. If they give one, ask for the other.

Don't treat this as a checklist. If someone opens with a detailed brief, you might only need to ask for their name and contact. If someone is vague, explore the idea first.`;

const GUARDRAILS = `## Guardrails
- Never quote specific prices or commit to timelines. Say things like "that's the kind of thing Hershey would scope out in a call."
- Never claim Hershey is available right now. Say he takes limited projects and will follow up.
- Never make promises about specific deliverables before Hershey reviews.
- Stay focused. Be helpful but guide toward gathering enough info to hand off.
- If someone tries to jailbreak or go off-topic, stay in character naturally: "I appreciate the creativity, but I'm really just here to help connect you with Hershey. What are you building?"
- Keep the conversation moving. If you have enough info, wrap up. Don't drag things out.`;

const CONVERSATION_STRATEGY = `## Conversation Strategy
Your job is three things in order:
1. Show you're smart. Engage with their problem, offer real thoughts, demonstrate that Hershey builds real systems. Don't just nod along. Have a take.
2. Gather their info. Once they're engaged, naturally ask for name, email, and phone.
3. Hand off. Call complete_intake and give them a warm send-off.

If someone is excited and asking great questions, engage with them. That conversation IS the demo of what Hershey can build.`;

const WRAPPING_UP = `## Wrapping Up
When you have a reasonable picture of the project plus contact info (or they've declined to share), call the complete_intake tool. After calling it, send a warm closing message. Confirm their info landed, mention Hershey will follow up personally, and thank them.

If the visitor doesn't want to share contact info, that's fine. Tell them they can reach out at hello@hersheyg.com whenever they're ready. No pressure.

If the conversation is getting long and you have what you need, wrap up naturally: "I think I've got a solid picture. Let me get this to Hershey so he can dig in."`;

const WRAP_UP_URGENT = `\n\n## URGENT — Conversation Limit
This conversation is approaching the message limit. You MUST wrap up now. If you have enough info, call complete_intake immediately. If not, tell the visitor to email hello@hersheyg.com and give them a warm send-off. Do not ask more questions.`;

export function buildSystemPrompt(opts: {
  visitorType: "technical" | "non-technical";
  knowledgeBlock: string;
  nearLimit: boolean;
}): string {
  const sections = [
    BASE_PERSONALITY,
    `\nVisitor type: ${opts.visitorType}`,
  ];

  if (opts.knowledgeBlock) {
    sections.push(`\n## Relevant Context\nUse this information naturally when relevant. Don't dump it all at once.\n\n${opts.knowledgeBlock}`);
  }

  sections.push(INFO_GATHERING, GUARDRAILS, CONVERSATION_STRATEGY, WRAPPING_UP);

  if (opts.nearLimit) {
    sections.push(WRAP_UP_URGENT);
  }

  return sections.join("\n\n");
}
```

- [ ] **Step 2: Update imports in route.ts (must happen together with prompt rewrite)**

In `src/app/api/chat/route.ts`, replace the import line:

```ts
// OLD:
import { INTAKE_SYSTEM_PROMPT } from "@/lib/intake-system-prompt";

// NEW:
import { buildSystemPrompt } from "@/lib/intake-system-prompt";
import { classifyVisitor, getRelevantKnowledge, ALL_KNOWLEDGE } from "@/lib/knowledge";
```

- [ ] **Step 3: Add a helper to extract text from UIMessages**

Add this function after the existing `getClientIp` function in `route.ts`:

```ts
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
```

- [ ] **Step 4: Replace static prompt with dynamic builder**

In `route.ts`, replace the block that builds the system prompt (the `let systemPrompt = INTAKE_SYSTEM_PROMPT` section and the `if (messages.length >= 25)` block):

```ts
// OLD:
  let systemPrompt = INTAKE_SYSTEM_PROMPT;
  if (messages.length >= 25) {
    systemPrompt += `\n\n## URGENT — Conversation Limit
This conversation is approaching the message limit. You MUST wrap up now. If you have enough info, call complete_intake immediately. If not, tell the visitor to email hello@hersheyg.com and give them a warm send-off. Do not ask more questions.`;
  }

// NEW:
  const textMessages = extractTextMessages(messages);
  const visitorType = classifyVisitor(textMessages);
  const knowledgeBlock = getRelevantKnowledge(textMessages, visitorType, ALL_KNOWLEDGE);
  const systemPrompt = buildSystemPrompt({
    visitorType,
    knowledgeBlock,
    nearLimit: messages.length >= 25,
  });
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 6: Run all unit tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 7: Commit prompt rewrite + route integration together**

```bash
git add src/lib/intake-system-prompt.ts src/app/api/chat/route.ts
git commit -m "feat: rewrite system prompt with personality overhaul and integrate knowledge injection"
```

---

### Task 6: Rotating Suggestion Chips in IntakeAgent

Update the IntakeAgent component to use the categorized chip pool with seeded rotation instead of static chips.

**Files:**
- Modify: `src/components/IntakeAgent.tsx`

- [ ] **Step 1: Update imports**

In `IntakeAgent.tsx`, add the `INTAKE_CHIP_POOL` import:

```ts
// OLD:
import { INTAKE_GREETINGS } from "@/lib/intake-system-prompt";

// NEW:
import { INTAKE_GREETINGS, INTAKE_CHIP_POOL } from "@/lib/intake-system-prompt";
```

- [ ] **Step 2: Replace the static SUGGESTION_CHIPS with a selection function**

Replace the `SUGGESTION_CHIPS` constant (line 111-116) with:

```ts
function selectChips(): string[] {
  const now = new Date();
  const day = now.getUTCDate();
  const hour = now.getUTCHours();
  // 3 time-of-day buckets: morning (0-7), afternoon (8-15), evening (16-23)
  const bucket = Math.floor(hour / 8);
  const seed = day * 3 + bucket;

  // Seeded pick: use seed to select one chip from each category
  const categories = Object.values(INTAKE_CHIP_POOL);
  return categories.map((chips, i) => {
    const index = (seed + i * 7) % chips.length;
    return chips[index];
  });
}
```

- [ ] **Step 3: Use the selection function in SuggestionChips**

Update the `SuggestionChips` component to accept and render dynamic chips:

```ts
function SuggestionChips({
  onSelect,
  visible,
  chips,
}: {
  onSelect: (text: string) => void;
  visible: boolean;
  chips: string[];
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, height: "auto", marginTop: 0 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, height: 0, marginTop: 0 }
          }
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          className="overflow-hidden mt-3"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelect(chip)}
                className="border border-line rounded-md sm:rounded-lg px-3 py-3 sm:px-4 sm:py-3.5 text-left font-mono text-xs sm:text-[13px] text-text bg-transparent hover:border-accent-lit/30 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Add chip state to the main component and pass it down**

In the `IntakeAgent` component function, add a `useMemo` for chips and update the `SuggestionChips` usage:

```ts
// Add inside IntakeAgent(), after the greeting useState:
const chips = useMemo(() => selectChips(), []);
```

Update the `SuggestionChips` JSX to pass the chips:

```tsx
// OLD:
<SuggestionChips
  onSelect={handleChipSelect}
  visible={messages.length === 1 && messages[0]?.role === "assistant"}
/>

// NEW:
<SuggestionChips
  onSelect={handleChipSelect}
  visible={messages.length === 1 && messages[0]?.role === "assistant"}
  chips={chips}
/>
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/IntakeAgent.tsx
git commit -m "feat: rotating suggestion chips from categorized pool"
```

---

### Task 7: Update Playwright E2E Tests

The existing e2e test "Suggestion chips render in grid" checks for specific chip text that is now dynamic. Update it to verify 4 chips render without checking exact text. Also add a test for chip rotation.

**Files:**
- Modify: `e2e/intake-form.spec.ts`

- [ ] **Step 1: Update the chip rendering test**

Replace test #2 ("Suggestion chips render in grid") in `e2e/intake-form.spec.ts`:

```ts
// OLD:
test("Suggestion chips render in grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  // All 4 chips should be visible
  await expect(page.getByRole("button", { name: "I want to build an AI agent" })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("button", { name: "I have a project idea" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tell me about your work" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Just exploring" })).toBeVisible();

  // Chips container should use grid layout
  const chipsGrid = page.locator(".grid.grid-cols-2");
  await expect(chipsGrid).toBeVisible();
});

// NEW:
test("Suggestion chips render 4 in a 2x2 grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(60_000);

  await mockChatAPI(page);
  await page.goto("/");

  await scrollToContact(page);

  // Chips container should use grid layout with exactly 4 buttons
  const chipsGrid = page.locator(".grid.grid-cols-2");
  await expect(chipsGrid).toBeVisible({ timeout: 5000 });
  const chipButtons = chipsGrid.locator("button");
  await expect(chipButtons).toHaveCount(4);

  // Each chip should have non-empty text
  for (let i = 0; i < 4; i++) {
    const text = await chipButtons.nth(i).innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  }
});
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/intake-form.spec.ts
git commit -m "test: update chip e2e test for dynamic rotation"
```

---

### Task 8: Final Verification

Run all checks to verify everything works together.

- [ ] **Step 1: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 2: Run unit tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: PASS (build completes without errors)

- [ ] **Step 4: Verify no regressions with e2e tests**

```bash
npm test
```

Expected: all Playwright tests PASS (requires dev server running or `reuseExistingServer`)

Note: The e2e tests mock the chat API, so they don't test the actual LLM behavior. The personality changes and knowledge injection need manual testing by chatting with the live agent.

- [ ] **Step 5: Final commit if any fixes were needed**

If any fixes were made during verification, commit them.
