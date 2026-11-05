# DESIGN SYSTEM SPECIFICATION (`DESIGN.md`)
> Machine-readable design system and frontend contract for AI coding agents and developers.
> Tailored for **June & Bloom Lifestyle Company** (`docs/01-PRD.md` Section 4 & `docs/03-Architecture.md` Section 13), combining high-craft frontend engineering standards with the June & Bloom cream, forest green, emerald, gold, and sage colour theme.

---

## 1. System Identity & Philosophy

- **Brand**: June & Bloom Lifestyle Company — *"memories that inspire"* (appears in the hero and footer).
- **Archetype**: Everyday-Luxury Minimalist / High-Craft Editorial & Commerce. Warm, composed, tactile, and deliberately not overtly feminine (no script fonts, no floral clip art, no pink, no heavy ornament).
- **Core Principle**: Depth through tonal shifts, subtle paper-grain texture, generous whitespace, and deliberate typography — never divider lines, ruled borders, flat gray boxes, or decorative clutter.
- **Visual Weight**: Calm, lightweight, high breathing room, one clear primary action per view, zero visual noise.
- **Logo & Wordmark Rules**:
  - **JB Monogram (`DR-02`)**: Use only the supplied `public/brand/jb-monogram.svg`. Never redraw, recolour, or recreate it.
  - **Distinctive Ampersand (`DR-03`)**: Wordmark `"June & Bloom"` uses a unique, hand-picked ampersand exported as an outlined SVG (`public/brand/ampersand.svg`) set slightly larger with a gentle baseline drop in `--gold` (`#E6C687`) on emerald surfaces and `--gold-text` (`#846A28`) on ivory. Three candidates are reviewed on `/dev/ampersand` (italic display serif, swash, engraved).

---

## 2. Color Palette & Token Contract (June & Bloom Theme)

All colours must come from design tokens (`src/styles/tokens.css`). Raw hex values outside the tokens file and black text (`#000`, `#000000`, `black`) are strictly forbidden and blocked by automated CI checks (`NFR-10`).

### Surface, Text & Accent Hierarchy
| Token | Value | Tailwind / CSS Equivalent | Purpose |
| :--- | :--- | :--- | :--- |
| `--ivory` | `#FDFBF7` | `bg-[var(--ivory)]` / `text-[var(--ivory)]` | Page background (off-white with a very subtle cream undertone) & text on emerald primary buttons |
| `--ink` | `#032A19` | `text-[var(--ink)]` | Body text throughout (dark forest green). **Never use black text** |
| `--emerald` | `#122620` | `bg-[var(--emerald)]` / `text-[var(--emerald)]` | Headings, header, primary button fill, footer, and page gradient end |
| `--gold` | `#E6C687` | `text-[var(--gold)]` / `bg-[var(--gold)]` | Ampersand on emerald surfaces, small accents, hover states. Never use for small text on ivory |
| `--gold-text` | `#846A28` | `text-gold-text` | Accessible gold accent text on ivory and cream surfaces. Measured 4.99:1 on ivory and 4.74:1 on cream (WCAG 2.1 AA). Darkened from the original `#9A7B2F`, which measured 3.87:1 and failed AA for small text |
| `--sage` | `#7A8B7B` | `bg-[var(--sage)]` / `text-[var(--sage)]` | Quiet tonal surfaces, filter chips, and status tags. Never use for small text on ivory |
| `--bg-page` | `linear-gradient(to bottom, #FDFBF7 0%, #FDFBF7 85%, #122620 100%)` | Page wrapper background | Cream background graduating to emerald **only** in the final screen before the footer (`DR-10`) |
| `--grain` | SVG noise (`public/textures/grain.svg`) at `3%–5%` opacity | Texture overlay | Subtle paper-grain undertone (`DR-12`); barely noticeable, never muddies text, zero layout/perf cost |
| `surface-glass` | `rgba(253, 251, 247, 0.88)` | `bg-[var(--ivory)]/88 backdrop-blur-md` | Sticky header after scrolling past the hero (`DR-30`, max height `64px`) |

