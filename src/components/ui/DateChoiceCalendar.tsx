"use client";

import React, { useMemo, useState } from "react";
import { ChevronIcon } from "./Icons";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ORDINALS = ["First choice", "Second choice", "Third choice", "Fourth choice", "Fifth choice"];

/** YYYY-MM-DD in local time (toISOString would shift the day near midnight). */
export function localIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function prettyIso(iso: string): string {
  return fromIso(iso).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Month calendar used for every date choice on the site.
 * - Styling inquiry: up to three preferred dates, in order (Sundays closed).
 * - Gift and board orders: a single date (max = 1); tapping another date replaces it.
 * Dates before `minIso`, on `closedWeekdays`, or rejected by `isAvailable` are greyed out.
 * Colours: available dates are outlined, chosen dates turn emerald, and
 * unavailable dates are greyed. A legend explains all three.
 */
export function DateChoiceCalendar({
  value,
  onChange,
  minIso,
  max = 3,
  monthsAhead = 4,
  error,
  id = "dates",
  closedWeekdays = [0],
  isAvailable,
  unavailableLabel = "Unavailable (Sundays and dates too soon)",
  showChoices = true,
}: {
  value: string[];
  onChange: (dates: string[]) => void;
  minIso: string;
  max?: number;
  monthsAhead?: number;
  error?: string;
  id?: string;
  /** Days of the week that are never available (0 = Sunday). */
  closedWeekdays?: number[];
  /** Extra availability rule, e.g. lead time or a fully booked day. */
  isAvailable?: (iso: string) => boolean;
  unavailableLabel?: string;
  /** List the chosen dates under the calendar (used for multi-date choices). */
  showChoices?: boolean;
}) {
  const single = max === 1;
  const first = fromIso(minIso);
  const [view, setView] = useState({ y: first.getFullYear(), m: first.getMonth() });
  const [hint, setHint] = useState("");

  const firstMonthIndex = first.getFullYear() * 12 + first.getMonth();
  const viewIndex = view.y * 12 + view.m;
  const canPrev = viewIndex > firstMonthIndex;
  const canNext = viewIndex < firstMonthIndex + monthsAhead;

  const cells = useMemo(() => {
    const start = new Date(view.y, view.m, 1, 12);
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const blanks = start.getDay();
    const out: Array<{ iso: string; day: number; closed: boolean } | null> = Array(blanks).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.y, view.m, d, 12);
      out.push({ iso: localIso(date), day: d, closed: closedWeekdays.includes(date.getDay()) });
    }
    return out;
  }, [view, closedWeekdays]);

  function shift(delta: number) {
    setView((v) => {
      const idx = v.y * 12 + v.m + delta;
      return { y: Math.floor(idx / 12), m: idx % 12 };
    });
  }

  function toggle(iso: string) {
    if (single) {
      onChange(value[0] === iso ? [] : [iso]);
      setHint("");
      return;
    }
    if (value.includes(iso)) {
      onChange(value.filter((v) => v !== iso));
      setHint("");
      return;
    }
    if (value.length >= max) {
      setHint(`You can choose up to ${max} dates. Remove one to pick another.`);
      return;
    }
    onChange([...value, iso]);
    setHint("");
  }

  const monthLabel = new Date(view.y, view.m, 1, 12).toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="sm:max-w-[80%]">
      <div className="rounded-card bg-ivory p-4 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--sage)_45%,transparent)] sm:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canPrev}
            aria-label="Previous month"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-emerald transition-colors hover:bg-cream disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronIcon size={16} className="rotate-90" />
          </button>
          <p className="font-heading text-[1.125rem] text-emerald" aria-live="polite" id={`${id}-month`}>
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canNext}
            aria-label="Next month"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-emerald transition-colors hover:bg-cream disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronIcon size={16} className="-rotate-90" />
          </button>
        </div>

        <div role="group" aria-labelledby={`${id}-month`} className="mt-3">
          <div aria-hidden className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className={`py-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.12em] ${
                  closedWeekdays.includes(WEEKDAYS.indexOf(w)) ? "text-ink/35" : "text-muted"
                }`}
              >
                {w}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c, i) => {
              if (!c) return <span key={`blank-${i}`} aria-hidden />;
              const unavailable = c.closed || c.iso < minIso || (isAvailable ? !isAvailable(c.iso) : false);
              const order = value.indexOf(c.iso);
              const chosen = order >= 0;
              const full = fromIso(c.iso).toLocaleDateString("en-CA", {
                weekday: "long",
                month: "long",
                day: "numeric",
              });
              const state = chosen
                ? single
                  ? "selected"
                  : ORDINALS[order].toLowerCase()
                : unavailable
                  ? "unavailable"
                  : "available";
              return (
                <span key={c.iso}>
                  <button
                    type="button"
                    disabled={unavailable}
                    aria-pressed={chosen}
                    aria-label={`${full}, ${state}`}
                    onClick={() => toggle(c.iso)}
                    className={`relative flex aspect-square w-full items-center justify-center rounded-card text-[0.9375rem] tabular-nums sm:text-[0.875rem] transition-colors duration-300 ease-luxe ${
                      chosen
                        ? "bg-emerald font-medium text-ivory"
                        : unavailable
                          ? "cursor-not-allowed bg-ink/[0.06] text-ink/30"
                          : "bg-ivory font-medium text-emerald shadow-[inset_0_0_0_1px_var(--sage)] hover:bg-mist"
                    }`}
                  >
                    {c.day}
                    {chosen && !single && (
                      <span
                        aria-hidden
                        className="absolute right-1 top-0.5 text-[0.625rem] font-medium leading-none text-gold sm:right-1.5 sm:top-1"
                      >
                        {order + 1}
                      </span>
                    )}
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-ink-soft" aria-label="Calendar key">
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-ivory shadow-[inset_0_0_0_1px_var(--sage)]" />
            Available
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-emerald" />
            Your choice
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-ink/[0.06]" />
            {unavailableLabel}
          </li>
        </ul>
      </div>

      {/* Chosen dates, in order */}
      <div className="mt-4" aria-live="polite">
        {!showChoices ? null : value.length > 0 ? (
          <ol className="space-y-2">
            {value.map((iso, i) => (
              <li key={iso} className="flex items-center justify-between gap-4 text-[0.9375rem] text-ink">
                <span>
                  <span className="text-muted">{ORDINALS[i]}:</span>{" "}
                  <span className="font-medium text-emerald">{prettyIso(iso)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggle(iso)}
                  className="link-quiet text-[0.8125rem] text-emerald hover:text-gold-text"
                  aria-label={`Remove ${prettyIso(iso)}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[0.8125rem] text-muted">Tap a date to choose it. Tap it again to remove it.</p>
        )}
        {hint && <p className="mt-2 text-[0.8125rem] text-gold-text">{hint}</p>}
        {error && (
          <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-gold-text">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
