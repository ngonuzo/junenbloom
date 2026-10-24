# June & Bloom Lifestyle Company: Product Requirements Document (PRD)

**Product:** One premium website for Gifting, Charcuterie Boards and Holiday Styling
**Domain:** juneandbloomlifestyle.com (Vercel project: june-and-bloom-lifestyle)
**Version:** 2.0 (supersedes 1.0) | **Date:** 2026-10-22 | **Owners:** The two founders (sisters)
**Audience:** the founders and the VS Code coding agent that will build the site
**Source:** the founders' voice brief, the Business Blueprint, and the Q&A decisions listed in section 15

---

## 0. How to read this document

- Requirement IDs (DR, FR, BR, NFR) are stable. The Implementation Plan and Architecture refer to them.
- Priority tags: **Core** (the site is not ready without it), **Next** (build right after Core), **Later** (backlog).
- No dates or timelines appear here. The Implementation Plan gives the order of work and the acceptance tests.
- Items marked **PLACEHOLDER** are content or numbers the founders will replace. The build must make every placeholder easy to replace without code changes.

## 1. Summary

June & Bloom is a premium, everyday-luxury lifestyle brand run by two sisters, one of whom has curated gifts for about ten years. The new website launches the brand as a duo with three offers:

1. **Gifting:** premium gift boxes (signature men's, women's, family and food-based boxes).
2. **Charcuterie Boards:** beautifully styled boards, ordered online with a date and time slot.
3. **Holiday Styling:** Christmas tree decorating, gift wrapping and festive styling, booked through an inquiry form.

It serves the GTA first. The website must feel clean, minimal and luxurious, let a visitor order within 5 to 10 seconds of deciding, and give the founders one private dashboard for orders, a status tracker, inventory and inquiries, with instant alerts when a sale is made.

### Scope statement (decided with the founders)
The documents are as comprehensive as the product needs. They contain no delivery timeline. Business set-up topics (legal structure, business name registration, insurance, tax registration) are handled separately and later.

### Operating assumptions
- **A1:** Permits, licences and insurance for all three offers are in place. The site therefore treats charcuterie and holiday styling as live offers. Each availability setting remains an on/off switch in the admin (FR-92), so the site can be paused without code changes.
- **A2:** The founders will supply the item lists, prices and photographs. Until then the site uses elegant placeholders.
- **A3:** All amounts are Canadian dollars.

## 2. Goals, non-goals and success measures

### Goals
1. **Order in 5 to 10 seconds.** A visitor can pick a product, see what is in it and reach payment in three simple steps: Choose, Details, Pay.
2. **Feel luxurious and calm.** Minimal layout, premium typography, very subtle cream and forest green, one clear action per view.
3. **One system for the whole business.** Payments, notifications, orders, tracker, inventory and inquiries live in one place.
4. **Run itself smoothly.** Instant alerts on new orders; no spreadsheets to reconcile; stock and slots protect against overselling.
5. **Grow without a rebuild.** New gift boxes, categories, boards and styling packages are added by the founders in the admin.
6. **Near-zero running cost.** Free or low-cost services by default.

### Non-goals
Nationwide shipping, customer accounts, marketplace features, loyalty points, native mobile apps, multi-language, subscriptions.

### Success measures
| Measure | Target |
|---|---|
| Home to payment page for a gift | 3 steps or fewer; under 10 seconds for a returning visitor |
| Mobile Lighthouse performance and accessibility | 90 or more |
| Order alert to founders after payment | Under 30 seconds |
| Checkout completion (started to paid) | 60 percent or better |
| Visitor to inquiry or order conversion | 3 percent or better |
| Stock accuracy | Zero oversells after launch |
| First personal reply to a styling inquiry | Within 1 business day |

## 3. Users

| Persona | Needs | Behaviour |
|---|---|---|
| **The Thoughtful Giver** | A gift that looks and feels expensive, with no guesswork | Browses on a phone, wants contents, price, date and a handwritten note |
| **The Host** | A beautiful board for a gathering, on time | Chooses size, date and time slot, cares about allergens |
| **The Holiday Home** | A polished tree and styled spaces without doing the work | Wants photos, clear inclusions and an easy inquiry |
| **The Small Business Buyer** | Client gifts, office styling, invoices | Needs a clear quote and receipt |
| **The Founders** | See every order the moment it lands, track fulfilment, manage stock | Uses a phone first; wants alerts, one list and simple controls |

