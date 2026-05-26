import type { Money, PersonBreakdown, Teammate, Trip, TripSummary } from "./types";
import { toEUR } from "./fx";

type RateMap = Record<string, number>;

function moneyToEUR(m: Money, rates: RateMap): number {
  return toEUR(m.amount, m.currency, rates);
}

export function headcountOf(t: Teammate): number {
  const n = t.headcount ?? 1;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function breakdownFor(t: Teammate, rates: RateMap): PersonBreakdown {
  const n = headcountOf(t);
  const travelEUR = moneyToEUR(t.travel, rates) * n;
  const lodgingEUR = moneyToEUR(t.lodging, rates) * n;
  const foodEUR = moneyToEUR(t.food, rates) * n;
  return {
    teammate: t,
    travelEUR,
    lodgingEUR,
    foodEUR,
    totalEUR: travelEUR + lodgingEUR + foodEUR,
  };
}

export function summarize(trip: Trip, rates: RateMap): TripSummary {
  const perPerson = trip.teammates.map((t) => breakdownFor(t, rates));
  const personalSpendEUR = perPerson.reduce((s, p) => s + p.totalEUR, 0);

  const tc = trip.teamCosts;
  const teamSpendEUR =
    moneyToEUR(tc.groupActivity, rates) +
    moneyToEUR(tc.specialDinner, rates) +
    moneyToEUR(tc.meetingRoom, rates) +
    moneyToEUR(tc.misc, rates);

  const headcount = trip.teammates.reduce((s, t) => s + headcountOf(t), 0);
  const poolEUR = trip.budgetPerPerson * headcount;
  const totalSpendEUR = personalSpendEUR + teamSpendEUR;
  const varianceEUR = poolEUR - totalSpendEUR;

  return { headcount, poolEUR, personalSpendEUR, teamSpendEUR, totalSpendEUR, varianceEUR, perPerson };
}

export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
