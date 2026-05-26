"use client";

import { useId } from "react";
import { AIRPORTS, findAirport } from "@/lib/airports";
import { inputClass } from "./Field";

export function AirportInput({
  value,
  onChange,
  placeholder = "BER",
  className = "",
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}) {
  const listId = useId();
  const upper = value.toUpperCase();
  const match = findAirport(upper);

  if (compact) {
    return (
      <>
        <input
          list={listId}
          className={`h-8 w-16 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 text-sm font-medium text-center uppercase tabular-nums shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ${className}`}
          value={value}
          maxLength={3}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          title={upper.length === 3 ? (match ? `${match.city} · ${match.name}, ${match.country}` : "Unknown IATA") : "3-letter IATA"}
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 3))}
        />
        <datalist id={listId}>
          {AIRPORTS.map((a) => (
            <option key={a.iata} value={a.iata}>
              {a.city} — {a.name} ({a.country})
            </option>
          ))}
        </datalist>
      </>
    );
  }

  return (
    <div className="space-y-1">
      <input
        list={listId}
        className={`${inputClass} uppercase ${className}`}
        value={value}
        maxLength={3}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 3))}
      />
      <datalist id={listId}>
        {AIRPORTS.map((a) => (
          <option key={a.iata} value={a.iata}>
            {a.city} — {a.name} ({a.country})
          </option>
        ))}
      </datalist>
      {upper.length === 3 ? (
        <p className="text-[11px] text-neutral-500 truncate">
          {match ? `${match.city} · ${match.name}, ${match.country}` : "Unknown IATA — using as entered."}
        </p>
      ) : null}
    </div>
  );
}