### Separation Without Dividing Lines (`DR-14`)
- **No Line Separators**: Never use `<hr>`, horizontal rules, divider lines, or ruled borders between sections, cards, or list rows.
- **Separation Mechanism**: Separate exclusively with spacing (`4, 8, 12, 16, 24, 32, 48, 72, 112 px`), tonal shifts (ivory `#FDFBF7`, soft tonal sage/cream panels, emerald `#122620`), and background blocks.
- **Focus States (`DR-20`)**: Visible, high-contrast keyboard focus rings (`ring-2 ring-[var(--emerald)] ring-offset-2 ring-offset-[var(--ivory)]`).

---

## 3. Typography & Spatial Rhythm

### Font Stacks (`DR-16`)
Self-hosted through the Next.js font loader with zero third-party network requests and zero layout shift:
- **Default Pairing**:
  - **Headings**: `Newsreader` (screen-first editorial serif with an optical-size axis; sturdy at small sizes)
  - **Body**: `Hanken Grotesk` (clean, warm humanist sans)
- **Alternates (on `/dev/type` for founder approval)**:
  - **Previous default**: `Bodoni Moda` (headings) + `Hanken Grotesk` (body). High contrast, thin hairlines at small sizes.
  - **Alternate 1**: `Libre Caslon Display` (headings) + `Albert Sans` (body)
  - **Alternate 2**: `Instrument Serif` (headings) + `Figtree` (body)

### Scale & Tracking Matrix
Type scale uses `14, 16, 18, 22, 28, 36, 48, 64 px` with tight, confident headline spacing:

| Level | Size | Weight | Tracking (Letter Spacing) | Line Height | Color | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px–64px` | `font-normal` / `font-medium` | `tracking-tight` (`-0.025em`) | `leading-[1.08]` | `--emerald` (`#122620`) | Landing page H1 |
| **Section Title** | `28px–36px` | `font-normal` / `font-medium` | `tracking-tight` (`-0.02em`) | `leading-snug` | `--emerald` (`#122620`) | Major section H2 |
| **Card Heading** | `22px` | `font-medium` | `tracking-tight` (`-0.01em`) | `leading-snug` | `--emerald` (`#122620`) | Product & styling option titles, H3 |
| **Body (Default)** | `16px–18px` | `font-normal` | `tracking-normal` (`0`) | `leading-relaxed` | `--ink` (`#032A19`) | Paragraphs (`text-pretty`) |
| **Caption / Tag** | `14px` | `font-medium` | `tracking-wide` (`+0.04em`) | `leading-none` | `--ink` / `--gold-text` | Category chips, price badges, metadata |

*Rule:* Always apply `text-balance` to headlines and `text-pretty` to body copy for composed typographic ragging. Voice is warm, composed, and specific — no hype words, no em dashes, no exclamation marks (`DR-04`).

---

## 4. Layout & Grid Standards

### Spacing Rhythm & Radii
- **Spacing Scale**: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `72`, `112` px.
- **Section Padding**: `48px` to `112px` vertical spacing (`py-12 sm:py-20 lg:py-28`) for generous luxury breathing room.
- **Border Radius**:
  - `4px` (`rounded-[4px]`) for cards, buttons, and inputs — quiet and refined.
  - `999px` (`rounded-full`) for filter chips and status pills.
- **Mobile First (`DR-21`)**: Designed at `375px` viewport width first; thumb-sized controls; sticky actions where helpful.

### Imagery & Intentional Placeholders (`DR-17`, `DR-18`)
- **Aspect Ratios**:
  - `4:5` portrait for gift box tiles and quick view drawers.
  - `3:2` landscape for charcuterie board cards, so the whole board is visible. Board photography is wide, and a portrait crop cut away most of the board.
  - `3:2` landscape for hero and Our Story sections.
- **Placeholders**: Until owned photography arrives, every missing image slot renders a refined placeholder: a tonal green (`--emerald` / `--sage`) or cream (`--ivory`) panel with the paper-grain texture (`--grain`) and the product name set in the heading font. Placeholders must look deliberate, never like broken or missing images.

---

## 5. Components & Interactive States

