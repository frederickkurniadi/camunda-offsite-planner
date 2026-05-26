# Camunda Offsite Planner

A small Next.js app to plan a team offsite against a per-person budget pool, see the variance, and look up indicative flight prices.

Built for a fully-remote team: each member flies in from their own home airport, stays a few nights, joins a shared activity, then heads home. The budget is treated as a single pool (`budgetPerPerson × headcount`) so cheaper-to-fly teammates can subsidize expensive ones.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Data is saved to your browser's `localStorage`. Use **Export JSON** to share or version a plan; **Import JSON** to load one.

## What it tracks

**Trip-level**
- Destination city + airport (IATA)
- Arrive / depart dates (defaults to next Mon → Thu)
- Budget per person (defaults to 2000 EUR)
- Currency

**Per teammate** — three estimates
- Travel (flight + getting to/from airports)
- Lodging (hotel total for the stay)
- Food (all meals for the trip)

**Team-wide totals**
- Group activity
- Special team dinner
- Meeting room
- Misc team

The summary panel shows total spend vs. the pooled budget and the variance.

## Flight price lookup

Each teammate card has a **Search on Google Flights** link that opens Google Flights in a new tab, pre-filled with that teammate's route and the trip dates. Read the price, type it into the Travel field. No API key, no rate limits.

## Deploy

Deploy to Vercel:

```bash
vercel
```

No environment variables required.

## Project layout

```
src/
  app/
    page.tsx              # renders <Planner />
    layout.tsx
  components/
    Planner.tsx           # top-level client component
    TripBasics.tsx
    TeammateCard.tsx
    TeamCostsSection.tsx
    Summary.tsx
    Field.tsx
    MoneyInput.tsx
  lib/
    types.ts              # Trip / Teammate / TeamCosts types
    budget.ts             # pure budget math (summarize)
    dates.ts              # date helpers
    defaults.ts           # newTrip / newTeammate / team field definitions
    storage.ts            # useTrip() hook + JSON import/export
```

The budget math in `lib/budget.ts` is pure and trivially unit-testable if you want to add tests later.
