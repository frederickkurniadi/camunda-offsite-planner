"use client";

import { useMemo, useRef } from "react";
import { useTrip, exportTripJSON, importTripJSON } from "@/lib/storage";
import { useFxRates, mergeOverrides } from "@/lib/fx";
import { headcountOf } from "@/lib/budget";
import { newTeammate } from "@/lib/defaults";
import { TripBasics } from "./TripBasics";
import { TeammateCard, TeammateRowHeader } from "./TeammateCard";
import { TeamCostsSection } from "./TeamCostsSection";
import { Summary } from "./Summary";
import { FxRatesPanel } from "./FxRatesPanel";
import { BudgetPill } from "./BudgetPill";
import { Instructions } from "./Instructions";
import { Plane, Download, Upload, RotateCcw, UserPlus, Users } from "lucide-react";

export default function Planner() {
  const { trip, setTrip, hydrated, resetTrip } = useTrip();
  const fx = useFxRates();
  const effectiveRates = useMemo(
    () => mergeOverrides(fx.rates, trip.fxOverrides),
    [fx.rates, trip.fxOverrides],
  );
  const fileInput = useRef<HTMLInputElement>(null);

  function addTeammate() {
    setTrip((prev) => ({ ...prev, teammates: [...prev.teammates, newTeammate()] }));
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importTripJSON(file);
      setTrip(imported);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      <header className="border-b border-neutral-200/60 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#FC5D0D] to-[#FF8C42] text-white shadow-sm">
              <Plane className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-none">Camunda Offsite Planner</h1>
              <p className="text-[11px] text-neutral-500 mt-0.5">Plan team offsites against a per-person EUR budget. DRI: FP&amp;A</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {hydrated ? <BudgetPill trip={trip} rates={effectiveRates} /> : null}
            <div className="flex items-center gap-1.5">
              <ToolbarButton onClick={() => exportTripJSON(trip)} icon={<Download className="h-3.5 w-3.5" />} label="Export" />
              <ToolbarButton onClick={() => fileInput.current?.click()} icon={<Upload className="h-3.5 w-3.5" />} label="Import" />
              <input
                ref={fileInput}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImport}
              />
              <ToolbarButton
                onClick={() => {
                  if (confirm("Reset all data? This clears the saved trip.")) resetTrip();
                }}
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                label="Reset"
                danger
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {!hydrated ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-6 min-w-0">
              <Instructions />
              <TripBasics trip={trip} onChange={setTrip} />

              <section id="teammates" className="scroll-mt-24 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm border-t-4 border-t-[#FC5D0D]">
                <div className="flex items-center gap-2 mb-5">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-[#FFE2CC] dark:bg-[#3a1d05]/60 text-[#FC5D0D]">
                    <Users className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Teammates
                    <span className="ml-1.5 text-neutral-400 font-normal">
                      ({trip.teammates.reduce((s, t) => s + headcountOf(t), 0)})
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={addTeammate}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium px-3 py-1.5 hover:bg-neutral-800 dark:hover:bg-white shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add teammate
                  </button>
                </div>
                {trip.teammates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
                    <p className="text-sm text-neutral-500">No teammates yet.</p>
                    <button
                      type="button"
                      onClick={addTeammate}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium px-3 py-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Add the first one
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <div className="min-w-[680px] px-1 space-y-1">
                      <TeammateRowHeader />
                      {trip.teammates.map((t) => (
                        <TeammateCard
                          key={t.id}
                          trip={trip}
                          teammate={t}
                          rates={effectiveRates}
                          onChange={(next) =>
                            setTrip((prev) => ({
                              ...prev,
                              teammates: prev.teammates.map((x) => (x.id === t.id ? next : x)),
                            }))
                          }
                          onRemove={() => {
                            if (confirm(`Remove ${t.name || "this teammate"}?`)) {
                              setTrip((prev) => ({
                                ...prev,
                                teammates: prev.teammates.filter((x) => x.id !== t.id),
                              }));
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <TeamCostsSection
                trip={trip}
                rates={effectiveRates}
                onChange={(next) => setTrip((prev) => ({ ...prev, teamCosts: next }))}
              />
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
              <Summary trip={trip} rates={effectiveRates} />
              <FxRatesPanel trip={trip} fx={fx} onChange={setTrip} />
            </aside>
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-neutral-200/60 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-[11px] text-neutral-500">
          &copy; 2026 FK | FP&amp;A. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon,
  label,
  danger = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium px-2.5 py-1.5 shadow-xs transition-colors ${
        danger
          ? "hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-800"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
