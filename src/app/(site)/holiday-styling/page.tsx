import React from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { CheckIcon, MinusIcon } from "@/components/ui/Icons";
import { Reveal, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { PausedNotice } from "@/components/site/PausedNotice";
import { formatCents } from "@/lib/domain/money";
import { slotToneFor } from "@/lib/catalog";
import { PAGE_IMAGERY } from "@/content/imagery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Holiday Styling",
  description:
    "Christmas tree decorating, sourcing and full-home holiday styling across the GTA. Three options, a clear quote and a limited number of homes each season.",
};

const PROCESS = [
  {
    title: "Inquire",
    body: "Tell us about the room, the tree and the dates you have in mind. It takes about three minutes.",
  },
  {
    title: "Consult and quote",
    body: "We reply within 1-2 business days, talk it through and send a written quote. A 40% retainer holds your date.",
  },
  {
    title: "Styled",
    body: "We arrive on the day, do the work and leave the room tidy. The balance is due 48 hours before.",
  },
];

export default function HolidayStylingPage() {
  const store = readStore();
  const options = store.products.filter((p) => p.type === "styling" && p.status === "live");
  const { seasonCap, weeklyInstallSlots, takedownStorageOpen, stylingOpen } = store.settings;

  const addOns = [
    {
      title: "Gift wrapping",
      body: "Papers, ribbon and fresh sprigs chosen to match the tree, so the gifts underneath complement it.",
    },
    {
      title: "Festive spaces",
      body: "Mantels, banisters, tables and entryways dressed with garland, candles and greenery.",
    },
    ...(takedownStorageOpen
      ? [
          {
            title: "Take down and storage",
            body: "In early January, we take it all down, wrap each ornament and label your boxes for the next season.",
          },
        ]
      : []),
  ];

  const faq = [
    {
      q: "How is a date confirmed?",
      a: "After a short consultation we send a quote by private link. Accepting it and paying the 40% retainer holds your installation date. The balance is due 48 hours before we arrive.",
    },
    {
      q: "Do we need to buy anything?",
      a: "Not for Decorating Only, which uses what you have. For the other two options we source everything new and list each item in the quote. New decor is prepaid at cost.",
    },
    {
      q: "How many homes do you take?",
      a: `We take ${weeklyInstallSlots} installations a week and ${seasonCap} for the season, so each home gets our full attention. Trees over 9 ft and business spaces count as two.`,
    },
    {
      q: "Can we use your photos of our home?",
      a: "Only with your permission. We ask on the inquiry form and record your answer. Images on this page are sample styling until our own portfolio photographs are added.",
    },
  ];

  return (
    <>
      {/* Intro (PRD 6.4) */}
      <section className="container-page pb-10 pt-10 sm:pt-14 lg:pb-14">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="anim-fade-up t-kicker text-gold-text">Holiday Styling, 2026 season</p>
            <HeroTitle className="t-h1 mt-6" text="Take care of hosting, we handle the decor." italicWords={["decor."]} />
            <p className="anim-fade-up t-lede mt-7 text-ink" style={{ "--d": "620ms" } as React.CSSProperties}>
              We provide decor sourcing, styling, installation, and take down services across Toronto
              and the GTA. We take {seasonCap} homes or businesses per season.
            </p>
            <div
              className="anim-fade-up mt-10 flex flex-wrap items-center gap-x-9 gap-y-5"
              style={{ "--d": "760ms" } as React.CSSProperties}
            >
              <ButtonLink href="#options" size="lg">
                Select an option
              </ButtonLink>
              <TextLink href="/holiday-styling/inquire">Start an inquiry</TextLink>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="anim-curtain overflow-hidden rounded-card" style={{ "--d": "160ms" } as React.CSSProperties}>
              <div className="anim-settle" style={{ "--d": "160ms" } as React.CSSProperties}>
                <ImageSlot
                  title="A tree in the living room"
                  ratio="3:2"
                  tone="emerald"
                  photo={PAGE_IMAGERY.stylingHero}
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  priority
                  parallax
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three options (PRD 6.4) */}
      <section id="options" className="paper scroll-mt-[var(--header-h)] bg-cream section-y-snug" aria-labelledby="options-title">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="t-kicker text-gold-text">Three options</p>
              </Reveal>
              <RevealWords id="options-title" className="t-h2 mt-5" text="Choose what you would like us to do." />
              <Reveal delay={0.1}>
                <p className="mt-4 t-body italic text-ink-soft">
                  Every piece we install is yours to keep. All decor remains the property of the client.
                </p>
              </Reveal>
            </div>
            <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
              <p className="rounded-[1.25rem] border border-linen bg-ivory px-6 py-4 text-center t-body text-emerald shadow-[inset_0_1px_0_color-mix(in_oklab,var(--ivory)_100%,transparent),inset_0_-2px_0_color-mix(in_oklab,var(--ink)_7%,transparent),0_10px_24px_-16px_color-mix(in_oklab,var(--ink)_45%,transparent)]">
                Reserve by November 20 to have your installation done by December 10.
              </p>
            </Reveal>
          </div>

          {stylingOpen ? (
            <Stagger className="mt-8 grid gap-6 lg:grid-cols-3" stagger={0.12} amount={0}>
              {options.map((opt, i) => {
                const custom = opt.slug === "full-service-holiday";
                return (
                  <StaggerItem as="article" key={opt.id} className="flex flex-col rounded-card bg-ivory p-5 sm:p-7">
                    <ImageSlot
                      title={opt.name}
                      caption={opt.subtitle}
                      tone={slotToneFor(opt)}
                      composition={i + 1}
                      tag={opt.images?.length ? undefined : "Sample styling"}
                      photo={opt.images?.[0]}
                      sizes="(min-width: 1024px) 28vw, 92vw"
                      priority
                    />
                    <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="t-h3 whitespace-nowrap">{opt.name}</h3>
                      <p className="shrink-0 text-[0.9375rem] text-emerald">
                        {custom ? `Custom quote, from ${formatCents(opt.priceCents)}` : `From ${formatCents(opt.priceCents)}`}
                      </p>
                    </div>
                    <p className="mt-3 t-small text-ink">{opt.shortDescription}</p>

                    <div className="mt-7">
                      <p className="text-[0.8125rem] font-medium text-emerald">Included</p>
                      <ul className="mt-3 space-y-2.5">
                        {opt.includes?.map((item) => (
                          <li key={item} className="flex gap-3 t-small">
                            <CheckIcon size={15} className="mt-[0.2rem] text-gold-text" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-8 mt-6">
                      <p className="text-[0.8125rem] font-medium text-muted">Not included</p>
                      <ul className="mt-3 space-y-2">
                        {opt.excludes?.map((item) => (
                          <li key={item} className="flex gap-3 text-[0.8125rem] leading-relaxed text-muted">
                            <MinusIcon size={13} className="mt-[0.3rem]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ButtonLink
                      href={`/holiday-styling/inquire?option=${opt.slug}`}
                      className="mt-auto w-full"
                      aria-label={`Inquire about ${opt.name}`}
                    >
                      Inquire about this option
                    </ButtonLink>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : (
            <div className="mt-14">
              <PausedNotice
                title="Our styling calendar is full for this season."
                body="Every date has been taken. Message us to join the waitlist, or to plan ahead for next year."
              />
            </div>
          )}
        </div>
      </section>

      {/* Add-ons and over 9 ft (PRD 6.4) */}
      <section className="section-y-snug" aria-labelledby="addons-title">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="t-kicker text-gold-text">Add ons</p>
            </Reveal>
            <RevealWords id="addons-title" className="t-h2 mt-5" text="The finishing touches." />
            <Stagger className="mt-8 space-y-8" stagger={0.1}>
              {addOns.map((a, i) => (
                <StaggerItem key={a.title} className="grid gap-3 sm:grid-cols-[3rem_1fr]">
                  <span className="t-numeral text-[1.0625rem] text-gold-text">0{i + 1}</span>
                  <div>
                    <h3 className="t-h3">{a.title}</h3>
                    <p className="mt-2 max-w-lg t-body text-ink">{a.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
            <div className="on-emerald rounded-card bg-emerald p-8 text-ivory sm:p-10">
              <p className="t-kicker text-gold">Custom quote</p>
              <h3 className="mt-5 font-heading text-[1.75rem] leading-tight text-ivory">
                Trees over 9 ft and businesses.
              </h3>
              <p className="mt-4 t-body text-ivory-soft">
                Tall trees need more hands and more time, so they take two installation slots. The
                same goes for lobbies, large shops, and offices. We quote each one individually.
              </p>
              <div className="mt-8">
                <TextLink
                  href="/holiday-styling/inquire?option=full-service-holiday&height=over_9ft"
                  className="!text-gold hover:!text-ivory"
                >
                  Request a custom quote
                </TextLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process (PRD 6.4) */}
      <section className="paper bg-cream section-y-snug" aria-labelledby="process-title">
        <div className="container-page">
          <Reveal>
            <p className="t-kicker text-gold-text">How it works</p>
          </Reveal>
          <RevealWords id="process-title" className="t-h2 mt-5" text="Inquire, consult, then styled." />
          <Stagger as="ol" className="mt-10 grid gap-10 md:grid-cols-3 md:gap-10" stagger={0.12}>
            {PROCESS.map((s, i) => (
              <StaggerItem as="li" key={s.title}>
                <span className="t-numeral block text-[3.5rem] leading-none text-gold-text">{i + 1}</span>
                <h3 className="t-h3 mt-6">{s.title}</h3>
                <p className="mt-3 max-w-sm t-body text-ink">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Short FAQ (PRD 6.4) */}
      <section className="section-y-snug" aria-labelledby="styling-faq">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="t-kicker text-gold-text">Questions</p>
            </Reveal>
            <RevealWords id="styling-faq" className="t-h2 mt-5" text="Before you inquire." />
            <Reveal delay={0.1}>
              <div className="mt-8">
                <TextLink href="/faq">All questions</TextLink>
              </div>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <Accordion items={faq} defaultOpen={0} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
