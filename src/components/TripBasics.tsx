"use client";

import type { Trip } from "@/lib/types";
import { Field, inputClass } from "./Field";
import { AirportInput } from "./AirportInput";
import { formatRange, nightsBetween } from "@/lib/dates";
import { formatMoney } from "@/lib/budget";
import { CalendarDays, MapPin } from "lucide-react";

export function TripBasics({
  trip,
  onChange,
}: {
  trip: Trip;
  onChange: (next: Trip) => void;
}) {
  const set = <K extends keyof Trip>(key: K, value: Trip[K]) =>
    onChange({ ...trip, [key]: value });

  const nights = nightsBetween(trip.startDate, trip.endDate);

  return (
    <section id="trip" className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm border-t-4 border-t-[#F59E0B]">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-[#FEF3C7] dark:bg-[#3a2a05]/60 text-[#B45309] dark:text-[#FBBF24]">
          <MapPin className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Trip</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Name" className="sm:col-span-2">
          <input
            className={inputClass}
            value={trip.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Q3 Engineering Offsite"
          />
        </Field>
        <Field label="Destination city">
          <input
            className={inputClass}
            value={trip.destinationCity}
            onChange={(e) => set("destinationCity", e.target.value)}
            placeholder="Lisbon"
          />
        </Field>
        <Field label="Destination airport" hint="IATA code">
          <AirportInput
            value={trip.destinationAirport}
            onChange={(v) => set("destinationAirport", v)}
            placeholder="LIS"
          />
        </Field>
        <Field label="Arrive">
          <input
            type="date"
            className={inputClass}
            value={trip.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>
        <Field label="Depart">
          <input
            type="date"
            className={inputClass}
            value={trip.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </Field>
        <Field label="Budget per person" hint="Always EUR.">
          <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400">
            <input
              type="number"
              min={0}
              step="100"
              className="flex-1 min-w-0 bg-transparent px-3 text-sm tabular-nums text-right focus:outline-none"
              value={trip.budgetPerPerson}
              onChange={(e) => set("budgetPerPerson", parseFloat(e.target.value) || 0)}
            />
            <span className="grid place-items-center border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              EUR
            </span>
          </div>
        </Field>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatRange(trip.startDate, trip.endDate)} · {nights} night{nights === 1 ? "" : "s"} · Pool {formatMoney(trip.budgetPerPerson * trip.teammates.length)}
      </p>
    </section>
  );
}
