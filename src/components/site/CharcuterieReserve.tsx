"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { BoardSlot, Product } from "@/lib/db/store";
import { generateUpcomingDates } from "@/lib/domain/dates";
import { formatCents } from "@/lib/domain/money";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/Field";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { ProductCard } from "./ProductCard";
import { useCart } from "./CartContext";

export const DIETARY_OPTIONS = [
  "No allergies",
  "Nut-free",
  "Gluten-free crisps",
  "No pork",
  "Vegetarian",
  "Something else",
] as const;

function prettyDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

/**
 * Board cards plus the slot builder (FR-50 to FR-54): size, date, two-hour
 * window and a required dietary choice, then straight to order details.
 */
export function CharcuterieReserve({
  boards,
  slots,
  leadTimeHours,
  blockedDates,
}: {
  boards: Product[];
  slots: BoardSlot[];
  leadTimeHours: number;
  blockedDates: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const { addItem, items, removeItem, setSelectedSlot, setDietaryNote } = useCart();
  const reserveRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(
    () => generateUpcomingDates(16, leadTimeHours, blockedDates),
    [leadTimeHours, blockedDates]
  );
  const firstOpen = dates.find((d) => d.eligible && slots.some((s) => s.day === d.iso))?.iso ?? "";

  const [boardSlug, setBoardSlug] = useState(boards.find((b) => b.featured)?.slug ?? boards[0]?.slug ?? "");
  const [day, setDay] = useState(firstOpen);
  const [slotId, setSlotId] = useState<string>("");
  const [dietary, setDietary] = useState<string>("");
  const [dietaryOther, setDietaryOther] = useState("");
  const [attempted, setAttempted] = useState(false);

  // Arriving from a card, quick view or product page with ?board=
  const requested = params.get("board");
  useEffect(() => {
    if (requested && boards.some((b) => b.slug === requested)) {
      setBoardSlug(requested);
      window.setTimeout(() => {
        reserveRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, 80);
    }
  }, [requested, boards, reduce]);

  const daySlots = slots.filter((s) => s.day === day);
  const board = boards.find((b) => b.slug === boardSlug) ?? boards[0];
  const slot = daySlots.find((s) => s.id === slotId);
  const dietaryValue = dietary === "Something else" ? dietaryOther.trim() : dietary;
  const complete = Boolean(board && slot && dietaryValue);

  function chooseBoard(p: Product) {
    setBoardSlug(p.slug);
    reserveRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function proceed() {
    setAttempted(true);
    if (!board || !slot || !dietaryValue) return;
    // One board slot per order: replace any board already in the tray.
    for (const item of items) {
      if (item.product.type === "board") removeItem(item.product.slug, item.optionId);
    }
    addItem(board, board.options[0]?.id, 1);
    setSelectedSlot({ id: slot.id, day: slot.day, window: slot.window });
    setDietaryNote(dietaryValue);
    router.push("/order");
  }

  return (
    <>
      <section className="container-page pb-24 sm:pb-28" aria-label="Boards">
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-3">
          {boards.map((b, i) => (
            <motion.li
              key={b.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: EASE_LUXE }}
            >
              <ProductCard product={b} index={i + 7} onOrder={chooseBoard} />
            </motion.li>
          ))}
        </ul>
      </section>

      <section id="reserve" ref={reserveRef} className="paper scroll-mt-[var(--header-h)] bg-cream section-y" aria-labelledby="reserve-title">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <p className="t-kicker text-gold-text">Reserve a board</p>
            <h2 id="reserve-title" className="t-h2 mt-5">
              Choose a size, a day and a window.
            </h2>
            <p className="mt-5 max-w-xl t-body text-ink">
              We build every board on the day it leaves us, so we need at least{" "}
              {Math.round(leadTimeHours / 24)} days&apos; notice. For anything sooner,{" "}
              <Link href="/contact?topic=rush" className="link-quiet text-emerald">
                message us
              </Link>{" "}
              and we will tell you honestly if we can.
            </p>

            <Step n={1} title="Size">
              <div className="grid gap-2 sm:grid-cols-3">
                {boards.map((b) => (
                  <ChoiceCard
                    key={b.id}
                    name="board-size"
                    value={b.slug}
                    checked={b.slug === board?.slug}
                    onChange={setBoardSlug}
                    surface="ivory"
                    title={b.name.replace(/^The /, "")}
                    detail={b.options[0]?.serves ? `Serves ${b.options[0].serves}` : b.subtitle}
                    aside={formatCents(b.priceCents)}
                    className="sm:flex-col sm:gap-3"
                  />
                ))}
              </div>
            </Step>

            <Step n={2} title="Day">
              <div
                role="radiogroup"
                aria-label="Delivery or pickup day"
                className="no-scrollbar scroll-fade -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
              >
                {dates.map((d) => {
                  const hasSlots = slots.some((s) => s.day === d.iso && !s.blocked && s.booked < s.capacity);
                  const open = d.eligible && hasSlots;
                  const on = d.iso === day;
                  const date = new Date(`${d.iso}T12:00:00`);
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={`${prettyDate(d.iso)}${open ? "" : ", unavailable"}`}
                      disabled={!open}
                      onClick={() => {
                        setDay(d.iso);
                        setSlotId("");
                      }}
                      className={`flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-card py-3.5 transition-colors duration-300 ease-luxe ${
                        on
                          ? "bg-emerald text-ivory"
                          : open
                            ? "bg-ivory text-emerald hover:bg-mist"
                            : "bg-transparent text-ink/30"
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
                Faded days are inside our notice period or fully booked.
              </p>
            </Step>

            <Step n={3} title="Two-hour window">
              {daySlots.length === 0 ? (
                <p className="t-small text-muted">Choose a day to see the windows.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3">
                  {daySlots.map((s) => {
                    const left = Math.max(0, s.capacity - s.booked);
                    const full = left === 0 || s.blocked;
                    return (
                      <ChoiceCard
                        key={s.id}
                        name="board-window"
                        value={s.id}
                        checked={s.id === slotId}
                        onChange={setSlotId}
                        disabled={full}
                        surface="ivory"
                        title={s.window}
                        detail={full ? "Fully booked" : left <= 2 ? `${left} left` : "Available"}
                      />
                    );
                  })}
                </div>
              )}
              {attempted && !slot && (
                <p className="mt-3 text-[0.8125rem] text-gold-text">Please choose a window.</p>
              )}
            </Step>

            <Step n={4} title="Allergies and diet">
              <div role="radiogroup" aria-label="Allergies and diet" aria-required="true" className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const on = dietary === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setDietary(opt)}
                      className={`h-10 rounded-full px-4 text-[0.875rem] transition-colors duration-300 ${
                        on ? "bg-emerald text-ivory" : "bg-ivory text-ink hover:bg-mist hover:text-emerald"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence initial={false}>
                {dietary === "Something else" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_LUXE }}
                    className="overflow-hidden"
                  >
                    <label htmlFor="dietary-other" className="sr-only">
                      Describe the allergy or preference
                    </label>
                    <input
                      id="dietary-other"
                      type="text"
                      value={dietaryOther}
                      onChange={(e) => setDietaryOther(e.target.value)}
                      placeholder="For example, no walnuts, almonds are fine"
                      className="mt-3 h-12 w-full rounded-card bg-ivory px-4 text-[1rem] outline-none focus:shadow-[0_0_0_2px_var(--emerald)]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <p className={`mt-3 text-[0.8125rem] ${attempted && !dietaryValue ? "text-gold-text" : "text-muted"}`}>
                Required for every board. It is printed on the packing slip we work from.
              </p>
            </Step>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Your board">
            <div className="rounded-card bg-ivory p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="t-kicker text-gold-text">Your board</p>
              <p className="mt-5 font-heading text-[1.75rem] leading-tight text-emerald">{board?.name}</p>
              <dl className="mt-6 space-y-3 text-[0.9375rem]">
                <SummaryRow label="Serves" value={board?.options[0]?.serves ?? "–"} />
                <SummaryRow label="Day" value={day ? prettyDate(day) : "Choose a day"} muted={!day} />
                <SummaryRow label="Window" value={slot?.window ?? "Choose a window"} muted={!slot} />
                <SummaryRow label="Diet" value={dietaryValue || "Choose an option"} muted={!dietaryValue} />
              </dl>
              <div className="mt-7 flex items-baseline justify-between">
                <span className="text-[0.9375rem] text-muted">Board</span>
                <span className="font-heading text-[1.75rem] text-emerald">
                  {board ? formatCents(board.priceCents) : ""}
                </span>
              </div>
              <Button size="lg" arrow className="mt-6 w-full" onClick={proceed} aria-disabled={!complete}>
                Continue to details
              </Button>
              <p className="mt-4 text-center text-[0.8125rem] text-muted">
                Delivery or free pickup is chosen on the next step.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-12">
      <legend className="mb-5 flex items-baseline gap-3">
        <span className="t-numeral text-[1.0625rem] text-gold-text">{n}</span>
        <span className="text-[1rem] font-medium text-emerald">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right ${muted ? "text-ink/45" : "text-emerald"}`}>{value}</dd>
    </div>
  );
}
