"use client";

import React from "react";
import { Ampersand, Wordmark } from "@/components/brand/Wordmark";
import { AMPERSANDS, type AmpersandVariant } from "@/components/brand/ampersand-paths";
import { useBrandPreferences } from "@/components/brand/BrandPreferences";
import { CheckIcon } from "@/components/ui/Icons";
import { TextLink } from "@/components/ui/Button";

const ORDER: AmpersandVariant[] = ["italic", "swash", "engraved"];

/** Founder review page for the wordmark ampersand (T1.6, DR-03). */
export default function DevAmpersandPage() {
  const { ampersandVariant, setAmpersandVariant } = useBrandPreferences();

  return (
    <div className="container-page pb-24 pt-10 sm:pt-16">
      <p className="t-kicker text-gold-text">Design review, step 2 of 3</p>
      <h1 className="t-h1 mt-6 max-w-3xl">Choose the ampersand.</h1>
      <p className="mt-5 max-w-2xl t-lede text-ink">
        Each option is an outlined vector taken from its typeface, so it looks the same on every device.
        It appears in the wordmark only, never in the JB monogram. Your choice previews in the header and
        footer straight away.
      </p>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {ORDER.map((variant, i) => {
          const amp = AMPERSANDS[variant];
          const on = ampersandVariant === variant;
          return (
            <article key={variant} className="flex flex-col rounded-card bg-cream p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="t-kicker text-gold-text">Option {String.fromCharCode(65 + i)}</p>
                {on && (
                  <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-emerald">
                    <CheckIcon size={14} className="text-gold-text" /> In use
                  </span>
                )}
              </div>
              <div className="mt-6 flex aspect-[4/3] items-center justify-center rounded-card bg-ivory text-gold-text">
                <Ampersand variant={variant} className="!h-36" />
              </div>
              <div className="mt-3 rounded-card bg-ivory px-6 py-5">
                <Wordmark size="md" variant={variant} />
              </div>
              <div className="on-emerald mt-3 rounded-card bg-emerald px-6 py-6">
                <Wordmark size="lg" surface="emerald" variant={variant} />
              </div>
              <p className="mt-6 text-[0.9375rem] text-emerald">{amp.label}</p>
              <p className="mt-1 t-small text-muted">{amp.source}</p>
              <button
                type="button"
                onClick={() => setAmpersandVariant(variant)}
                aria-pressed={on}
                className={`mt-8 h-12 rounded-card text-[0.78rem] font-medium uppercase tracking-[0.13em] transition-colors ${
                  on ? "bg-linen text-emerald" : "bg-emerald text-ivory hover:bg-pine"
                }`}
              >
                {on ? "Selected" : "Use this ampersand"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-14">
        <TextLink href="/dev/components">Next: components</TextLink>
      </div>
    </div>
  );
}
