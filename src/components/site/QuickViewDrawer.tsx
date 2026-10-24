"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/Field";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { CloseIcon } from "@/components/ui/Icons";
import { formatCents } from "@/lib/domain/money";
import { isSoldOut, leadTimeLabel, productHref, slotToneFor } from "@/lib/catalog";
import { NotifyMeForm } from "./NotifyMeForm";
import { PhotoGallery } from "./PhotoGallery";
import { useCart } from "./CartContext";

/**
 * Quick view (FR-10, T4.3): everything needed to decide, without a page load.
 * One primary action at the foot of the drawer.
 */
export function QuickViewDrawer() {
  const { quickViewProduct: product, closeQuickView, addItem, products } = useCart();
  const router = useRouter();
  const [optionId, setOptionId] = useState<string | undefined>();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setOptionId(product.options[0]?.id);
      setQty(1);
    }
  }, [product]);

  const option = product?.options.find((o) => o.id === optionId) ?? product?.options[0];
  const unitCents = option ? option.priceCents : product?.priceCents ?? 0;
  const sample = product?.status === "sample";
  const soldOut = product ? isSoldOut(product) : false;
  const board = product?.type === "board";
  const index = product ? Math.max(0, products.findIndex((p) => p.id === product.id)) : 0;

  function order() {
    if (!product) return;
    if (board) {
      closeQuickView();
      router.push(`/charcuterie?board=${product.slug}#reserve`);
      return;
    }
    addItem(product, option?.id, qty);
    closeQuickView();
    router.push("/order");
  }

  return (
    <Drawer open={Boolean(product)} onClose={closeQuickView} labelledBy="quickview-title">
      {product && (
        <>
          <div className="flex h-16 shrink-0 items-center justify-between px-6 sm:px-8">
            <p className="t-kicker text-gold-text">{product.categoryName}</p>
            <button
              type="button"
              onClick={closeQuickView}
              className="-mr-2 inline-flex h-10 items-center gap-2 rounded-card px-2 text-[0.875rem] text-emerald transition-colors hover:text-gold-text"
            >
              Close
              <CloseIcon size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10 sm:px-8">
            {product.images?.length ? (
              <PhotoGallery
                key={product.id}
                photos={product.images}
                tone={slotToneFor(product)}
                name={product.name}
                sizes="(min-width: 640px) 480px, 92vw"
                tag={sample ? "Coming soon" : soldOut ? "Sold out" : undefined}
              />
            ) : (
              <ImageSlot
                title={product.name}
                caption={product.subtitle}
                tone={slotToneFor(product)}
                composition={index}
                tag={sample ? "Coming soon" : soldOut ? "Sold out" : undefined}
                ratio="4:5"
                size="lg"
              />
            )}

            <div className="mt-8 flex items-start justify-between gap-6">
              <h2 id="quickview-title" className="t-h2">
                {product.name}
              </h2>
              <p className="mt-2 shrink-0 text-[1.0625rem] tabular-nums text-emerald">
                {formatCents(unitCents)}
              </p>
            </div>
            <p className="mt-3 t-body text-ink">{product.shortDescription}</p>

            {product.options.length > 1 && !sample && (
              <fieldset className="mt-8">
                <legend className="mb-3 text-[0.875rem] font-medium text-emerald">Choose an edition</legend>
                <div className="grid gap-2">
                  {product.options.map((opt) => (
                    <ChoiceCard
                      key={opt.id}
                      name={`qv-option-${product.id}`}
                      value={opt.id}
                      checked={opt.id === option?.id}
                      onChange={setOptionId}
                      title={opt.label}
                      aside={formatCents(opt.priceCents)}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {product.contents.length > 0 && (
              <section className="mt-10" aria-labelledby="qv-contents">
                <h3 id="qv-contents" className="t-kicker text-gold-text">
                  {board ? "On the board" : "In the box"}
                </h3>
                <ol className="mt-5 space-y-3.5">
                  {product.contents.map((item, i) => (
                    <li key={item} className="flex items-baseline gap-4">
                      <span className="t-numeral w-6 shrink-0 text-[1rem] text-gold-text">{i + 1}</span>
                      <span className="t-body text-ink">{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <dl className="mt-10 grid gap-2 rounded-card bg-cream p-5 text-[0.875rem]">
              <div className="flex justify-between gap-6">
                <dt className="text-muted">Order ahead</dt>
                <dd className="text-right text-emerald">At least {leadTimeLabel(product.leadTimeHours)}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-muted">{board ? "Delivery" : "Delivery or pickup"}</dt>
                <dd className="text-right text-emerald">
                  {board ? "Two-hour window, or free pickup" : "Across the GTA, or free pickup"}
                </dd>
              </div>
              {!board && (
                <div className="flex justify-between gap-6">
                  <dt className="text-muted">Card</dt>
                  <dd className="text-right text-emerald">Handwritten with your note</dd>
                </div>
              )}
            </dl>

            {product.allergens.length > 0 && (
              <div className="mt-3 rounded-card bg-mist p-5">
                <p className="text-[0.875rem] font-medium text-emerald">Allergens</p>
                <p className="mt-1.5 t-small text-ink">{product.allergens.join(", ")}.</p>
              </div>
            )}

            <Link
              href={productHref(product)}
              onClick={closeQuickView}
              className="mt-8 inline-block t-small text-emerald link-quiet"
            >
              View the full page
            </Link>
          </div>

          <div className="shrink-0 bg-ivory px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_32px_-24px_color-mix(in_oklab,var(--ink)_22%,transparent)] sm:px-8 sm:pb-6">
            {sample ? (
              <NotifyMeForm productSlug={product.slug} productName={product.name} />
            ) : soldOut ? (
              <p className="py-3 t-small text-muted">
                This box is sold out for now. New stock is added each week.
              </p>
            ) : board ? (
              <Button size="lg" arrow className="w-full" onClick={order}>
                Choose date and time
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(10, option?.stockOnHand ?? 10))} />
                <Button size="lg" arrow className="flex-1" onClick={order}>
                  Order · {formatCents(unitCents * qty)}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
