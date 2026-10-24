"use client";

import React from "react";
import { useBrandPreferences, type FontPairingKey } from "@/components/brand/BrandPreferences";
import { CheckIcon } from "@/components/ui/Icons";
import { TextLink } from "@/components/ui/Button";

const PAIRINGS: Array<{
  key: FontPairingKey;
  label: string;
  heading: string;
  body: string;
  headingVar: string;
  bodyVar: string;
  note: string;
}> = [
  {
    key: "bodoni",
    label: "Default",
    heading: "Bodoni Moda",
    body: "Hanken Grotesk",
    headingVar: "var(--font-bodoni)",
    bodyVar: "var(--font-hanken)",
    note: "High-contrast and formal, with fine hairlines at display sizes. A calm, modern sans for reading.",
  },
  {
    key: "caslon",
    label: "Alternate 1",
    heading: "Libre Caslon Display",
    body: "Albert Sans",
    headingVar: "var(--font-caslon)",
    bodyVar: "var(--font-albert)",
    note: "Warmer and more literary. Feels like a well-made book.",
  },
  {
    key: "instrument",
    label: "Alternate 2",
    heading: "Instrument Serif",
    body: "Figtree",
    headingVar: "var(--font-instrument)",
    bodyVar: "var(--font-figtree)",
    note: "Narrow and contemporary, with a friendly rounded sans.",
  },
];

/** Founder review page for the type pairing (T1.5, DR-16). */
export default function DevTypePage() {
  const { fontPairing, setFontPairing } = useBrandPreferences();

  return (
    <div className="container-page pb-24 pt-10 sm:pt-16">
      <p className="t-kicker text-gold-text">Design review, step 1 of 3</p>
      <h1 className="t-h1 mt-6 max-w-3xl">Choose the type pairing.</h1>
      <p className="mt-5 max-w-2xl t-lede text-ink">
        Each pairing is shown on real copy. Choosing one applies it across the whole site in this browser,
        so you can look around before deciding.
      </p>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PAIRINGS.map((p) => {
          const on = fontPairing === p.key;
          return (
            <article
              key={p.key}
              className={`flex flex-col rounded-card p-6 transition-colors duration-500 sm:p-8 ${on ? "bg-emerald text-ivory" : "bg-cream"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={`t-kicker ${on ? "text-gold" : "text-gold-text"}`}>{p.label}</p>
                {on && (
                  <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-gold">
                    <CheckIcon size={14} /> In use
                  </span>
                )}
              </div>
              <div className="mt-6 rounded-card bg-ivory p-6 text-ink" style={{ fontFamily: p.bodyVar }}>
                <p className="text-[0.8125rem] italic text-gold-text" style={{ fontFamily: p.headingVar }}>
                  memories that inspire
                </p>
                <p className="mt-3 text-[2rem] leading-[1.08] tracking-[-0.02em] text-emerald" style={{ fontFamily: p.headingVar }}>
                  The Signature Men&apos;s Box
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed">
                  Six considered pieces for quiet mornings and good evenings, with a card written by hand.
                </p>
                <p className="mt-4 text-[0.8125rem] text-muted">From $120 · Order at least 3 days ahead</p>
              </div>
              <p className={`mt-6 text-[0.9375rem] ${on ? "text-ivory" : "text-emerald"}`}>
                {p.heading} with {p.body}
              </p>
              <p className={`mt-2 t-small ${on ? "text-ivory-soft" : "text-muted"}`}>{p.note}</p>
              <button
                type="button"
                onClick={() => setFontPairing(p.key)}
                aria-pressed={on}
                className={`mt-8 h-12 rounded-card text-[0.78rem] font-medium uppercase tracking-[0.13em] transition-colors ${
                  on ? "bg-pine text-gold" : "bg-emerald text-ivory hover:bg-pine"
                }`}
              >
                {on ? "Selected" : `Use ${p.heading}`}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-14">
        <TextLink href="/dev/ampersand">Next: the ampersand</TextLink>
      </div>
    </div>
  );
}
