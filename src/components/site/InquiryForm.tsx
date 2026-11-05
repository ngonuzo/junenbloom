"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { routeInquiry, type SpaceCategory, type TreeHeightBand } from "@/lib/domain/rules";
import { Button, TextButton, TextLink } from "@/components/ui/Button";
import { Checkbox, ChoiceCard, SelectField, TextArea, TextField } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";
import { DateChoiceCalendar, localIso } from "@/components/ui/DateChoiceCalendar";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { SITE } from "@/content/site";

const OPTIONS = [
  { slug: "decorating-only", name: "Decorating Only", note: "From $395" },
  { slug: "decorating-plus-sourcing", name: "Decorating plus sourcing", note: "From $595" },
  { slug: "full-service-holiday", name: "Custom Service", note: "Custom quote, from $995" },
];

const PALETTES = [
  "Gold, forest green and cream",
  "White, silver and soft grey",
  "Deep red, brass and pine",
  "Natural: wood, linen and greenery",
  "Help me choose",
];

const ADD_ONS = ["Gift wrapping", "Festive spaces", "Take down and storage"];

const BUDGETS = ["$300 to $600", "$600 to $1,000", "$1,000 to $2,000", "Over $2,000", "Not sure yet"];

const STEPS = ["Your home", "Dates and style", "Your details"] as const;

function isoInDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localIso(d);
}

/**
 * Holiday styling inquiry (FR-60 to FR-62): three short steps, the chosen option
 * preselected, and the custom-quote route explained as soon as it applies.
 */
