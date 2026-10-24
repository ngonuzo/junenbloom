# Changelog

All notable changes to the June & Bloom Lifestyle Company website are recorded here.

- **2026-10-23:** Added canonical specification docs (`docs/01-PRD.md`, `docs/02-Implementation-Plan.md`, `docs/03-Architecture.md`) and `DESIGN.md`.
- **2026-10-23:** Completed WP0 audit and initialized full Next.js App Router luxury storefront, interactive ordering flow, charcuterie slot booking, holiday styling inquiry flow, founder admin dashboard, and `/dev/*` design review pages.
- **2026-10-23:** Rebuilt the public site design against `DESIGN.md`: new token layer (brand-only Tailwind palette, type scale, motion), outlined wordmark ampersands taken from Bodoni Moda and Libre Caslon, typographic image placeholders, and a scroll and entrance motion system that respects reduced motion.
- **2026-10-23:** Redesigned every public page (Home, Gifting, product pages, Charcuterie with slot builder, Holiday Styling, three-step inquiry, Order details, order status, Service Area, Our Story, FAQ, Contact, Policies, 404) and the header, mobile menu, quick view drawer and footer with the ivory-to-emerald graduation.
- **2026-10-23:** Fixes: the order tray starts empty and survives a reload; checkout fields are no longer pre-filled; the CASL consent box on the inquiry form is unchecked by default; admin and design-review links removed from public navigation; invented pickup address removed; order status pages now require the private token; delivery orders outside the service area are refused on the server; `--gold-text` darkened to pass WCAG AA.
- **2026-10-23:** Text sharpness: paper grain moved beneath the text, platform font smoothing restored for dark-on-light text, and semi-transparent body text replaced with solid colour tokens.
- **2026-10-23:** First owned photography for The Signature Men's Box: home hero and inset, Gifting tile, product card with hover view, quick view gallery, product page gallery with captions, order summary thumbnail, and social preview image. Products now accept an `images` list.
- **2026-10-24:** Photography for The Gathering Board: Charcuterie page hero, home Charcuterie tile, board card with hover view, quick view and product page. Wide photographs now keep their landscape shape on product pages and in quick view. Board contents and allergens updated to match the photographs.
- **2026-10-24:** Photography for The Signature Women's Box on cards, quick view and its product page; contents, allergens and edition label updated to match the photographs.
- **2026-10-24:** Photography for The Signature Family Box; all three signature boxes now use owned photography.
- **2026-10-24:** Charcuterie imagery shows the whole board: the home tile and board cards use a landscape 3:2 frame. Photos now request a file sized to how large they are actually drawn, fixing soft images where a wide photo filled a narrower frame.
- **2026-10-24:** Holiday Styling page hero now uses a photograph (labelled Sample styling).
- **2026-10-24:** Home Holiday Styling tile uses the living room tree photograph; all three home offering tiles are now photographed.
- **2026-10-24:** Removed the Sample styling label from the living room tree photograph (Holiday Styling hero and home tile).
- **2026-10-24:** Home offering tiles share one 3:2 frame so all three are the same height; the Gifting tile now shows the opened Women's Box, which keeps every piece in frame at that shape.
- **2026-10-24:** Photographs on the Decorating Only and Decorating plus Sourcing option cards.
- **2026-10-24:** Photograph on the Full-Service option card; all Holiday Styling imagery is now photographed.
- **2026-10-24:** Founders' portrait on the home story section (5:4) and Our Story, where it now sits beside the story text at its full 4:5 shape.
- **2026-10-24:** Individual portraits on the two Our Story profiles; the profiles now align side by side.
- **2026-10-24:** The brand ampersand is set into the background of every public page, tone on tone behind the content, with a slow drift on scroll. Fixed a hydration warning in the Service Area zone diagram.
- **2026-10-24:** Photograph for The Intimate Board on its card, quick view and product page.
- **2026-10-24:** Photograph for The Grand Table Board; all three charcuterie boards are now photographed.
