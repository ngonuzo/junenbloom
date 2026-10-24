"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/db/store";

export interface CartItem {
  product: Product;
  optionId?: string;
  optionLabel?: string;
  unitCents: number;
  qty: number;
}

export interface SelectedSlot {
  id: string;
  day: string;
  window: string;
}

interface StoredLine {
  slug: string;
  optionId?: string;
  qty: number;
}

interface CartContextValue {
  products: Product[];
  items: CartItem[];
  count: number;
  ready: boolean;
  addItem: (product: Product, optionId?: string, qty?: number) => void;
  updateQty: (productSlug: string, optionId: string | undefined, qty: number) => void;
  removeItem: (productSlug: string, optionId?: string) => void;
  clearCart: () => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  selectedSlot: SelectedSlot | null;
  setSelectedSlot: (slot: SelectedSlot | null) => void;
  dietaryNote: string;
  setDietaryNote: (note: string) => void;
}

const STORAGE_KEY = "jb_order_v1";
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Order tray (FR-12): starts empty, survives a reload, and resolves every line
 * against the current catalogue so prices are never taken from storage.
 */
export function CartProvider({
  children,
  initialProducts,
}: {
  children: React.ReactNode;
  initialProducts: Product[];
}) {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [dietaryNote, setDietaryNote] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (Array.isArray(saved?.lines)) setLines(saved.lines);
      if (saved?.selectedSlot) setSelectedSlot(saved.selectedSlot);
      if (typeof saved?.dietaryNote === "string") setDietaryNote(saved.dietaryNote);
    } catch {
      // Storage unavailable: start with an empty tray.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, selectedSlot, dietaryNote }));
    } catch {
      // Ignore storage failures.
    }
  }, [lines, selectedSlot, dietaryNote, ready]);

  const items = useMemo<CartItem[]>(() => {
    const out: CartItem[] = [];
    for (const line of lines) {
      const product = initialProducts.find((p) => p.slug === line.slug);
      if (!product) continue;
      const option = line.optionId
        ? product.options.find((o) => o.id === line.optionId)
        : product.options[0];
      out.push({
        product,
        optionId: option?.id,
        optionLabel: option?.label,
        unitCents: option ? option.priceCents : product.priceCents,
        qty: line.qty,
      });
    }
    return out;
  }, [lines, initialProducts]);

  const addItem = useCallback(
    (product: Product, optionId?: string, qty: number = 1) => {
      const resolved = optionId ?? product.options[0]?.id;
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.slug === product.slug && l.optionId === resolved);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [...prev, { slug: product.slug, optionId: resolved, qty }];
      });
    },
    []
  );

  const removeItem = useCallback((productSlug: string, optionId?: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === productSlug && l.optionId === optionId)));
  }, []);

  const updateQty = useCallback(
    (productSlug: string, optionId: string | undefined, qty: number) => {
      if (qty <= 0) {
        removeItem(productSlug, optionId);
        return;
      }
      setLines((prev) =>
        prev.map((l) => (l.slug === productSlug && l.optionId === optionId ? { ...l, qty } : l))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setLines([]);
    setSelectedSlot(null);
    setDietaryNote("");
  }, []);

  const openQuickView = useCallback((p: Product) => setQuickViewProduct(p), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        products: initialProducts,
        items,
        count,
        ready,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        selectedSlot,
        setSelectedSlot,
        dietaryNote,
        setDietaryNote,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
