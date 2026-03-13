# Visual Redesign — hersheyg.com

## Context

The current site has a hero with a terminal animation and scramble text that feels too techy and jittery — it rotates headlines every 10 seconds and uses random character scrambling. This doesn't land for business owners. The font sizes are undersized across the board (base = 14px), colors lack contrast on the navy background, service cards feel boxy and inconsistent with the proof section, and sections are separated by hard HR dividers rather than flowing smoothly. The site needs to appeal to **two audiences simultaneously**: technical people and business owners.

## Design Decisions

### Color Palette

| Token | Current | New | Notes |
|-------|---------|-----|-------|
| `--color-bg` | `#0D1B2A` | `#080F1A` | Near-black with navy hint |
| `--color-bg-2` | `#0f2035` | `#0C1524` | Subtle step up for alternating sections |
| `--color-text` | `#CBD5E1` | `#E2E8F0` | Primary text, brighter |
| `--color-body` | `#b8c8da` | `#CBD5E1` | Body copy bumped up |
| `--color-dim` | `#94a3b3` | `#A0AEBF` | Subtle text, still readable |
| `--color-line` | `rgba(148,163,184,0.08)` | `rgba(148,163,184,0.10)` | Slightly more visible borders |
| `--color-accent` | `#1E3A5F` | unchanged | |
| `--color-accent-lit` | `#5b9bd5` | unchanged | |
| `--color-white` | `#FFFFFF` | unchanged | |

Terminal colors (`term-green`, `term-orange`, etc.) remain unchanged — they're used in Proof badges and pop harder on the darker background automatically.

- **Remove**: `--color-surface` token (`oklch(0.17 0.01 260)`) — was used by IntakeAgent terminal chrome. Replace usage with `--color-bg-2`.
- **Remove**: Grain overlay (`body::before`) and scanlines (`body::after`) — these are terminal-aesthetic remnants that conflict with the new clean direction.

### Typography Scale

| Token | Current | New |
|-------|---------|-----|
| `--text-xs` | `0.625rem` (10px) | `0.75rem` (12px) |
| `--text-sm` | `0.75rem` (12px) | `0.875rem` (14px) |
| `--text-base` | `0.875rem` (14px) | `1rem` (16px) |
| `--text-md` | `1rem` (16px) | `1.125rem` (18px) |
| `--text-lg` | `1.0625rem` (17px) | `1.25rem` (20px) |

Section headings keep fluid `clamp()` sizing but with higher floor values.

### Hero

- **Layout**: Single centered column, no right-side element
- **Remove**: Terminal component (desktop), TerminalCompact (mobile), TextScramble, variant rotation system
- **Keep**: Staggered entrance animation (fade/slide in), MagneticButton on CTA, DotGrid + CursorGlow background
- **Add**: Subtle ambient glow — radial gradient behind headline area (`rgba(91,155,213,0.07)`)
- **Content**: Single static headline (no rotation). Eyebrow + headline + one line of sub-copy + single CTA
- **Headline direction**: Needs to bridge tech and business audiences. Current headlines are too dev-focused. Write new copy during implementation — tone: confident authority, not clever. Placeholder: "I build AI that runs your business forward"
- **Animation**: Entrance fade-in only (elements slide up once on load), plus the subtle ambient glow. No ongoing text animation.
- **Mobile**: Same centered layout, just responsive sizing. No TerminalCompact replacement needed — the single column works as-is at all breakpoints.

### Services

- **Layout**: Remove 3-column card grid. Replace with **stacked rows** — number (01/02/03) on the left column (56px), title + body on the right
- **Remove**: Tags entirely. ServiceCard component replaced with simple row markup
- **Remove**: Stats bar ("180k+ tickets sold · $9.2M in transactions · zero downtime") from section header — these numbers belong in Proof section
- **Content**: Section heading, intro paragraph, then 3 rows separated by subtle horizontal rules
- **Copy**: Service titles and body text need rework for dual audience — current copy is too insider. Do during implementation.
- **Background**: `--color-bg-2` (`#0C1524`) to differentiate from adjacent sections

### Proof

- **Layout**: Convert from 2-column card grid to **stacked rows** — project label on the left column (200px), metric + description + badge on the right. Note: 200px left column (vs 56px for Services) is intentional — Proof labels are longer text. The sections share row structure but not column widths.
- **Remove**: ProofCard component, header strips, scramble animation on metric numbers
- **Numbers**: Static display, no scramble. Optional: simple count-up animation on scroll-into-view (once, not repeating)
- **Testimonial**: Keep carousel below proof items. Centered, italic quote, attribution, dot navigation. No changes to structure.
- **Background**: `--color-bg` (`#080F1A`)

### About

- **Layout**: Two-column — text left, headshot photo right (300px)
- **Add**: Headshot image placeholder (user will provide actual photo)
- **Remove**: "HG" monogram graphic
- **Content**: Keep existing copy, just benefits from typography/color bump
- **Mobile**: Photo stacks above or below text (full-width). Keep existing responsive behavior minus the monogram.
- **Background**: `--color-bg-2` (`#0C1524`)

### Contact

