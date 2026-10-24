import type { ProductImage } from "@/lib/db/store";

/**
 * Page-level photography (DR-17), kept apart from product photos so a page's
 * opening image can change without editing components.
 */
export const PAGE_IMAGERY: Record<"charcuterieHero" | "stylingHero" | "giftingTile" | "founders", ProductImage> = {
  charcuterieHero: {
    src: "/images/products/gathering-board/board-eye-level.webp",
    alt: "A charcuterie board at eye level on a linen cloth: brie, folded salami and prosciutto, a pepperoni rose, grapes, strawberries and sliced apple, with eucalyptus in warm light behind.",
    width: 1672,
    height: 941,
    focal: "50% 55%",
  },
  stylingHero: {
    src: "/images/styling/living-room-tree.webp",
    alt: "A tall tree dressed in gold baubles, cream ribbon bows and warm lights beside floor-to-ceiling windows, with wrapped gifts beneath, a lit fireplace and a snowy lake view at dusk.",
    width: 1536,
    height: 1024,
    focal: "60% 45%",
  },
  // Home "Gifting" tile. Chosen because every piece stays in frame in the tile's 3:2 crop.
  giftingTile: {
    src: "/images/products/signature-womens-box/box-open.webp",
    alt: "An open gift box: a blush stoneware cup, loose-leaf rose tea, a lit candle, a silk scrunchie, rose petal soap, chocolate and a card sealed in copper wax.",
    width: 1122,
    height: 1402,
    focal: "50% 55%",
  },
  // The two founders. Focal point sits high so wider crops keep both faces with headroom.
  founders: {
    src: "/images/story/the-two-of-us.webp",
    alt: "The two sisters behind June & Bloom, smiling side by side: one in a teal satin blouse, one in a cream blouse.",
    width: 1122,
    height: 1402,
    focal: "50% 12%",
  },
};
