# June & Bloom Website: Implementation Plan

**Version:** 2.0 (supersedes 1.0) | **Date:** 2026-10-22 | **Companion docs:** `01-PRD.md`, `03-Architecture.md`
**Purpose:** The order of work, task by task, with acceptance tests, so the coding agent can build the site and the founders can approve each step.
**Note:** By the founders' decision this plan contains no dates or time estimates. Work is sequenced by dependency. Each work package ends with an approval point.

---

## 1. Working agreement

| Topic | Agreement |
|---|---|
| Source of truth | PRD says what; Architecture says how; this plan says in what order and how it is accepted |
| Branch flow | Agent builds on a branch; Vercel creates a preview URL; founders review the preview; approval merges to main; main deploys to production |
| Approvals | Each work package ends with a short demo list. Founders reply "approved" or list changes in one message |
| Secrets | Founders paste API keys into Vercel and `.env.local`; the agent never commits secrets |
| Content gaps | Agent uses elegant placeholders (DR-18) and records every gap in `CONTENT_TODO.md` |
| Design rules | No divider lines; JB monogram from the supplied SVG only; colours from tokens only; no text in black |
| Copy rules | Warm, composed, specific. No hype words, no em dashes, no exclamation marks |
| Scope control | Build only what is in the task. New ideas go to the backlog (section 6) |
| Definition of done | Acceptance test passes; lint, types and tests pass; mobile and keyboard check; preview reviewed |
| Reporting | After each work package the agent reports: tasks done, tests passing, what needs approval, open questions |

## 2. Founder inputs (gather in parallel; placeholders cover any gap)

