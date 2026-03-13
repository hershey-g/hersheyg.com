# Intake Agent — Persona & UX Refresh

**Date:** 2026-03-12
**Branch:** `feat/site-polish`

## Problem

The intake chat agent makes Hershey seem hard to reach. Three issues:

1. **Gatekeeper tone** — All 5 greetings frame the agent as a wall between the visitor and Hershey ("first line of defense," "the bouncer," "before you get Hershey, you get me"). This is off-putting.
2. **Blank input paralysis** — Visitors see a greeting and a blank text input. No guidance on what to say or how to start. High friction.
3. **Terminal-green chat colors** — Agent messages use `term-green-soft` which feels "hackery." Agent and user message bubbles lack visual distinction.

## Solution

Full persona refresh: rewrite greetings, add conversation starter chips, update colors, soften the system prompt tone.

## Changes

### 1. Rewrite Greetings (intake-system-prompt.ts)

Replace all 5 `INTAKE_GREETINGS` with 8 new variants. Warm, curious, no gatekeeper language. No em dashes.

New greetings:

1. "Hey! Tell me what you're working on. I'm curious."
2. "Hey, tell me what you're building. I love hearing about new projects."
3. "Hey there. Got something you're trying to build? I'm all ears."
4. "Hey! Whether you've got a detailed brief or just a rough idea, what's on your mind?"
5. "Hey. What brings you here? Working on something interesting?"
6. "Hey! I'm here to chat about your project. No forms, no hoops. What are you building?"
7. "Hey there, what are you thinking about building? Happy to dig into it."
8. "Hey! Tell me about your project. Even if it's just an idea, that's a great place to start."

### 2. Conversation Starter Chips (IntakeAgent.tsx)

Add clickable suggestion chips below the greeting message:

- "I want to build an AI agent"
- "I have a project idea"
- "Tell me about your work"
- "Just exploring"

**Behavior:**
- Render as a flex-wrap row of pill-shaped buttons below the greeting
- Aligned with message text, indented past the avatar (`ml-[38px]` — 28px avatar + 10px gap)
- Clicking a chip sends its text as the user's first message
- Chips disappear when `messages.length > 1` (greeting is the only message)
- Removal animated via Framer Motion AnimatePresence: `opacity: 0` + `height: 0` + `marginTop: 0` over ~200ms ease-out, with `overflow: hidden` wrapper
- Reduced motion: chips disappear instantly (no animation)
- Chips work in both desktop embed and mobile modal

**Responsive:**
- `flex-wrap: wrap` with 8px gap
- `white-space: nowrap` on each chip
- On narrow screens, chips stack into 2 rows naturally
- Chips live inside the scrollable chat body, never push the input off-screen

### 3. Color Update (IntakeAgent.tsx)

Move away from terminal green. Increase visual distinction between agent and user messages.

| Element | Current | New |
|---------|---------|-----|
| Agent text | `text-term-green-soft` | `text-text` (#CBD5E1) |
| Agent bubble bg | `bg-bg/60` | `bg-accent/40` |
| Agent bubble border | `border-term-green/15` | `border-accent/25` |
| User text | `text-accent-lit` | `text-white` |
| User bubble bg | `bg-accent-lit/10` | `bg-accent-lit/15` |
| User bubble border | `border-accent-lit/25` | `border-accent-lit/30` |
| Input field border | `border-term-green/20` (line 215) | `border-line` |
| Input focus border | `focus:border-accent-lit/50` | Keep as-is |
| Header bottom border | `border-b border-term-green/15` (line 267) | `border-b border-line` |
| Input area top border | `border-t border-term-green/15` (line 207) | `border-t border-line` |

Keep unchanged:
- Terminal dots (red/yellow/green) in header
- Orange "H" avatar badge
- Orange thinking indicator and streaming cursor
- `~/intake-agent` title on desktop, "Intake Agent" on mobile

### 4. System Prompt Tone (intake-system-prompt.ts)

Update tone directives in `INTAKE_SYSTEM_PROMPT`:

- "Witty, direct, slightly irreverent. You have opinions." becomes "Warm, direct, genuinely curious. You're enthusiastic about interesting problems."
- "You're not corporate. You're not a chatbot." becomes "You're friendly and technical. You feel like texting someone who gets it."
- "you're his agent, not him" becomes "You represent Hershey. Be the kind of first impression he'd want to make."
- Add rule: "Never use em dashes. Write like a human texting, not like AI."

Everything else in the system prompt stays unchanged: conversation strategy, guardrails, what-to-gather list, wrapping-up behavior.

## Files Modified

- `src/lib/intake-system-prompt.ts` — Greetings array + system prompt tone
- `src/components/IntakeAgent.tsx` — Starter chips component, color classes

## Verification

1. `npx tsc --noEmit` — Type check passes
2. `npm run dev` — Load site, scroll to intake section:
   - Greeting is warm, no gatekeeper language
   - Refresh page several times to confirm greeting rotates
   - Suggestion chips visible below greeting
   - Click a chip: sends as message, chips disappear smoothly
   - Send a typed message instead: chips disappear after send (still visible while typing)
   - Agent messages: neutral gray text, navy-tinted bubble
   - User messages: white text, blue-tinted bubble
   - Clear visual distinction between agent and user
3. Test mobile: resize browser to <768px, tap mobile prompt to open modal:
   - Chips render properly, wrap on narrow screens
   - No layout shift or glitch when chips disappear
   - Input stays visible, not pushed off-screen by chips
4. Test reduced motion: enable `prefers-reduced-motion` in devtools:
   - Chips disappear instantly, no animation
5. `npm test` — Existing Playwright e2e tests pass
