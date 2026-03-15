# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run start     # Serve production build
npx tsc --noEmit  # Type-check without emitting
npm test          # Run Playwright e2e tests (desktop + mobile)
npm run test:ui   # Playwright interactive UI mode
npm run test:unit # Run Vitest unit tests
```

## Architecture

Single-page portfolio site. Next.js 16 App Router with React 19, Tailwind CSS v4, and Framer Motion.

**Stack:** TypeScript, Next.js (App Router), Tailwind CSS v4 (`@theme inline` tokens in globals.css), Framer Motion for animations.

**Routing:** Single page at `src/app/page.tsx`. Layout in `src/app/layout.tsx` (Inter + JetBrains Mono fonts, dark mode only).

**Structure:**
- `src/app/` - Next.js App Router (layout, page, globals.css)
- `src/components/` - All UI components (no nesting, flat structure)
- `src/lib/constants.ts` - All copy/content centralized in a single `COPY` object
- `src/lib/knowledge/` - Structured knowledge base for IntakeAgent (see below)
- `src/lib/intake-system-prompt.ts` - IntakeAgent system prompt builder, greetings, chip pool

**Page sections in order:** Nav, Hero, Services, Proof, Contact, Footer (separated by AnimatedHR dividers). Background effects: DotGrid, CursorGlow, ScrollProgress.

**Design tokens** are defined as CSS custom properties in `src/app/globals.css` using Tailwind v4's `@theme inline` block (e.g., `--color-bg`, `--color-accent`, `--color-text`). Use these token names in Tailwind classes (e.g., `bg-bg`, `text-accent`).

**Path alias:** `@/*` maps to `./src/*`.

**Deploy:** Vercel.

## IntakeAgent Knowledge System

The contact section's AI chat agent uses a structured knowledge injection system:

- `src/lib/knowledge/` - Knowledge entries organized by category (`portfolio.ts`, `opinions.ts`, `process.ts`, `capabilities.ts`, `faq.ts`)
- `src/lib/knowledge/classifier.ts` - Classifies visitors as technical/non-technical based on language signals
- `src/lib/knowledge/matcher.ts` - Keyword-matches conversation against knowledge entries, injects relevant ones into the system prompt
- `src/lib/intake-system-prompt.ts` - `buildSystemPrompt()` composes the prompt dynamically based on visitor type + matched knowledge

**Knowledge entries** currently contain sample/placeholder content. Real content needs to be extracted from Hershey and structured into the TypeScript files. Each entry has: `id`, `category`, `keywords`, `techLevel` ("any" | "technical" | "non-technical"), and `content`.