- **Layout**: Must fit within a single viewport (`min-height: 100vh` with flex layout)
- **Structure**: Section header text at top, chat interface centered in remaining space
- **Chat interface**: Remove all terminal chrome (no red/yellow/green dots, no `~/intake-agent` title bar). Clean container with `--color-bg-2` fill, subtle border, rounded corners
- **Chat chips**: 2x2 grid layout with `grid-template-columns: 1fr 1fr` — chips stretch to fill. If chip count changes, grid wraps naturally.
- **Remove**: "Typical reply time: under 24h" with green dot
- **Remove**: Email link from contact section (moved to footer)
- **Remove**: Animated conic gradient border (`intake-border` class). Replace with static `border: 1px solid var(--line)`.
- **Mobile**: Chat remains inline (not tap-to-open modal). The single-viewport constraint applies to desktop; on mobile, the section can scroll naturally if needed.
- **Background**: `--color-bg` (`#080F1A`)

### Footer

- **Content**: `© 2026 Hershey Goldberger · hello@hersheyg.com · LinkedIn · GitHub`
- **Remove**: All arrows from links
- **Remove**: "designed & shipped by an AI agent" credit
- **Add**: Email link (moved from contact section)
- **Typography**: Bump from 11px to 14px

### Nav

- **Structure**: No layout changes
- **Typography**: Bump link sizes with new scale (14px for links)
- **Behavior**: Keep scroll-triggered backdrop blur, keep mobile hamburger menu

### Page Flow & Animation

- **Remove**: AnimatedHR dividers between all sections
- **Section transitions**: Alternating background colors (`#080F1A` ↔ `#0C1524`) create natural separation without hard dividers
- **Parallax scrolling**: Use Framer Motion `useScroll` + `useTransform` (already in codebase). Implementation:
  - Section headings: `translateY` at 0.95x scroll speed (slightly slower than content, creates depth)
  - Background elements (DotGrid, ambient glows): 0.85x scroll speed
  - Content blocks: normal 1x scroll speed (no transform needed)
  - Use `useMotionValueEvent` or `useTransform` with scroll offset ranges per section
  - Parallax disabled when `prefers-reduced-motion: reduce`
- **Scroll-triggered entrances**: Use existing `RevealOnScroll` component pattern. Each section's content fades/slides in as it enters viewport. Stagger children within sections (50-100ms between elements).
- **Keep**: DotGrid interactive background, CursorGlow, ScrollProgress bar
- **Keep**: All `prefers-reduced-motion` respect across animations

### Components to Delete

- `Terminal.tsx` — desktop terminal animation
- `TerminalCompact.tsx` — mobile terminal single-line
- `TextScramble.tsx` — character scramble animation
- `ServiceCard.tsx` — card-based service display
- `ProofCard.tsx` — card-based proof display
- `AnimatedHR.tsx` — section dividers
- `ScrambleReveal.tsx` — metric number scramble animation (used by ProofCard)

### Components Unchanged

- `FloatingCTA.tsx` — keep as-is, still needed for mobile CTA between hero and contact
- `SectionTag.tsx` — keep, used by Services/Proof/About for eyebrow labels
- `SectionHead.tsx` — keep, used for section headings
- `RevealOnScroll.tsx` — keep, used for scroll-triggered entrance animations

### Components to Modify

- `Hero.tsx` — complete rewrite: single centered column, static headline, no rotation, no terminal
- `Services.tsx` — replace card grid with stacked rows
- `Proof.tsx` — replace card grid with stacked rows, remove scramble on metrics
- `About.tsx` — add headshot image, remove HG monogram
- `Contact.tsx` / `IntakeAgent.tsx` — remove terminal chrome, restructure for single viewport
- `Footer.tsx` — add email, remove arrows, bump typography
- `Nav.tsx` — bump typography
- `globals.css` — update all design tokens (colors, typography scale), remove terminal-related CSS animations (`rotate-border`, `blink`), remove `@property --border-angle` declaration, remove grain overlay and scanlines pseudo-elements, remove `--color-surface` token
- `constants.ts` — new hero headline/copy, reworked service copy, remove hero variants array, remove terminal content
- `page.tsx` — remove AnimatedHR imports/usage between sections

### E2E Tests to Update

- `e2e/hero-rotation.spec.ts` — remove or rewrite. No longer tests rotation (removed). Replace with: assert single static headline is visible, CTA button exists, no terminal element present.
- `e2e/intake-form.spec.ts` — update selectors: remove assertions for `~/intake-agent` title, terminal dots, "Typical reply time". Add assertions for clean chat container, 2x2 chip grid, message input.

### Mockup Reference

Low-fidelity mockups saved in `.superpowers/brainstorm/51301-1773416408/`:
- `full-page-v3.html` — final approved full-page layout
- `hero-v2.html` — hero options (option A selected: centered minimal)
- `services-v2.html` — services options (option A selected: stacked rows)
- `color-palette.html` — color comparison (proposed selected)

## Verification

1. `npx tsc --noEmit` — must pass with zero errors
2. `npm run build` — production build succeeds
3. `npm test` — Playwright e2e tests pass (desktop + mobile)
4. Visual check in browser at 1440px, 768px, and 375px widths
5. Lighthouse accessibility score remains ≥ 90
6. All animations respect `prefers-reduced-motion: reduce`
7. No layout shift (CLS) regressions
8. Parallax scrolling feels smooth at 60fps
