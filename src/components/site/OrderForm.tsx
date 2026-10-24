"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { zoneForPostalCode, type DeliveryZone } from "@/lib/domain/zones";
import { priceOrder } from "@/lib/domain/pricing";
import { generateUpcomingDates } from "@/lib/domain/dates";
import { formatCents } from "@/lib/domain/money";
import { Ampersand } from "@/components/brand/Wordmark";
import { Button, ButtonLink, TextLink } from "@/components/ui/Button";
import { Checkbox, ChoiceCard, TextArea, TextField } from "@/components/ui/Field";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { CheckIcon } from "@/components/ui/Icons";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { slotToneFor } from "@/lib/catalog";
import { useCart, type CartItem } from "./CartContext";

const WINDOWS = [
  { value: "10:00 AM – 1:00 PM", title: "Morning", detail: "10 am to 1 pm" },
  { value: "1:00 PM – 4:00 PM", title: "Afternoon", detail: "1 pm to 4 pm" },
  { value: "4:00 PM – 7:00 PM", title: "Evening", detail: "4 pm to 7 pm" },
];

const NOTE_LIMIT = 200;

function prettyDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * One-page order details (PRD 6.7, FR-11): fulfilment, date, the card, contact,
 * then a single Continue to payment action. Totals shown here are a preview;
 * the server prices the order again from the catalogue (T4.8).
 */
