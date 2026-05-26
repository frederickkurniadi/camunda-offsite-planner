"use client";

import type { Trip } from "@/lib/types";
import { StickyNote } from "lucide-react";

export function NotesSection({
  trip,
  onChange,
}: {
  trip: Trip;
  onChange: (next: Trip) => void;
}) {
  const value = trip.notes ?? "";

  return (
    <section
      id="notes"
      className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm border-t-4 border-t-[#EAB308]"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-[#FEF9C3] dark:bg-[#3a2e05]/60 text-[#A16207] dark:text-[#FDE047]">
          <StickyNote className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Notes</h2>
        <span className="text-xs text-neutral-500 ml-auto">
          Saved with export · {value.length ? `${value.length} chars` : "empty"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange({ ...trip, notes: e.target.value })}
        rows={5}
        placeholder="Anything the next planner should know — hotel block code, dietary considerations, links, why this venue, etc."
        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm leading-relaxed shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y"
      />
    </section>
  );
}
