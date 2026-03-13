# Intake Agent Persona & UX Refresh — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace gatekeeper tone with warm greetings, add conversation starter chips, update chat colors for better visual distinction, and ensure the agent collects both email and phone.

**Architecture:** Three files modified. Greetings + system prompt tone in `intake-system-prompt.ts`. Suggestion chips component + color class updates in `IntakeAgent.tsx`. Phone field added to `complete_intake` tool schema in `api/chat/route.ts`. No new dependencies.

**Tech Stack:** React 19, Framer Motion (AnimatePresence), Tailwind CSS v4 tokens

**Spec:** `docs/superpowers/specs/2026-03-12-intake-agent-refresh-design.md`

---

## Chunk 1: Greetings & System Prompt Tone

### Task 1: Replace greetings and update system prompt

**Files:**
- Modify: `src/lib/intake-system-prompt.ts`

- [ ] **Step 1: Replace INTAKE_GREETINGS array (lines 5-11)**

Replace the contents of the array. Keep the export and type annotation.

```ts
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
```

- [ ] **Step 2: Update tone lines in INTAKE_SYSTEM_PROMPT**

Line 13 — replace em dash:
```
Old: `You are the intake agent on hersheyg.com — the personal portfolio`
New: `You are the intake agent on hersheyg.com, the personal portfolio`
```

Line 16 — replace tone directive:
```
Old: `- Witty, direct, slightly irreverent. You're not corporate. You're not a chatbot. You have opinions.`
New: `- Warm, direct, genuinely curious. You're enthusiastic about interesting problems.`
     `- You're friendly and technical. You feel like texting someone who gets it.`
```

Line 17 — replace identity line (remove em dash):
```
Old: `- Refer to "Hershey" in third person — you're his agent, not him.`
New: `- Refer to "Hershey" in third person. You represent Hershey. Be the kind of first impression he'd want to make.`
```

After line 22 — add new rule:
```
- Never use em dashes. Write like a human texting, not like AI.
```

- [ ] **Step 3: Remove remaining em dashes from system prompt**

Line 32: `build — project type` → `build, project type`
Line 33: `sense — when` → `sense, when`
Line 34: `range — rough` → `range, rough`
Line 35: `info — email or phone` → update to collect both (see Step 3b below)
Line 44: `Hershey — I can` → `Hershey. I can`
Line 56: `them — that conversation` → `them. That conversation`
Line 56: `into — let me` → `into. Let me`
Line 63: `picture — let me` → `picture. Let me`

- [ ] **Step 3b: Update "What to Gather" section to require both email AND phone**

Line 35 currently reads:
```
5. Contact info — email or phone so Hershey can follow up
```

Replace with:
```
5. Email address so Hershey can follow up
6. Phone number, so Hershey can call or text if needed
```

This changes "email or phone" (one is enough) to collecting both explicitly as separate items.

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/intake-system-prompt.ts
git commit -m "feat: warm up intake greetings and system prompt tone"
```

---

## Chunk 1b: Add phone field to complete_intake tool

### Task 1b: Update tool schema and email template

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Add `phone` field to complete_intake zod schema (line 98)**

After the existing `contact` field, add:
```ts
phone: z.string().optional().describe("Phone number if provided"),
```

- [ ] **Step 2: Update notification email template (line 128 area)**

Add phone to the email body, after the contact line:
```
`Phone: ${args.phone ?? "—"}`,
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add phone field to intake tool schema"
```

---

## Chunk 2: Color Updates

### Task 2: Update chat color classes

**Files:**
- Modify: `src/components/IntakeAgent.tsx`

All changes are class string replacements — no structural changes.

- [ ] **Step 1: Agent bubble (line 149)**

```
Old: bg-bg/60 border border-term-green/15
New: bg-accent/40 border border-accent/25
```

- [ ] **Step 2: Agent text (line 155)**

```
Old: text-term-green-soft
New: text-text
```

- [ ] **Step 3: User bubble (line 174)**