## 4. Brand and design requirements

### 4.1 Identity
| ID | Requirement | Priority |
|---|---|---|
| DR-01 | Brand: June & Bloom Lifestyle Company. Premium and luxury, everyday-premium audience. Tagline "memories that inspire" appears in the hero and footer. | Core |
| DR-02 | Logo: use only the supplied JB monogram SVG. Never redraw, recolour or recreate it. | Core |
| DR-03 | **Distinctive ampersand.** The wordmark "June & Bloom" uses a unique, hand-picked ampersand. Deliver three options on a design review page for approval (italic display serif ampersand; swash ampersand; engraved style). The chosen ampersand is exported as an outlined SVG so it renders identically on every device. It is a wordmark element only and never replaces or alters the JB monogram. | Core |
| DR-04 | Voice: warm, composed, specific. Short sentences. No hype words, no exclamation marks. | Core |

### 4.2 Look and feel
| ID | Requirement | Priority |
|---|---|---|
| DR-10 | **Background:** off-white with a very, very subtle cream undertone (`#FDFBF7`). The page graduates to emerald (`#122620`) only in the final screen before the footer. | Core |
| DR-11 | **Text:** forest or darker green throughout (`#032A19` body; emerald `#122620` for headings and the header). No black text. | Core |
| DR-12 | **Texture:** a very slight paper-grain undertone, implemented as a tiled SVG or CSS noise at 3 to 5 percent opacity. It must be barely noticeable, never muddy text, and must not affect performance. | Core |
| DR-13 | **Restraint:** things stand out only when they need to. Exactly one primary button style (filled emerald with ivory text) per view. Soft gold `#E6C687` is used sparingly (ampersand, small accents, hover). Sage `#7A8B7B` for quiet surfaces and tags. | Core |
| DR-14 | **No line separators.** No horizontal rules, divider lines or ruled borders between sections or list rows. Separate with spacing, tone shifts and background blocks only. | Core |
| DR-15 | Premium and warm, deliberately not overtly feminine: no script fonts, no floral clip art, no pink, no heavy ornament. | Core |
| DR-16 | **Typography:** premium, uncommon fonts. Avoid the usual AI-default faces (Inter, Roboto, Arial, Poppins, Space Grotesk, Playfair Display, Cormorant, Fraunces). Default pairing: **Bodoni Moda** (headings, high-contrast luxury serif) with **Hanken Grotesk** (body). Provide a type test page offering two alternates (Libre Caslon Display with Albert Sans; Instrument Serif with Figtree) so the founders choose in minutes. Fonts are self-hosted through the framework font loader. | Core |
| DR-17 | Imagery: 4:5 portrait for product tiles, 3:2 for hero and story, generous whitespace, one subject per image. Owned photography only. Sample styling is labelled "sample styling". No AI imagery presented as client work. | Core |
| DR-18 | **Placeholders:** until photos arrive, every image slot shows a refined placeholder: a tonal green or cream panel with the grain texture and the product name set in the heading font. Placeholders must look deliberate, never like missing images. | Core |
| DR-19 | Motion is subtle: fade and gentle rise on scroll, smooth drawer transitions. Respect reduced-motion settings. | Core |
| DR-20 | Accessibility: WCAG 2.1 AA. Check contrast of gold and sage; never use them for small text on ivory. Visible focus states, alt text, keyboard navigation. | Core |
| DR-21 | Mobile first: design at 375 px; thumb-sized controls; sticky actions where helpful. | Core |

### 4.3 Header and navigation
| ID | Requirement | Priority |
|---|---|---|
| DR-30 | **Sticky header.** Always visible while scrolling. Transparent over the hero, turning solid cream with a slight blur after scrolling. Height 64 px or less. | Core |
| DR-31 | Header contents: wordmark (with the distinctive ampersand) at left; links **Gifting, Charcuterie, Holiday Styling, Service Area**; order button or cart indicator at right. Our Story, FAQ and Contact in the footer and in the mobile menu. | Core |
| DR-32 | Mobile header: wordmark, cart or order indicator and a menu button; full-screen menu with large links. | Core |

## 5. Sitemap

