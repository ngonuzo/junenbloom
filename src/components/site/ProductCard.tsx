"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/db/store";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button, TextButton } from "@/components/ui/Button";
import { isSoldOut, priceLabel, productHref, slotToneFor } from "@/lib/catalog";
import { useCart } from "./CartContext";

/**
 * Product tile (PRD 6.2): image, name, price and one line. Live products carry
 * an Order button; samples show Coming soon and Notify me.
 */
export function ProductCard({
  product,
  index = 0,
  onOrder,
  priority = false,
}: {
  product: Product;
  index?: number;
  /** Override the default Order behaviour, e.g. boards jump to the slot picker. */
  onOrder?: (product: Product) => void;
  priority?: boolean;
}) {
  const { openQuickView, addItem } = useCart();
  const router = useRouter();
  const sample = product.status === "sample";
  const soldOut = isSoldOut(product);

  function order() {
    if (onOrder) {
      onOrder(product);
      return;
    }
    if (product.type === "board") {
      router.push(`/charcuterie?board=${product.slug}#reserve`);
      return;
    }
    addItem(product, product.options[0]?.id, 1);
    router.push("/order");
  }

  const tag = sample ? "Coming soon" : soldOut ? "Sold out" : undefined;

  return (
    <article className="group/card flex h-full flex-col">
      <button
        type="button"
        onClick={() => openQuickView(product)}
        aria-label={`Quick view: ${product.name}`}
        className="relative block w-full overflow-hidden rounded-card text-left transition-transform duration-700 ease-luxe hover:-translate-y-0.5"
      >
        <div className="transition-transform duration-[1400ms] ease-luxe group-hover/card:scale-[1.025]">
          <ImageSlot
            title={product.name}
            caption={product.subtitle}
            tone={slotToneFor(product)}
            composition={index}
            tag={tag}
            photo={product.images?.[0]}
            hoverPhoto={product.images?.[1]}
            // Boards are wide subjects: show the whole board rather than a portrait crop.
            ratio={product.type === "board" ? "3:2" : "4:5"}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
            priority={priority}
          />
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-5 bottom-5 hidden translate-y-2 items-center justify-center rounded-card bg-ivory/92 py-3 text-[0.75rem] font-medium uppercase tracking-[0.16em] text-emerald opacity-0 backdrop-blur-sm transition-all duration-500 ease-luxe group-hover/card:translate-y-0 group-hover/card:opacity-100 md:flex"
        >
          {sample ? "Preview the box" : "Quick view"}
        </span>
      </button>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="t-h3">
            <Link
              href={productHref(product)}
              className="transition-colors duration-300 hover:text-gold-text"
            >
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-[0.9375rem] tabular-nums text-emerald">{priceLabel(product)}</p>
        </div>
        <p className="mt-2 t-small text-muted">{product.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          {sample ? (
            <>
              <TextButton onClick={() => openQuickView(product)}>Notify me</TextButton>
              <span className="text-[0.8125rem] text-muted">Coming soon</span>
            </>
          ) : soldOut ? (
            <span className="text-[0.875rem] text-muted">Sold out for now</span>
          ) : (
            <>
              <TextButton onClick={() => openQuickView(product)}>
                {product.contents.length > 0 ? `See all ${product.contents.length} pieces` : "Details"}
              </TextButton>
              <Button size="sm" onClick={order} aria-label={`Order ${product.name}`}>
                Order
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
