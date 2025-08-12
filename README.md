# Roommate App UI (Cursor-ready)

Minimal pastel UI prototypes for a shared-home app. This repo includes:
- **Dashboard** (Hero + Daily Report with progressive disclosure)
- **Finance** (Hero + Progressive card for bills, transactions, settlement) with CRUD
- **Plants** (Hero + Progressive schedule + card grid) with CRUD
- **Cleaning** (Hero + Rotation/Backlog + card grid) with CRUD
- A tiny Vite + React + Tailwind scaffold so you can run/edit in Cursor immediately.

## Quick start

```bash
# Node 18+ recommended
pnpm i   # or: npm i / yarn
pnpm dev # or: npm run dev / yarn dev
```

Then open the local URL. Use the top-right tabs to switch between **Dashboard** and **Finance**.

Hero “+” buttons open the same add forms as the section actions on each screen.

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

### Finance (Hero + Progressive + CRUD)
- **Hero**: taller image, greeting (“Finances, Lucas”), **balance chip**, and top-right **“+” quick add**.
- **Finance overview (single card)** with progressive rows:
  1) **Upcoming bills** (mark paid)
  2) **Recent transactions** (search + filter; click to open detail slide-over)
  3) **Settlement suggestion** (computed from splits; mock actions)
- **CRUD**:
  - Add/Edit/Delete transactions via slide-over form (accessible from section and hero “+”).
  - Add/Edit/Delete bills via slide-over form; mark paid inline.
  - Filter/search transactions.

### Plants (Hero + Progressive + Card Grid + CRUD)
- **Hero**: greeting (“Plants, Lucas”), top-right **“+”** opens Add Plant form; command input parses “add plant NAME every N days”.
- **Progressive sections**:
  - Today (due/overdue watering)
  - Schedule (next 7 days)
  - Notes
- **All plants** grid: responsive cards with frequency and next date, quick Details/Edit/Delete.
- **CRUD**: Add/Edit/Delete plants via slide-over form; mark watered in Details.

### Cleaning (Hero + Rotation + Backlog + Card Grid + CRUD)
- **Hero**: greeting (“Cleaning, Lucas”), top-right **“+”** opens Add Room form; command input parses “clean ROOM every N days”.
- **Progressive sections**:
  - Today (due/overdue cleaning)
  - Rotation (assignment per room)
  - Backlog (overdue > 1 day)
- **All rooms** grid: cards with frequency/next date, assigned person, quick Details/Edit/Delete.
- **CRUD**: Add/Edit/Delete rooms via slide-over; “Mark cleaned” rotates assignment and updates last-cleaned.

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
- **Forms and overlays**: slide-over forms use high z-index and the hero backgrounds disable pointer events so the **“+”** buttons remain clickable.

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
7. **Testing**: Vitest + React Testing Library for components; Playwright for flows. Basic browser checks are already in use to validate rendering.
8. **CI**: add linting (ESLint + Prettier) and type checks.
9. **Analytics**: privacy-preserving basic telemetry.

## Adopt in Cursor

- Open this folder in Cursor, run it, and edit any of the screens. 
- Remaining area (Shopping) should follow the same **Hero + Progressive** pattern (see `design.md`).

---

MIT © You