```
/                          Home
/gifting                   Gifting: boxes by category
/gifting/[slug]            Gift box page (also opens as a quick view drawer)
/charcuterie               Charcuterie boards
/charcuterie/[slug]        Board page (also as a quick view drawer)
/holiday-styling           Holiday Styling: three tree options, gift wrapping, takedown
/holiday-styling/inquire   Styling inquiry form
/order                     One-page order details (delivery or pickup, date, note)
/order/[id]                Order status page (secure link)
/service-area              GTA service area, delivery zones and fees, postal code checker
/our-story                 The two sisters
/faq                       FAQ
/policies/[slug]           Terms, delivery, refunds, privacy, allergen and safety, accessibility
/contact                   Contact form
/thank-you                 Confirmation
/admin/*                   Founders' dashboard (private)
```

## 6. Page requirements

### 6.1 Home (Core)
- Hero: one strong line, tagline, one primary button ("Shop Gifting") and one quiet link ("Book Holiday Styling").
- Three offer tiles: Gifting, Charcuterie, Holiday Styling. Each has an image slot, one sentence and one link.
- Featured signature boxes (up to three) with price and an **Order** button directly on the tile, so ordering starts from the home page.
- "Two sisters, one standard" short story block with link to Our Story.
- How it works in three steps: Choose, Personalize, Delivered with care.
- Service area teaser with postal code checker.
- Footer with contact, social, policies, newsletter opt-in (explicit consent).

### 6.2 Gifting (Core)
- Categories as quiet filter chips: Signature, For Him, For Her, Family, Food. Chips may be hidden when only one category has live products.
- Product grid of cards (image, name, "from" price, short line). Cards for **live** products show an **Order** button. Cards for **sample** products show "Coming soon" and a "Notify me" option.
- Launch with two or three live signature boxes. Additional categories appear as sample boxes.
- Opening a card shows a **quick view drawer** (no page load): large image, what is in the box (5 or 6 premium items listed), price, palette or option choice if any, quantity, and the **Order** button.
- Full product page exists for each box (same content plus gallery and notes) for search engines and sharing.

### 6.3 Charcuterie (Core)
- Same pattern as Gifting: board cards with size, serves (guest count), price, what is on the board.
- Quick view drawer shows contents, size options, allergen disclosure and lead time.
- Date and time-slot picker (FR-50), allergy notes field, delivery or pickup, pay in full.

### 6.4 Holiday Styling (Core)
- Introduction line and a strong image slot.
- **Three styling options** presented as three equal cards, each with a placeholder image, name, "from" price, and a bulleted list of what is included and what is not. Working names (to confirm): **Decorating Only**, **Decorating plus Sourcing**, **Full-Service**. The founders' past holiday styling content is brought in here.
- Add-ons: gift wrapping, festive space styling, takedown and storage.
- Trees over 9 ft: custom quote note.
- A single primary button on each card: **Inquire about this option**. It opens the inquiry form with the option preselected.
- Process in three steps (Inquire, Consult and quote, Styled) and a short FAQ.

### 6.5 Holiday Styling inquiry form (Core)
Short and elegant, saved to the dashboard (FR-60 to FR-66). Not Tally; one system for everything.

### 6.6 Service Area (Core)
- An elegant map or illustrated list of GTA areas (see FR-40), grouped into zones, with delivery fees, minimums and pickup information.
- A **postal code checker** returning zone, fee and available delivery days instantly.
- A "Not in your area?" note with a contact link.

### 6.7 Order details page `/order` (Core)
One compact page: items summary, delivery or pickup choice, postal code check, recipient name, address, date and window (or slot), gift note with live character count, allergy or avoid notes, contact details, consent boxes, and a single **Continue to payment** button. Autofills for returning visitors using the browser.

### 6.8 Our Story, FAQ, Policies, Contact (Core)
- Our Story: the two sisters, photo slots, ten years of gifting experience, standards and promise. Placeholder text until supplied.
- FAQ: accordion without divider lines.
- Policies: terms, refunds and cancellations, delivery and pickup, allergen and food, safety, privacy, accessibility.
- Contact: short form, email, WhatsApp link, Instagram, service area.

### 6.9 Order status page (Core)
Secure link, no login: order number, items, status steps (Received, Preparing, Ready, On its way or Ready for pickup, Delivered), date and window, contact button.

## 7. Functional requirements

