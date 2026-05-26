import { differenceInCalendarDays, addDays, addMonths, startOfMonth, format, parseISO, isValid } from "date-fns";

export function defaultTripDates(today: Date = new Date()): { startDate: string; endDate: string } {
  // First day of the month, two months from now (e.g. May → July 1).
  const start = startOfMonth(addMonths(today, 2));
  const end = addDays(start, 3);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function parseISODate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

export function nightsBetween(arrival: string, departure: string): number {
  const a = parseISODate(arrival);
  const d = parseISODate(departure);
  if (!a || !d) return 0;
  const n = differenceInCalendarDays(d, a);
  return n > 0 ? n : 0;
}

export function formatRange(start: string, end: string): string {
  const a = parseISODate(start);
  const b = parseISODate(end);
  if (!a || !b) return `${start} – ${end}`;
  return `${format(a, "yyyy-MM-dd")} – ${format(b, "yyyy-MM-dd")}`;
}