export function InquiryForm() {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ publicId: string; customQuote: boolean } | null>(null);

  const initialOption = OPTIONS.some((o) => o.slug === params.get("option"))
    ? (params.get("option") as string)
    : "decorating-plus-sourcing";
  const initialHeight = (["under_7ft", "7_to_9ft", "over_9ft"] as const).includes(
    params.get("height") as TreeHeightBand
  )
    ? (params.get("height") as TreeHeightBand)
    : "7_to_9ft";

  const [optionSlug, setOptionSlug] = useState(initialOption);
  const [space, setSpace] = useState<SpaceCategory>("residential");
  const [height, setHeight] = useState<TreeHeightBand>(initialHeight);
  const [supply, setSupply] = useState<"client_owned" | "source_for_me">("client_owned");
  const [area, setArea] = useState("");
  const [ceiling, setCeiling] = useState("");
  const [access, setAccess] = useState("");
  const [household, setHousehold] = useState("");

  const [dates, setDates] = useState<string[]>([]);
  const [palette, setPalette] = useState("");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);

  const routing = routeInquiry({ optionSlug, treeHeightBand: height, spaceCategory: space });
  const minDate = isoInDays(7);

  useEffect(() => {
    if (step === 0 && !done) return;
    headingRef.current?.focus({ preventScroll: true });
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [step, done, reduce]);

  const stepValid = [
    Boolean(optionSlug && area.trim()),
    dates.length > 0,
    Boolean(name.trim() && /\S+@\S+\.\S+/.test(email) && phone.trim() && consent),
  ];

  function next() {
    setTried(true);
    if (!stepValid[step]) return;
    setTried(false);
    setDirection(1);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setTried(false);
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    setTried(true);
    if (!stepValid[2]) return;
    setSubmitting(true);
    setError("");
    const details = [
      ceiling && `Ceiling height: ${ceiling}`,
      access && `Access and parking: ${access}`,
      household && `Pets and children: ${household}`,
      photos.length && `Photos to follow: ${photos.join(", ")}`,
      `Photo permission: ${photoConsent ? "yes" : "no"}`,
      notes && `Notes: ${notes}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_inquiry",
          payload: {
            optionSlug,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            areaAndPostal: area,
            spaceCategory: space,
            treeHeightBand: height,
            treeSupply: supply,
            preferredDates: dates,
            palette: palette || "Not specified",
            addOns,
            budgetBand: budget || "Not sure yet",
            notes: details,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.inquiry) {
        setDone({ publicId: data.inquiry.publicId, customQuote: data.inquiry.customQuote });
      } else {
        setError("Something went wrong on our side. Please try again, or email us directly.");
      }
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+2rem)]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
          className="rounded-card bg-cream p-8 sm:p-12"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-gold">
            <CheckIcon size={20} />
          </span>
          <h2 ref={headingRef} tabIndex={-1} className="t-h2 mt-8 outline-none">
            Thank you, {name.split(" ")[0]}. We have your inquiry.
          </h2>
          <p className="mt-5 max-w-xl t-body text-ink">
            Your reference is <span className="font-medium text-emerald">{done.publicId}</span>. A
            copy is on its way to {email}. {SITE.replyPromise}
          </p>
          {done.customQuote && (
            <p className="mt-4 max-w-xl t-body text-ink">
              Because of the size or setting, we will prepare a custom quote rather than a standard
              one. Nothing is booked until you accept it.
            </p>
          )}
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {["We reply and set up a short call", "You receive a written quote", "A 40% retainer holds your date"].map(
              (t, i) => (
                <li key={t} className="flex gap-4">
                  <span className="t-numeral text-[1.25rem] text-gold-text">{i + 1}</span>
                  <span className="t-small text-ink">{t}</span>
                </li>
              )
            )}
          </ol>
          <div className="mt-10">
            <TextLink href="/holiday-styling">Back to Holiday Styling</TextLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+2rem)]">
      {/* Progress */}
      <ol className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Inquiry progress">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-3">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[0.8125rem] transition-colors duration-500 ${
                  state === "current"
                    ? "bg-emerald text-ivory"
                    : state === "done"
                      ? "bg-linen text-gold-text"
                      : "bg-cream text-ink/50"
                }`}
              >
                {state === "done" ? <CheckIcon size={13} /> : i + 1}
              </span>
              <span className={`text-[0.875rem] ${state === "todo" ? "text-ink/50" : "text-emerald"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} noValidate className="mt-10">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={reduce ? false : { opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
          >
            <h2 ref={headingRef} tabIndex={-1} className="t-h2 outline-none">
              {step === 0 && "Tell us about the room."}
              {step === 1 && "Tell us about your style and taste."}
              {step === 2 && "How we can reach you."}
            </h2>

            {step === 0 && (
              <div className="mt-10 space-y-10">
                <fieldset>
                  <legend className="mb-3 text-[0.875rem] font-medium text-emerald">Styling option</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {OPTIONS.map((o) => (
                      <ChoiceCard
                        key={o.slug}
                        name="option"
                        value={o.slug}
                        checked={optionSlug === o.slug}
                        onChange={setOptionSlug}
                        title={o.name}
                        detail={o.note}
                      />
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-6 sm:grid-cols-3">
                  <SelectField
                    id="space"
                    label="Setting"
                    value={space}
                    onChange={(e) => setSpace(e.target.value as SpaceCategory)}
                  >
                    <option value="residential">A home</option>
                    <option value="commercial">A business or office</option>
                  </SelectField>
                  <SelectField
                    id="height"
                    label="Tree height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value as TreeHeightBand)}
                  >
                    <option value="under_7ft">Up to 6 ft</option>
                    <option value="7_to_9ft">7 to 9 ft</option>
                    <option value="over_9ft">Over 9 ft</option>
                  </SelectField>
                  <SelectField
                    id="supply"
                    label="The tree"
                    value={supply}
                    onChange={(e) => setSupply(e.target.value as "client_owned" | "source_for_me")}
                  >
                    <option value="client_owned">We have one</option>
                    <option value="source_for_me">Please source one</option>
                  </SelectField>
                </div>

                <AnimatePresence initial={false}>
                  {routing.customQuote && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE_LUXE }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-card bg-mist px-5 py-4">
                        <p className="text-[0.875rem] font-medium text-emerald">This is a custom quote</p>
                        <p className="mt-1 t-small text-ink">
                          {routing.reason} Hence, there is no instant booking: we price this service after a
                          short call.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <TextField
                  id="area"
                  label="Neighbourhood and postal code"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Leaside, M4G 1A1"
                  autoComplete="postal-code"
                  error={tried && !area.trim() ? "Please add your area so we can check the zone." : undefined}
                  required
                />

                <div className="grid gap-6 sm:grid-cols-3">
                  <TextField
                    id="ceiling"
                    label="Ceiling height"
                    optional
                    value={ceiling}
                    onChange={(e) => setCeiling(e.target.value)}
                    placeholder="About 10 ft"
                  />
                  <TextField
                    id="access"
                    label="Access and parking"
                    optional
                    value={access}
                    onChange={(e) => setAccess(e.target.value)}
                    placeholder="Driveway, elevator"
                  />
                  <TextField
                    id="household"
                    label="Pets or children"
                    optional
                    value={household}
                    onChange={(e) => setHousehold(e.target.value)}
                    placeholder="One curious cat"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-10 space-y-10">
                <fieldset>
                  <legend className="mb-3 text-[0.875rem] font-medium text-emerald">
                    Preferred dates, up to three
                  </legend>
                  <DateChoiceCalendar
                    value={dates}
                    onChange={setDates}
                    minIso={minDate}
                    max={3}
                    error={tried && dates.length === 0 ? "Please choose at least one date." : undefined}
                  />
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-[0.875rem] font-medium text-emerald">
                    Palette <span className="font-normal text-muted">(optional)</span>
                  </legend>
                  <div role="radiogroup" className="flex flex-wrap gap-2">
                    {PALETTES.map((p) => (
                      <Chip key={p} on={palette === p} onClick={() => setPalette(palette === p ? "" : p)} role="radio">
                        {p}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-[0.875rem] font-medium text-emerald">
                    Add-ons <span className="font-normal text-muted">(optional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {ADD_ONS.map((a) => {
                      const on = addOns.includes(a);
                      return (
                        <Chip
                          key={a}
                          on={on}
                          role="checkbox"
                          onClick={() => setAddOns((prev) => (on ? prev.filter((x) => x !== a) : [...prev, a]))}
                        >
                          {a}
                        </Chip>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-6 sm:grid-cols-2">
                  <SelectField id="budget" label="Sourcing budget" optional value={budget} onChange={(e) => setBudget(e.target.value)}>
                    <option value="">Choose a range</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </SelectField>
                  <div>
                    <p className="mb-2 text-[0.875rem] font-medium text-emerald">
                      Photos of the room <span className="font-normal text-muted">(optional, up to 5)</span>
                    </p>
                    <label
                      htmlFor="photos"
                      className="flex h-12 cursor-pointer items-center justify-between gap-3 rounded-card bg-cream px-4 text-[0.9375rem] text-ink-soft transition-colors hover:bg-linen/70 has-[:focus-visible]:shadow-[0_0_0_2px_var(--emerald)]"
                    >
                      <span className="truncate">
                        {photos.length ? `${photos.length} selected` : "Choose photos"}
                      </span>
                      <span className="shrink-0 text-[0.8125rem] font-medium text-emerald">Browse</span>
                      <input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) =>
                          setPhotos(Array.from(e.target.files ?? []).slice(0, 5).map((f) => f.name))
                        }
                      />
                    </label>
                    {photos.length > 0 && (
                      <p className="mt-2 truncate text-[0.8125rem] text-muted">{photos.join(", ")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-10 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="name"
                    label="Your name"
                    bordered
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={tried && !name.trim() ? "Please add your name." : undefined}
                    required
                  />
                  <TextField
                    id="phone"
                    type="tel"
                    label="Phone"
                    bordered
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={tried && !phone.trim() ? "Please add a phone number." : undefined}
                    required
                  />
                  <TextField
                    id="email"
                    type="email"
                    label="Email"
                    bordered
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={tried && !/\S+@\S+\.\S+/.test(email) ? "Please add a valid email." : undefined}
                    required
                    className="sm:col-span-2"
                  />
                </div>
                <TextArea
                  id="notes"
                  label="Anything else"
                  bordered
                  optional
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ornaments you love, things to avoid, a mantel you would like included."
                />
                <div className="space-y-4">
                  <Checkbox id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)}>
                    I agree to be contacted about this inquiry, and understand a 40% retainer is
                    needed to hold a date once I accept a quote. See our{" "}
                    <a href="/policies/privacy" className="link-quiet text-emerald">
                      privacy policy
                    </a>
                    .
                  </Checkbox>
                  {tried && !consent && (
                    <p className="pl-8 text-[0.8125rem] text-gold-text">Please tick this box to send your inquiry.</p>
                  )}
                  <Checkbox id="photo-consent" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)}>
                    You may photograph the finished room for your portfolio. Optional, and you can change
                    your mind later.
                  </Checkbox>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-8 rounded-card bg-mist px-5 py-4 t-small text-emerald">
            {error}
          </p>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          {step > 0 ? <TextButton onClick={back}>Back</TextButton> : <span />}
          <div className="flex items-center gap-6">
            <span className="text-[0.8125rem] text-muted">
              Step {step + 1} of {STEPS.length}
            </span>
            <Button type="submit" size="lg" arrow disabled={submitting}>
              {step < STEPS.length - 1 ? "Continue" : submitting ? "Sending" : "Send inquiry"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
  role,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-[0.875rem] transition-colors duration-300 ${
        on ? "bg-emerald text-ivory" : "bg-cream text-ink hover:bg-linen hover:text-emerald"
      }`}
    >
      {children}
    </button>
  );
}
