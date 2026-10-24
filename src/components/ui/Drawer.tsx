"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_LUXE } from "./Reveal";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Locks page scroll without the layout jump caused by a disappearing scrollbar. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
    };
  }, [active]);
}

/**
 * Side drawer on larger screens, bottom sheet on phones (FR-10, DR-19).
 * Modal semantics: focus moves in, stays in, and returns on close; Escape closes.
 */
export function Drawer({
  open,
  onClose,
  labelledBy,
  children,
  width = "max-w-[34rem]",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
    }, 60);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const hidden = desktop ? { x: "100%" } : { y: "100%" };
  const shown = desktop ? { x: 0 } : { y: 0 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-emerald/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE_LUXE }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`absolute flex flex-col bg-ivory text-ink shadow-[0_0_60px_-20px_color-mix(in_oklab,var(--ink)_45%,transparent)] ${
              desktop
                ? `inset-y-0 right-0 w-full ${width}`
                : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[10px]"
            }`}
            initial={reduce ? false : hidden}
            animate={shown}
            exit={reduce ? { opacity: 0 } : hidden}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE_LUXE }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
