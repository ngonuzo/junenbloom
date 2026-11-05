"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ampersand, Wordmark } from "@/components/brand/Wordmark";
import { RevealWords, Reveal } from "@/components/ui/Reveal";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";
import { POLICY_NAV, PRIMARY_NAV, SECONDARY_NAV, SITE, whatsappHref } from "@/content/site";

/** Footer on solid emerald, opening with the tagline (DR-01). */
export function Footer() {
  const whatsapp = whatsappHref();
  return (
    <footer className="no-print">
      <div
        className="paper on-emerald relative flex items-end justify-center overflow-hidden bg-emerald pb-12 pt-16 sm:pb-16 sm:pt-20"
      >
        <div className="container-page text-center">
          <Reveal y={10} duration={1.2}>
            <Ampersand variant="italic" className="mx-auto mb-6 !h-10 text-gold opacity-90" />
          </Reveal>
          <RevealWords
            as="p"
            text={SITE.tagline}
            className="font-heading text-[2.5rem] italic leading-[1.05] tracking-[-0.02em] text-ivory sm:text-[4rem]"
          />
        </div>
      </div>

      <div className="paper on-emerald bg-emerald text-ivory">
        <div className="container-page pb-10 pt-6 sm:pt-10">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-4">
              <Wordmark surface="emerald" size="lg" />
              <p className="max-w-sm t-small text-ivory-soft">
                {SITE.description}
              </p>
              <ul className="space-y-2 t-small">
                <li>
                  <a href={`mailto:${SITE.email}`} className="link-quiet text-ivory hover:text-gold">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link-quiet text-ivory hover:text-gold"
                  >
                    Instagram @{SITE.instagramHandle}
                  </a>
                </li>
                {whatsapp && (
                  <li>
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="link-quiet text-ivory hover:text-gold">
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
              <FooterColumn title="Shop" links={PRIMARY_NAV} />
              <FooterColumn title="The house" links={SECONDARY_NAV} />
              <FooterColumn title="Policies" links={POLICY_NAV} />
            </div>

            <div className="lg:col-span-3">
              <Newsletter />
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-3 text-[0.8125rem] text-ivory-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {SITE.name}
            </p>
            <p>Toronto, Canada. All prices in Canadian dollars.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="t-kicker text-gold">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="t-small text-ivory transition-colors duration-300 hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Seasonal letter sign-up with explicit, unchecked-by-default consent (FR-75, NFR-04). */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consented) return;
    setState("sending");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notify_me",
          payload: { email, productSlug: "newsletter-seasonal" },
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <p className="t-kicker text-gold">Seasonal letters</p>
      <div aria-live="polite">
        {state === "done" ? (
          <p className="mt-5 flex items-start gap-2.5 t-small text-ivory">
            <CheckIcon size={16} className="mt-0.5 text-gold" />
            Thank you. The next letter will find you.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <p className="t-small text-ivory-soft">
              A short note when new boxes and styling dates open. A few times a season, never more.
            </p>
            <div className="flex h-12 items-stretch rounded-card bg-pine focus-within:shadow-[0_0_0_2px_var(--gold)]">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-[0.9375rem] text-ivory outline-none placeholder:text-ivory/45"
              />
              <button
                type="submit"
                disabled={!consented || state === "sending"}
                aria-label="Join the seasonal letter"
                className="group inline-flex w-12 items-center justify-center text-gold transition-opacity disabled:opacity-35"
              >
                <ArrowIcon size={20} className="transition-transform duration-500 ease-luxe group-hover:translate-x-0.5" />
              </button>
            </div>
            <label htmlFor="footer-consent" className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-relaxed text-ivory-muted">
              <input
                id="footer-consent"
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
              />
              <span>
                Yes, send me seasonal emails from June &amp; Bloom. I can unsubscribe at any time.
              </span>
            </label>
            {state === "error" && (
              <p className="text-[0.8125rem] text-gold">That did not go through. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
