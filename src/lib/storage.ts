"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip } from "./types";
import { newTrip, emptyTeamCosts } from "./defaults";

const STORAGE_KEY = "offsite-planner.trip.v3";

// Stable placeholder with no random values — safe for SSR initial state.
const PLACEHOLDER_TRIP: Trip = {
  id: "",
  name: "Team Offsite",
  destinationCity: "",
  destinationAirport: "",
  startDate: "",
  endDate: "",
  budgetPerPerson: 2000,
  teammates: [],
  teamCosts: emptyTeamCosts(),
  notes: "",
};

export function useTrip(): {
  trip: Trip;
  setTrip: (t: Trip | ((prev: Trip) => Trip)) => void;
  hydrated: boolean;
  resetTrip: () => void;
} {
  const [trip, setTripState] = useState<Trip>(PLACEHOLDER_TRIP);
  const [hydrated, setHydrated] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    let initial = newTrip();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trip;
        if (isValidTrip(parsed)) {
          initial = parsed;
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setTripState(initial);
    setHydrated(true);
    ready.current = true;
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch {
      // quota / private mode. Silently skip.
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
