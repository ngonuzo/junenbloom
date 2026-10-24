import React from "react";
import { Ampersand } from "@/components/brand/Wordmark";
import { ButtonLink, TextLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[64vh] flex-col items-center justify-center py-24 text-center">
      <Ampersand variant="italic" className="anim-fade !h-20 text-gold-text opacity-80" />
      <h1 className="t-h1 mt-10">This page is not here.</h1>
      <p className="mt-5 max-w-md t-lede text-ink-soft">
        It may have moved, or the link may be mistyped. Everything else is just where we left it.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
        <ButtonLink href="/" size="lg">
          Home
        </ButtonLink>
        <TextLink href="/gifting">Shop Gifting</TextLink>
      </div>
    </section>
  );
}
