# Roommate App UI (Cursor-ready)

Minimal pastel UI prototypes for a shared-home app. This repo includes:
- **Dashboard** (Hero + Daily Report with progressive disclosure)
- **Finance** (Hero + Progressive card for bills, transactions, settlement)
- A tiny Vite + React + Tailwind scaffold so you can run/edit in Cursor immediately.

## Quick start

```bash
# Node 18+ recommended
pnpm i   # or: npm i / yarn
pnpm dev # or: npm run dev / yarn dev
```

Then open the local URL. Use the top-right tabs to switch between **Dashboard** and **Finance**.

## Stack

- React 18 + Vite 5 + TypeScript
- TailwindCSS 3 (utility-first)
- framer-motion (micro-interactions)
- lucide-react (icons)

## Project structure

```
.
├─ src/
│  ├─ App.tsx                       # Simple tab switcher (Dashboard / Finance)
│  ├─ components/
│  │  ├─ DashboardHeroDailyLucas.tsx
│  │  └─ FinanceHeroProgressiveLucas.tsx
│  ├─ index.css                     # Tailwind base
│  ├─ main.tsx
├─ index.html
├─ tailwind.config.ts
├─ postcss.config.js
├─ vite.config.ts
├─ package.json
└─ tsconfig.json
```

## Components overview

### Dashboard (Hero + Daily)
- **Hero**: background image, greeting (“Early morning, Lucas”), floating input with **text + mock voice**.
- **Daily Report (single card)**: three rows — Daily, Short‑term, Long‑term — each shows a **count** and **expands inline** to reveal items.
- **Detail panel**: clicking an item opens a right-side slide-over with actions (mock), consistent with the design system.

### Finance (Hero + Progressive)
- **Hero**: taller image, greeting (“Finances, Lucas”), **balance chip**, and top-right **“+” quick add**.
- **Finance overview (single card)** with progressive rows:
  1) **Upcoming bills** (mark paid)
  2) **Recent transactions** (search + filter; click to open detail slide-over)
  3) **Settlement suggestion** (computed from splits; mock actions)
- **Quick Add** is currently minimal (adds a small “Other” expense).

## Data model (mock)

```
Person: string ("Lucas" | "Alex")

Transaction (Tx):
  id: string
  date: YYYY-MM-DD
  category: string
  amount: number
  payer: Person
  split: Record<Person, number>  // proportion (e.g., 0.5/0.5)
  note?: string
  status: 'paid' | 'due' | 'scheduled'

Bill:
  id: string
  name: string
  amount: number
  due: YYYY-MM-DD
  status: 'due' | 'scheduled' | 'paid'
```

> The **net balance** is computed by attributing each person's share on every transaction and crediting the payer for the portion fronted for others.

## Implementation notes

- **Progressive disclosure** is implemented with per-row open state and Framer Motion transitions.
- **Detail panels** are slide-overs to keep context and reduce nav churn.
- **Accessibility**: buttons have labels; keyboard focus styles come from Tailwind defaults. (Further a11y polishing listed in `design.md`.)

## Roadmap to “real” app

1. **State management**: introduce a thin store (Zustand or Redux Toolkit) to replace local state when wiring real data.
2. **Persistence**: add local storage and later backend endpoints (REST/GraphQL).
3. **Authentication**: simple auth guard.
4. **LLM integration** (your 20B model):
   - Create `src/lib/llm.ts` with `executeCommand(input: string)`.
   - Use env var `VITE_LLM_API_KEY` and `VITE_LLM_BASE_URL` (documented in `.env.example`).
   - Map intents → actions (add expense, split, mark paid, create list).
5. **Voice**: Web Speech API for capture; send transcript to LLM; show a confirmation sheet before mutation.
6. **Receipts**: image upload + preview; OCR later.
7. **Testing**: Vitest + React Testing Library for components; Playwright for flows.
8. **CI**: add linting (ESLint + Prettier) and type checks.
9. **Analytics**: privacy-preserving basic telemetry.

## Adopt in Cursor

- Open this folder in Cursor, run it, and edit the two components. 
- The remaining screens (Shopping, Cleaning, Plants) should follow the same **Hero + Progressive** pattern (see `design.md`).

---

MIT © You
