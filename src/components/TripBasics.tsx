"use client";

import type { Trip } from "@/lib/types";
import { Field, inputClass } from "./Field";
import { AirportInput } from "./AirportInput";
import { DateInput } from "./DateInput";
import { nightsBetween } from "@/lib/dates";
import { CalendarDays, MapPin, StickyNote } from "lucide-react";

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
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Trip Details</h2>
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
        <Field label="Arrive" hint="YYYY-MM-DD">
          <DateInput
            ariaLabel="Arrival date"
            value={trip.startDate}
            onChange={(v) => set("startDate", v)}
          />
        </Field>
        <Field label="Depart" hint="YYYY-MM-DD">
          <DateInput
            ariaLabel="Departure date"
            value={trip.endDate}
            onChange={(v) => set("endDate", v)}
          />
        </Field>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Duration
          </span>
          <span className="h-9 inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 text-xs font-medium tabular-nums text-neutral-700 dark:text-neutral-300 shadow-xs">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
            {nights} night{nights === 1 ? "" : "s"}
          </span>
        </div>
        <Field label="Budget per person" hint="Always EUR.">
          <div className="flex h-9 items-stretch overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400">
            <input
              type="text"
              inputMode="numeric"
              className="flex-1 min-w-0 bg-transparent px-3 text-xs tabular-nums text-right focus:outline-none"
              value={trip.budgetPerPerson.toLocaleString("en-US")}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d]/g, "");
                set("budgetPerPerson", cleaned === "" ? 0 : parseInt(cleaned, 10));
              }}
            />
            <span className="grid place-items-center border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 text-[10px] font-medium text-neutral-700 dark:text-neutral-300">
              EUR
            </span>
          </div>
        </Field>
      </div>
      <div className="mt-5 pt-5 border-t border-neutral-200/60 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 mb-2">
          <StickyNote className="h-3.5 w-3.5 text-[#A16207] dark:text-[#FDE047]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Notes
          </span>
          <span className="text-[11px] text-neutral-500 ml-auto">
            {(trip.notes ?? "").length ? `${(trip.notes ?? "").length} chars` : "saved with export"}
          </span>
        </div>
        <textarea
          value={trip.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder="Anything the next planner should know: hotel block code, dietary considerations, links, why this venue, etc."
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm leading-relaxed shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y"
        />
      </div>
    </section>
  );
}
