import { cn } from "@/lib/utils";

type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "elevated" | "subtle";
};

const variantStyles = {
  default: "border-glass-border bg-glass-bg backdrop-blur-xl",
  elevated:
    "border-glass-border bg-bg-secondary/90 shadow-glow-cyan backdrop-blur-2xl",
  subtle: "border-glass-border/50 bg-surface-glass backdrop-blur-md",
} as const;

export function GlassPanel({
  variant = "default",
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