export function OrderForm({
  zones,
  prefixMap,
  blockedDates,
  pickupHours,
}: {
  zones: DeliveryZone[];
  prefixMap: Record<string, DeliveryZone["code"]>;
  blockedDates: string[];
  pickupHours: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { items, ready, updateQty, removeItem, selectedSlot, dietaryNote, clearCart } = useCart();

  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [postal, setPostal] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [day, setDay] = useState("");
  const [windowLabel, setWindowLabel] = useState("");
  const [note, setNote] = useState("");
  const [allergies, setAllergies] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [news, setNews] = useState(false);
  const [terms, setTerms] = useState(false);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasBoard = items.some((i) => i.product.type === "board");
  const boardSlot = hasBoard ? selectedSlot : null;
  const leadTime = Math.max(48, ...items.map((i) => i.product.leadTimeHours));
  const dates = useMemo(
    () => generateUpcomingDates(21, leadTime, blockedDates).filter((d) => d.eligible).slice(0, 14),
    [leadTime, blockedDates]
  );

  useEffect(() => {
    if (dietaryNote && !allergies) setAllergies(dietaryNote);
    // Only seed from the board builder once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dietaryNote]);

  const lookup = zoneForPostalCode(postal, zones, prefixMap);
  const postalReady = postal.replace(/\s/g, "").length >= 3;
  const pricing = priceOrder(
    items.map((i) => ({ unitCents: i.unitCents, qty: i.qty })),
    lookup.zone,
    fulfilment,
    false
  );
  const outside = fulfilment === "delivery" && postalReady && !lookup.matched;
  const belowMin = fulfilment === "delivery" && lookup.matched && !pricing.meetsMinimum;

  const serviceDate = boardSlot?.day ?? day;
  const serviceWindow = boardSlot?.window ?? windowLabel;

  const missing = {
    postal: fulfilment === "delivery" && !lookup.matched,
    recipientName: fulfilment === "delivery" && !recipientName.trim(),
    recipientPhone: fulfilment === "delivery" && !recipientPhone.trim(),
    address: fulfilment === "delivery" && !address.trim(),
    city: fulfilment === "delivery" && !city.trim(),
    date: !serviceDate || !serviceWindow,
    allergies: hasBoard && !allergies.trim(),
    name: !name.trim(),
    email: !/\S+@\S+\.\S+/.test(email),
    phone: !phone.trim(),
    terms: !terms,
  };
  const valid = !Object.values(missing).some(Boolean) && !belowMin && !(hasBoard && !boardSlot);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!valid) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true'], [data-missing='true']");
      first?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      first?.focus?.({ preventScroll: true });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          payload: {
            items: items.map((i) => ({ productSlug: i.product.slug, optionId: i.optionId, qty: i.qty })),
            fulfilment,
            postalCode: fulfilment === "delivery" ? postal : "",
            recipientName: recipientName || name,
            recipientPhone: recipientPhone || phone,
            addressLine: address,
            city,
            serviceDate,
            window: serviceWindow,
            slotId: boardSlot?.id,
            giftNote: note,
            allergyNotes: allergies,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            marketingOptIn: news,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.order) {
        clearCart();
        router.push(`/order/${data.order.publicId}?t=${data.order.token}&confirmed=1`);
        return;
      }
      setError(data.error ?? "Something went wrong on our side. Please try again.");
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <Ampersand variant="italic" className="!h-14 text-gold-text opacity-80" />
        <h1 className="t-h1 mt-8">Nothing here yet.</h1>
        <p className="mt-5 max-w-md t-lede text-ink-soft">
          Choose a signature box or a board, and it will wait for you here.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
          <ButtonLink href="/gifting" size="lg">
            Shop Gifting
          </ButtonLink>
          <TextLink href="/charcuterie">Reserve a board</TextLink>
        </div>
      </section>
    );
  }

  return (
    <div className="container-page pb-24 pt-8 sm:pb-32 sm:pt-12">
      <Progress />
      <h1 className="t-h1 mt-10">Order details</h1>
      <a
        href="#order-summary"
        className="mt-6 flex items-center justify-between rounded-card bg-cream px-5 py-4 text-[0.9375rem] lg:hidden"
      >
        <span className="text-emerald">
          {items.reduce((n, i) => n + i.qty, 0)} {items.reduce((n, i) => n + i.qty, 0) === 1 ? "item" : "items"}
        </span>
        <span className="tabular-nums text-muted">
          {formatCents(pricing.subtotalCents)} <span className="ml-2 text-emerald link-quiet">View</span>
        </span>
      </a>

      <form onSubmit={submit} noValidate className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 space-y-16 lg:col-span-7">
          {/* Fulfilment */}
          <Section n={1} title="Delivery or pickup">
            <Segmented
              value={fulfilment}
              onChange={(v) => setFulfilment(v as "delivery" | "pickup")}
              options={[
                { value: "delivery", label: "Delivery" },
                { value: "pickup", label: "Pickup, free" },
              ]}
            />
            <AnimatePresence mode="wait" initial={false}>
              {fulfilment === "delivery" ? (
                <motion.div
                  key="delivery"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE_LUXE }}
                  className="mt-8 space-y-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField
                      id="postal"
                      label="Postal code"
                      autoComplete="postal-code"
                      value={postal}
                      onChange={(e) => setPostal(e.target.value.toUpperCase())}
                      placeholder="M5V 2T6"
                      maxLength={7}
                      error={tried && missing.postal ? "We need a postal code in our delivery area." : undefined}
                    />
                    <div aria-live="polite" className="flex items-end">
                      {postalReady && lookup.matched && lookup.zone ? (
                        <p className="flex items-start gap-2.5 pb-3 t-small text-ink">
                          <CheckIcon size={16} className="mt-0.5 text-gold-text" />
                          <span>
                            {lookup.zone.name}. Delivery {formatCents(lookup.zone.feeCents)}, minimum{" "}
                            {formatCents(lookup.zone.minOrderCents)}.
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {outside && (
                    <div className="rounded-card bg-mist px-5 py-4">
                      <p className="t-small text-emerald">{lookup.message}</p>
                      <div className="mt-3 flex flex-wrap gap-6">
                        <button
                          type="button"
                          onClick={() => setFulfilment("pickup")}
                          className="t-small font-medium text-emerald link-quiet"
                        >
                          Switch to free pickup
                        </button>
                        <Link href="/contact?topic=delivery" className="t-small font-medium text-emerald link-quiet">
                          Message us
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField
                      id="recipient"
                      label="Recipient's name"
                      autoComplete="off"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      error={tried && missing.recipientName ? "Who should we deliver to?" : undefined}
                    />
                    <TextField
                      id="recipient-phone"
                      type="tel"
                      label="Recipient's phone"
                      hint="For the driver only"
                      autoComplete="off"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      error={tried && missing.recipientPhone ? "A number in case we cannot find the door." : undefined}
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <TextField
                      id="address"
                      label="Street address and unit"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="sm:col-span-2"
                      error={tried && missing.address ? "Please add the address." : undefined}
                    />
                    <TextField
                      id="city"
                      label="City"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      error={tried && missing.city ? "Please add the city." : undefined}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pickup"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE_LUXE }}
                  className="mt-8 rounded-card bg-cream px-6 py-5"
                >
                  <p className="t-body text-ink">
                    Pickup is free. The address and instructions come with your confirmation.
                  </p>
                  <p className="mt-2 t-small text-muted">Pickup hours: {pickupHours}.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* Date and window */}
          <Section n={2} title={fulfilment === "delivery" ? "Delivery day and window" : "Pickup day and window"}>
            {hasBoard ? (
              boardSlot ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-cream px-6 py-5">
                  <div>
                    <p className="font-heading text-[1.25rem] text-emerald">{prettyDate(boardSlot.day)}</p>
                    <p className="mt-1 t-small text-muted">{boardSlot.window}, reserved for your board</p>
                  </div>
                  <TextLink href="/charcuterie#reserve" arrow={false}>
                    Change
                  </TextLink>
                </div>
              ) : (
                <div data-missing={tried} className="rounded-card bg-mist px-6 py-5">
                  <p className="t-small text-emerald">Boards need a reserved day and two-hour window.</p>
                  <div className="mt-3">
                    <TextLink href="/charcuterie#reserve">Choose a day and window</TextLink>
                  </div>
                </div>
              )
            ) : (
              <>
                <div
                  role="radiogroup"
                  aria-label="Day"
                  data-missing={tried && !day}
                  className="no-scrollbar scroll-fade -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
                >
                  {dates.map((d) => {
                    const on = d.iso === day;
                    const date = new Date(`${d.iso}T12:00:00`);
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={prettyDate(d.iso)}
                        onClick={() => setDay(d.iso)}
                        className={`flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-card py-3.5 transition-colors duration-300 ease-luxe ${
                          on ? "bg-emerald text-ivory" : "bg-cream text-emerald hover:bg-linen"
                        }`}
                      >
                        <span className="text-[0.6875rem] uppercase tracking-[0.14em] opacity-80">
                          {date.toLocaleDateString("en-CA", { weekday: "short" }).replace(".", "")}
                        </span>
                        <span className="mt-1 font-heading text-[1.625rem] leading-none">{date.getDate()}</span>
                        <span className="mt-1 text-[0.6875rem] opacity-75">
                          {date.toLocaleDateString("en-CA", { month: "short" }).replace(".", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[0.8125rem] text-muted">
                  The earliest day reflects the notice your order needs. Sooner?{" "}
                  <Link href="/contact?topic=rush" className="link-quiet text-emerald">
                    Message us
                  </Link>
                  .
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {WINDOWS.map((w) => (
                    <ChoiceCard
                      key={w.value}
                      name="window"
                      value={w.value}
                      checked={windowLabel === w.value}
                      onChange={setWindowLabel}
                      title={w.title}
                      detail={w.detail}
                    />
                  ))}
                </div>
                {tried && missing.date && (
                  <p className="mt-3 text-[0.8125rem] text-gold-text">Please choose a day and a window.</p>
                )}
              </>
            )}
          </Section>

          {/* The card */}
          <Section n={3} title="The card">
            <div className="grid gap-6 md:grid-cols-[1fr_15rem]">
              <TextArea
                id="note"
                label="Your message"
                optional
                maxLength={NOTE_LIMIT}
                hint={`${note.length} of ${NOTE_LIMIT}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="We write it by hand, exactly as you type it."
                rows={5}
              />
              <CardPreview note={note} />
            </div>
            <div className="mt-6">
              <TextField
                id="allergies"
                label={hasBoard ? "Allergies and diet" : "Allergies or anything to avoid"}
                optional={!hasBoard}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={hasBoard ? "No allergies" : "For example, no nuts"}
                error={tried && missing.allergies ? "Required for boards. Write 'No allergies' if none." : undefined}
              />
            </div>
          </Section>

          {/* Contact */}
          <Section n={4} title="Your details">
            <p className="-mt-2 mb-6 t-small text-muted">For your receipt and the link to follow your order.</p>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                id="name"
                label="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={tried && missing.name ? "Please add your name." : undefined}
              />
              <TextField
                id="phone"
                type="tel"
                label="Phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={tried && missing.phone ? "Please add a phone number." : undefined}
              />
              <TextField
                id="email"
                type="email"
                label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sm:col-span-2"
                error={tried && missing.email ? "Please add a valid email." : undefined}
              />
            </div>
            <div className="mt-8 space-y-4">
              <Checkbox id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={tried && missing.terms ? true : undefined}>
                I agree to the{" "}
                <Link href="/policies/terms" className="link-quiet text-emerald">
                  terms
                </Link>{" "}
                and the{" "}
                <Link href="/policies/refunds" className="link-quiet text-emerald">
                  refund policy
                </Link>
                .
              </Checkbox>
              {tried && missing.terms && (
                <p className="pl-8 text-[0.8125rem] text-gold-text">Please tick this box to continue.</p>
              )}
              <Checkbox id="news" checked={news} onChange={(e) => setNews(e.target.checked)}>
                Send me seasonal letters from June &amp; Bloom. Optional, and easy to stop.
              </Checkbox>
            </div>
          </Section>
        </div>

        {/* Summary */}
        <aside id="order-summary" className="min-w-0 scroll-mt-[calc(var(--header-h)+1rem)] lg:col-span-5 lg:col-start-8" aria-label="Order summary">
          <div className="rounded-card bg-cream p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <p className="t-kicker text-gold-text">Your order</p>
            <ul className="mt-6 space-y-5">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <SummaryItem
                    key={`${item.product.slug}-${item.optionId ?? "base"}`}
                    item={item}
                    onQty={(q) => updateQty(item.product.slug, item.optionId, q)}
                    onRemove={() => removeItem(item.product.slug, item.optionId)}
                  />
                ))}
              </AnimatePresence>
            </ul>

            <dl className="mt-8 space-y-2.5 text-[0.9375rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums text-emerald">{formatCents(pricing.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{fulfilment === "pickup" ? "Pickup" : "Delivery"}</dt>
                <dd className="tabular-nums text-emerald">
                  {fulfilment === "pickup"
                    ? "Free"
                    : lookup.zone
                      ? formatCents(pricing.deliveryCents)
                      : "Add postal code"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pt-4">
                <dt className="font-heading text-[1.25rem] text-emerald">Total</dt>
                <dd className="font-heading text-[1.75rem] tabular-nums text-emerald">
                  {formatCents(pricing.totalCents)}
                </dd>
              </div>
            </dl>

            {belowMin && lookup.zone && (
              <p className="mt-5 rounded-card bg-ivory px-4 py-3 t-small text-emerald">
                Add {formatCents(pricing.minimumShortfallCents)} more for delivery to {lookup.zone.name}, or
                choose free pickup.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-5 rounded-card bg-ivory px-4 py-3 t-small text-emerald">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" arrow className="mt-7 w-full" disabled={submitting}>
              {submitting ? (
                "One moment"
              ) : (
                <>
                  Continue to payment
                  <span className="hidden sm:inline"> · {formatCents(pricing.totalCents)}</span>
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-muted">
              Secure payment by Stripe. Card, Apple Pay and Google Pay.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Progress() {
  const steps = ["Choose", "Details", "Pay"];
  return (
    <ol className="flex items-center gap-6 text-[0.8125rem]" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === 1 ? "step" : undefined} className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
              i === 0 ? "bg-linen text-gold-text" : i === 1 ? "bg-emerald text-ivory" : "bg-cream text-ink/45"
            }`}
          >
            {i === 0 ? <CheckIcon size={12} /> : i + 1}
          </span>
          <span className={i === 2 ? "text-ink/45" : "text-emerald"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${n}`}>
      <h2 id={`section-${n}`} className="mb-7 flex items-baseline gap-4">
        <span className="t-numeral text-[1.125rem] text-gold-text">{n}</span>
        <span className="font-heading text-[1.5rem] leading-tight tracking-[-0.01em] text-emerald">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const reduce = useReducedMotion();
  return (
    <LayoutGroup id="fulfilment">
      <div role="radiogroup" aria-label="Delivery or pickup" className="inline-flex rounded-card bg-cream p-1">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={`relative h-11 rounded-[3px] px-6 text-[0.9375rem] transition-colors duration-300 ${
                on ? "text-ivory" : "text-ink-soft hover:text-emerald"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="fulfilment-pill"
                  className="absolute inset-0 rounded-[3px] bg-emerald"
                  transition={{ duration: reduce ? 0 : 0.45, ease: EASE_LUXE }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/** Live preview of the handwritten card (FR-16, FR-17). */
function CardPreview({ note }: { note: string }) {
  return (
    <div aria-hidden className="hidden md:block">
      <p className="mb-2 text-[0.875rem] font-medium text-emerald">Preview</p>
      <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-card bg-linen p-5 shadow-[0_20px_40px_-28px_color-mix(in_oklab,var(--ink)_45%,transparent)]">
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply" />
        <Ampersand variant="italic" className="relative !h-6 text-gold-text" />
        <p className="relative font-heading text-[1.0625rem] italic leading-snug text-emerald [overflow-wrap:anywhere]">
          {note || <span className="text-emerald/35">Your words, in our hand.</span>}
        </p>
        <p className="relative text-[0.625rem] uppercase tracking-[0.2em] text-gold-text">June &amp; Bloom</p>
      </div>
    </div>
  );
}

function SummaryItem({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const tone = slotToneFor(item.product);
  const swatch =
    tone === "emerald" ? "bg-emerald text-gold" : tone === "moss" ? "bg-moss text-emerald" : "bg-linen text-gold-text";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.4, ease: EASE_LUXE }}
      className="flex gap-4"
    >
      <span className={`relative flex h-[4.5rem] w-14 shrink-0 items-center justify-center overflow-hidden rounded-card ${swatch}`}>
        {item.product.images?.[0] ? (
          <Image
            src={item.product.images[0].src}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
            style={{ objectPosition: item.product.images[0].focal ?? "50% 50%" }}
          />
        ) : (
          <Ampersand variant="italic" className="!h-7 opacity-60" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate font-heading text-[1.0625rem] text-emerald">{item.product.name}</p>
          <p className="shrink-0 text-[0.9375rem] tabular-nums text-emerald">{formatCents(item.unitCents * item.qty)}</p>
        </div>
        {item.optionLabel && <p className="mt-0.5 truncate text-[0.8125rem] text-muted">{item.optionLabel}</p>}
        <div className="mt-2.5 flex items-center gap-4">
          {item.product.type === "board" ? (
            <span className="text-[0.8125rem] text-muted">One board per slot</span>
          ) : (
            <QuantityStepper size="sm" value={item.qty} onChange={onQty} label={`Quantity of ${item.product.name}`} />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-[0.8125rem] text-muted underline-offset-4 transition-colors hover:text-emerald hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  );
}
