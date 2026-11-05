import React from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { formatCents } from "@/lib/domain/money";
import { HeroTitle } from "@/components/ui/HeroTitle";
import { TextLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Ampersand } from "@/components/brand/Wordmark";
import { SITE } from "@/content/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

const STEPS = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out", label: "On its way" },
  { key: "delivered", label: "Delivered" },
] as const;

function prettyDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

/** Order status by private link (PRD 6.9, T4.13): the right token shows the order, anything else shows nothing. */
export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; confirmed?: string }>;
}) {
  const { id } = await params;
  const { t, confirmed } = await searchParams;
  const store = readStore();
  const order = store.orders.find((o) => o.publicId === id);

  if (!order || !t || t !== order.token) {
    return (
      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <Ampersand variant="italic" className="!h-14 text-gold-text opacity-80" />
        <h1 className="t-h1 mt-8">We could not open this order.</h1>
        <p className="mt-5 max-w-md t-lede text-ink-soft">
          Please use the private link from your confirmation email. If it still does not work, message
          us with your order number.
        </p>
        <div className="mt-10">
          <TextLink href="/contact">Message us</TextLink>
        </div>
      </section>
    );
  }

  const pickup = order.fulfilment === "pickup";
  const steps = STEPS.map((s) => (s.key === "out" && pickup ? { ...s, label: "Ready for pickup" } : s));
  const current = Math.max(0, steps.findIndex((s) => s.key === order.status));
  const firstName = order.customerName.split(" ")[0];

  return (
    <div className="container-page pb-24 pt-10 sm:pb-32 sm:pt-16">
      <div className="max-w-3xl">
        {confirmed === "1" ? (
          <>
            <span
              className="anim-fade inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-gold anim-halo"
              aria-hidden
            >
              <CheckIcon size={20} />
            </span>
            <HeroTitle className="t-h1 mt-8" text={`Thank you, ${firstName}.`} />
            <p className="anim-fade-up mt-6 t-lede text-ink" style={{ "--d": "400ms" } as React.CSSProperties}>
              Order <span className="font-medium text-emerald">{order.publicId}</span> is confirmed. A
              receipt is on its way to {order.customerEmail}. Keep this page to follow your order.
            </p>
          </>
        ) : (
          <>
            <p className="anim-fade-up t-kicker text-gold-text">Your order</p>
            <HeroTitle className="t-h1 mt-6" text={order.publicId} />
          </>
        )}
      </div>

      {/* Status (PRD 6.9) */}
      <Reveal className="mt-16" delay={0.2}>
        <ol className="grid gap-4 sm:grid-cols-5 sm:gap-3" aria-label="Order status">
          {steps.map((s, i) => {
            const state = i < current ? "done" : i === current ? "current" : "todo";
            return (
              <li
                key={s.key}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-4 rounded-card px-5 py-4 sm:flex-col sm:items-start sm:gap-6 sm:py-5 ${
                  state === "current" ? "bg-emerald text-ivory" : "bg-cream"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] ${
                    state === "done"
                      ? "bg-linen text-gold-text"
                      : state === "current"
                        ? "anim-halo bg-gold text-emerald"
                        : "bg-ivory text-ink/40"
                  }`}
                >
                  {state === "done" ? <CheckIcon size={13} /> : i + 1}
                </span>
                <span
                  className={`text-[0.9375rem] ${
                    state === "current" ? "text-ivory" : state === "done" ? "text-emerald" : "text-ink/45"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="space-y-12 lg:col-span-7">
          <section aria-labelledby="when-title">
            <h2 id="when-title" className="t-kicker text-gold-text">
              {pickup ? "Pickup" : "Delivery"}
            </h2>
            <p className="mt-5 font-heading text-[1.75rem] leading-tight text-emerald">{prettyDate(order.serviceDate)}</p>
            <p className="mt-2 t-body text-ink">{order.window}</p>
            <div className="mt-6 t-body text-ink">
              {pickup ? (
                <>
                  <p>{store.settings.pickupAddress}</p>
                  <p className="mt-1 whitespace-pre-line text-muted">Hours: {store.settings.pickupHours}</p>
                </>
              ) : (
                <>
                  <p>{order.recipientName}</p>
                  <p className="text-muted">
                    {order.addressLine}, {order.city} {order.postalCode}
                  </p>
                </>
              )}
            </div>
          </section>

          {(order.giftNote || (order.allergyNotes && order.allergyNotes !== "None")) && (
            <section aria-labelledby="card-title">
              <h2 id="card-title" className="t-kicker text-gold-text">
                The card
              </h2>
              {order.giftNote ? (
                <div className="relative mt-6 max-w-md overflow-hidden rounded-card bg-linen p-8">
                  <div className="grain pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply" />
                  <p className="relative font-heading text-[1.375rem] italic leading-snug text-emerald">
                    {order.giftNote}
                  </p>
                </div>
              ) : (
                <p className="mt-5 t-body text-muted">No message, so the card will simply be signed from us.</p>
              )}
              {order.allergyNotes && order.allergyNotes !== "None" && (
                <p className="mt-5 t-small text-ink">
                  <span className="font-medium text-emerald">Allergies and diet:</span> {order.allergyNotes}
                </p>
              )}
            </section>
          )}
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.1}>
          <div className="rounded-card bg-cream p-6 sm:p-8">
            <h2 className="t-kicker text-gold-text">Summary</h2>
            <ul className="mt-6 space-y-3">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 text-[0.9375rem]">
                  <span>
                    <span className="text-emerald">{item.nameSnapshot}</span>
                    {item.qty > 1 && <span className="text-muted"> × {item.qty}</span>}
                    {item.optionLabel && <span className="block text-[0.8125rem] text-muted">{item.optionLabel}</span>}
                  </span>
                  <span className="shrink-0 tabular-nums text-emerald">{formatCents(item.unitCents * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-muted">{pickup ? "Pickup" : "Delivery"}</dt>
                <dd className="tabular-nums text-emerald">{order.deliveryCents ? formatCents(order.deliveryCents) : "Free"}</dd>
              </div>
              {order.taxCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">HST</dt>
                  <dd className="tabular-nums text-emerald">{formatCents(order.taxCents)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-4">
                <dt className="font-heading text-[1.25rem] text-emerald">Paid</dt>
                <dd className="font-heading text-[1.75rem] tabular-nums text-emerald">{formatCents(order.totalCents)}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-6 t-small text-muted">
            Need to change something? Email{" "}
            <a href={`mailto:${SITE.email}?subject=${order.publicId}`} className="link-quiet text-emerald">
              {SITE.email}
            </a>{" "}
            with your order number.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
