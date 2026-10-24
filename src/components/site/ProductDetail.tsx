import React from "react";
import Link from "next/link";
import type { Product, StoreState } from "@/lib/db/store";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal, RevealMask, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { formatCents } from "@/lib/domain/money";
import { leadTimeLabel, photoRatio, priceLabel, slotToneFor } from "@/lib/catalog";
import { ProductPurchase } from "./ProductPurchase";
import { ProductCard } from "./ProductCard";

const ALT_TONES = { emerald: "linen", linen: "moss", moss: "emerald", mist: "emerald" } as const;

/**
 * Full product page (T4.4): the same content as quick view, plus a gallery,
 * delivery notes and structured data for search and sharing.
 */
export function ProductDetail({ product, store }: { product: Product; store: StoreState }) {
  const board = product.type === "board";
  const tone = slotToneFor(product);
  const index = store.products.findIndex((p) => p.id === product.id);
  const related = store.products
    .filter((p) => p.type === product.type && p.id !== product.id && p.status !== "hidden" && p.status !== "archived")
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"))
    .slice(0, 3);
  const back = board ? { href: "/charcuterie", label: "Charcuterie" } : { href: "/gifting", label: "Gifting" };
  const zones = store.zones;
  const photos = product.images ?? [];
  const wideSet = photos.length > 0 && photoRatio(photos[0]) === "3:2";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://juneandbloomlifestyle.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    ...(photos.length ? { image: photos.map((p) => `${siteUrl}${p.src}`) } : {}),
    brand: { "@type": "Brand", name: "June & Bloom Lifestyle Company" },
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.status === "live" && (!product.trackStock || product.stockOnHand > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    },
  };

  const details = [
    {
      q: "Delivery and pickup",
      a: (
        <>
          <p>
            {board
              ? "Boards are built on the day and delivered inside the two-hour window you choose, or ready for pickup at that time."
              : "We deliver across the Greater Toronto Area on the date you choose, or have your box ready for free pickup."}{" "}
            Order at least {leadTimeLabel(product.leadTimeHours)} ahead.
          </p>
          <ul className="mt-4 space-y-1.5">
            {zones.map((z) => (
              <li key={z.code} className="flex justify-between gap-6">
                <span>{z.name}</span>
                <span className="tabular-nums text-emerald">{formatCents(z.feeCents)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-6">
              <span>Pickup</span>
              <span className="text-emerald">Free</span>
            </li>
          </ul>
        </>
      ),
    },
    ...(product.allergens.length
      ? [
          {
            q: "Allergens",
            a: (
              <p>
                {product.allergens.join(", ")}. Tell us about any allergy when you order and we will
                confirm what we can adjust. Read our{" "}
                <Link href="/policies/allergens" className="link-quiet text-emerald">
                  allergen policy
                </Link>
                .
              </p>
            ),
          },
        ]
      : []),
    {
      q: board ? "Serving and storage" : "The handwritten card",
      a: board ? (
        <p>
          Keep the board in the fridge until 30 minutes before serving, and enjoy within four hours
          at room temperature. Crisps are packed separately so they stay crisp.
        </p>
      ) : (
        <p>
          Write your message at checkout, up to 200 characters. One of us writes it by hand on a
          heavy cream card and seals it before the box is closed.
        </p>
      ),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page pb-24 pt-8 sm:pt-10">
        <nav aria-label="Breadcrumb" className="anim-fade text-[0.8125rem] text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href={back.href} className="transition-colors hover:text-emerald">
                {back.label}
              </Link>
            </li>
            <li aria-hidden className="text-gold-text">
              /
            </li>
            <li aria-current="page" className="text-emerald">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {photos.length > 0 ? (
              <div className="space-y-4">
                <figure>
                  <div className="anim-curtain overflow-hidden rounded-card" style={{ "--d": "80ms" } as React.CSSProperties}>
                    <div className="anim-settle" style={{ "--d": "80ms" } as React.CSSProperties}>
                      <ImageSlot
                        title={product.name}
                        tone={tone}
                        photo={photos[0]}
                        ratio={photoRatio(photos[0])}
                        tag={product.status === "sample" ? "Coming soon" : undefined}
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        priority
                      />
                    </div>
                  </div>
                  {photos[0].caption && <PhotoCaption>{photos[0].caption}</PhotoCaption>}
                </figure>
                {photos.length > 1 && (
                  // Portrait sets pair up beneath the cover; wide shots stack at full width.
                  <div className={`grid gap-4 ${wideSet ? "" : "grid-cols-2"}`}>
                    {photos.slice(1, 3).map((p, i) => (
                      <Reveal as="figure" key={p.src} delay={i * 0.1}>
                        <RevealMask className="rounded-card" delay={i * 0.1}>
                          <ImageSlot
                            title={product.name}
                            tone={tone}
                            photo={p}
                            ratio={photoRatio(p)}
                            sizes={wideSet ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 50vw"}
                          />
                        </RevealMask>
                        {p.caption && <PhotoCaption>{p.caption}</PhotoCaption>}
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="anim-curtain overflow-hidden rounded-card" style={{ "--d": "80ms" } as React.CSSProperties}>
                  <div className="anim-settle" style={{ "--d": "80ms" } as React.CSSProperties}>
                    <ImageSlot
                      title={product.name}
                      caption={product.subtitle}
                      tone={tone}
                      composition={index}
                      size="lg"
                      tag={product.status === "sample" ? "Coming soon" : undefined}
                      ambient
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Reveal>
                    <ImageSlot
                      title={board ? "Packed for the drive" : "The card, by hand"}
                      ratio="1:1"
                      tone={ALT_TONES[tone]}
                      composition={index + 1}
                      size="sm"
                    />
                  </Reveal>
                  <Reveal delay={0.1}>
                    <ImageSlot
                      title={board ? "Set on the table" : "Tied and sealed"}
                      ratio="1:1"
                      tone={tone === "emerald" ? "mist" : "emerald"}
                      composition={index + 2}
                      size="sm"
                    />
                  </Reveal>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="anim-fade-up t-kicker text-gold-text">{product.categoryName}</p>
              <HeroTitle className="t-h1 mt-5" text={product.name} delay={100} step={70} />
              <p
                className="anim-fade-up mt-5 font-heading text-[1.5rem] text-emerald"
                style={{ "--d": "380ms" } as React.CSSProperties}
              >
                {priceLabel(product)}
                <span className="ml-2 font-body text-[0.875rem] text-muted">CAD</span>
              </p>
              <div className="anim-fade-up" style={{ "--d": "460ms" } as React.CSSProperties}>
                <p className="mt-5 t-lede text-ink">{product.shortDescription}</p>

                {product.contents.length > 0 && (
                  <section className="mt-9" aria-labelledby="contents-title">
                    <h2 id="contents-title" className="t-kicker text-gold-text">
                      {board ? "On the board" : `In the box, ${product.contents.length} pieces`}
                    </h2>
                    <ol className="mt-5 space-y-3">
                      {product.contents.map((item, i) => (
                        <li key={item} className="flex items-baseline gap-4">
                          <span className="t-numeral w-5 shrink-0 text-[1rem] text-gold-text">{i + 1}</span>
                          <span className="t-body">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                <div className="mt-10">
                  <ProductPurchase product={product} />
                </div>

                <div className="-mx-5 mt-10 sm:-mx-6">
                  <Accordion items={details} defaultOpen={null} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="paper bg-cream section-y" aria-labelledby="related-title">
          <div className="container-page">
            <RevealWords
              id="related-title"
              className="t-h2"
              text={board ? "Other sizes" : "You may also like"}
            />
            <Stagger className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-3" stagger={0.1}>
              {related.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} index={store.products.indexOf(p)} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </>
  );
}

function PhotoCaption({ children }: { children: React.ReactNode }) {
  return <figcaption className="mt-3 text-[0.8125rem] text-muted">{children}</figcaption>;
}
