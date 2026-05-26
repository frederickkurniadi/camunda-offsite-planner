"use client";

import type { Trip } from "@/lib/types";
import type { RateMap } from "@/lib/fx";
import { formatMoney, summarize } from "@/lib/budget";
import { TrendingDown, TrendingUp, CircleDashed } from "lucide-react";

export function BudgetPill({ trip, rates }: { trip: Trip; rates: RateMap }) {
  const s = summarize(trip, rates);

  if (s.headcount === 0 || s.poolEUR === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-500 shadow-xs">
        <CircleDashed className="h-3.5 w-3.5" />
        No budget set
      </span>
    );
  }

  const over = s.varianceEUR < 0;
  const pct = Math.round((s.totalSpendEUR / s.poolEUR) * 100);
  const tone = over
    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    : pct >= 90
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums shadow-xs ${tone}`}
      title={`${formatMoney(s.totalSpendEUR)} of ${formatMoney(s.poolEUR)} pool`}
    >
      {over ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {formatMoney(Math.abs(s.varianceEUR))} {over ? "over" : "under"}
      <span className="text-[10px] opacity-70 font-medium">· {pct}%</span>
    </span>
  );
}