### 7.1 Catalogue and content
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Products live in the database and are managed in the admin: name, slug, category, type (gift, board, styling package), status (live, sample, hidden), price, "from" flag, short description, contents list (ordered items), allergens, images, options, lead time, stock tracking on or off. | Core |
| FR-02 | Founders can add, edit, reorder, duplicate, hide and archive products without a developer. | Core |
| FR-03 | Product images upload from the admin (drag and drop), auto-resized and optimized; missing images show the placeholder (DR-18). | Core |
| FR-04 | Categories are managed in admin; adding a category adds a filter chip and page section. | Core |
| FR-05 | Page copy (Home, Our Story, FAQ, policies) is stored in structured files edited through the coding workflow, with a small set of editable fields in the admin (hero line, banner message). | Core |
| FR-06 | A new service type can be added later through configuration and templates, not a rebuild. | Later |

### 7.2 Ordering and checkout (gifts and boards)
| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Quick view drawer with **Order** button on every live product card and page. | Core |
| FR-11 | Order flow in three steps: Choose, Details (`/order`), Pay. Time to complete Details on a phone is under 90 seconds. | Core |
| FR-12 | Order accepts multiple items from day one (order items list), with a minimal cart summary. The default path is a single item. | Core |
| FR-13 | Payment through hosted Stripe Checkout in CAD with card, Apple Pay and Google Pay where available. No card data touches our servers. | Core |
| FR-14 | Order record created before the redirect to payment; marked paid only by a verified Stripe webhook. | Core |
| FR-15 | Order number format `JB-YYMM-###`. | Core |
| FR-16 | Confirmation page and email show items, date or slot, delivery or pickup details, the exact gift note, total paid and the order link. | Core |
| FR-17 | Gift note card: handwritten note text is captured and printed on the packing slip view for the founders. | Core |
| FR-18 | Promo codes, gift cards, multi-recipient corporate gifting. | Later |

### 7.3 Delivery, pickup and service area
| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Service area defined by zones (Core, Extended, Far or by quote) mapped from postal code prefixes in a table editable in the admin. | Core |
| FR-41 | Postal code check on the Service Area page, product quick view and order page shows zone, fee, minimum order and earliest date. | Core |
| FR-42 | **Delivery fee by zone** is added to the order total. **Free pickup** is always offered; the pickup address and instructions are revealed in the confirmation, not published on the site. | Core |
| FR-43 | Postal codes outside the service area: polite message, contact option, no payment. | Core |
| FR-44 | Delivery windows (for example morning, afternoon, evening) and blocked dates managed in admin. | Core |
| FR-45 | Delivery run sheet in admin: per day, grouped by zone, with address, window, contact, items and note. | Core |

### 7.4 Charcuterie slots
| ID | Requirement | Priority |
|---|---|---|
| FR-50 | Date and time-slot picker for boards. Each slot has a maximum number of boards (capacity) and a minimum lead time (default 48 hours, editable). | Core |
| FR-51 | A slot at capacity or inside the lead time is unavailable. Capacity is checked at checkout and reduced on payment. | Core |
| FR-52 | Allergy and dietary notes are required (a "none" option is allowed) and shown on the packing slip. | Core |
| FR-53 | Boards use narrower delivery windows; delivery or pickup only inside the slot. | Core |
| FR-54 | Same-day and rush orders show a "message us" path rather than checkout. | Core |

### 7.5 Holiday styling inquiry, quote and retainer
| ID | Requirement | Priority |
|---|---|---|
| FR-60 | Inquiry form with progressive steps: option, home details (area, postal code, tree height band, owned or needed, access and parking, pets and children, ceiling height), preferred dates (up to three), inspiration and palette, up to 5 photos, budget range, contact and consent. | Core |
| FR-61 | Trees over 9 ft and commercial jobs route to a custom quote path; no instant booking. | Core |
| FR-62 | Instant confirmation page and email; both founders alerted. | Core |
| FR-63 | In admin, the inquiry becomes a pipeline item: New, Consult, Quote sent, Accepted, Retainer paid, Scheduled, Installed, Balance paid, Done. | Core |
| FR-64 | Quote page (secure link) lists scope, total, retainer (40 percent) and terms; client accepts and pays the retainer through Stripe. | Core |
| FR-65 | Balance link generated for the remaining amount before the install date. | Core |
| FR-66 | Capacity guard: weekly install slots (default 4; commercial or luxury uses 2) and season cap (default 24); a waitlist message when full. | Core |
| FR-67 | Optional consult scheduling link (Cal.com or similar) shown after the inquiry. | Next |
| FR-68 | Quote builder in admin that produces the quote page and PDF. | Next |
| FR-69 | Reminder emails (day before, balance due, thank-you and review request). | Next |

