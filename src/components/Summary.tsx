"use client";

import type { Trip } from "@/lib/types";
import { formatMoney, headcountOf, summarize } from "@/lib/budget";
import type { RateMap } from "@/lib/fx";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

export function Summary({ trip, rates }: { trip: Trip; rates: RateMap }) {
  const s = summarize(trip, rates);
  const over = s.varianceEUR < 0;
  const pct = s.poolEUR > 0 ? Math.min(100, Math.round((s.totalSpendEUR / s.poolEUR) * 100)) : 0;

  return (
    <section id="summary" className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden border-t-4 border-t-[#FC5D0D]">
      <div className="bg-gradient-to-br from-[#FFF1E6] via-white to-[#FFE2CC] dark:from-[#3a1d05]/40 dark:via-neutral-900 dark:to-[#3a1d05]/40 px-6 pt-5 pb-6 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <Wallet className="h-4 w-4 text-[#FC5D0D]" />
          Summary
        </div>
        <div className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
          {formatMoney(Math.abs(s.varianceEUR))}
        </div>
        <div
          className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
            over ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {over ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {over ? "over budget" : "under budget"}
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all ${
                over ? "bg-red-500" : pct > 90 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs text-neutral-500 flex justify-between tabular-nums">
            <span>{pct}% of pool</span>
            <span>
              {formatMoney(s.totalSpendEUR)} / {formatMoney(s.poolEUR)}
            </span>
          </div>
        </div>

        <dl className="space-y-2 text-sm tabular-nums pt-1">
          <Row label="Personal spend" value={formatMoney(s.personalSpendEUR)} />
          <Row label="Team spend" value={formatMoney(s.teamSpendEUR)} />
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
          <Row label="Total spend" value={formatMoney(s.totalSpendEUR)} strong />
        </dl>

        {s.perPerson.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
              Per-person totals
            </summary>
            <ul className="mt-2 space-y-1 tabular-nums">
              {s.perPerson.map((p) => {
                const n = headcountOf(p.teammate);
                return (
                  <li key={p.teammate.id} className="flex justify-between gap-2">
                    <span className="truncate text-neutral-600 dark:text-neutral-400">
                      {p.teammate.name || "Unnamed"}
                      {n > 1 ? <span className="text-neutral-400"> ×{n}</span> : null}
                    </span>
                    <span>{formatMoney(p.totalEUR)}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className={`text-neutral-600 dark:text-neutral-400 ${strong ? "font-medium" : ""}`}>{label}</dt>
      <dd className={strong ? "font-semibold" : ""}>{value}</dd>
    </div>
  );
}
