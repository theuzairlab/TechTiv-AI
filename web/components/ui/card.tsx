import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: "cyan" | "lime" | "violet" | "none";
};

const glowStyles = {
  cyan: "hover:shadow-glow-cyan hover:border-accent-cyan/30",
  lime: "hover:shadow-glow-lime hover:border-accent-lime/30",
  violet: "hover:border-accent-violet/30",
  none: "",
} as const;

export function Card({
  className,
  glow = "none",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-glass-border bg-glass-bg p-6 backdrop-blur-md transition-all duration-300",
        glowStyles[glow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-text-muted", className)} {...props} />
  );
}
