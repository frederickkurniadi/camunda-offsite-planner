"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function DateInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const valid = !value || ISO_RE.test(value);

  return (
    <div
      className={`flex h-9 items-stretch overflow-hidden rounded-lg border bg-white dark:bg-neutral-900 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 ${
        valid
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-red-400 dark:border-red-500"
      }`}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{4}-\d{2}-\d{2}"
        placeholder="YYYY-MM-DD"
        aria-label={ariaLabel}
        className="flex-1 min-w-0 bg-transparent px-3 text-xs tabular-nums focus:outline-none placeholder:text-neutral-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.()}
        title="Pick a date"
        aria-label="Pick a date"
        className="grid place-items-center border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <CalendarDays className="h-3.5 w-3.5" />
      </button>
      <input
        ref={pickerRef}
        type="date"
        value={ISO_RE.test(value) ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
    </div>
  );
}
