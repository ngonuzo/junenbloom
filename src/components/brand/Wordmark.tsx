"use client";

import React from "react";
import { AMPERSANDS, type AmpersandVariant } from "./ampersand-paths";
import { useBrandPreferences } from "./BrandPreferences";

export type { AmpersandVariant };

/**
 * The distinctive wordmark ampersand (DR-03), rendered from outlined SVG.
 * Gold on emerald surfaces, gold-text on ivory.
 */
export function Ampersand({
  variant,
  className = "",
  style,
}: {
  variant?: AmpersandVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ampersandVariant } = useBrandPreferences();
  const v = variant ?? ampersandVariant;
  const glyph = AMPERSANDS[v];
  const engraved = v === "engraved";

  return (
    <svg
      viewBox={glyph.viewBox}
      aria-hidden="true"
      focusable="false"
      className={`inline-block h-[0.9em] w-auto shrink-0 overflow-visible ${className}`}
      style={style}
    >
      <path
        d={glyph.d}
        fill={engraved ? "none" : "currentColor"}
        stroke={engraved ? "currentColor" : "none"}
        strokeWidth={engraved ? 1 : 0}
        vectorEffect={engraved ? "non-scaling-stroke" : undefined}
      />
    </svg>
  );
}

const SIZE: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "text-[1.125rem]",
  md: "text-[1.25rem] sm:text-[1.375rem]",
  lg: "text-[2rem] sm:text-[2.5rem]",
  xl: "text-[2.75rem] sm:text-[4rem]",
};

export function Wordmark({
  surface = "ivory",
  size = "md",
  variant,
  className = "",
}: {
  surface?: "ivory" | "emerald";
  size?: keyof typeof SIZE;
  variant?: AmpersandVariant;
  className?: string;
}) {
  const word = surface === "emerald" ? "text-ivory" : "text-emerald";
  const amp = surface === "emerald" ? "text-gold" : "text-gold-text";

  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-heading font-normal leading-none tracking-[-0.012em] select-none ${SIZE[size]} ${word} ${className}`}
    >
      <span>June</span>
      <span className="sr-only"> and </span>
      <Ampersand
        variant={variant}
        className={`mx-[0.16em] ${amp}`}
        style={{ transform: "translateY(0.07em)" }}
      />
      <span>Bloom</span>
    </span>
  );
}

/** JB monogram (DR-02): always the supplied file, never redrawn. */
export function MonogramMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/jb-monogram.svg"
      alt="June & Bloom monogram"
      width={size}
      height={size}
      className={`select-none shrink-0 ${className}`}
    />
  );
}
