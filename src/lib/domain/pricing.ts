import type { DeliveryZone } from "./zones";

export interface PricedLineItem {
  unitCents: number;
  qty: number;
}

export interface OrderPriceSummary {
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  totalCents: number;
  meetsMinimum: boolean;
  minimumShortfallCents: number;
}

export const ONTARIO_HST_RATE_BPS = 1300; // 13.00%

export function priceOrder(
  items: PricedLineItem[],
  zone: DeliveryZone | null,
  fulfilment: "delivery" | "pickup",
  taxMode: boolean
): OrderPriceSummary {
  const subtotalCents = items.reduce((sum, item) => {
    const qty = Math.max(0, Math.floor(item.qty));
    const unit = Math.max(0, Math.floor(item.unitCents));
    return sum + unit * qty;
  }, 0);

  const deliveryCents =
    fulfilment === "pickup" ? 0 : zone ? Math.max(0, zone.feeCents) : 0;

  const minRequired =
    fulfilment === "pickup" ? 0 : zone ? zone.minOrderCents : 0;

  const meetsMinimum =
    fulfilment === "pickup" ? subtotalCents > 0 : Boolean(zone) && subtotalCents >= minRequired;

  const minimumShortfallCents = Math.max(0, minRequired - subtotalCents);

  const taxableBase = subtotalCents + deliveryCents;
  const taxCents = taxMode
    ? Math.round((taxableBase * ONTARIO_HST_RATE_BPS) / 10000)
    : 0;

  const totalCents = taxableBase + taxCents;

  return {
    subtotalCents,
    deliveryCents,
    taxCents,
    totalCents,
    meetsMinimum,
    minimumShortfallCents,
  };
}

export interface RetainerBreakdown {
  totalCents: number;
  retainerCents: number;
  balanceCents: number;
}

/**
 * Holiday styling requires a 40% retainer to confirm the date (BR-02 / FR-64 / FR-65).
 */
export function calculateRetainer(totalCents: number): RetainerBreakdown {
  const cleanTotal = Math.max(0, Math.floor(totalCents));
  const retainerCents = Math.round(cleanTotal * 0.4);
  const balanceCents = cleanTotal - retainerCents;
  return {
    totalCents: cleanTotal,
    retainerCents,
    balanceCents,
  };
}
