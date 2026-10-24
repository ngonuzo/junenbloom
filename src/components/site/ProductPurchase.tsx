"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/db/store";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/Field";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCents } from "@/lib/domain/money";
import { isSoldOut } from "@/lib/catalog";
import { NotifyMeForm } from "./NotifyMeForm";
import { useCart } from "./CartContext";

/** Options, quantity and the single Order action on a product page (FR-10). */
export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [optionId, setOptionId] = useState(product.options[0]?.id);
  const [qty, setQty] = useState(1);
  const option = product.options.find((o) => o.id === optionId) ?? product.options[0];
  const unitCents = option ? option.priceCents : product.priceCents;

  if (product.status === "sample") {
    return (
      <div className="rounded-card bg-cream p-6">
        <NotifyMeForm productSlug={product.slug} productName={product.name} surface="cream" />
      </div>
    );
  }

  if (isSoldOut(product)) {
    return (
      <p className="rounded-card bg-cream p-6 t-body text-ink">
        Sold out for now. New stock is added each week, or{" "}
        <a href="/contact" className="link-quiet text-emerald">
          message us
        </a>{" "}
        and we will hold one for you.
      </p>
    );
  }

  const board = product.type === "board";

  return (
    <div className="space-y-6">
      {product.options.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-[0.875rem] font-medium text-emerald">Choose an edition</legend>
          <div className="grid gap-2">
            {product.options.map((opt) => (
              <ChoiceCard
                key={opt.id}
                name={`option-${product.id}`}
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

      {board ? (
        <Button
          size="lg"
          arrow
          className="w-full"
          onClick={() => router.push(`/charcuterie?board=${product.slug}#reserve`)}
        >
          Choose date and time
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={qty}
            onChange={setQty}
            max={Math.max(1, Math.min(10, option?.stockOnHand ?? 10))}
          />
          <Button
            size="lg"
            arrow
            className="flex-1"
            onClick={() => {
              addItem(product, option?.id, qty);
              router.push("/order");
            }}
          >
            Order · {formatCents(unitCents * qty)}
          </Button>
        </div>
      )}
    </div>
  );
}