```
Old: bg-accent-lit/10 border border-accent-lit/25
New: bg-accent-lit/15 border border-accent-lit/30
```

- [ ] **Step 4: User text (line 175)**

```
Old: text-accent-lit
New: text-white
```

- [ ] **Step 5: Input area top border (line 207)**

```
Old: border-t border-term-green/15
New: border-t border-line
```

- [ ] **Step 6: Input field border (line 215)**

```
Old: border border-term-green/20
New: border border-line
```

- [ ] **Step 7: Header bottom border (line 267)**

```
Old: border-b border-term-green/15
New: border-b border-line
```

- [ ] **Step 8: Mobile prompt button border (line 623)**

```
Old: border border-term-green/20
New: border border-line
```

- [ ] **Step 9: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/components/IntakeAgent.tsx
git commit -m "feat: update intake chat colors for better visual distinction"
```

---

## Chunk 3: Suggestion Chips

### Task 3: Add SuggestionChips component and wire it up

**Files:**
- Modify: `src/components/IntakeAgent.tsx`

- [ ] **Step 1: Add SuggestionChips sub-component (after UserMessage, ~line 184)**

Insert before the `ChatInput` component definition:

```tsx
const SUGGESTION_CHIPS = [
  "I want to build an AI agent",
  "I have a project idea",
  "Tell me about your work",
  "Just exploring",
] as const;

function SuggestionChips({
  onSelect,
  visible,
}: {
  onSelect: (text: string) => void;
  visible: boolean;
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
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden ml-[38px] mb-4"
        >
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelect(chip)}
                className="font-mono text-[12px] px-3 py-1.5 rounded-full border border-accent/30 bg-accent/15 text-dim hover:text-text hover:bg-accent/25 hover:border-accent/40 transition-colors whitespace-nowrap"
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

- [ ] **Step 2: Add `onChipSelect` prop to IntakeChatContent (line 235)**

Add to the destructured props:
```ts
onChipSelect,
```

Add to the type:
```ts
onChipSelect?: (text: string) => void;
```

- [ ] **Step 3: Render SuggestionChips in chat body (after line 339, before typing dots)**

Insert after the `messages.map()` closing `})}`:

```tsx
{/* Suggestion chips — shown only when greeting is the sole message */}
<SuggestionChips
  onSelect={(text) => onChipSelect?.(text)}
  visible={messages.length === 1 && messages[0]?.role === "assistant"}
/>
```

- [ ] **Step 4: Add `onChipSelect` prop to IntakeModal (line 387)**

Add to the destructured props:
```ts
onChipSelect,
```

Add to the type (after line 408):
```ts
onChipSelect: (text: string) => void;
```

Pass through to IntakeChatContent inside IntakeModal (line 456):
```tsx
onChipSelect={onChipSelect}
```

- [ ] **Step 5: Create handleChipSelect in main IntakeAgent component (after handleSendMessage, ~line 568)**

```tsx
const handleChipSelect = useCallback(
  (text: string) => {
    if (status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    userScrolledUpRef.current = false;
  },
  [status, sendMessage]
);
```

- [ ] **Step 6: Pass onChipSelect to desktop IntakeChatContent (line 607)**

Add prop:
```tsx
onChipSelect={handleChipSelect}
```

- [ ] **Step 7: Pass onChipSelect to IntakeModal (line 663)**

Add prop:
```tsx
onChipSelect={handleChipSelect}
```

- [ ] **Step 8: Type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/IntakeAgent.tsx
git commit -m "feat: add conversation starter chips to intake agent"
```

---

## Chunk 4: Verification

### Task 4: Run tests and verify

- [ ] **Step 1: Run Playwright e2e tests**

Run: `npm test`
Expected: All 6 tests pass (5 intake + 1 hero rotation). Key test: "No horizontal overflow on mobile" must pass to confirm chips don't break layout.

- [ ] **Step 2: Type check one final time**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Push to main**

```bash
git push origin main
```