### 7.6 Notifications and communication
| ID | Requirement | Priority |
|---|---|---|
| FR-70 | On every paid order: instant email to both founders and a confirmation email to the customer. | Core |
| FR-71 | On every inquiry or contact message: instant email to both founders and an auto-reply to the sender. | Core |
| FR-72 | Admin web push notifications on phones (installable admin as a home-screen app) for new orders, inquiries and low stock. | Core |
| FR-73 | In-dashboard alert: new order toast with a soft sound while the dashboard is open. | Core |
| FR-74 | Emails sent from the business domain, branded in the same palette, plain and elegant. | Core |
| FR-75 | Marketing email or text only with explicit opt-in (unchecked by default), unsubscribe, consent recorded with time and wording. | Core |
| FR-76 | SMS or WhatsApp automatic alerts through a paid API. | Later |

### 7.7 Admin dashboard (private)
| ID | Requirement | Priority |
|---|---|---|
| FR-80 | Passwordless login limited to the two founder emails. Installable to the home screen. | Core |
| FR-81 | **Live orders view:** new orders appear within 10 seconds without refreshing; filters (today, upcoming, status, type, zone); search by name, order number or phone. | Core |
| FR-82 | **Tracker board:** orders move across Received, Preparing, Ready, Out for delivery or Ready for pickup, Delivered. Status changes on a tap; the customer sees status on their order page; optional status email. | Core |
| FR-83 | **Order detail:** items, note, allergy notes, address, window, payment, history log, internal notes, owner (one accountable person), refund shortcut to Stripe. | Core |
| FR-84 | **Inventory:** stock count per product and option, low-stock threshold, manual adjust with reason, sold-out toggle, automatic decrement on payment, movement history. | Core |
| FR-85 | **Products manager** (FR-01 to FR-04) with live preview. | Core |
| FR-86 | **Slots and calendar:** charcuterie slot capacity, blocked dates, delivery windows, install capacity by week. | Core |
| FR-87 | **Inquiries pipeline** for holiday styling and contact messages with status, owner, notes, files and quote actions. | Core |
| FR-88 | **Packing slips and gift note cards:** printable page per order and a day batch. | Core |
| FR-89 | **Today view:** what to prepare and deliver today and tomorrow, grouped by window and zone. | Core |
| FR-90 | Reports: orders, revenue, average order value, by product and category, by zone; weekly summary. | Core |
| FR-91 | CSV export for orders, customers, inquiries, inventory. | Core |
| FR-92 | **Settings and switches:** `gifting_open`, `charcuterie_open`, `styling_open`, `takedown_storage_open`, tax mode, pickup details, delivery fees and minimums, lead times, cutoffs, banner message, notification recipients. All take effect on the public site within one minute. | Core |
| FR-93 | Audit log of status, price, stock and setting changes. | Core |
| FR-94 | Customer data export and deletion on request. | Core |
| FR-95 | Costs per product and job to show margin in reports. | Next |

### 7.8 SEO, analytics and trust
| ID | Requirement | Priority |
|---|---|---|
| FR-100 | Titles, descriptions, Open Graph images, sitemap.xml, robots.txt, canonical URLs, structured data (LocalBusiness, Product, Service). | Core |
| FR-101 | Privacy-friendly analytics with events: product_view, order_start, details_complete, payment_success, inquiry_submit, postal_check. | Core |
| FR-102 | Reviews and testimonials block hidden until real, permissioned entries exist. | Core |
| FR-103 | Google Business Profile and Instagram links. | Core |

## 8. Business rules

