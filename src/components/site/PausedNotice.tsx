import React from "react";
import { TextLink } from "@/components/ui/Button";

/** Shown in place of ordering when an offer is switched off in the dashboard (FR-92). */
export function PausedNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card bg-cream px-6 py-14 text-center sm:px-12 sm:py-20">
      <p className="t-kicker text-gold-text">A short pause</p>
      <h2 className="t-h2 mx-auto mt-5 max-w-2xl">{title}</h2>
      <p className="mx-auto mt-5 max-w-lg t-body text-ink">{body}</p>
      <div className="mt-8">
        <TextLink href="/contact">Message us</TextLink>
      </div>
    </div>
  );
}
