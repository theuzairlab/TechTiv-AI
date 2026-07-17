import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm transition-colors",
          "focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20",
          error && "border-accent-rose/50 focus:border-accent-rose/50 focus:ring-accent-rose/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-accent-rose">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
