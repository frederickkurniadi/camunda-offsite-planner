"use client";

import { useEffect, useRef } from "react";
import type { Money, Teammate, Trip } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";
import { AirportInput } from "./AirportInput";
import { breakdownFor, formatMoney, headcountOf } from "@/lib/budget";
import { SUPPORTED_CURRENCIES, currencySymbol } from "@/lib/fx";
import { Trash2, Minus, Plus, Plane } from "lucide-react";

type Rates = Record<string, number>;

function googleFlightsUrl(from: string, to: string, depart: string, ret: string): string {
  const q = `Round trip flights from ${from} to ${to} on ${depart} returning ${ret}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export const TEAMMATE_GRID_COLS =
  "grid-cols-[minmax(0,1.4fr)_72px_96px_68px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_76px_22px]";

export function TeammateRowHeader() {
  return (
    <div
      className={`grid ${TEAMMATE_GRID_COLS} gap-1.5 px-2 pb-1.5 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold`}
    >
      <span>Name</span>
      <span className="text-center"># People</span>
      <span>Airport</span>
      <span>Currency</span>
      <span>Travel</span>
      <span>Lodging</span>
      <span>Food</span>
      <span className="text-right">Total (EUR)</span>
      <span />
    </div>
  );
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

  // Single currency per teammate. All three cost fields share it.
  const currency = teammate.travel.currency;
  const setCurrency = (next: string) =>
    onChange({
      ...teammate,
      travel: { ...teammate.travel, currency: next },
      lodging: { ...teammate.lodging, currency: next },
      food: { ...teammate.food, currency: next },
    });

  const setHeadcount = (n: number) => setField("headcount", Math.max(1, Math.floor(n)));

  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!teammate.name) nameRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`group grid ${TEAMMATE_GRID_COLS} items-center gap-1.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1.5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors`}
    >
      {/* Name + avatar */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="relative grid place-items-center h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#FFE2CC] to-[#FFC499] dark:from-[#3a1d05] dark:to-[#5c2a0a] text-[#FC5D0D] font-semibold text-[11px]">
          {(teammate.name || "?").charAt(0).toUpperCase()}
          {count > 1 ? (
            <span className="absolute -bottom-1 -right-1 grid place-items-center h-3 min-w-3 px-0.5 rounded-full bg-[#FC5D0D] text-white text-[7px] font-semibold ring-2 ring-white dark:ring-neutral-900">
              ×{count}
            </span>
          ) : null}
        </span>
        <input
          ref={nameRef}
          className="flex-1 min-w-0 bg-transparent px-1 py-0.5 text-[11px] font-medium rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/30"
          value={teammate.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Name"
        />
      </div>

      {/* Headcount */}
      <div className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs h-7">
        <button
          type="button"
          onClick={() => setHeadcount(count - 1)}
          disabled={count <= 1}
          className="grid place-items-center h-7 w-5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease headcount"
        >
          <Minus className="h-2.5 w-2.5" />
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
          className="w-6 h-7 bg-transparent text-center text-[11px] font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="People in this entry"
        />
        <button
          type="button"
          onClick={() => setHeadcount(count + 1)}
          className="grid place-items-center h-7 w-5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          aria-label="Increase headcount"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Airport + Google Flights lookup */}
      <div className="flex items-center gap-1 min-w-0">
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
            title={`Search Google Flights · ${teammate.homeAirport} ⇄ ${trip.destinationAirport} · ${trip.startDate} → ${trip.endDate}`}
            className="grid place-items-center h-7 w-7 rounded-md border border-[#FC5D0D]/30 bg-[#FFF1E6] dark:bg-[#3a1d05]/40 text-[#FC5D0D] hover:bg-[#FFE2CC] dark:hover:bg-[#5c2a0a]/60 shadow-xs transition-colors"
          >
            <Plane className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span
            title="Fill in home airport, destination airport, and dates to enable flight search"
            className="grid place-items-center h-7 w-7 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
            aria-disabled
          >
            <Plane className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Currency */}
      <select
        aria-label="Currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="h-7 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer tabular-nums"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {currencySymbol(c)} {c}
          </option>
        ))}
      </select>

      {/* Travel / Lodging / Food (currency is shared) */}
      <MoneyInput dense hideCurrency value={teammate.travel} onChange={setMoney("travel")} />
      <MoneyInput dense hideCurrency value={teammate.lodging} onChange={setMoney("lodging")} />
      <MoneyInput dense hideCurrency value={teammate.food} onChange={setMoney("food")} />

      {/* Total */}
      <span
        className="text-[11px] font-semibold tabular-nums text-[#FC5D0D] text-right truncate"
        title={`Travel ${formatMoney(bd.travelEUR)} · Lodging ${formatMoney(bd.lodgingEUR)} · Food ${formatMoney(bd.foodEUR)}`}
      >
        {formatMoney(bd.totalEUR)}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-50 group-hover:opacity-100 transition-opacity grid place-items-center h-6 w-6 rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
        title="Remove teammate"
        aria-label="Remove teammate"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
