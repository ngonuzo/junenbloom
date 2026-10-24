import React, { Suspense } from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { CharcuterieReserve } from "@/components/site/CharcuterieReserve";
import { PausedNotice } from "@/components/site/PausedNotice";
import Link from "next/link";
import { FactList } from "@/components/site/PageIntro";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { TextLink } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { leadTimeLabel, priceLabel } from "@/lib/catalog";
import { PAGE_IMAGERY } from "@/content/imagery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Charcuterie Boards",
  description:
    "Charcuterie boards built on the day, delivered across the GTA inside a two-hour window. Small, medium and large, serving 4 to 16.",
};

const NOTES = [
  {
    title: "Built on the day",
    body: "Cheese is cut and fruit is washed the morning your board leaves us, never the night before.",
  },
  {
    title: "Allergies, taken seriously",
    body: "Nuts and crisps can be packed apart. Our kitchen handles milk, wheat, nuts and sesame, so we cannot promise a trace-free board.",
  },
  {
    title: "Serving",
    body: "Keep it cold until 30 minutes before guests arrive. Enjoy within four hours at room temperature.",
  },
];

export default function CharcuteriePage() {
  const store = readStore();
  const boards = store.products.filter((p) => p.type === "board" && p.status === "live");
  const pictured = boards.find((b) => b.images?.some((img) => img.src === PAGE_IMAGERY.charcuterieHero.src));

  return (
    <>
      {/* Intro with the board photographed at eye level (PRD 6.3) */}
      <section className="container-page pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="anim-fade-up t-kicker text-gold-text">Charcuterie</p>
            <HeroTitle
              className="t-h1 mt-6"
              text="Boards built on the morning of your gathering."
              italicWords={["gathering."]}
            />
            <p className="anim-fade-up t-lede mt-7 text-ink" style={{ "--d": "600ms" } as React.CSSProperties}>
              Cheese, cured meats and fresh fruit, arranged by hand and brought to your door inside a
              two-hour window.
            </p>
            <div className="anim-fade-up" style={{ "--d": "700ms" } as React.CSSProperties}>
              <FactList
                facts={[
                  { label: "Serves", value: "4 to 16" },
                  { label: "Order ahead", value: leadTimeLabel(store.settings.boardLeadTimeHours) },
                  { label: "Window", value: "2 hours" },
                ]}
              />
            </div>
            {store.settings.charcuterieOpen && (
              <div className="anim-fade-up mt-9" style={{ "--d": "800ms" } as React.CSSProperties}>
                <TextLink href="#reserve">Choose a day and time</TextLink>
              </div>
            )}
          </div>

          <figure className="lg:col-span-7">
            <div className="anim-curtain overflow-hidden rounded-card" style={{ "--d": "160ms" } as React.CSSProperties}>
              <div className="anim-settle" style={{ "--d": "160ms" } as React.CSSProperties}>
                <ImageSlot
                  title="Charcuterie board"
                  tone="linen"
                  ratio="3:2"
                  photo={PAGE_IMAGERY.charcuterieHero}
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  priority
                  parallax
                />
              </div>
            </div>
            {pictured && (
              <figcaption className="anim-fade mt-4 flex gap-2 text-[0.8125rem] text-muted" style={{ "--d": "1000ms" } as React.CSSProperties}>
                <Link href={`/charcuterie/${pictured.slug}`} className="transition-colors hover:text-emerald">
                  {pictured.name}
                </Link>
                <span aria-hidden className="text-gold-text">
                  /
                </span>
                <span>{priceLabel(pictured)}</span>
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      {store.settings.charcuterieOpen ? (
        <Suspense>
          <CharcuterieReserve
            boards={boards}
            slots={store.slots}
            leadTimeHours={store.settings.boardLeadTimeHours}
            blockedDates={store.settings.blockedDates}
          />
        </Suspense>
      ) : (
        <section className="container-page pb-24">
          <PausedNotice
            title="Board orders are paused for a short while."
            body="We are catering private events this week. Message us about an upcoming date and we will reply within a business day."
          />
        </section>
      )}

      <section className="section-y" aria-labelledby="notes-title">
        <div className="container-page">
          <Reveal>
            <h2 id="notes-title" className="t-kicker text-gold-text">
              Good to know
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-10 md:grid-cols-3" stagger={0.1}>
            {NOTES.map((n) => (
              <StaggerItem key={n.title}>
                <h3 className="t-h3">{n.title}</h3>
                <p className="mt-3 t-body text-ink">{n.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
