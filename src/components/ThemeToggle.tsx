"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Light" },
  { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "System" },
  { value: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Dark" },
];

export function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
      {OPTIONS.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={`${label} mode`}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`inline-flex items-center justify-center h-[30px] w-[30px] transition-colors ${
            theme === value
              ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
