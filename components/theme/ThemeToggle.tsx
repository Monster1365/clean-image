"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "라이트 모드", Icon: Sun },
  { value: "dark", label: "다크 모드", Icon: Moon },
  { value: "system", label: "시스템 설정", Icon: Monitor },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  return (
    <div
      role="radiogroup"
      aria-label="테마 선택"
      className="inline-flex items-center gap-0.5 rounded-md border border-border p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => applyTheme(value)}
            className={`grid size-7 cursor-pointer place-items-center rounded-sm transition-colors ${
              active
                ? "bg-surface-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/** Inline script for <head>: applies the saved theme before first paint. */
export const themeInitScript = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