| ID | Rule |
|---|---|
| BR-01 | Order and inquiry numbers use `JB-YYMM-###`, sequence resets monthly. |
| BR-02 | Gift and board orders are paid in full online. Holiday styling is confirmed only after quote acceptance and the 40 percent retainer. |
| BR-03 | Balance for styling is due 48 hours before the install date. Client-purchased decor is prepaid. |
| BR-04 | Trees over 9 ft and commercial jobs are custom quote only and use 2 capacity slots. |
| BR-05 | Install capacity: 4 per week; season cap 24 (editable). |
| BR-06 | Charcuterie lead time: 48 hours by default; slot capacity set per slot; same-day by message only. |
| BR-07 | Gift lead time: set per product (default 3 days); blocked dates and cutoffs are editable settings. |
| BR-08 | Delivery fee by zone with minimum order per zone; pickup is free. Zone and fee values are editable. |
| BR-09 | Stock is decremented when payment is confirmed. If two buyers pay for the last item, the later order is flagged "Needs attention" and a founder resolves it within the dashboard (offer alternative or refund). |
| BR-10 | Allergy fields are required on board orders and shown on the packing slip. |
| BR-11 | Prices shown as "from" for options or quotes; checkout always shows the exact amount. |
| BR-12 | HST wording and calculation follow the `tax_mode` setting. |
| BR-13 | One accountable owner per order or inquiry (the sister handling it). |
| BR-14 | Photos of client homes are shared only with consent recorded on the inquiry. |

### Starting content and prices (PLACEHOLDER unless noted)
| Item | Placeholder |
|---|---|
| Signature Men's Box | From **$120** (given by the founders); 5 or 6 premium items (founders will supply the list) |
| Signature boxes at launch | Two or three live; for example Signature Men's, Signature Women's, Signature Family |
| Sample categories | For Him, For Her, Family, Food-based boxes, shown as samples |
| Charcuterie boards | Small (serves 4 to 6), Medium (serves 8 to 10), Large (serves 12 to 16); prices to supply |
| Holiday styling options | Decorating Only; Decorating plus Sourcing; Full-Service; starting prices from the Blueprint ($275 and $425 bands for decorating; Full-Service custom) |
| Add-ons | Gift wrapping, festive space styling, takedown and storage |
| Delivery zones | Core, Extended, Far (quote); fees from $15 to $45 in the Blueprint, to confirm |

## 9. Data requirements (summary)

Customers, products, product options, inventory movements, orders, order items, payments, delivery zones and postal prefixes, slots and capacity, styling inquiries and quotes, contact messages, consents, files, notification subscriptions, settings, audit log. Retention: delete client photos and notes 12 months after last activity unless the client opts in to keep a preferences list. Full model in `03-Architecture.md`.

## 10. Integrations

| Integration | Purpose | Cost |
|---|---|---|
| Stripe (Canada) | Checkout, retainers, balances, refunds, webhooks | Transaction fees only |
| Resend | Transactional email from the business domain | Free tier |
| Neon Postgres via Vercel | Data | Free tier |
| Vercel Blob | Product and inquiry images | Free tier |
| Web Push (VAPID) | Phone alerts for the admin | Free |
| Cloudflare Turnstile | Spam protection | Free |
| Vercel Analytics or Plausible | Analytics | Free to low |
| Optional: Cal.com | Consult scheduling | Free |
| Later: SMS or WhatsApp API | Automatic alerts | Paid |

## 11. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Performance: LCP under 2.5 s on 4G mobile; images optimized; light JavaScript on content pages; drawers and checkout feel instant. |
| NFR-02 | Accessibility: WCAG 2.1 AA; axe checks pass; manual keyboard and screen reader smoke test. |
| NFR-03 | Security: HTTPS; secrets in env variables; hosted payments; webhook signature verification; server-side price calculation; validation on every input; rate limits; protected admin. |
| NFR-04 | Privacy: PIPEDA aligned; CASL consent for promotional messages; privacy policy linked on forms; minimal data. |
| NFR-05 | Reliability: persist before notify; failed emails retried; webhook handlers idempotent; daily database backup and a monthly export to the founders' Drive. |
| NFR-06 | Observability: error tracking, uptime checks, alert to founders on payment or webhook failures. |
| NFR-07 | Browsers: last 2 versions of Chrome, Safari, Edge, Firefox; iOS Safari 16.4 and above (push needs the installed app). |
| NFR-08 | Cost: fixed monthly cost under about $20 CAD. |
| NFR-09 | Maintainability: TypeScript, lint, tests, README and runbook, content separate from code, Git push deploys with preview URLs. |
| NFR-10 | Design integrity: automated check that no divider elements exist (DR-14) and that colours come from tokens. |

