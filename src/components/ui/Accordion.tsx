"use client";

import React, { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_LUXE } from "./Reveal";

export interface AccordionItem {
  q: string;
  a: React.ReactNode;
  kicker?: string;
}

/**
 * Accordion without divider lines (DR-14): items are separated by space, and
 * the open item settles onto a soft tonal panel.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  surface = "ivory",
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  surface?: "ivory" | "cream";
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  const reduce = useReducedMotion();
  const openBg = surface === "cream" ? "bg-ivory" : "bg-cream";

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div
            key={item.q}
            className={`rounded-card transition-colors duration-500 ease-luxe ${isOpen ? openBg : "bg-transparent"}`}
          >
            <h3 className="font-body text-inherit">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start justify-between gap-6 rounded-card px-5 py-5 text-left sm:px-6"
              >
                <span className="space-y-1.5">
                  {item.kicker && (
                    <span className="t-kicker block text-gold-text">{item.kicker}</span>
                  )}
                  <span className="block font-heading text-[1.1875rem] leading-snug tracking-[-0.01em] text-emerald transition-colors group-hover:text-gold-text sm:text-[1.3125rem]">
                    {item.q}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="relative mt-2 h-3 w-3 shrink-0 text-gold-text"
                >
                  <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                  <span
                    className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-luxe ${
                      isOpen ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_LUXE }}
                  className="overflow-hidden"
                >
                  <div className="t-body max-w-[62ch] px-5 pb-6 text-ink sm:px-6">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