| Input | Used in |
|---|---|
| JB monogram SVG | WP1 |
| Item list, name and price for each gift box (Signature Men's from $120, 5 or 6 items; plus the next one or two signature boxes) | WP4 |
| Sample categories to display (For Him, For Her, Family, Food) with names and short descriptions | WP4 |
| Charcuterie sizes, serving counts, prices, what is on each board, slot windows, capacity, allergens | WP5 |
| Holiday styling: three option names, inclusions, exclusions, starting prices (from past work) | WP6 |
| Delivery zones, fees, minimums; pickup address and hours | WP3, WP4 |
| Sisters' names, roles, photos, story | WP4 |
| Stripe account (Canada) verified; Resend account and domain records; Neon database; Turnstile keys; admin emails | WP2, WP7 |
| Approval of fonts and ampersand | WP1 |
| Policy wording approval | WP9 |

## 3. Work packages in order

Dependencies are shown as "After". Task references like FR-10 point to the PRD.

### WP0: Discovery and decisions
| ID | Task | Acceptance |
|---|---|---|
| T0.1 | Open the existing project folder and audit it: stack, pages, dependencies, deployment, repository, what can be reused | `docs/AUDIT.md` with a clear extend-or-rebuild recommendation |
| T0.2 | Record the stack decision as ADR-001 and confirm the stack in `03-Architecture.md` | Decision recorded and approved |
| T0.3 | Create `CONTENT_TODO.md`, `ACCOUNTS.md` (names only, no secrets), `CHANGELOG.md` | Files exist; checklist matches section 2 |
| T0.4 | Confirm accounts exist or create them (Vercel, GitHub, Neon, Stripe, Resend, Turnstile) | Checklist ticked |

**Approval point:** founders approve the audit and stack decision.

### WP1: Foundation and design system
After WP0.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T1.1 | Project skeleton per Architecture section 8; TypeScript, ESLint, Prettier, Vitest, Playwright; CI | `lint`, `typecheck`, `test` pass in CI | NFR-09 |
| T1.2 | Design tokens: colours (`#FDFBF7`, `#032A19`, `#122620`, `#E6C687`, `#7A8B7B`), spacing, type scale, radius, motion | Tokens file is the single source; no raw hex in components | DR-10 to DR-13 |
| T1.3 | Background: cream, with the graduation to emerald only before the footer | Visual check at multiple heights | DR-10 |
| T1.4 | Paper-grain texture at 3 to 5 percent opacity | Subtle at normal view, no effect on text legibility, no layout cost | DR-12 |
| T1.5 | `/dev/type` page showing the default pairing and two alternates, on real sample content | Founders can pick a pairing in one pass | DR-16 |
| T1.6 | `/dev/ampersand` page showing three ampersand options in the wordmark at header size and large; export the chosen one as outlined SVG | Approved option becomes the wordmark | DR-03 |
| T1.7 | Wordmark component and favicon set (JB monogram used only from the supplied file) | Wordmark renders the same on all browsers | DR-02, DR-03 |
| T1.8 | Sticky header, mobile menu, footer | Always visible; transparent over hero then solid with blur; 64 px max; keyboard accessible | DR-30 to DR-32 |
| T1.9 | Core components: Button (one primary style), TextLink, Card, Section, Hero, Drawer, Accordion, Chip, Field set, Toast, StatusBadge, Placeholder | Shown on `/dev/components`; none use divider lines | DR-13, DR-14, DR-18 |
| T1.10 | Placeholder component: tonal panel, grain, product name in heading font, correct aspect ratios (4:5 and 3:2) | Looks intentional at every size | DR-18 |
| T1.11 | Automated design checks: fail if `<hr>`, divider borders or black text colours appear; fail on raw hex outside tokens | Check runs in CI | NFR-10, DR-14 |
| T1.12 | Page transitions and scroll reveals with reduced-motion support | Reduced-motion users see no animation | DR-19 |

**Approval point:** founders approve fonts, ampersand, header and the overall look on the preview.

### WP2: Data layer and settings
After WP0. Can run alongside WP1.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T2.1 | Database schema and migrations per Architecture section 9 | All tables created; migrations repeatable | PRD 9 |
| T2.2 | Seed data: categories, 3 sample gift boxes plus sample categories, 3 board sizes, 3 styling options, zones and a proposed postal prefix table, slot windows, settings | Seed script runs on a fresh database and on preview | PRD 8 |
| T2.3 | Settings service with caching (about 60 seconds) and the four availability switches | Changing a switch alters the public site within a minute | FR-92 |
| T2.4 | Domain services with unit tests: order numbers, zone lookup, delivery fee, order totals, stock availability, slot availability, capacity for installs, retainer and balance maths | All rules covered by tests, including edge cases | BR-01 to BR-14 |
| T2.5 | Validation schemas shared by client and server | Invalid input is rejected with friendly messages | NFR-03 |
| T2.6 | Money in integer cents; one formatting helper | No floating point money | NFR-03 |

### WP3: Service area and zones
After WP2.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T3.1 | Zone and postal prefix admin data and public lookup function | Postal code returns zone, fee, minimum or "outside area" | FR-40, FR-41 |
| T3.2 | Postal code checker component (reused on Service Area, quick view and order page) | Result appears in under a second; accessible | FR-41 |
| T3.3 | Service Area page with an elegant illustrated map or area list grouped by zone, fees, minimums, pickup note | Works on mobile; fees match settings | FR-40, FR-42, 6.6 |
| T3.4 | Outside-area flow: polite message and contact link, no payment path | Tested | FR-43 |

### WP4: Public pages, gifting catalogue and ordering
After WP1, WP2, WP3.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T4.1 | Home page | All blocks in PRD 6.1; featured boxes have Order buttons | 6.1 |
| T4.2 | Gifting page with category chips and product cards (live and sample states) | Live cards order; sample cards show Coming soon and Notify me | 6.2, FR-01 |
| T4.3 | Quick view drawer: image, contents, price, options, quantity, Order button | Opens without page load; keyboard and screen reader friendly | FR-10 |
| T4.4 | Product page for each box (same content plus gallery, notes) with structured data | Indexable; shareable | FR-100 |
| T4.5 | "Notify me" capture for sample products with consent | Stored; visible in admin | FR-01, FR-75 |
| T4.6 | Order details page `/order` with items summary, delivery or pickup, postal check, recipient, date and window, gift note with character count, allergy notes, contact, consent | Completed in under 90 seconds on a phone in a usability test | 6.7, FR-11 |
| T4.7 | Date and window logic using lead time, blocked dates and cutoffs | Unavailable dates cannot be selected | FR-44, BR-07 |
| T4.8 | Order creation: server calculates all totals from the database (never from the client); order record created with status "Awaiting payment" | Tampering with client values has no effect | FR-14, NFR-03 |
| T4.9 | Stripe Checkout session creation and redirect; success and cancel pages | Test card works; cancel returns to the order page with data kept | FR-13 |
| T4.10 | Stripe webhook: verify signature, idempotent processing, mark paid, decrement stock, write payment and movement records | Same event delivered twice changes nothing the second time | FR-14, BR-09 |
| T4.11 | Last-item race handling: later payer flagged "Needs attention" | Simulated race produces one normal and one flagged order | BR-09 |
| T4.12 | Confirmation page and email with the exact gift note and order link | Content matches the order | FR-16 |
| T4.13 | Order status page `/order/[id]` with secure token | Wrong token shows nothing; right token shows status | 6.9 |
| T4.14 | Our Story, FAQ, Contact, Thank-you pages with placeholders flagged in `CONTENT_TODO.md` | No broken layouts when text changes | 6.8 |
| T4.15 | Contact form with Turnstile, honeypot, rate limit, persistence and alerts | Message saved before email sends | FR-71 |

**Approval point:** founders place a test order end to end on the preview using Stripe test mode.

### WP5: Charcuterie
After WP4.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T5.1 | Charcuterie page with board cards and quick view (size, serves, contents, allergens, lead time) | Same ordering pattern as Gifting | 6.3 |
| T5.2 | Slot data model and admin-editable capacity; slot picker UI showing available dates and windows | Full or too-soon slots are disabled | FR-50, FR-51 |
| T5.3 | Allergy and dietary field required on board orders; shown on packing slip | Cannot proceed without choosing an option | FR-52, BR-10 |
| T5.4 | Capacity reduced on payment; slot full state; race handling same as stock | Tested with parallel orders | FR-51, BR-09 |
| T5.5 | Narrow delivery windows for boards; same-day shows "message us" path | Same-day cannot reach checkout | FR-53, FR-54 |
| T5.6 | `charcuterie_open` switch honoured on all pages | When off, shows a polite pause message and contact link | FR-92 |

### WP6: Holiday Styling
After WP4.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T6.1 | Holiday Styling page with three option cards, inclusions and exclusions, add-ons, over-9-ft note, process steps, FAQ | One primary button per card | 6.4 |
| T6.2 | Inquiry form: progressive steps, option preselected, up to 5 photo uploads, dates, palette, budget, consent | Completed in under 3 minutes on a phone | FR-60 |
| T6.3 | Rules: over 9 ft or commercial goes to custom quote path; capacity guard and waitlist message | Verified with test cases | FR-61, FR-66, BR-04, BR-05 |
| T6.4 | Instant confirmation and alerts | Both founders alerted; sender auto-reply | FR-62, FR-71 |
| T6.5 | Pipeline in admin (WP8) and quote page with secure link, 40 percent retainer through Stripe, acceptance record | Retainer payment moves the inquiry to "Retainer paid" | FR-63, FR-64, BR-02 |
| T6.6 | Balance link generation | Balance equals total minus retainer | FR-65 |
| T6.7 | `styling_open` switch and takedown and storage switch | Respected everywhere | FR-92 |

### WP7: Notifications and email
After WP4 (alongside WP5 and WP6).

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T7.1 | Email service, branded plain and HTML templates: customer order confirmation, founder order alert, inquiry received, inquiry alert, status updates | Rendered and checked in three mail clients | FR-70, FR-71, FR-74 |
| T7.2 | Domain email setup (SPF, DKIM, DMARC) | Test emails reach the inbox, not spam | NFR-05 |
| T7.3 | Message log with retry for failures | A forced failure retries and then alerts | NFR-05 |
| T7.4 | Web push: VAPID keys, service worker, subscription storage, push on new order, new inquiry, low stock | Phone receives a push within 30 seconds of payment | FR-72 |
| T7.5 | Admin installable as a home-screen app (manifest and icons using the JB monogram file) | Installs on iOS and Android | FR-80 |
| T7.6 | Consent store and unsubscribe handling | Consent text, time and source stored | FR-75 |

### WP8: Admin dashboard
After WP2; features arrive as their data exists. Final acceptance after WP4 to WP7.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T8.1 | Passwordless login limited to two founder emails; server-side protection on every admin route and action | Any other email is refused everywhere | FR-80, NFR-03 |
| T8.2 | Layout optimized for phone first: bottom navigation (Orders, Today, Inventory, Inquiries, More) | Usable one-handed | FR-80 |
| T8.3 | Live orders view with filters, search and new-order toast and soft sound; refresh within 10 seconds | A new test order appears without refreshing | FR-81, FR-73 |
| T8.4 | Tracker board with tap-to-advance status; optional customer status email | Customer sees status on their order page | FR-82 |
| T8.5 | Order detail with history, internal notes, owner, refund shortcut, "Needs attention" handling | Status changes logged | FR-83, BR-13 |
| T8.6 | Inventory screen: counts, thresholds, adjust with reason, sold-out toggle, movement history, low-stock alert | Paid order reduces stock; manual adjust logged | FR-84 |
| T8.7 | Products manager: add, edit, reorder, duplicate, hide, archive; image upload; options; live preview | Founders add a new box without a developer | FR-85, FR-01 to FR-04 |
| T8.8 | Slots and calendar screens: board slot capacity, blocked dates, delivery windows, install capacity | Changes appear on the public site within a minute | FR-86 |
| T8.9 | Inquiries pipeline: list, detail, files, notes, owner, status, create quote, send quote link | Full path from inquiry to retainer works | FR-87 |
| T8.10 | Today view and delivery run sheet grouped by window and zone | Printable and phone friendly | FR-45, FR-89 |
| T8.11 | Packing slips and gift note cards, single and batch print | Prints cleanly on letter paper | FR-88, FR-17 |
| T8.12 | Reports: orders, revenue, average order value, by product, category and zone | Totals match Stripe test data | FR-90 |
| T8.13 | CSV exports | Files open correctly in a spreadsheet | FR-91 |
| T8.14 | Settings screen with availability switches and all editable values | Each setting verified on the public site | FR-92 |
| T8.15 | Audit log and customer data export and delete | Actions recorded; delete verified | FR-93, FR-94 |

**Approval point:** founders run a full day simulation: three test orders, one inquiry, a stock adjustment, a new product added, a status change and a printed packing slip.

### WP9: SEO, analytics, policies
After WP4.

| ID | Task | Acceptance | Refs |
|---|---|---|---|
| T9.1 | Metadata, Open Graph images, sitemap, robots, canonical URLs | Validated | FR-100 |
| T9.2 | Structured data for LocalBusiness, Product, Service | Rich result test passes | FR-100 |
| T9.3 | Analytics events listed in FR-101 | Events appear in the analytics tool | FR-101 |
| T9.4 | Policy pages from approved wording, linked in footer and on forms | Linked everywhere required | PRD 12 |
| T9.5 | Reviews block hidden until entries exist | Verified empty and populated states | FR-102 |

### WP10: Quality, security and performance
After WP4 to WP9.

| ID | Task | Acceptance |
|---|---|---|
| T10.1 | Full test suite: unit, integration, end-to-end (section 5) | All green |
| T10.2 | Performance tuning | Mobile Lighthouse 90 or above on Home, Gifting, Holiday Styling |
| T10.3 | Accessibility audit | axe zero serious; keyboard-only run of every flow |
| T10.4 | Security checklist (Architecture section 11) | Every item verified |
| T10.5 | Cross-device checks: iPhone Safari, Android Chrome, desktop Chrome, Safari, Edge | No blocking defects |
| T10.6 | Content and copy QA | Tone, spelling, no em dashes, no hype words |
| T10.7 | Design QA | Cream, forest green, grain, no divider lines, one primary button per view |

### WP11: Launch readiness
After WP10.

| ID | Task | Acceptance |
|---|---|---|
| T11.1 | Switch Stripe to live keys; run a real $1 payment and refund | Appears in dashboard within 10 seconds; push and emails fire |
| T11.2 | Production domain, redirects, SSL, email DNS verified | Verified |
| T11.3 | Production seed with real products, zones, settings; remove test data | Clean database |
| T11.4 | Monitoring and alerts live | A forced error produces an alert |
| T11.5 | Backups confirmed; first monthly export tested | Restore test succeeds |
| T11.6 | Founders' walkthrough and `docs/RUNBOOK.md` (change a price, add a product, adjust stock, pause an offer, refund, export, rotate keys) | Founders complete each task unaided |
| T11.7 | Go or no-go against PRD section 14 | Both founders approve |

## 4. Test plan

| Level | Tools | Coverage |
|---|---|---|
| Unit | Vitest | Pricing, totals, zones, fees, lead times, slot and stock availability, capacity, order numbers, retainer maths |
| Integration | Vitest with a test database | Server actions, webhook handler (idempotent, bad signature rejected), message retries, inventory movements |
| End to end | Playwright | Gift order to paid; board order with slot; inquiry to quote to retainer; admin login and status change; switches on and off; outside-area postal code |
| Visual and accessibility | axe, Lighthouse CI | Contrast, focus, performance budget, no-divider check |
| Manual | Founders | Real phone run of every flow; copy and photo review |

### Acceptance scenarios (must pass)
1. A visitor on a phone opens Home, taps Order on the Signature Men's Box, completes Details and reaches payment in three steps.
2. A test payment completes; the order appears in the dashboard within 10 seconds; both founders get an email; a phone push arrives.
3. Stock drops by one after payment; at zero the product shows Sold out and cannot be ordered.
4. Two simultaneous buyers of the last item: one order is normal, one is flagged "Needs attention".
5. A board order for a date inside the lead time is blocked; a full slot is disabled.
6. A postal code outside the area cannot pay and sees the polite message.
7. The same Stripe webhook delivered twice creates one payment.
8. A 12 ft tree inquiry shows the custom quote path with no instant booking.
9. A non-founder email cannot reach any admin page or API.
10. Turning off `charcuterie_open` hides ordering within a minute and shows the pause message.
11. Founders add a new gift box with photos in the admin and see it on the site.
12. The design checks report no dividers, no black text and no off-token colours.

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Existing site stack cannot support the requirements | Decide in WP0; the pages are simple enough to rebuild cleanly |
| Stripe verification or webhook issues | Start verification early; test mode through WP4 to WP10; live test in WP11 |
| Email lands in spam | SPF, DKIM, DMARC; test in several mail clients; alerts also go to push |
| Overselling stock or slots | Server-side checks, atomic decrements, flagged races, tests |
| Content or photos late | Elegant placeholders; the site is complete without them |
| Push notifications not delivered on iOS unless installed | Prompt installation in admin onboarding; email alerts always on |
| Fonts or ampersand taste | Review pages in WP1 with alternates |
| Scope creep | Backlog list; approvals at the end of each work package |
| Free-tier limits | Usage watch in runbook; upgrade path documented |
| Policies and business set-up not yet finalised | Policy pages are easy to edit; set-up handled separately later |

## 6. Backlog (after launch)

| Item | Ref |
|---|---|
| Quote builder with PDF | FR-68 |
| Reminder emails: day before, balance due, review request | FR-69 |
| Optional consult scheduling | FR-67 |
| Cost tracking and margin reports | FR-95 |
| Multi-recipient and corporate gifting | FR-18 |
| Promo codes and gift cards | FR-18 |
| SMS or WhatsApp alerts | FR-76 |
| Reviews and testimonials admin | FR-102 |
| Client preferences list with birthdays and holiday reminders | Blueprint |
| New service types (spring styling, event styling) via configuration | FR-06 |

## 7. Change control

- Copy, price, photo and stock changes are made in the admin; no developer needed.
- Behaviour changes update the PRD requirement, then this plan, then the build.
- Every change gets a one-line note in `CHANGELOG.md`.

## 8. Prompts for the coding agent

Paste in order. Replace bracketed fields.

**Prompt 0: Audit**
"Read `docs/01-PRD.md`, `docs/02-Implementation-Plan.md` and `docs/03-Architecture.md`. Audit the project in [folder]. Write `docs/AUDIT.md` with stack, pages, dependencies, deployment settings, repository status and a recommendation to extend or rebuild. Do not change any code."

**Prompt 1: Foundation (WP1) and data (WP2)**
"Implement WP1 and WP2 exactly as written. Follow the design rules: cream `#FDFBF7` background with a very subtle grain, forest green text, one primary button style per view, no divider lines of any kind, JB monogram only from the supplied SVG, and no common AI fonts. Build `/dev/type` and `/dev/ampersand` review pages. Stop at the approval point and give me the preview URL."

**Prompt 2: Ordering (WP3 and WP4)**
"Implement WP3 and WP4. Orders are priced on the server from the database. Webhooks must be idempotent. Keep three steps: Choose, Details, Pay. Use placeholders for missing content and log them in `CONTENT_TODO.md`. Stop at the approval point."

**Prompt 3: Charcuterie, Holiday Styling, Notifications (WP5 to WP7)**
"Implement WP5, WP6 and WP7 with tests for every rule in the PRD section 8. Do not add features that are not in the tasks."

**Prompt 4: Admin (WP8)**
"Implement WP8 phone-first. Verify every admin route and action on the server. Add the live order toast, push notifications, inventory, products manager, tracker, run sheet, packing slips and settings."

**Prompt 5: Quality and launch (WP9 to WP11)**
"Implement WP9 to WP11. Report test results, Lighthouse scores and the security checklist status. Do not switch Stripe to live keys until I confirm."
