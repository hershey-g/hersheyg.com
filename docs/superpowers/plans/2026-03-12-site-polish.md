# Site Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the site's visual hierarchy and spacing — more breathing room in the hero, rotating headline text, tighter section rhythm, alternating section backgrounds, and earlier scroll reveals.

**Architecture:** All changes are in existing React components (`src/components/`). No new files, no new dependencies, no API changes. The rotating text uses an interval timer + existing `TextScramble` component + Framer Motion `AnimatePresence` for sub-copy transitions.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-12-site-polish-design.md`

---

## Chunk 1: Section Rhythm & Visual Hierarchy

### Task 1: AnimatedHR — Add Divider Padding

**Files:**
- Modify: `src/components/AnimatedHR.tsx`

- [ ] **Step 1: Add padding wrapper around divider**

Change the component to wrap the existing divider in a padded container:

```tsx
export default function AnimatedHR() {
  return (
    <div className="py-8 sm:py-12">
      <div
        className="relative h-px w-full overflow-hidden"
        style={{ backgroundColor: "rgba(148, 163, 184, 0.08)" }}
        aria-hidden="true"
      >
        <div
          className="absolute h-full w-[120px] bg-gradient-to-r from-transparent via-accent-lit to-transparent"
          style={{ animation: "streak 6s linear infinite" }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Open `http://localhost:3000`, scroll past hero. Dividers should have visible vertical space around them.

- [ ] **Step 3: Commit**

```bash
git add src/components/AnimatedHR.tsx
git commit -m "style: add breathing room around AnimatedHR dividers"
```

---

### Task 2: RevealOnScroll — Earlier Trigger Margin

**Files:**
- Modify: `src/components/RevealOnScroll.tsx:20`

- [ ] **Step 1: Change useInView margin**

In `RevealOnScroll.tsx` line 20, change:

```tsx
// OLD
const isInView = useInView(ref, { once: true, margin: "-60px" });

// NEW
const isInView = useInView(ref, { once: true, margin: "-20px" });
```

- [ ] **Step 2: Verify visually**

Scroll through the page. Content in Services and Proof sections should reveal sooner — less blank space before animations trigger.

- [ ] **Step 3: Commit**

```bash
git add src/components/RevealOnScroll.tsx
git commit -m "style: tighten RevealOnScroll trigger margin for earlier reveals"
```

---

### Task 3: Section Padding + Alternating Backgrounds

**Files:**
- Modify: `src/components/Services.tsx:11`
- Modify: `src/components/Proof.tsx:9`
- Modify: `src/components/IntakeAgent.tsx:584,591,595`

- [ ] **Step 1: Update Services section**

In `Services.tsx` line 11, change:

```tsx
// OLD
<section id="services" className="py-16 sm:py-32">

// NEW
<section id="services" className="py-14 sm:py-24 bg-bg-2/30">
```

- [ ] **Step 2: Update Proof section**

In `Proof.tsx` line 9, change:

```tsx
// OLD
<section id="proof" className="py-16 sm:py-32">

// NEW
<section id="proof" className="py-14 sm:py-24">
```

- [ ] **Step 3: Update IntakeAgent section padding and background**

In `IntakeAgent.tsx` line 584, change:

```tsx
// OLD
<section className="py-16 sm:py-32 sm:pb-16" ref={sectionRef}>

// NEW
<section className="py-14 sm:py-24 sm:pb-14 bg-bg-2/30" ref={sectionRef}>
```

- [ ] **Step 4: Update IntakeAgent contact heading spacing**

In `IntakeAgent.tsx` line 591, change:

```tsx
// OLD
<h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-4">

// NEW
<h2 className="text-[clamp(28px,5vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-5">
```

- [ ] **Step 5: Update IntakeAgent contact sub-copy spacing**

In `IntakeAgent.tsx` line 595, change:

```tsx
// OLD
<p className="text-base sm:text-[17px] text-dim leading-relaxed max-w-[540px] mb-8 sm:mb-10">

// NEW
<p className="text-base sm:text-[17px] text-dim leading-relaxed max-w-[540px] mb-10 sm:mb-12">
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Verify visually**

Open `http://localhost:3000`:
- Services section should have a subtle darker background (`bg-bg-2/30`)
- Proof section stays on the default background
- Contact section should have the same subtle darker background
- Section gaps are tighter than before
- Contact heading and sub-copy have more breathing room

- [ ] **Step 8: Commit**

```bash
git add src/components/Services.tsx src/components/Proof.tsx src/components/IntakeAgent.tsx
git commit -m "style: tighter section padding, alternating backgrounds, contact spacing"
```

---

### Task 4: Run Existing Tests

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass. The changes are CSS-only — no behavioral changes that would break existing tests. The intake form tests should still find elements by their existing selectors.

---

## Chunk 2: Hero Polish

### Task 5: Hero Spacing + CTA Simplification

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: Increase eyebrow bottom margin**

In `Hero.tsx` line 29, change:

```tsx
// OLD
className="group flex items-center gap-3 mb-5 sm:mb-6"

// NEW
className="group flex items-center gap-3 mb-8 sm:mb-10"
```

- [ ] **Step 2: Increase headline-to-subcopy gap**

In `Hero.tsx` line 56, change:

```tsx
// OLD
className="mt-4 sm:mt-5 text-base sm:text-lg text-body leading-relaxed max-w-[520px]"

// NEW
className="mt-6 sm:mt-8 text-base sm:text-lg text-body leading-relaxed max-w-[520px]"
```

- [ ] **Step 3: Increase subcopy-to-CTA gap**

In `Hero.tsx` line 66, change:

```tsx
// OLD
className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 mt-6 sm:mt-7"

// NEW
className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 mt-8 sm:mt-10"
```

- [ ] **Step 4: Increase terminal compact margin (mobile)**

In `Hero.tsx` line 87, change:

```tsx
// OLD
className="mt-5 block lg:hidden"

// NEW
className="mt-8 block lg:hidden"
```

- [ ] **Step 5: Remove CTA arrow**

In `Hero.tsx` lines 74-80, simplify the CTA link. Remove the arrow span:

```tsx
// OLD
<a
  href="#contact"
  className="group inline-flex items-center justify-center gap-2 font-mono text-sm sm:text-base tracking-wide text-white bg-accent rounded-sm px-6 sm:px-7 py-3.5 hover:bg-accent-lit transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
>
  {COPY.hero.cta}
  <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
    →
  </span>
</a>

// NEW
<a
  href="#contact"
  className="inline-flex items-center justify-center font-mono text-sm sm:text-base tracking-wide text-white bg-accent rounded-sm px-6 sm:px-7 py-3.5 hover:bg-accent-lit transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lit"
>
  {COPY.hero.cta}
</a>
```

Note: Also remove `group` from the class list and `gap-2` since there's no longer a second element.

- [ ] **Step 6: Verify visually**

Open `http://localhost:3000`:
- Hero text elements are visibly more spaced out
- CTA button says "Start a conversation" with no arrow
- Desktop terminal still appears on the right
- Mobile shows compact terminal badge below CTA with more gap

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "style: increase hero spacing, remove CTA arrow"
```

---

### Task 6: Hero Rotating Text

**Files:**
- Modify: `src/components/Hero.tsx`

This is the most complex change. We need to:
1. Add an interval that cycles through `HERO_VARIANTS` every 10 seconds
2. Use `TextScramble` key changes to trigger headline re-scramble
3. Add `AnimatePresence` for sub-copy fade transitions
4. Respect reduced motion (instant swaps, no animation)

- [ ] **Step 1: Write e2e test for rotating headline**

Create `e2e/hero-rotation.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("Hero headline rotates after interval", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  test.setTimeout(30_000);

  await page.goto("/");

  // Capture initial headline text (wait for scramble to finish)
  await page.waitForTimeout(2000);
  const h1 = page.locator("h1");
  const initialText = await h1.getAttribute("aria-label") ?? await h1.innerText();

  // Wait for rotation (10s interval + scramble time)
  await page.waitForTimeout(12_000);

  // Headline should have changed
  const newText = await h1.getAttribute("aria-label") ?? await h1.innerText();
  expect(newText).not.toBe(initialText);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/hero-rotation.spec.ts --project=desktop`
Expected: FAIL — headline doesn't change because rotation isn't implemented yet.

- [ ] **Step 3: Implement rotating text in Hero.tsx**

Update the imports at the top of `Hero.tsx`:

```tsx
// OLD
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// NEW
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
```

Replace the variant state management (lines 17-20):

```tsx
// OLD
const [variant, setVariant] = useState(HERO_VARIANTS[0]);
useEffect(() => {
  setVariant(HERO_VARIANTS[Math.floor(Math.random() * HERO_VARIANTS.length)]);
}, []);

// NEW
const [variantIndex, setVariantIndex] = useState(0);
const initializedRef = useRef(false);

// Pick random start on mount, then rotate every 10s
useEffect(() => {
  if (!initializedRef.current) {
    setVariantIndex(Math.floor(Math.random() * HERO_VARIANTS.length));
    initializedRef.current = true;
  }

  const interval = setInterval(() => {
    setVariantIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
  }, 10_000);

  return () => clearInterval(interval);
}, []);

const variant = HERO_VARIANTS[variantIndex];
```

Update the headline to use `variantIndex` as key (triggers `TextScramble` re-animation):

```tsx
// OLD (line 51)
<TextScramble text={variant.headline} />

// NEW — key change triggers re-scramble
<TextScramble key={variantIndex} text={variant.headline} />
```

Replace the sub-copy `motion.p` with `AnimatePresence` for fade transition (lines 55-62):

```tsx
// OLD
<motion.p
  className="mt-6 sm:mt-8 text-base sm:text-lg text-body leading-relaxed max-w-[520px]"
  initial={noMotion ? false : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.0, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
>
  {variant.sub}
</motion.p>

// NEW
<AnimatePresence mode="wait">
  <motion.p
    key={variantIndex}
    className="mt-6 sm:mt-8 text-base sm:text-lg text-body leading-relaxed max-w-[520px]"
    initial={noMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={noMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
    transition={{ duration: noMotion ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {variant.sub}
  </motion.p>
</AnimatePresence>
```

**Reduced motion handling:** When `noMotion` is true:
- The interval still runs (content rotates)
- `TextScramble` already handles reduced motion internally (instant text swap, no scramble characters)
- The sub-copy `AnimatePresence` uses `opacity: 1` for both initial and exit (no visible transition), with `duration: 0`

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Run rotation test**

Run: `npx playwright test e2e/hero-rotation.spec.ts --project=desktop`
Expected: PASS — headline changes after ~10 seconds.

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + new rotation test).

- [ ] **Step 7: Visual verification**

Open `http://localhost:3000`:
- Watch for 30+ seconds
- Headline scrambles to a new variant every ~10s
- Sub-copy fades out and new one fades in simultaneously
- The scramble effect masks the text change (characters randomize then resolve)
- On mobile, same behavior with the compact terminal below

- [ ] **Step 8: Commit**

```bash
git add e2e/hero-rotation.spec.ts src/components/Hero.tsx
git commit -m "feat: rotate hero headline and sub-copy every 10 seconds"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: All tests pass (desktop + mobile).

- [ ] **Step 3: Desktop visual check (1440px)**

Open `http://localhost:3000` at 1440px width:
- Hero: more breathing room, headline rotates, no CTA arrow
- Sections: tighter padding, Services and Contact have subtle darker bg
- Dividers: visible vertical padding
- Scroll reveals: content appears sooner

- [ ] **Step 4: Mobile visual check (390px)**

Open at 390px or use device emulation:
- Hero: text more spaced, terminal badge has more gap from CTA
- Sections flow tighter
- No horizontal overflow
