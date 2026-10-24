"use client";

import React from "react";
import { MinusIcon, PlusIcon } from "./Icons";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label = "Quantity",
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div role="group" aria-label={label} className={`inline-flex ${h} items-stretch rounded-card bg-cream`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={`inline-flex ${w} items-center justify-center text-emerald transition-opacity hover:text-gold-text disabled:opacity-30`}
      >
        <MinusIcon size={14} />
      </button>
      <output aria-live="polite" className="inline-flex min-w-7 items-center justify-center text-[0.9375rem] tabular-nums text-emerald">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={`inline-flex ${w} items-center justify-center text-emerald transition-opacity hover:text-gold-text disabled:opacity-30`}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
