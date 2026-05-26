"use client";

import type { Money } from "@/lib/types";
import { SUPPORTED_CURRENCIES, currencySymbol } from "@/lib/fx";

export function MoneyInput({
  value,
  onChange,
  className = "",
  dense = false,
  hideCurrency = false,
}: {
  value: Money;
  onChange: (next: Money) => void;
  className?: string;
  dense?: boolean;
  hideCurrency?: boolean;
}) {
  const h = dense ? "h-7" : "h-9";
  const text = dense ? "text-[11px]" : "text-xs";
  const symbolBox = dense ? "min-w-4 px-1 text-[10px]" : "min-w-7 px-2 text-xs";
  const selectBox = dense ? "px-1 text-[10px]" : "px-2 text-xs";
  return (
    <div
      className={`flex ${h} items-stretch overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 ${className}`}
    >
      <span
        aria-hidden
        className={`grid place-items-center ${symbolBox} font-medium text-neutral-500 dark:text-neutral-400 select-none`}
      >
        {currencySymbol(value.currency)}
      </span>
      <input
        type="number"
        min={0}
        step="1"
        inputMode="decimal"
        className={`flex-1 min-w-0 bg-transparent pl-1 pr-2 ${text} tabular-nums text-right focus:outline-none`}
        value={Number.isFinite(value.amount) ? value.amount : 0}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange({ ...value, amount: Number.isFinite(v) ? v : 0 });
        }}
      />
      {hideCurrency ? null : (
        <select
          aria-label="Currency"
          value={value.currency}
          onChange={(e) => onChange({ ...value, currency: e.target.value })}
          className={`border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 ${selectBox} font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer`}
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {currencySymbol(c)} {c}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
