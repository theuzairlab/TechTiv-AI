import type { IndustryAccent } from "@/lib/industries";
import { cn } from "@/lib/utils";

export const industryAccentStyles: Record<
  IndustryAccent,
  { ring: string; bg: string; text: string; border: string; dot: string }
> = {
  cyan: {
    ring: "ring-accent-cyan/40",
    bg: "bg-accent-cyan/15",
    text: "text-accent-cyan",
    border: "border-accent-cyan/30",
    dot: "bg-accent-cyan",
  },
  lime: {
    ring: "ring-accent-lime/40",
    bg: "bg-accent-lime/15",
    text: "text-accent-lime",
    border: "border-accent-lime/30",
    dot: "bg-accent-lime",
  },
  violet: {
    ring: "ring-accent-violet/40",
    bg: "bg-accent-violet/15",
    text: "text-accent-violet",
    border: "border-accent-violet/30",
    dot: "bg-accent-violet",
  },
  rose: {
    ring: "ring-accent-rose/40",
    bg: "bg-accent-rose/15",
    text: "text-accent-rose",
    border: "border-accent-rose/30",
    dot: "bg-accent-rose",
  },
};

export function getIndustryCardClasses(accent: IndustryAccent, active: boolean) {
  const styles = industryAccentStyles[accent];
  return cn(
    "rounded-2xl border bg-glass-bg/90 p-5 text-left backdrop-blur-md transition-all duration-300",
    active
      ? cn("ring-2 shadow-glow-cyan", styles.ring, styles.border)
      : "border-glass-border hover:border-glass-border hover:bg-bg-secondary/70",
  );
}