## 12. Legal and policy content

Founders approve: terms, refunds and cancellation, delivery and pickup, allergen and food, safety, privacy, accessibility. Starter wording is in the Business Blueprint (Template K). A lawyer review is recommended; business structure, tax registration and insurance wording will be revisited later and the site text must be easy to update.

## 13. Out of scope

Customer accounts, loyalty, gift cards, native apps, nationwide shipping, subscription gifting, live chat, multi-language.

## 14. Release criteria

1. Every Core requirement passes its acceptance test in the Implementation Plan.
2. A real $1 payment completes, appears in the dashboard within 10 seconds, triggers both email alerts and a phone push, then refunds correctly.
3. Stock and slot counts change correctly, and the last-item race is handled.
4. All three offer switches work in both states.
5. Mobile Lighthouse 90 or above on Home, Gifting and Holiday Styling.
6. The no-divider check, contrast checks and keyboard checks pass.
7. Both founders can add a product, change a price, adjust stock and move an order through the tracker unaided.

## 15. Decisions log (from the Q&A)

| Topic | Decision |
|---|---|
| Timeline | No timeline in the documents; comprehensive scope as required |
| Dashboard | Built-in admin page on the site (not Notion or a Sheet) |
| Charcuterie ordering | Pay online with date and time slot, 48 hour lead time by default |
| Delivery | Fee by postal code zone plus free pickup |
| Holiday styling form | Built into the site and saved to the same dashboard (not Tally) |
| Permits, licences, insurance | Assumed complete; availability switches retained |
| Business set-up (structure, registration, insurance) | To be handled later, separately |

## 16. Open items to confirm (defaults apply if unanswered)

| # | Item | Default |
|---|---|---|
| 1 | Item lists, prices and photos for each gift box | Placeholders |
| 2 | Charcuterie sizes, serving counts, prices, slot windows and daily capacity | Small, Medium, Large placeholders; 3 windows; capacity 6 per window |
| 3 | The three holiday styling option names and inclusions from past work | Decorating Only, Decorating plus Sourcing, Full-Service |
| 4 | Delivery zones: which cities and postal prefixes sit in each zone; fees; minimums | Proposed table in config for review |
| 5 | Pickup address and hours | Revealed after order; set in admin |
| 6 | Sisters' names, roles, photos, story | Placeholders |
| 7 | Chosen font pairing and ampersand | Default pairing and design review page |
| 8 | HST status | Tax mode off until confirmed |
| 9 | Meaning of "order for filming" in the voice note, assumed to be **order fulfilment** (packing slips, delivery run sheet, tracker) | Fulfilment tools as specified in FR-45, FR-82, FR-88, FR-89 |
| 10 | Existing site stack and repository | Audit first |

## 17. Traceability to the founders' brief

| In the brief | Requirement |
|---|---|
| Premium three-in-one brand: gifting, charcuterie, holiday styling | Sections 1, 5, 6 |
| Two-sister brand with ten years of gifting | DR-01, 6.8 |
| Signature men's box from $120, 5 or 6 premium items; women, family, food boxes; start with two or three | 6.2, FR-01, section 8 |
| Samples shown for all categories | 6.2, status "sample" |
| Beautiful placeholders for images and trees | DR-18, 6.4 |
| Front end, back end, payment, contact form | FR-13, 6.8, 7.7 |
| Clean, minimal, luxury fonts, slight texture, cream and forest green, stand out only when needed | DR-10 to DR-19 |
| Unique ampersand | DR-03 |
| Not common AI fonts | DR-16 |
| Order within 5 to 10 seconds; click image, see contents | Goal 1, FR-10, FR-11, 6.2 |
| Sticky header | DR-30 to DR-32 |
| Three distinct pages after Home | Section 5 |
| Charcuterie like gifting: options, click pay | 6.3, FR-50 to FR-54 |
| Holiday styling with three options and included lists; form | 6.4, 6.5, 7.5 |
| Simplest structure; notifications on sale; payment; real-time orders; tracker; dashboard; inventory | 7.2, 7.6, 7.7 |
| GTA service area page | 6.6, 7.3 |
| Charcuterie permits and insurance assumed; set-up later | A1, section 15 |
