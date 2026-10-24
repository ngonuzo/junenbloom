import React from "react";
import type { Metadata } from "next";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { SITE, whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to June & Bloom about gifts, boards, holiday styling or delivery. We reply within one business day.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const whatsapp = whatsappHref();

  const channels = [
    { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { label: "Instagram", value: `@${SITE.instagramHandle}`, href: SITE.instagramUrl },
    ...(whatsapp ? [{ label: "WhatsApp", value: "Send a message", href: whatsapp }] : []),
  ];

  return (
    <div className="container-page pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="anim-fade-up t-kicker text-gold-text">Contact</p>
          <HeroTitle className="t-h1 mt-6" text="Write to us. A person will answer." italicWords={["person"]} />
          <p className="anim-fade-up mt-6 max-w-md t-lede text-ink" style={{ "--d": "480ms" } as React.CSSProperties}>
            Rush orders, deliveries outside our area, gifts for a team, or a question about your tree.{" "}
            {SITE.replyPromise}
          </p>

          <dl className="anim-fade-up mt-12 space-y-6" style={{ "--d": "620ms" } as React.CSSProperties}>
            {channels.map((c) => (
              <div key={c.label}>
                <dt className="text-[0.8125rem] text-muted">{c.label}</dt>
                <dd className="mt-1">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                    className="link-quiet font-heading text-[1.125rem] text-emerald transition-colors [overflow-wrap:anywhere] hover:text-gold-text sm:text-[1.375rem]"
                  >
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-[0.8125rem] text-muted">Where we work</dt>
              <dd className="mt-1 font-heading text-[1.125rem] text-emerald sm:text-[1.375rem]">The {SITE.region}</dd>
            </div>
          </dl>
        </div>

        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.15}>
          <div className="relative rounded-card bg-cream p-6 sm:p-10">
            <ContactForm initialTopic={topic} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
