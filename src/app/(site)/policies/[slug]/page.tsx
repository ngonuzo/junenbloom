import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLICIES } from "@/content/policies";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/content/site";

/** Turns the contact email and phone number inside policy text into links. */
function withContactLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    const e = rest.indexOf(SITE.email);
    const p = rest.indexOf(SITE.phone);
    const hits = [e, p].filter((n) => n >= 0);
    if (hits.length === 0) {
      parts.push(rest);
      break;
    }
    const at = Math.min(...hits);
    const isEmail = at === e;
    const match = isEmail ? SITE.email : SITE.phone;
    if (at > 0) parts.push(rest.slice(0, at));
    parts.push(
      <a
        key={key++}
        href={isEmail ? `mailto:${SITE.email}` : SITE.phoneHref}
        className="link-quiet whitespace-nowrap text-emerald"
      >
        {match}
      </a>,
    );
    rest = rest.slice(at + match.length);
  }
  return parts;
}

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return policy ? { title: policy.title, description: policy.summary } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="container-page pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <nav aria-label="Policies" className="lg:col-span-3">
          <p className="t-kicker text-gold-text">Policies</p>
          <ul className="mt-6 flex flex-wrap gap-2 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:flex-col lg:gap-0.5">
            {Object.entries(POLICIES).map(([key, p]) => {
              const on = key === slug;
              return (
                <li key={key}>
                  <Link
                    href={`/policies/${key}`}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex h-10 items-center rounded-full px-4 text-[0.875rem] transition-colors lg:rounded-card lg:px-0 ${
                      on
                        ? "bg-emerald text-ivory lg:bg-transparent lg:text-emerald lg:font-medium"
                        : "bg-cream text-ink-soft hover:text-emerald lg:bg-transparent lg:hover:text-gold-text"
                    }`}
                  >
                    {on && <span aria-hidden className="mr-3 hidden h-1.5 w-1.5 rounded-full bg-gold-text lg:inline-block" />}
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <article className="lg:col-span-7 lg:col-start-5">
          <HeroTitle className="t-h1" text={policy.title} delay={60} />
          <p className="anim-fade-up mt-5 t-lede font-semibold text-ink" style={{ "--d": "300ms" } as React.CSSProperties}>
            {policy.summary}
          </p>
          {policy.note && (
            <p
              className="anim-fade-up mt-3 t-body max-w-[65ch] text-ink"
              style={{ "--d": "360ms" } as React.CSSProperties}
            >
              {policy.note}
            </p>
          )}

          <div className="mt-14 space-y-12">
            {policy.sections.map((s, i) => (
              <Reveal as="section" key={s.heading} delay={Math.min(i, 3) * 0.05}>
                <h2 className="font-heading text-[1.5rem] leading-tight tracking-[-0.01em] text-emerald">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((para) => (
                    <p key={para.slice(0, 32)} className="t-body max-w-[65ch] text-ink">
                      {withContactLinks(para)}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 rounded-card bg-cream px-6 py-6 t-small text-ink">
            Questions about this policy? Email{" "}
            <a href={`mailto:${SITE.email}`} className="link-quiet text-emerald">
              {SITE.email}
            </a>
            .
          </div>
        </article>
      </div>
    </div>
  );
}
