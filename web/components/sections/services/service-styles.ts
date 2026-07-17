import type { ServiceAccent } from "@/lib/services";
import { cn } from "@/lib/utils";

export const accentStyles: Record<
  ServiceAccent,
  { ring: string; bg: string; text: string; dot: string }
> = {
  cyan: {
    ring: "ring-accent-cyan/40",
    bg: "bg-accent-cyan/15",
    text: "text-accent-cyan",
    dot: "bg-accent-cyan",
  },
  lime: {
    ring: "ring-accent-lime/40",
    bg: "bg-accent-lime/15",
    text: "text-accent-lime",
    dot: "bg-accent-lime",
  },
  violet: {
    ring: "ring-accent-violet/40",
    bg: "bg-accent-violet/15",
    text: "text-accent-violet",
    dot: "bg-accent-violet",
  },
  rose: {
    ring: "ring-accent-rose/40",
    bg: "bg-accent-rose/15",
    text: "text-accent-rose",
    dot: "bg-accent-rose",
  },
};

export function getAccentClasses(accent: ServiceAccent, active: boolean) {
  const styles = accentStyles[accent];
  return cn(
    "border-glass-border bg-glass-bg/90 backdrop-blur-md transition-all duration-300",
    active && `border-transparent ring-2 ${styles.ring} shadow-glow-cyan`,
    !active && "hover:border-glass-border hover:bg-bg-secondary/80",
  );
}
