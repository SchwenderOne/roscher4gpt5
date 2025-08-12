# Design System — Minimal Pastel

This document captures the visual and interaction rules so all screens feel coherent.

## Principles
- **Calm first**: low-ink UI, generous whitespace, soft shadows, and airy cards.
- **Progressive disclosure**: short-overview first, details on demand inline or via slide-over.
- **One clear action** per region (primary buttons; chips for secondary).
- **Motion as feedback**: fast, subtle, and purposeful.

## Colors (pastel tints)
- Base surface: `slate-50`
- Text: `slate-800` (primary), `slate-500` (secondary)
- Cards: white with blur — `bg-white/70` and `ring-1 ring-slate-200`
- Category tints (examples):
  - Shopping: `rose-50` / ring `rose-100`
  - Finances: `amber-50` / ring `amber-100`
  - Cleaning: `sky-50` / ring `sky-100`
  - Plants: `emerald-50` / ring `emerald-100`

> Keep contrast AA for text on tinted backgrounds (use dark text).

## Typography & Spacing
- Font size scale: 12 / 14 / 16 / 20 / 24 / 32 for headings & key numbers.
- Sections: 16–20px inner padding (`p-4` / `p-5`), 12px gaps (`gap-3`) between elements.
- Rounded: `rounded-2xl` for cards, `rounded-full` for pills.

## Components
- **Hero**: full-bleed image with gradient overlay, greeting line, and a floating command bar (text + mic). 
  - Finance hero also shows **balance chip** and a **+** quick-add in top-right.
- **Stat chips**: `ring-1` + `bg-slate-100`, small text, rounded-xl.
- **Rows (expanders)**: tap the row to expand its content inline; rotate chevron 90° on open.
- **Task/Transaction item**: tint block, short title, optional time/subtext, trailing arrow.
- **Slide-over**: right-anchored, rounded left edge, same card/ring treatment.

## Patterns
- **Hero + Progressive** across screens: 
  - **Dashboard**: Daily / Short‑term / Long‑term.
  - **Finance**: Bills / Transactions / Settlement.
  - **Shopping**: Lists / Today’s picks / Long‑term items.
  - **Cleaning**: Today / Rotation / Backlog.
  - **Plants**: Today / Schedule / Notes.

## Motion
- Page section enter: y: 8px, opacity: 0 → 1, duration 0.2s (springs for slide-over).
- Expander enter/exit: 6–8px translate with opacity.
- Avoid large bounces; aim for subtle responsiveness.

## Accessibility
- Ensure focus outlines are visible on all interactive elements.
- Provide aria-labels where icons exist without text (e.g., mic, +, close).
- Keyboard: Esc closes slide-overs; Enter submits command.
- Color contrast: at least AA for text; avoid tinted text on tinted backgrounds.

## Theming
- Keep everything pastel by default. For a **dark pastel** variant later, invert surfaces (`slate-900` base) and maintain soft tints (50/100 levels) for content blocks.

## Assets
- Hero backgrounds currently use Unsplash placeholders; replace with your curated imagery or local assets later.
