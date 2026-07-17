import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-lime text-on-accent hover:bg-accent-cyan shadow-glow-lime",
        secondary:
          "border border-glass-border bg-bg-secondary/60 text-text-primary hover:border-accent-cyan/30 hover:bg-bg-secondary",
        outline:
          "border border-accent-cyan/40 bg-transparent text-accent-cyan hover:bg-accent-cyan/10",
        ghost:
          "bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary/50",
        rose:
          "border border-accent-rose/40 bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    href?: string;
  };

export function Button({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
