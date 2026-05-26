import { differenceInCalendarDays, nextMonday, addDays, format, parseISO, isValid } from "date-fns";

export function defaultTripDates(today: Date = new Date()): { startDate: string; endDate: string } {
  const monday = nextMonday(today);
  const thursday = addDays(monday, 3);
  return { startDate: toISODate(monday), endDate: toISODate(thursday) };
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
  return `${format(a, "EEE d MMM")} – ${format(b, "EEE d MMM yyyy")}`;
}
