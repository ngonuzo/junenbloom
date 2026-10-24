import React from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { GiftingCatalogue } from "@/components/site/GiftingCatalogue";
import { PausedNotice } from "@/components/site/PausedNotice";
import { FactList, PageIntro } from "@/components/site/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { formatCents } from "@/lib/domain/money";
import { leadTimeLabel } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gifting",
  description:
    "Signature gift boxes of five or six well-chosen pieces, each with a handwritten card. Delivered across the GTA or picked up free.",
};

export default function GiftingPage() {
  const store = readStore();
  const gifts = store.products.filter(
    (p) => p.type === "gift" && (p.status === "live" || p.status === "sample")
  );
  const live = gifts.filter((p) => p.status === "live");
  const fromCents = live.length ? Math.min(...live.map((p) => p.priceCents)) : 12000;

  return (
    <>
      <PageIntro
        kicker="Gifting"
        title="Boxes worth keeping, long after the ribbon."
        italicWords={["ribbon."]}
        lede="Every box holds five or six pieces, each chosen by hand. Open one to see exactly what is inside, then order in a few taps."
        aside={
          <FactList
            facts={[
              { label: "Boxes from", value: formatCents(fromCents) },
              { label: "Order ahead", value: leadTimeLabel(store.settings.giftLeadTimeHours) },
              { label: "Card", value: "By hand" },
            ]}
          />
        }
      />

      <section className="container-page pb-24 sm:pb-32" aria-label="Gift boxes">
        {store.settings.giftingOpen ? (
          <GiftingCatalogue products={gifts} />
        ) : (
          <PausedNotice
            title="Gift boxes are paused for a short while."
            body="We are restocking for the next season. Message us for a gift in the meantime and we will see what we can do."
          />
        )}
      </section>

      <section className="paper bg-cream">
        <div className="container-page grid gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <p className="t-kicker text-gold-text">For businesses</p>
            <h2 className="t-h2 mt-5">Gifts for clients and teams, with a clear quote.</h2>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="t-body text-ink">
              Tell us the occasion, the number of people and a budget. We will suggest a box, send a
              quote and provide an invoice.
            </p>
            <div className="mt-6">
              <TextLink href="/contact?topic=business">Ask about business gifting</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
