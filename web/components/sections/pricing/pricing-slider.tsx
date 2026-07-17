"use client";

import { cn } from "@/lib/utils";

type PricingSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function PricingSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: PricingSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="text-sm tabular-nums text-brand-cyan">
          {value.toLocaleString()}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-secondary",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:shadow-glow-cyan",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:bg-accent-cyan",
          )}
          style={{
            background: `linear-gradient(to right, var(--accent-cyan) ${percent}%, var(--bg-secondary) ${percent}%)`,
          }}
        />
      </div>
    </div>
  );
}
