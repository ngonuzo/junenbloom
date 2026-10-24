"use client";

import React from "react";
import { MotionConfig } from "motion/react";

/** Honour the visitor's reduced-motion preference for every motion component (DR-19). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
