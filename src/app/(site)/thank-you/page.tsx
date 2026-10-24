import React from "react";
import type { Metadata } from "next";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { TextLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <section className="container-page flex min-h-[64vh] flex-col items-center justify-center py-24 text-center">
      <span className="anim-fade anim-halo inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-gold" aria-hidden>
        <CheckIcon size={20} />
      </span>
      <HeroTitle className="t-h1 mt-8" text="Thank you. It is in our hands now." />
      <p className="anim-fade-up mt-6 max-w-lg t-lede text-ink-soft" style={{ "--d": "500ms" } as React.CSSProperties}>
        A confirmation and your private link are on their way to your inbox. {SITE.replyPromise}
      </p>
      <div className="anim-fade-up mt-10" style={{ "--d": "650ms" } as React.CSSProperties}>
        <TextLink href="/">Back to the home page</TextLink>
      </div>
    </section>
  );
}
