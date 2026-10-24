"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/db/store";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";

const CATEGORY_ORDER = ["signature", "for-him", "for-her", "family", "food"];

/**
 * Gifting grid with quiet category chips (PRD 6.2). Chips only appear when more
 * than one category has products, and the grid re-flows softly on change.
 */
export function GiftingCatalogue({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("all");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) seen.set(p.categorySlug, p.categoryName);
    return [...seen.entries()]
      .sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
      .map(([slug, label]) => ({ slug, label }));
  }, [products]);

  const visible = active === "all" ? products : products.filter((p) => p.categorySlug === active);

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-6">
          <LayoutGroup id="gift-chips">
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {[{ slug: "all", label: "All" }, ...categories].map((cat) => {
                const on = active === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(cat.slug)}
                    className={`relative h-10 rounded-full px-5 text-[0.875rem] transition-colors duration-300 ${
                      on ? "text-ivory" : "bg-cream text-ink hover:bg-linen hover:text-emerald"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="gift-chip"
                        className="absolute inset-0 rounded-full bg-emerald"
                        transition={{ duration: reduce ? 0 : 0.5, ease: EASE_LUXE }}
                      />
                    )}
                    <span className="relative">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <p className="text-[0.875rem] text-muted" aria-live="polite">
            {visible.length} {visible.length === 1 ? "box" : "boxes"}
          </p>
        </div>
      )}

      <motion.ul layout className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((product) => (
            <motion.li
              key={product.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE_LUXE }}
            >
              <ProductCard
                product={product}
                index={products.indexOf(product)}
                priority={visible.indexOf(product) === 0}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
