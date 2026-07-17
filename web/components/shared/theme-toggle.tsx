"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Toggle light/dark mode"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "theme-toggle relative flex h-7 w-[54px] shrink-0 cursor-pointer items-center rounded-full border-[1.5px] border-border-subtle bg-surface-elevated p-[3px] transition-[border-color,background] duration-300 hover:border-brand-cyan",
        className,
      )}
    >
      <span className="relative flex h-full w-full items-center">
        <span
          className={cn(
            "absolute left-0 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-accent-lime to-accent-cyan shadow-[0_0_8px_rgba(198,255,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isLight && "translate-x-[26px] from-accent-cyan to-accent-lime shadow-[0_0_8px_rgba(61,232,255,0.5)]",
          )}
        />
        <Sun
          className={cn(
            "absolute left-[5px] size-2.5 text-text-muted transition-opacity duration-300",
            isLight ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
        <Moon
          className={cn(
            "absolute right-[5px] size-2.5 text-text-muted transition-opacity duration-300",
            isLight ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        />
      </span>
    </button>
  );
}
