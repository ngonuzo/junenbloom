"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_LUXE } from "@/components/ui/Reveal";
import type { DeliveryZone } from "@/lib/domain/zones";

const FILLS = ["var(--emerald)", "var(--moss)", "var(--mist)"];
const RADII = [70, 128, 188];

/**
 * Illustrated service area (PRD 6.6): three filled rings around Toronto, drawn
 * outward as they enter the viewport. Tone, not lines, marks each zone.
 */
export function ZoneRings({ zones }: { zones: DeliveryZone[] }) {
  const reduce = useReducedMotion();
  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[30rem]">
      <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-labelledby="zone-rings-title">
        {/* A single string: <title> must hold one text node to hydrate cleanly */}
        <title id="zone-rings-title">{`Delivery zones radiating from Toronto: ${zones
          .map((z, i) => `zone ${i + 1}, ${z.name}`)
          .join("; ")}.`}</title>
        {[...RADII].reverse().map((r, idx) => {
          const i = RADII.length - 1 - idx;
          return (
            <motion.circle
              key={r}
              cx={200}
              cy={200}
              r={r}
              fill={FILLS[i]}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4, delay: 0.1 + idx * 0.12, ease: EASE_LUXE }}
              style={{ transformOrigin: "200px 200px" }}
            />
          );
        })}
        <motion.circle
          cx={200}
          cy={200}
          r={4}
          fill="var(--gold)"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
      </svg>
      <div aria-hidden className="pointer-events-none absolute inset-0 text-center">
        <span className="absolute left-1/2 top-[56%] -translate-x-1/2 text-[0.75rem] tracking-[0.04em] text-ivory">
          Toronto
        </span>
        <span className="t-numeral absolute left-1/2 top-[38%] -translate-x-1/2 text-[1.5rem] text-gold">1</span>
        <span className="t-numeral absolute left-1/2 top-[22.5%] -translate-x-1/2 text-[1.375rem] text-emerald">2</span>
        <span className="t-numeral absolute left-1/2 top-[7.5%] -translate-x-1/2 text-[1.375rem] text-emerald">3</span>
      </div>
    </figure>
  );
}
