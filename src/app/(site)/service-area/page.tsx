import React from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { PageIntro } from "@/components/site/PageIntro";
import { ZoneChecker } from "@/components/site/ZoneChecker";
import { ZoneRings } from "@/components/site/ZoneRings";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { formatCents } from "@/lib/domain/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service Area",
  description:
    "Delivery zones, fees and days across the Greater Toronto Area, with a postal code checker. Pickup is always free.",
};

export default function ServiceAreaPage() {
  const store = readStore();

  return (
    <>
      <PageIntro
        kicker="Service area"
        title="Delivering across the Greater Toronto Area."
        italicWords={["Area."]}
        lede="Three zones, each with its own fee, minimum and delivery days. Enter your postal code to see yours. Pickup is always free."
      />

      <section className="container-page pb-24 sm:pb-28">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-6">
            <ZoneChecker zones={store.zones} prefixMap={store.prefixMap} />
          </Reveal>
          <div className="lg:col-span-5 lg:col-start-8">
            <ZoneRings zones={store.zones} />
          </div>
        </div>
      </section>

      <section className="paper bg-cream section-y" aria-labelledby="zones-title">
        <div className="container-page">
          <Reveal>
            <h2 id="zones-title" className="t-h2">
              Zones and fees
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
            {store.zones.map((zone, i) => (
              <StaggerItem key={zone.code} as="article" className="flex flex-col rounded-card bg-ivory p-7">
                <span className="t-numeral text-[1.5rem] text-gold-text">{i + 1}</span>
                <h3 className="t-h3 mt-4">{zone.name}</h3>
                <p className="mt-3 t-small text-muted">{zone.areasSummary}</p>
                <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-4 pt-8 text-[0.8125rem]">
                  <div>
                    <dt className="text-muted">Fee</dt>
                    <dd className="mt-1 font-heading text-[1.125rem] text-emerald">{formatCents(zone.feeCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Minimum</dt>
                    <dd className="mt-1 font-heading text-[1.125rem] text-emerald">{formatCents(zone.minOrderCents)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted">Days</dt>
                    <dd className="mt-1 font-heading text-[1.125rem] text-emerald">{zone.deliveryDays}</dd>
                  </div>
                </dl>
              </StaggerItem>
            ))}
            <StaggerItem as="article" className="on-emerald flex flex-col rounded-card bg-emerald p-7 text-ivory">
              <span className="t-numeral text-[1.5rem] text-gold">&amp;</span>
              <h3 className="mt-4 font-heading text-[1.375rem] font-medium text-ivory">Pickup</h3>
              <p className="mt-3 t-small text-ivory-soft">
                Always free, with no minimum. The address and instructions come with your confirmation.
              </p>
              <dl className="mt-auto pt-8 text-[0.8125rem]">
                <dt className="text-ivory-muted">Hours</dt>
                <dd className="mt-1 font-heading text-[1.125rem] text-ivory">{store.settings.pickupHours}</dd>
              </dl>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-6">
            <p className="t-kicker text-gold-text">Not in your area?</p>
            <h2 className="t-h2 mt-5">We will tell you honestly what we can do.</h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
            <p className="t-body text-ink">
              For Hamilton, Niagara, cottage country or a gift to several addresses, send us a note with
              the postal code and date. If we can arrange it, we will quote it.
            </p>
            <div className="mt-6">
              <TextLink href="/contact?topic=delivery">Message us about delivery</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
