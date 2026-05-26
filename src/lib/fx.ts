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
// Replaced by live ECB rates when the Frankfurter request succeeds.
// Roughly ECB reference rates; precision doesn't matter — these only fill in while loading or on failure.
export const FALLBACK_RATES: RateMap = {
  EUR: 1,
  USD: 0.92, GBP: 1.17, CHF: 1.04, JPY: 0.0061, AUD: 0.61, CAD: 0.68, NZD: 0.56,
  SEK: 0.087, NOK: 0.086, DKK: 0.134, ISK: 0.0066, PLN: 0.23, CZK: 0.040,
  HUF: 0.0026, RON: 0.20, BGN: 0.51, TRY: 0.028,
  CNY: 0.13, HKD: 0.12, SGD: 0.69, KRW: 0.00068, INR: 0.011, IDR: 0.000058,
  THB: 0.026, MYR: 0.20, PHP: 0.016, ZAR: 0.049,
  BRL: 0.18, MXN: 0.054, ILS: 0.25,
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
  | { status: "loading"; rates: RateMap }
  | { status: "ready"; rates: RateMap; asOf: string }
  | { status: "error"; rates: RateMap; error: string };

export function useFxRates(): FxState {
  const [state, setState] = useState<FxState>(() => {
    const cached = readCache();
    if (cached) return { status: "ready", rates: { ...FALLBACK_RATES, ...cached.rates }, asOf: cached.date };
    return { status: "loading", rates: { ...FALLBACK_RATES } };
  });

  useEffect(() => {
    if (state.status === "ready") return;
    let active = true;
    fetchRates()
      .then((rates) => {
        if (!active) return;
        writeCache(rates);
        setState({ status: "ready", rates: { ...FALLBACK_RATES, ...rates }, asOf: todayKey() });
      })
      .catch((e: unknown) => {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setState({ status: "error", rates: { ...FALLBACK_RATES }, error: msg });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
