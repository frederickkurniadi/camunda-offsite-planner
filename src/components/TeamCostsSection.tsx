"use client";

import type { Money, TeamCosts, Trip } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";
import { TEAM_FIELDS } from "@/lib/defaults";
import { toEUR, type RateMap } from "@/lib/fx";
import { formatMoney } from "@/lib/budget";
import { Users } from "lucide-react";

export function TeamCostsSection({
  trip,
  rates,
  onChange,
}: {
  trip: Trip;
  rates: RateMap;
  onChange: (next: TeamCosts) => void;
}) {
  const setMoney = (key: keyof TeamCosts) => (next: Money) =>
    onChange({ ...trip.teamCosts, [key]: next });

  return (
    <section id="team-costs" className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm border-t-4 border-t-[#F43F5E]">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-[#FFE4E6] dark:bg-[#3a0510]/60 text-[#E11D48] dark:text-[#FB7185]">
          <Users className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Team-Wide Expenses</h2>
        <span className="text-[11px] text-neutral-500 ml-auto">Totals, not per-person</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
        {TEAM_FIELDS.map((f) => {
          const money = trip.teamCosts[f.key];
          const showEur = money.currency !== "EUR" && money.amount > 0;
          const eur = showEur ? toEUR(money.amount, money.currency, rates) : 0;
          return (
            <label key={f.key} className="flex flex-col gap-1 min-w-0">
              <span
                className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold"
                title={f.hint}
              >
                {f.label}
              </span>
              <MoneyInput dense value={money} onChange={setMoney(f.key)} />
              {showEur ? (
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 tabular-nums leading-snug">
                  ≈ {formatMoney(eur)}
                </span>
              ) : null}
              {f.hint ? (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-snug">
                  {f.hint}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </section>
  );
}
