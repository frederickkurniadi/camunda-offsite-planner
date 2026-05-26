"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip } from "./types";
import { newTrip } from "./defaults";

const STORAGE_KEY = "offsite-planner.trip.v3";

export function useTrip(): {
  trip: Trip;
  setTrip: (t: Trip | ((prev: Trip) => Trip)) => void;
  hydrated: boolean;
  resetTrip: () => void;
} {
  const [trip, setTripState] = useState<Trip>(() => newTrip());
  const [hydrated, setHydrated] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trip;
        if (isValidTrip(parsed)) {
          setTripState(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch {
      // quota / private mode — silently skip
    }
  }, [trip]);

  function setTrip(t: Trip | ((prev: Trip) => Trip)) {
    setTripState((prev) => (typeof t === "function" ? (t as (p: Trip) => Trip)(prev) : t));
  }

  function resetTrip() {
    setTripState(newTrip());
  }

  return { trip, setTrip, hydrated, resetTrip };
}

export function exportTripJSON(trip: Trip): void {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (trip.name || "offsite").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
  a.href = url;
  a.download = `${safeName}-${trip.startDate}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importTripJSON(file: File): Promise<Trip> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Trip;
  if (!isValidTrip(parsed)) {
    throw new Error("File doesn't look like an offsite-planner trip (current schema).");
  }
  return parsed;
}

function isValidTrip(v: unknown): v is Trip {
  if (!v || typeof v !== "object") return false;
  const t = v as Trip;
  if (!Array.isArray(t.teammates) || !t.teamCosts) return false;
  const sampleOk =
    t.teammates.length === 0 ||
    (typeof t.teammates[0]?.travel === "object" && t.teammates[0]?.travel?.currency !== undefined);
  return sampleOk;
}
