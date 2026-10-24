import type { Product, ProductImage } from "./db/store";
import type { SlotRatio, SlotTone } from "@/components/ui/ImageSlot";
import { formatCents } from "./domain/money";

export function slotToneFor(product: Pick<Product, "tone">): SlotTone {
  switch (product.tone) {
    case "sage":
      return "moss";
    case "cream":
      return "linen";
    default:
      return "emerald";
  }
}

export function productHref(product: Pick<Product, "type" | "slug">): string {
  if (product.type === "board") return `/charcuterie/${product.slug}`;
  if (product.type === "styling") return `/holiday-styling/inquire?option=${product.slug}`;
  return `/gifting/${product.slug}`;
}

export function priceLabel(product: Pick<Product, "priceCents" | "priceIsFrom">): string {
  return `${product.priceIsFrom ? "From " : ""}${formatCents(product.priceCents)}`;
}

export function isSoldOut(product: Product): boolean {
  return product.status === "live" && product.trackStock && product.stockOnHand <= 0;
}

export function leadTimeLabel(hours: number): string {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? "1 day" : `${days} days`;
  }
  return `${hours} hours`;
}

/** "Tuesday to Sunday" becomes "Tue–Sun" so it fits a narrow column. */
export function shortDays(days: string): string {
  return days
    .replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/g, (d) => d.slice(0, 3))
    .replace(" to ", "–");
}

/** Shows a photograph at its own shape where space allows: wide shots at 3:2, the rest at 4:5. */
export function photoRatio(photo: Pick<ProductImage, "width" | "height">): SlotRatio {
  return photo.width / photo.height > 1.2 ? "3:2" : "4:5";
}