### Buttons & Actions (`DR-13`)
1. **Primary Button (Strictly one primary button style per view)**:
   - Filled `--emerald` (`#122620`) with `--ivory` (`#FDFBF7`) text, `4px` radius, subtle hover transition (`hover:opacity-95 active:scale-[0.99] transition-all duration-200`).
2. **Secondary Action (`TextLink`)**:
   - Secondary actions are quiet text links in `--emerald` (`#122620`) or `--ink` (`#032A19`) with subtle `--gold` (`#E6C687`) or `--gold-text` (`#846A28`) accent on hover.

### Cards & Panels
- **Product / Option Card**:
  - **No outlines or borders**: Use tonal background blocks and generous spacing instead of borders.
  - **Radius**: `4px` (`rounded-[4px]`).
  - **Hover**: Subtle lift (`hover:-translate-y-0.5 transition-transform duration-200 ease-out`).

### Header & Navigation (`DR-30` to `DR-32`)
- **Sticky Header**: Always visible while scrolling, `<= 64px` height. Transparent over the hero, turning solid `--ivory` (`#FDFBF7`) with a slight blur after scrolling.
- **Contents**: Wordmark (with distinctive ampersand) at left; links (`Gifting`, `Charcuterie`, `Holiday Styling`, `Service Area`); `Order` button or cart indicator at right.

---

## 6. Motion & Micro-Interaction Tokens (`DR-19`)

- **Timing & Easing**: `200ms` to `300ms` `ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Scroll & Drawers**: Subtle fade and gentle rise on scroll (`opacity: 0, y: 12` -> `opacity: 1, y: 0`); smooth quick-view drawer transitions without page reloads.
- **Reduced Motion**: Strictly respect `prefers-reduced-motion: reduce` — users with reduced motion enabled see instant state changes with no animation.

---

## 7. Strict Negative Constraints ("Anti-AI Slop" & Brand Integrity Rules)

When writing UI code, AI agents **MUST NEVER**:
1. ❌ **Use divider lines or ruled borders (`DR-14`, `NFR-10`)**: Never use `<hr>`, `divide-y`, `divide-x`, or separator borders between sections, cards, or list rows.
2. ❌ **Use black text (`DR-11`, `NFR-10`)**: Never use `#000`, `#000000`, `text-black`, `text-zinc-900`, or `text-gray-900`. Always use `--ink` (`#032A19`) for body text and `--emerald` (`#122620`) for headings.
3. ❌ **Use raw hex colours outside `src/styles/tokens.css` (`T1.2`, `T1.11`)**: Every colour in components must reference the June & Bloom design tokens.
4. ❌ **Use forbidden AI-default fonts (`DR-16`)**: Never use `Inter`, `Roboto`, `Arial`, `Poppins`, `Space Grotesk`, `Playfair Display`, `Cormorant`, or `Fraunces`.
5. ❌ **Redraw or alter the JB Monogram (`DR-02`)**: Use only the supplied `public/brand/jb-monogram.svg` file.
6. ❌ **Use multiple primary button styles in a single view (`DR-13`)**: Keep one primary button style (emerald fill, ivory text); secondary actions are text links.
7. ❌ **Use small gold or sage text on ivory (`DR-20`)**: Never use `--gold` (`#E6C687`) or `--sage` (`#7A8B7B`) for small text on `--ivory` (`#FDFBF7`); use `--gold-text` (`#846A28`) or `--ink` (`#032A19`) so WCAG 2.1 AA contrast passes.
8. ❌ **Use hype words, em dashes, or exclamation marks in copy (`DR-04`)**: Keep all copy warm, composed, and specific.

---

## 8. Integration Quick-Reference

- **Framework & Styling**: Next.js App Router (TypeScript) + Tailwind CSS mapped to `src/styles/tokens.css`
- **Review Pages (WP1)**:
  - `/dev/type` — Typography pairing selector (`Bodoni Moda` + `Hanken Grotesk` vs. two alternates)
  - `/dev/ampersand` — Wordmark ampersand selector (3 candidates at header and display sizes)
  - `/dev/components` — Core component showcase verifying zero divider lines and token compliance
