import React from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/site/PageIntro";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Reveal, RevealMask, RevealWords, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { PAGE_IMAGERY } from "@/content/imagery";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "June & Bloom is two sisters in the Greater Toronto Area: ten years of gift curation, now joined by the table and the tree.",
};

// PLACEHOLDER copy until the founders supply their own words (CONTENT_TODO.md).
const SISTERS = [
  {
    role: "The gift curator",
    title: "Ten years of choosing for other people.",
    body: "She began by putting together gifts for friends and clients, and never stopped. She looks for things that are used, not stored: a cup for the first coffee, a cloth for the table, something good to eat.",
    tone: "emerald" as const,
    photo: {
      src: "/images/story/gift-curator.webp",
      alt: "The gift curator smiling as she tucks a card into a gift box lined with green tissue, with ribbon, wax seals and finished boxes on the table.",
      width: 1122,
      height: 1402,
      focal: "50% 30%",
    },
  },
  {
    role: "The table and the tree",
    title: "Gatherings, boards and the holidays.",
    body: "She is the one who builds the boards and dresses the trees. She likes generous tables, honest ingredients and a room that feels finished without feeling fussy.",
    tone: "linen" as const,
    photo: {
      src: "/images/story/table-and-tree.webp",
      alt: "The sister who builds the boards and dresses the trees, smiling behind a full charcuterie board, with candles and a decorated tree behind her.",
      width: 1122,
      height: 1402,
      focal: "50% 30%",
    },
  },
];

const STANDARDS = [
  { title: "Fewer, better things", body: "We would rather offer three boxes we believe in than thirty we do not." },
  { title: "A card written by hand", body: "Every gift carries your words, written out by one of us and sealed." },
  { title: "On time, or told early", body: "If a date is at risk, you hear it from us first, with a plan." },
  { title: "Straight about allergens", body: "We tell you what our kitchen handles, and never promise what we cannot." },
];

export default function OurStoryPage() {
  return (
    <>
      <PageIntro
        kicker="Our story"
        title="Two sisters, one standard."
        italicWords={["standard."]}
        lede="June & Bloom brings together a decade of gift curation and a love of the well-set table. Everything we make passes through both of our hands."
      />

      <section className="container-page pb-24 sm:pb-28 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <figure className="lg:col-span-5">
            <RevealMask className="rounded-card">
              <ImageSlot
                title="The two of us"
                ratio="4:5"
                tone="moss"
                photo={PAGE_IMAGERY.founders}
                sizes="(min-width: 1024px) 38vw, 100vw"
                priority
              />
            </RevealMask>
          </figure>
          <div className="lg:col-span-6 lg:col-start-7">
            <RevealWords
              as="p"
              className="font-heading text-[1.75rem] italic leading-[1.25] tracking-[-0.015em] text-emerald sm:text-[2.25rem]"
              text="A good gift is not about the price. It is proof that someone was paying attention."
            />
            <Reveal className="mt-10 space-y-6" delay={0.1}>
              <p className="t-lede text-ink">
                For ten years one of us has been the person friends call when they need a gift that feels
                right. Over time the boxes grew, then the boards, then the requests to dress a tree.
              </p>
              <p className="t-body text-ink">
                June &amp; Bloom is how we answer all three, together. We keep the range small on purpose,
                we choose every piece ourselves, and we pack everything by hand.
              </p>
              <p className="t-body text-ink">
                We are based in the Greater Toronto Area and deliver across it. If you would like to meet
                us, pickup is always free.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="paper bg-cream section-y" aria-labelledby="sisters-title">
        <div className="container-page">
          <Reveal>
            <h2 id="sisters-title" className="t-kicker text-gold-text">
              The two of us
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-16 md:grid-cols-2 md:gap-10">
            {SISTERS.map((s, i) => (
              <Reveal key={s.role} delay={i * 0.12}>
                <RevealMask className="rounded-card" delay={i * 0.12}>
                  <ImageSlot
                    title={s.role}
                    caption="Portrait to come"
                    tone={s.tone}
                    composition={i + 2}
                    photo={s.photo}
                    sizes="(min-width: 768px) 46vw, 100vw"
                  />
                </RevealMask>
                <h3 className="t-h3 mt-8">{s.title}</h3>
                <p className="mt-3 max-w-md t-body text-ink">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="standards-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <Reveal>
              <p className="t-kicker text-gold-text">Our standards</p>
            </Reveal>
            <RevealWords id="standards-title" className="t-h2 mt-5" text="What you can expect from us, every time." />
          </div>
          <Stagger className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10" stagger={0.1}>
            {STANDARDS.map((s, i) => (
              <StaggerItem key={s.title}>
                <span className="t-numeral text-[2.5rem] leading-none text-gold-text">{i + 1}</span>
                <h3 className="t-h3 mt-5">{s.title}</h3>
                <p className="mt-3 t-body text-ink">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="paper on-emerald bg-emerald section-y text-ivory">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-kicker text-gold">Our promise</p>
            <RevealWords
              as="h2"
              className="mt-6 font-heading text-[2rem] italic leading-[1.15] tracking-[-0.02em] text-ivory sm:text-[2.75rem]"
              text="If something is not right, tell us. We will make it right."
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
            <p className="t-body text-ivory-soft">
              Write to us after your delivery or pickup and one of us will reply personally. No forms, just
              a conversation.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Reveal>
            <h2 className="t-h2 max-w-xl">Start with a box, a board or a conversation.</h2>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap items-center gap-x-9 gap-y-5">
            <ButtonLink href="/gifting" size="lg">
              Shop Gifting
            </ButtonLink>
            <TextLink href="/contact">Say hello</TextLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
