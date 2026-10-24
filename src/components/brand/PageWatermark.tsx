"use client";

import React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AMPERSANDS } from "./ampersand-paths";
import { useBrandPreferences } from "./BrandPreferences";

/**
 * The brand ampersand set into the page background, tone on tone. It sits
 * behind all content (photos, bands and the footer pass over it) and drifts
 * slightly as the page scrolls. Purely decorative.
 */
export function PageWatermark() {
  const reduce = useReducedMotion();
  const { ampersandVariant } = useBrandPreferences();
  const glyph = AMPERSANDS[ampersandVariant];
  const engraved = ampersandVariant === "engraved";
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "-12vh"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden no-print">
      <motion.div
        className="anim-fade absolute -right-[30vw] top-[16vh] h-[72vh] text-watermark sm:-right-[12vw] sm:top-[12vh] sm:h-[84vh] lg:-right-[2vw] lg:top-[9vh] lg:h-[92vh]"
        style={{ ...(reduce ? {} : { y }), "--d": "300ms" } as React.CSSProperties}
      >
        <svg viewBox={glyph.viewBox} className="h-full w-auto overflow-visible" focusable="false">
          <path
            d={glyph.d}
            fill={engraved ? "none" : "currentColor"}
            stroke={engraved ? "currentColor" : "none"}
            strokeWidth={engraved ? 1.5 : 0}
            vectorEffect={engraved ? "non-scaling-stroke" : undefined}
          />
        </svg>
      </motion.div>
    </div>
  );
}
