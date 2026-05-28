"use client";

import { useEffect, useState } from "react";

// Currencies supported by Frankfurter (ECB-backed). EUR is the base.
export const SUPPORTED_CURRENCIES = [
  "EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD", "NZD",
  "SEK", "NOK", "DKK", "ISK", "PLN", "CZK", "HUF", "RON", "BGN", "TRY",
  "CNY", "HKD", "SGD", "KRW", "INR", "IDR", "THB", "MYR", "PHP", "ZAR",
  "BRL", "MXN", "ILS",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(c: string): c is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(c);
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€", USD: "$", GBP: "£", CHF: "Fr", JPY: "¥", AUD: "A$", CAD: "C$", NZD: "NZ$",
  SEK: "kr", NOK: "kr", DKK: "kr", ISK: "kr", PLN: "zł", CZK: "Kč", HUF: "Ft", RON: "lei", BGN: "лв", TRY: "₺",
  CNY: "¥", HKD: "HK$", SGD: "S$", KRW: "₩", INR: "₹", IDR: "Rp", THB: "฿", MYR: "RM", PHP: "₱", ZAR: "R",
  BRL: "R$", MXN: "Mex$", ILS: "₪",
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

export type RateMap = Record<string, number>; // rate FROM currency TO EUR (1 unit of currency = N EUR)

// Hardcoded starting points so the app never silently treats foreign currency as EUR.
// Replaced by live ECB rates when the Frankfurter request succeeds. These only fill in while
// loading or on failure, so precision is not critical. Ballpark mid-2026 reference rates.
export const FALLBACK_RATES: RateMap = {
  EUR: 1,
  USD: 0.86, GBP: 1.18, CHF: 1.07, JPY: 0.0058, AUD: 0.59, CAD: 0.65, NZD: 0.54,
  SEK: 0.090, NOK: 0.088, DKK: 0.134, ISK: 0.0068, PLN: 0.23, CZK: 0.041,
  HUF: 0.0026, RON: 0.20, BGN: 0.51, TRY: 0.022,
  CNY: 0.12, HKD: 0.11, SGD: 0.66, KRW: 0.00064, INR: 0.010, IDR: 0.000054,
  THB: 0.025, MYR: 0.20, PHP: 0.015, ZAR: 0.047,
  BRL: 0.16, MXN: 0.049, ILS: 0.24,
};

type CachedRates = { date: string; rates: RateMap };

const CACHE_KEY = "offsite-planner.fxrates.v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCache(): CachedRates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rates: RateMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayKey(), rates }));
  } catch {
    // ignore
  }
}

async function fetchRates(): Promise<RateMap> {
  // Frankfurter returns rates with EUR as base: 1 EUR = rate units of currency.
  // We want 1 unit of currency -> EUR, so we invert.
  const symbols = SUPPORTED_CURRENCIES.filter((c) => c !== "EUR").join(",");
  const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${symbols}`);
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  const json = (await res.json()) as { rates: Record<string, number> };
  const out: RateMap = { EUR: 1 };
  for (const [code, rate] of Object.entries(json.rates)) {
    if (rate > 0) out[code] = 1 / rate;
  }
  return out;
}

export type FxState =
  | { status: "loading"; rates: RateMap; refresh: () => void }
  | { status: "ready"; rates: RateMap; asOf: string; refresh: () => void }
  | { status: "error"; rates: RateMap; error: string; refresh: () => void };

export function useFxRates(): FxState {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<FxState>(() => ({
    status: "loading",
    rates: { ...FALLBACK_RATES },
    refresh: () => {},
  }));

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    if (tick === 0) {
      const cached = readCache();
      if (cached) {
        setState({ status: "ready", rates: { ...FALLBACK_RATES, ...cached.rates }, asOf: cached.date, refresh });
        return;
      }
    } else {
      setState((s) => ({ status: "loading", rates: s.rates, refresh }));
    }
    let active = true;
    fetchRates()
      .then((rates) => {
        if (!active) return;
        writeCache(rates);
        setState({ status: "ready", rates: { ...FALLBACK_RATES, ...rates }, asOf: todayKey(), refresh });
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setState({ status: "error", rates: { ...FALLBACK_RATES }, error: msg, refresh });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return state;
}

export function toEUR(amount: number, currency: string, rates: RateMap): number {
  if (!amount) return 0;
  if (currency === "EUR") return amount;
  const rate = rates[currency];
  if (rate == null) return amount; // fallback: assume parity if rate unknown
  return amount * rate;
}

export function mergeOverrides(rates: RateMap, overrides: RateMap | undefined): RateMap {
  if (!overrides) return rates;
  const out: RateMap = { ...rates };
  for (const [code, rate] of Object.entries(overrides)) {
    if (Number.isFinite(rate) && rate > 0) out[code] = rate;
  }
  return out;
}
