"use client";

import type { Money, TeamCosts, Trip } from "@/lib/types";
import { Field } from "./Field";
import { MoneyInput } from "./MoneyInput";
import { TEAM_FIELDS } from "@/lib/defaults";
import { Users } from "lucide-react";

export function TeamCostsSection({
  trip,
  onChange,
}: {
  trip: Trip;
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
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Team-wide costs</h2>
        <span className="text-xs text-neutral-500 ml-auto">Totals, not per-person</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEAM_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            <MoneyInput value={trip.teamCosts[f.key]} onChange={setMoney(f.key)} />
          </Field>
        ))}
      </div>
    </section>
  );
}
