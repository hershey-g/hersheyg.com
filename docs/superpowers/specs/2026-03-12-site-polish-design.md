# Site Polish — Spacing & Visual Hierarchy

**Date:** 2026-03-12
**Branch:** `feat/site-polish`
**Scope:** Hero improvements + full-page spacing & visual hierarchy pass

## Problem

The landing page feels crowded, especially the hero. Too many text elements compete for attention without enough breathing room. Sections below the fold blend together visually — same background, generous padding creates blank voids, and RevealOnScroll hides content too long.

## Goals

1. Make the hero feel spacious and dynamic with rotating content
2. Establish clear visual rhythm between sections
3. Improve scan-ability so visitors can quickly grasp the page structure
4. Tighten scroll gaps so content doesn't hide behind blank space

---

## Changes

### 1. Hero — Breathing Room & Rotating Text

**File:** `src/components/Hero.tsx`

**Spacing increases:**
- Eyebrow → headline: `mb-5 sm:mb-6` → `mb-8 sm:mb-10`
- Headline → sub-copy: `mt-4 sm:mt-5` → `mt-6 sm:mt-8`
- Sub-copy → CTA: `mt-6 sm:mt-7` → `mt-8 sm:mt-10`
- Terminal compact (mobile): `mt-5` → `mt-8`

**Rotating headline + sub-copy:**
- Replace the one-shot `useEffect` (random on mount) with an interval-based rotation
- Cycle through `HERO_VARIANTS` sequentially every 10 seconds
- First variant still selected randomly on mount
- Headline transitions via existing `TextScramble` component (key change triggers re-scramble)
- Sub-copy transitions via Framer Motion `AnimatePresence` with a fade-out/fade-in (200ms exit, 400ms enter)
- Both headline and sub-copy are keyed to the same variant index so they swap together
- Clean up interval on unmount (`clearInterval` in `useEffect` return)
- Add `AnimatePresence` to the existing Framer Motion imports

**Reduced motion:** When `prefers-reduced-motion` is active, the 10s interval still runs (content stays fresh) but transitions are instant — no scramble animation on headline, no fade on sub-copy. Just swap the text.

**CTA simplification:**
- Remove the `→` span and `group-hover:translate-x-1` animation
- Button text is just "Start a conversation"

**Desktop terminal:** No changes.

### 2. Section Padding — Tighter Rhythm

**Files:** `src/components/Services.tsx`, `src/components/Proof.tsx`, `src/components/IntakeAgent.tsx`

- Services and Proof: `py-16 sm:py-32` → `py-14 sm:py-24`
- IntakeAgent: currently `py-16 sm:py-32 sm:pb-16` → `py-14 sm:py-24 sm:pb-14` (preserve the reduced bottom padding pattern — it prevents excessive space before the footer)
- This reduces the total gap between sections from ~256px to ~192px on desktop

### 3. AnimatedHR — Breathing Room

**File:** `src/components/AnimatedHR.tsx`

- Wrap the 1px divider in a container with `py-8 sm:py-12` padding
- The divider line itself stays unchanged (1px with animated streak)

### 4. RevealOnScroll — Earlier Triggers

**File:** `src/components/RevealOnScroll.tsx`

- Change `useInView` margin from `"-60px"` to `"-20px"`
- Content appears sooner as the user scrolls, reducing blank gap perception

### 5. Alternating Section Backgrounds

**Files:** `src/components/Services.tsx`, `src/components/IntakeAgent.tsx`

- Services and Contact sections get `bg-bg-2/30` (subtle darker background)
- Hero and Proof sections stay on default `bg-bg`
- Creates a light → dark → light → dark visual rhythm when scrolling
- The `bg-bg-2` color (`#0f2035`) already exists in the design tokens; we use it at 30% opacity

### 6. Contact Section Spacing

**File:** `src/components/IntakeAgent.tsx`

- Heading margin: `mb-3 sm:mb-4` → `mb-4 sm:mb-5`
- Sub-copy margin: `mb-8 sm:mb-10` → `mb-10 sm:mb-12`

---

## Files Modified (Summary)

| File | Changes |
|------|---------|
| `src/components/Hero.tsx` | Spacing increases, rotating variants (interval + AnimatePresence), remove CTA arrow |
| `src/components/Services.tsx` | `py-14 sm:py-24`, add `bg-bg-2/30` background |
| `src/components/Proof.tsx` | `py-14 sm:py-24` |
| `src/components/IntakeAgent.tsx` | `py-14 sm:py-24`, add `bg-bg-2/30` background, increase contact spacing |
| `src/components/AnimatedHR.tsx` | Wrap in `py-8 sm:py-12` container |
| `src/components/RevealOnScroll.tsx` | Trigger margin `"-60px"` → `"-20px"` |

## Not Changing

- Nav, Footer, FloatingCTA — no modifications
- Desktop terminal component — stays as-is
- Mobile intake modal — stays as-is
- ServiceCard, ProofCard internals — no changes
- Design tokens in globals.css — no changes (existing `bg-bg-2` is sufficient)
- All copy/content in constants.ts — no changes

## Verification

1. Run `npx tsc --noEmit` — no type errors
2. Run `npm test` — all Playwright e2e tests pass
3. Visual check on desktop (1440px): hero has more breathing room, sections alternate backgrounds, dividers have padding
4. Visual check on mobile (390px): hero elements more spaced, sections flow tighter
5. Watch hero for 30+ seconds — headlines rotate with scramble effect, sub-copy fades between variants
6. Scroll full page — content reveals sooner (no long blank gaps), sections visually distinct
