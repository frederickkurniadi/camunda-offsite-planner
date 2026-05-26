"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Briefcase,
  Wallet,
  ArrowLeftRight,
  ChevronLeft,
  Menu,
  StickyNote,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  icon: typeof MapPin;
  color: string;
};

const ITEMS: Item[] = [
  { id: "trip", label: "Trip", icon: MapPin, color: "#F59E0B" },
  { id: "teammates", label: "Teammates", icon: Users, color: "#FC5D0D" },
  { id: "team-costs", label: "Team-wide costs", icon: Briefcase, color: "#F43F5E" },
  { id: "notes", label: "Notes", icon: StickyNote, color: "#EAB308" },
  { id: "summary", label: "Summary", icon: Wallet, color: "#FC5D0D" },
  { id: "fx-rates", label: "FX rates", icon: ArrowLeftRight, color: "#D97706" },
];

const STORAGE_KEY = "offsite-planner.sectionnav.open.v1";

export function SectionNav() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState<string>("trip");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) setOpen(raw === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      // ignore
    }
  }, [hydrated, open]);

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Show section menu"
        aria-label="Show section menu"
        className="hidden lg:grid fixed top-20 left-3 z-20 place-items-center h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <Menu className="h-4 w-4" />
      </button>
    );
  }

  return (
    <nav
      aria-label="Sections"
      className="hidden lg:flex fixed top-20 left-3 z-20 flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur shadow-sm p-2 w-44"
    >
      <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-neutral-200/60 dark:border-neutral-800">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
          Jump to
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          title="Hide menu"
          aria-label="Hide menu"
          className="grid place-items-center h-6 w-6 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="space-y-0.5">
        {ITEMS.map(({ id, label, icon: Icon, color }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => jumpTo(id)}
                className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                <span
                  className="grid place-items-center h-5 w-5 rounded"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
