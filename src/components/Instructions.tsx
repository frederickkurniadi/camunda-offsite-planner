"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "offsite-planner.instructions.dismissed.v1";

export function Instructions() {
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  if (!hydrated || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <aside className="rounded-2xl border border-[#FC5D0D]/30 bg-gradient-to-br from-[#FFF1E6] to-[#FFE2CC] dark:from-[#3a1d05]/40 dark:to-[#5c2a0a]/40 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-white/70 dark:bg-neutral-900/40 text-[#FC5D0D]">
          <Info className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0 text-sm text-neutral-700 dark:text-neutral-200">
          <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            How to use this planner
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-[13px] leading-relaxed">
            <li>Fill in the trip basics — destination, dates, and per-person EUR budget.</li>
            <li>Add a row per teammate (or per city — use ×N for multiple people from the same origin). Type costs in any currency.</li>
            <li>Add team-wide costs that aren&apos;t per-person (group activity, dinner, meeting room).</li>
            <li>Check the budget pill in the top bar — it stays green while you&apos;re under and turns red when over.</li>
            <li>Use <strong>Export</strong> to share a JSON snapshot; the next person can <strong>Import</strong> it.</li>
          </ol>
        </div>
        <button
          type="button"
          onClick={dismiss}
          title="Dismiss"
          aria-label="Dismiss instructions"
          className="grid place-items-center h-7 w-7 shrink-0 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
