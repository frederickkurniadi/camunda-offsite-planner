"use client";

import type { Trip } from "@/lib/types";
import type { FxState, RateMap } from "@/lib/fx";
import { FALLBACK_RATES, currencySymbol } from "@/lib/fx";
import { ArrowLeftRight, Loader2, RotateCcw, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

function currenciesInUse(trip: Trip): string[] {
  const set = new Set<string>();
  for (const t of trip.teammates) {
    set.add(t.travel.currency);
    set.add(t.lodging.currency);
    set.add(t.food.currency);
  }
  const tc = trip.teamCosts;
  set.add(tc.groupActivity.currency);
  set.add(tc.specialDinner.currency);
  set.add(tc.meetingRoom.currency);
  set.add(tc.misc.currency);
  set.delete("EUR"); // EUR is the base, no rate to show
  return Array.from(set).sort();
}

function sourceFor(
  code: string,
  fx: FxState,
  overrides: RateMap | undefined,
): { label: string; tone: "override" | "live" | "fallback" } {
  if (overrides && overrides[code] != null) return { label: "override", tone: "override" };
  if (fx.status === "ready" && fx.rates[code] != null) return { label: "live", tone: "live" };
  return { label: "fallback", tone: "fallback" };
}

export function FxRatesPanel({
  trip,
  fx,
  onChange,
}: {
  trip: Trip;
  fx: FxState;
  onChange: (next: Trip) => void;
}) {
  const codes = currenciesInUse(trip);
  const overrides = trip.fxOverrides;

  function setOverride(code: string, value: number | null) {
    const next: Record<string, number> = { ...(overrides ?? {}) };
    if (value == null || !Number.isFinite(value) || value <= 0) {
      delete next[code];
    } else {
      next[code] = value;
    }
    onChange({ ...trip, fxOverrides: Object.keys(next).length ? next : undefined });
  }

  return (
    <section id="fx-rates" className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden border-t-4 border-t-[#D97706]">
      <div className="px-5 pt-4 pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <ArrowLeftRight className="h-4 w-4 text-[#D97706]" />
          FX Rates
          {fx.status === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin text-neutral-400 ml-1" />
          ) : null}
          <button
            type="button"
            onClick={fx.refresh}
            disabled={fx.status === "loading"}
            title="Re-fetch live ECB rates"
            aria-label="Refresh rates"
            className="ml-auto grid place-items-center h-6 w-6 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3 w-3 ${fx.status === "loading" ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500 mt-1">
          Edit the value if today&apos;s live rate isn&apos;t quite right.
        </p>
      </div>

      <div className="px-5 py-3 space-y-2">
        {codes.length === 0 ? (
          <p className="text-xs text-neutral-500 py-1">
            All amounts are in EUR. No conversion needed.
          </p>
        ) : (
          codes.map((code) => {
            const rate = (overrides && overrides[code]) ?? fx.rates[code] ?? FALLBACK_RATES[code] ?? 1;
            const src = sourceFor(code, fx, overrides);
            return (
              <div key={code} className="flex items-center gap-2 text-sm tabular-nums">
                <span className="w-14 font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="text-neutral-400 mr-0.5">{currencySymbol(code)}</span>
                  {code}
                </span>
                <span className="text-xs text-neutral-500">1 {currencySymbol(code)} =</span>
                <input
                  type="number"
                  min={0}
                  step="0.0001"
                  inputMode="decimal"
                  value={Number.isFinite(rate) ? rate : 0}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setOverride(code, Number.isFinite(v) ? v : null);
                  }}
                  className="flex-1 min-w-0 h-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2 text-right text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                />
                <span className="text-xs text-neutral-500">€</span>
                <SourceBadge tone={src.tone} label={src.label} />
                {src.tone === "override" ? (
                  <button
                    type="button"
                    onClick={() => setOverride(code, null)}
                    title="Reset to live/fallback"
                    aria-label={`Reset ${code} override`}
                    className="grid place-items-center h-6 w-6 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="w-6" />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 pb-3">
        <FxFooter fx={fx} />
      </div>
    </section>
  );
}

function SourceBadge({ tone, label }: { tone: "override" | "live" | "fallback"; label: string }) {
  const cls =
    tone === "override"
      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
      : tone === "live"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
  return (
    <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${cls}`}>
      {label}
    </span>
  );
}

function FxFooter({ fx }: { fx: FxState }) {
  if (fx.status === "loading") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading live rates…
      </div>
    );
  }
  if (fx.status === "error") {
    return (
      <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3 mt-0.5" />
        <span>Couldn&apos;t reach ECB. Using hardcoded fallbacks. Edit any row to override.</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> ECB rates as of {fx.asOf}
    </div>
  );
}
