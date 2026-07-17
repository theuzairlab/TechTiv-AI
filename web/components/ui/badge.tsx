import { cn } from "@/lib/utils";

const variants = {
  default: "bg-surface-glass text-text-primary border-glass-border",
  cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  lime: "bg-brand-cyan/15 text-brand border-brand-cyan/30",
  violet: "bg-accent-violet/15 text-accent-violet border-accent-violet/30",
  rose: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
} as const;

type BadgeVariant = keyof typeof variants;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
