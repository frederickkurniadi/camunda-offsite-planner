"use client";

import { useEffect, useRef } from "react";
import type { Money, Teammate, Trip } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";
import { AirportInput } from "./AirportInput";
import { breakdownFor, formatMoney, headcountOf } from "@/lib/budget";
import { Plane, BedDouble, UtensilsCrossed, Trash2, Minus, Plus, ExternalLink, PlaneTakeoff } from "lucide-react";

type Rates = Record<string, number>;

function googleFlightsUrl(from: string, to: string, depart: string, ret: string): string {
  const q = `Flights to ${to} from ${from} on ${depart} through ${ret}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export function TeammateCard({
  trip,
  teammate,
  rates,
  onChange,
  onRemove,
}: {
  trip: Trip;
  teammate: Teammate;
  rates: Rates;
  onChange: (next: Teammate) => void;
  onRemove: () => void;
}) {
  const bd = breakdownFor(teammate, rates);
  const count = headcountOf(teammate);
  const canLookup =
    teammate.homeAirport.length === 3 &&
    trip.destinationAirport.length === 3 &&
    trip.startDate &&
    trip.endDate;

  const setField = <K extends keyof Teammate>(key: K, value: Teammate[K]) =>
    onChange({ ...teammate, [key]: value });

  const setMoney = (key: "travel" | "lodging" | "food") => (next: Money) =>
    setField(key, next);

  const setHeadcount = (n: number) => setField("headcount", Math.max(1, Math.floor(n)));

  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!teammate.name) nameRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="group rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
      <div className="px-4 py-3 space-y-2.5">
        {/* Row 1: identity */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative grid place-items-center h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#FFE2CC] to-[#FFC499] dark:from-[#3a1d05] dark:to-[#5c2a0a] text-[#FC5D0D] font-semibold text-sm">
            {(teammate.name || "?").charAt(0).toUpperCase()}
            {count > 1 ? (
              <span className="absolute -bottom-1 -right-1 grid place-items-center h-4 min-w-4 px-1 rounded-full bg-[#FC5D0D] text-white text-[9px] font-semibold ring-2 ring-white dark:ring-neutral-900">
                ×{count}
              </span>
            ) : null}
          </span>

          <input
            ref={nameRef}
            className="flex-1 min-w-[140px] bg-transparent px-2 py-1 text-sm font-semibold rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/30"
            value={teammate.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Name or nickname"
          />

          <div className="flex items-center gap-1 shrink-0">
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold"
              title="Home airport (3-letter IATA)"
            >
              <PlaneTakeoff className="h-3 w-3" />
              Airport
            </span>
            <AirportInput
              compact
              value={teammate.homeAirport}
              onChange={(v) => setField("homeAirport", v)}
              placeholder="ORG"
            />
            {canLookup ? (
              <a
                href={googleFlightsUrl(teammate.homeAirport, trip.destinationAirport, trip.startDate, trip.endDate)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Google Flights ${teammate.homeAirport} → ${trip.destinationAirport}`}
                className="grid place-items-center h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>

          <div
            className="inline-flex items-center shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs"
            title="People in this entry"
          >
            <button
              type="button"
              onClick={() => setHeadcount(count - 1)}
              disabled={count <= 1}
              className="grid place-items-center h-8 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease headcount"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              min={1}
              step={1}
              value={count}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setHeadcount(Number.isFinite(v) ? v : 1);
              }}
              className="w-8 h-8 bg-transparent text-center text-xs font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="People in this entry"
            />
            <button
              type="button"
              onClick={() => setHeadcount(count + 1)}
              className="grid place-items-center h-8 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              aria-label="Increase headcount"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span
            className="text-sm font-bold tabular-nums text-[#FC5D0D] min-w-[80px] text-right shrink-0"
            title={`Travel ${formatMoney(bd.travelEUR)} · Lodging ${formatMoney(bd.lodgingEUR)} · Food ${formatMoney(bd.foodEUR)}`}
          >
            {formatMoney(bd.totalEUR)}
          </span>

          <button
            type="button"
            onClick={onRemove}
            className="opacity-50 group-hover:opacity-100 transition-opacity grid place-items-center h-8 w-8 rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
            title="Remove teammate"
            aria-label="Remove teammate"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: costs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-11">
          <CostField icon={<Plane className="h-3 w-3" />} label="Travel" perPerson={count > 1}>
            <MoneyInput dense value={teammate.travel} onChange={setMoney("travel")} />
          </CostField>
          <CostField icon={<BedDouble className="h-3 w-3" />} label="Lodging" perPerson={count > 1}>
            <MoneyInput dense value={teammate.lodging} onChange={setMoney("lodging")} />
          </CostField>
          <CostField icon={<UtensilsCrossed className="h-3 w-3" />} label="Food" perPerson={count > 1}>
            <MoneyInput dense value={teammate.food} onChange={setMoney("food")} />
          </CostField>
        </div>
      </div>
    </div>
  );
}

function CostField({
  icon,
  label,
  perPerson,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  perPerson: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 min-w-0">
      <span
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold shrink-0 w-14"
        title={perPerson ? `${label} (per person)` : label}
      >
        {icon}
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </label>
  );
}
