import React from "react";
import { HeroTitle } from "@/components/ui/HeroTitle";

/**
 * Opening block shared by inner pages: kicker, title rising on first paint,
 * and a short lede alongside.
 */
export function PageIntro({
  kicker,
  title,
  italicWords,
  lede,
  aside,
  className = "",
}: {
  kicker: string;
  title: string;
  italicWords?: string[];
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`container-page pb-16 pt-10 sm:pb-20 sm:pt-16 ${className}`}>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <p className="anim-fade-up t-kicker text-gold-text" style={{ "--d": "40ms" } as React.CSSProperties}>
            {kicker}
          </p>
          <HeroTitle className="t-h1 mt-6" text={title} italicWords={italicWords} delay={120} />
        </div>
        {(lede || aside) && (
          <div
            className="anim-fade-up lg:col-span-4 lg:col-start-9"
            style={{ "--d": "520ms" } as React.CSSProperties}
          >
            {lede && <p className="t-lede text-ink">{lede}</p>}
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

/** Small definition list of facts under an intro. */
export function FactList({ facts }: { facts: Array<{ label: string; value: string }> }) {
  return (
    <dl className="mt-8 grid grid-cols-3 gap-2">
      {facts.map((f) => (
        <div key={f.label} className="rounded-card bg-cream px-4 py-3.5">
          <dt className="text-[0.75rem] text-muted">{f.label}</dt>
          <dd className="mt-1 font-heading text-[1.125rem] leading-tight text-emerald">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
