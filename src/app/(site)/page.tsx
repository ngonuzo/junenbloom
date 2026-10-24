import React from "react";
import Link from "next/link";
import { readStore } from "@/lib/db/store";
import { SITE } from "@/content/site";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Reveal, RevealMask, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { ZoneChecker } from "@/components/site/ZoneChecker";
import { priceLabel } from "@/lib/catalog";
import type { ProductImage } from "@/lib/db/store";
import { PAGE_IMAGERY } from "@/content/imagery";

export const dynamic = "force-dynamic";

const OFFERINGS = [
  {
    title: "Gifting",
    sentence: "Signature boxes of five or six well-chosen pieces, finished with a handwritten card.",
    href: "/gifting",
    cta: "Shop gifting",
    tone: "emerald" as const,
    caption: "Signature boxes from $120",
  },
  {
    title: "Charcuterie",
    sentence: "Boards built on the morning of your gathering and delivered inside a two-hour window.",
    href: "/charcuterie",
    cta: "Reserve a board",
    tone: "linen" as const,
    caption: "Three sizes, for 4 to 16",
  },
  {
    title: "Holiday Styling",
    sentence: "Your tree and rooms dressed for the season, with your ornaments or pieces we source.",
    href: "/holiday-styling",
    cta: "See styling options",
    tone: "moss" as const,
    caption: "Sample styling",
  },
];

const STEPS = [
  { title: "Choose", body: "Open any box or board and see exactly what is inside before you decide." },
  { title: "Personalize", body: "Pick a date, delivery or free pickup, and write the words for the card." },
  { title: "Delivered with care", body: "We pack it by hand and bring it to the door, or have it ready when you arrive." },
];

