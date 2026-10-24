"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Wordmark } from "@/components/brand/Wordmark";
import { BagIcon, CloseIcon } from "@/components/ui/Icons";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { useScrollLock } from "@/components/ui/Drawer";
import { PRIMARY_NAV, SECONDARY_NAV, SITE } from "@/content/site";
import { useCart } from "./CartContext";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sticky header (DR-30 to DR-32): transparent at the top of the page, then
 * cream with a soft blur once the page scrolls. Never taller than 64 px.
 */
export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-[var(--header-h)] transition-[background-color,backdrop-filter] duration-500 ease-luxe no-print ${
          scrolled ? "bg-ivory/88 backdrop-blur-md backdrop-saturate-150" : "bg-transparent"
        }`}
      >
        <div className="container-page grid h-full grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="June & Bloom, home"
            className="justify-self-start rounded-sm py-2"
          >
            <Wordmark size="md" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-11">
              {PRIMARY_NAV.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative inline-block py-2 text-[1rem] tracking-[0.005em] transition-colors duration-300 ${
                        active ? "text-emerald" : "text-ink-soft hover:text-emerald"
                      }`}
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 bottom-1 h-px origin-left bg-gold-text transition-transform duration-500 ease-luxe ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-self-end gap-1 sm:gap-3">
            <Link
              href="/our-story"
              className="hidden px-2 py-2 text-[1rem] text-ink-soft transition-colors hover:text-emerald lg:inline-block"
            >
              Our Story
            </Link>
            <Link
              href="/order"
              aria-label={count > 0 ? `Your order, ${count} ${count === 1 ? "item" : "items"}` : "Your order"}
              className="group inline-flex h-10 items-center gap-2 rounded-card px-2.5 text-[1rem] text-emerald transition-colors hover:text-gold-text sm:px-3"
            >
              <BagIcon size={20} />
              <span className="hidden sm:inline">Order</span>
              <AnimatePresence initial={false}>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_LUXE }}
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald px-1.5 text-[0.6875rem] font-medium tabular-nums text-gold"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-10 items-center gap-2.5 rounded-card px-2.5 text-[1rem] text-emerald lg:hidden"
            >
              <span className="sr-only sm:not-sr-only">Menu</span>
              <span aria-hidden className="flex w-5 flex-col gap-[5px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-3/5 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          menuButton.current?.focus();
        }}
        pathname={pathname}
        count={count}
      />
    </>
  );
}

function MobileMenu({
  open,
  onClose,
  pathname,
  count,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  count: number;
}) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a,button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[65] flex flex-col bg-ivory lg:hidden"
          initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: EASE_LUXE }}
        >
          <div className="container-page flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Link href="/" aria-label="June & Bloom, home" className="py-2">
              <Wordmark size="md" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-card px-2.5 text-[0.875rem] text-emerald"
            >
              Close
              <CloseIcon size={16} />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-between overflow-y-auto pb-8 pt-6">
            <ul className="space-y-1">
              {PRIMARY_NAV.map((link, i) => (
                <li key={link.href} className="mask-line block">
                  <motion.div
                    initial={reduce ? false : { y: "130%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.18 + i * 0.06, ease: EASE_LUXE }}
                  >
                    <Link
                      href={link.href}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className="flex items-baseline justify-between py-2 font-heading text-[2.375rem] leading-[1.1] tracking-[-0.02em] text-emerald"
                    >
                      {link.label}
                      <span className="t-numeral text-[1rem] text-gold-text">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>

            <motion.div
              className="space-y-8 pt-10"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE_LUXE }}
            >
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {SECONDARY_NAV.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[1rem] text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/order" className="text-[1rem] text-ink">
                    Your order{count > 0 ? ` (${count})` : ""}
                  </Link>
                </li>
              </ul>
              <div className="rounded-card bg-cream px-5 py-5">
                <p className="font-heading text-[1.25rem] italic text-emerald">{SITE.tagline}</p>
                <p className="mt-1 t-small text-muted">
                  Two sisters, {SITE.region}. {SITE.replyPromise}
                </p>
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
