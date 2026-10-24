# June & Bloom: Content & Asset Checklist (`CONTENT_TODO.md`)

Items currently rendered with intentional placeholders (`DR-18`) awaiting founder input. Copy lives in `src/content/` and `src/lib/db/seed-products.ts`, so most of these change without touching components.

## Brand
- [ ] **JB monogram (`DR-02`):** Replace `public/brand/jb-monogram.svg` with the official file. The current file is a stand-in, so it is only used as the favicon and on `/dev/components`.
- [ ] **Wordmark ampersand (`DR-03`):** Choose on `/dev/ampersand`. Default is Option A (Bodoni Moda Italic). Options B (Libre Caslon Text Italic, swash) and C (Bodoni Moda, engraved outline) are outlined vectors in `src/components/brand/ampersand-paths.ts`. Once chosen, export it to `public/brand/ampersand.svg` (currently Option A).
- [ ] **Type pairing (`DR-16`):** Confirm on `/dev/type` (default Bodoni Moda + Hanken Grotesk).
- [ ] **Gold text colour:** `--gold-text` was darkened from `#9A7B2F` to `#846A28` so small gold labels pass WCAG AA. Confirm this shade.

## Photography (every slot is a placeholder at its final aspect ratio)
- [x] **The Signature Men's Box:** three `4:5` photographs in `public/images/products/signature-mens-box/` (box closed, box open, card in hand), set in `src/lib/db/seed-products.ts`.
- [x] **The Signature Women's Box:** three `4:5` photographs in `public/images/products/signature-womens-box/`. Contents rewritten to match them (blush cup, rose and chamomile tea, candle, silk scrunchie, rose petal soap, rose chocolate, card); confirm the list and the chocolate allergens.
- [x] **The Signature Family Box:** three `4:5` photographs in `public/images/products/signature-family-box/`. The existing contents list already matched them.
- [ ] **Sample boxes:** photographs for The Evening Box, The Morning Box, The Weekend Box and The Pantry Box when they are ready to launch. Add them to `images` in `src/lib/db/seed-products.ts` in the same order: closed box (cover), open box (shown on hover), then details.
- [x] **The Gathering Board:** three landscape photographs in `public/images/products/gathering-board/` (angle, overhead, eye level). The eye-level shot also opens the Charcuterie page (`src/content/imagery.ts`). If these show a different board size, move the `images` list to that board in `src/lib/db/seed-products.ts`.
- [x] **The Intimate Board:** photograph in `public/images/products/intimate-board/board.webp`. The existing contents list already matched it.
- [x] **The Grand Table Board:** photograph in `public/images/products/grand-table-board/board.webp`. The existing contents list already matched it; all three boards are now photographed.
- [ ] **The Gathering Board contents:** the list was rewritten to match the photographs (brie, cranberry goat cheese, salami, prosciutto, pepperoni, grapes, strawberries, apple, walnuts, apricots, crackers). Confirm it, and the allergens.
- [x] **Holiday Styling hero:** `3:2` photograph in `public/images/styling/living-room-tree.webp`, set in `src/content/imagery.ts`. The "Sample styling" label was removed at the founders' request; DR-17 asks for it on any image that is not a June & Bloom installation.
- [x] **Holiday styling options:** `4:5` photographs for Decorating Only, Decorating plus Sourcing and Full-Service in `public/images/styling/`, set on each option in `src/lib/db/seed-products.ts`.
- [x] **The two sisters together:** portrait in `public/images/story/the-two-of-us.webp` (set in `src/content/imagery.ts`), used on the home story section and Our Story.
- [x] **Individual portraits:** `public/images/story/gift-curator.webp` and `table-and-tree.webp`, on the two Our Story profiles.

## Copy and details
- [ ] **Gift box item lists and prices:** final 5 or 6 items per box (`src/lib/db/seed-products.ts`).
- [ ] **Charcuterie:** final prices, contents, slot windows and daily capacity.
- [ ] **Holiday styling:** option names, inclusions, exclusions and starting prices.
- [ ] **Our Story:** the sisters' names, roles and their own words (`src/app/(site)/our-story/page.tsx`). The page currently describes them by role only.
- [ ] **FAQ answers:** review every answer for accuracy (`src/app/(site)/faq/page.tsx`).
- [ ] **WhatsApp number:** add to `src/content/site.ts`. The WhatsApp link stays hidden until then.
- [ ] **Contact email and Instagram handle:** confirm in `src/content/site.ts`.

## Operations
- [ ] **Pickup address and hours:** set in the dashboard settings. Shown only in order confirmations.
- [ ] **Delivery zones:** confirm zone names, postal prefixes, fees, minimums and days (`src/lib/domain/zones.ts`).
- [ ] **Policy wording:** founder and legal review of Terms, Delivery, Refunds, Allergens, Safety, Privacy and Accessibility (`src/content/policies.ts`).