export default function HomePage() {
  const store = readStore();
  const featured = store.products
    .filter((p) => p.type === "gift" && p.status === "live")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);
  const heroProduct = featured[0];
  const heroPhotos = heroProduct?.images ?? [];
  // Each offering tile shows a photograph; the board comes from the catalogue so it follows the product.
  const boardPhoto = store.products
    .filter((p) => p.type === "board" && p.status === "live")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .find((p) => (p.images?.length ?? 0) > 0)?.images?.[0];
  const offeringPhotos: Record<string, ProductImage | undefined> = {
    "/gifting": PAGE_IMAGERY.giftingTile,
    "/charcuterie": boardPhoto,
    "/holiday-styling": PAGE_IMAGERY.stylingHero,
  };

  return (
    <>
      {/* Hero (PRD 6.1) */}
      <section className="container-page pb-20 pt-8 sm:pt-12 lg:pb-28 lg:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6 lg:pr-6">
            <p
              className="anim-fade-up font-heading text-[1.25rem] italic text-gold-text sm:text-[1.375rem]"
              style={{ "--d": "60ms" } as React.CSSProperties}
            >
              {SITE.tagline}
            </p>
            <HeroTitle
              className="t-display mt-5"
              text="Gifts, boards and holiday homes, considered to the last ribbon."
              italicWords={["ribbon."]}
              delay={160}
            />
            <p
              className="anim-fade-up t-lede mt-7 max-w-[33rem] text-ink"
              style={{ "--d": "720ms" } as React.CSSProperties}
            >
              We are two sisters in the {SITE.region}. Order a signature box or a styled board in a
              few taps, or let us dress your home for the season.
            </p>
            <div
              className="anim-fade-up mt-10 flex flex-wrap items-center gap-x-9 gap-y-5"
              style={{ "--d": "860ms" } as React.CSSProperties}
            >
              <ButtonLink href="/gifting" size="lg">
                Shop Gifting
              </ButtonLink>
              <TextLink href="/holiday-styling">Book Holiday Styling</TextLink>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <Link
              href={heroProduct ? `/gifting/${heroProduct.slug}` : "/gifting"}
              className="group block"
              aria-label={heroProduct ? `${heroProduct.name}, ${priceLabel(heroProduct)}` : "Gifting"}
            >
              <div className="anim-curtain overflow-hidden rounded-card" style={{ "--d": "200ms" } as React.CSSProperties}>
                <div className="anim-settle" style={{ "--d": "200ms" } as React.CSSProperties}>
                  <ImageSlot
                    title={heroProduct?.name ?? "The Signature Box"}
                    caption="Packed by hand in Toronto"
                    ratio="3:2"
                    tone="emerald"
                    size="lg"
                    composition={0}
                    ambient
                    parallax
                    photo={heroPhotos[0]}
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    priority
                  />
                </div>
              </div>
            </Link>
            <div
              aria-hidden
              className="anim-fade-up absolute -bottom-14 -right-6 hidden w-[27%] xl:block 2xl:-right-10"
              style={{ "--d": "900ms" } as React.CSSProperties}
            >
              <div className="rounded-card bg-ivory p-2 shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--ink)_35%,transparent)]">
                <ImageSlot
                  title="The handwritten card"
                  ratio="4:5"
                  tone="linen"
                  size="sm"
                  composition={3}
                  photo={heroPhotos[2]}
                  sizes="240px"
                />
              </div>
            </div>
            {heroProduct && (
              <p
                className="anim-fade mt-4 flex gap-2 text-[0.8125rem] text-muted"
                style={{ "--d": "1000ms" } as React.CSSProperties}
              >
                <span>{heroProduct.name}</span>
                <span aria-hidden className="text-gold-text">
                  /
                </span>
                <span>{priceLabel(heroProduct)}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Three offerings (PRD 6.1) */}
      <section className="section-y" aria-labelledby="offerings-title">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <Reveal>
                <p className="t-kicker text-gold-text">What we make</p>
              </Reveal>
              <RevealWords
                id="offerings-title"
                className="t-h2 mt-5"
                text="Three offerings, one standard of care."
              />
            </div>
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.15}>
              <p className="t-lede text-ink-soft">
                Everything is chosen, packed and delivered by the two of us. Nothing leaves our hands
                until it is right.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-14 md:grid-cols-3 md:gap-8 lg:mt-20 lg:gap-12">
            {OFFERINGS.map((offer, i) => (
              <Reveal key={offer.title} delay={i * 0.12}>
                <Link href={offer.href} className="group block" aria-label={offer.title}>
                  <RevealMask className="rounded-card" delay={i * 0.12}>
                    <div className="transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.03]">
                      <ImageSlot
                        title={offer.title}
                        caption={offer.caption}
                        tone={offer.tone}
                        composition={i + 1}
                        tag={offer.title === "Holiday Styling" && !offeringPhotos[offer.href] ? "Sample styling" : undefined}
                        parallax
                        photo={offeringPhotos[offer.href]}
                        // One frame shape for all three so the row reads as a set
                        ratio="3:2"
                        sizes="(min-width: 768px) 30vw, 92vw"
                      />
                    </div>
                  </RevealMask>
                </Link>
                <div className="mt-7 flex items-baseline gap-4">
                  <span className="t-numeral text-[1.0625rem] text-gold-text">0{i + 1}</span>
                  <h3 className="t-h3">{offer.title}</h3>
                </div>
                <p className="mt-3 t-body text-ink md:pl-9">{offer.sentence}</p>
                <div className="mt-5 md:pl-9">
                  <TextLink href={offer.href}>{offer.cta}</TextLink>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured signature boxes with Order on the tile (PRD 6.1) */}
      <section className="paper section-y bg-cream" aria-labelledby="featured-title">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Reveal>
                <p className="t-kicker text-gold-text">Ready to order</p>
              </Reveal>
              <RevealWords id="featured-title" className="t-h2 mt-5" text="Signature boxes" />
            </div>
            <Reveal delay={0.1}>
              <TextLink href="/gifting">All gifting</TextLink>
            </Reveal>
          </div>

          <Stagger className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-3" stagger={0.12}>
            {featured.map((product, i) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} index={i} />
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-16" delay={0.1}>
            <p className="t-small text-muted">
              Every box arrives with a card written by hand. Order at least three days ahead, or{" "}
              <Link href="/contact" className="link-quiet text-emerald">
                message us
              </Link>{" "}
              if it is sooner.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Two sisters, one standard (PRD 6.1) */}
      <section className="section-y" aria-labelledby="story-title">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <RevealMask className="rounded-card">
              <ImageSlot
                title="The two of us"
                ratio="5:4"
                tone="moss"
                photo={PAGE_IMAGERY.founders}
                sizes="(min-width: 1024px) 46vw, 100vw"
              />
            </RevealMask>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <p className="t-kicker text-gold-text">Two sisters, one standard</p>
            </Reveal>
            <RevealWords
              id="story-title"
              as="h2"
              className="mt-6 font-heading text-[1.75rem] italic leading-[1.2] tracking-[-0.015em] text-emerald sm:text-[2.25rem]"
              text="We would rather make fewer things, and make each one properly."
            />
            <Reveal delay={0.15}>
              <p className="mt-7 t-body text-ink">
                One of us has spent ten years choosing gifts for clients and family. The other brings
                the table and the tree. June &amp; Bloom is where those two habits meet.
              </p>
              <div className="mt-8">
                <TextLink href="/our-story">Read our story</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works (PRD 6.1) */}
      <section className="paper on-emerald bg-emerald section-y text-ivory" aria-labelledby="how-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <Reveal>
              <p className="t-kicker text-gold">How it works</p>
            </Reveal>
            <RevealWords
              id="how-title"
              className="t-h2 mt-5 text-ivory"
              text="Three steps, then it is in our hands."
            />
          </div>
          <Stagger as="ol" className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10" stagger={0.14}>
            {STEPS.map((step, i) => (
              <StaggerItem as="li" key={step.title}>
                <span className="t-numeral block text-[3.5rem] leading-none text-gold">{i + 1}</span>
                <h3 className="mt-6 font-heading text-[1.375rem] font-medium text-ivory">{step.title}</h3>
                <p className="mt-3 max-w-[22rem] t-body text-ivory-soft">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Service area teaser (PRD 6.1) */}
      <section className="section-y" aria-labelledby="area-title">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="t-kicker text-gold-text">Delivery</p>
            </Reveal>
            <RevealWords id="area-title" className="t-h2 mt-5" text="Across the Greater Toronto Area." />
            <Reveal delay={0.12}>
              <p className="mt-6 t-body text-ink">
                Three delivery zones, each with its own fee and days. Pickup is always free, and the
                address comes with your confirmation.
              </p>
              <div className="mt-8">
                <TextLink href="/service-area">See zones and fees</TextLink>
              </div>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <ZoneChecker zones={store.zones} prefixMap={store.prefixMap} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
