import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { readStore } from "@/lib/db/store";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PausedNotice } from "@/components/site/PausedNotice";
import { SITE } from "@/content/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Holiday Styling Inquiry",
  description: "Tell us about your home and preferred dates. We reply personally within one business day.",
};

export default function InquirePage() {
  const store = readStore();
  return (
    <div className="container-page pb-24 pt-8 sm:pb-32 sm:pt-12">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <Link
              href="/holiday-styling"
              className="anim-fade text-[0.8125rem] text-muted transition-colors hover:text-emerald"
            >
              Holiday Styling
            </Link>
            <HeroTitle className="t-h1 mt-6" text="A few questions, about three minutes." delay={80} />
            <p className="anim-fade-up mt-6 t-body text-ink" style={{ "--d": "520ms" } as React.CSSProperties}>
              Your answers go straight to the two of us. {SITE.replyPromise} Nothing is booked or
              charged until you accept a quote.
            </p>
          </div>
        </aside>
        <div className="lg:col-span-7 lg:col-start-6">
          {store.settings.stylingOpen ? (
            <Suspense>
              <InquiryForm />
            </Suspense>
          ) : (
            <PausedNotice
              title="Our styling calendar is full for this season."
              body="Message us to join the waitlist, or to plan ahead for next year."
            />
          )}
        </div>
      </div>
    </div>
  );
}
