"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: ReactNode;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {children}
      {hint ? <span className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-snug">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs shadow-xs transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400";
