"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { BoardSlot, BoardWindow, StoreState } from "@/lib/db/store";

const HORIZONS = [14, 21, 30, 45, 60];

function todayIso(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function prettyDay(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

async function post(action: string, payload: unknown) {
  const res = await fetch("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  return res.json() as Promise<{ ok: boolean; error?: string }>;
}

/**
 * Slots and calendar (FR-86, T8.8): the daily board windows and how many boards
 * each takes, how far ahead people can book, and day-by-day changes:
 * more or fewer boards in a window, closing a window, or closing the studio for a date.
 */
export function SlotsPanel({
  store,
  onChanged,
  toast,
}: {
  store: StoreState;
  onChanged: () => Promise<void> | void;
  toast: (msg: string) => void;
}) {
  const [windows, setWindows] = useState<BoardWindow[]>(store.settings.boardWindows ?? []);
  const [daysAhead, setDaysAhead] = useState<number>(store.settings.boardDaysAhead ?? 21);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Take fresh values from the server unless the founder is mid-edit.
  useEffect(() => {
    if (dirty) return;
    setWindows(store.settings.boardWindows ?? []);
    setDaysAhead(store.settings.boardDaysAhead ?? 21);
  }, [store.settings.boardWindows, store.settings.boardDaysAhead, dirty]);

  const today = todayIso();
  const closed = useMemo(() => new Set(store.settings.blockedDates), [store.settings.blockedDates]);
  const days = useMemo(() => {
    const byDay = new Map<string, BoardSlot[]>();
    for (const s of store.slots) {
      if (s.day < today) continue;
      if (!byDay.has(s.day)) byDay.set(s.day, []);
      byDay.get(s.day)!.push(s);
    }
    return [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [store.slots, today]);

  function editWindow(i: number, patch: Partial<BoardWindow>) {
    setDirty(true);
    setWindows((prev) => prev.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  }

  async function saveTemplate() {
    setError("");
    const clean = windows.map((w) => ({ label: w.label.trim(), capacity: w.capacity }));
    if (clean.some((w) => !w.label)) {
      setError("Every window needs a name, for example 11:00 AM – 1:00 PM.");
      return;
    }
    if (new Set(clean.map((w) => w.label)).size !== clean.length) {
      setError("Two windows have the same name.");
      return;
    }
    setSaving(true);
    const res = await post("save_board_windows", { windows: clean, daysAhead });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "That did not save. Please try again.");
      return;
    }
    setDirty(false);
    await onChanged();
    toast("Board windows saved for every upcoming day");
  }

  async function changeCapacity(slot: BoardSlot, delta: number) {
    await post("update_slot", { id: slot.id, capacity: slot.capacity + delta });
    await onChanged();
  }

  async function toggleWindow(slot: BoardSlot) {
    await post("update_slot", { id: slot.id, blocked: !slot.blocked });
    await onChanged();
    toast(`${prettyDay(slot.day)}, ${slot.window}: ${slot.blocked ? "reopened" : "closed"}`);
  }

  async function toggleDay(day: string) {
    await post("toggle_closed_date", { day });
    await onChanged();
    toast(`${prettyDay(day)}: ${closed.has(day) ? "reopened" : "closed for gifts and boards"}`);
  }

  return (
    <div className="space-y-6">
      {/* Daily windows */}
      <section className="rounded-[4px] bg-[var(--surface-cream)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold-text)]">Board slots (FR-86)</p>
        <h2 className="mt-1 font-heading text-2xl text-[var(--emerald)]">Daily windows and capacity</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)] opacity-80">
          These windows are offered every day. Capacity is how many boards you can make for that
          window. Saving applies to every upcoming day; days that already have bookings never go
          below what is booked.
        </p>

        <div className="mt-6 space-y-3">
          {windows.map((w, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 rounded-[4px] bg-[var(--ivory)] p-3">
              <label className="sr-only" htmlFor={`win-${i}`}>
                Window {i + 1} name
              </label>
              <input
                id={`win-${i}`}
                value={w.label}
                onChange={(e) => editWindow(i, { label: e.target.value })}
                placeholder="11:00 AM – 1:00 PM"
                maxLength={40}
                className="h-10 min-w-[12rem] flex-1 rounded-[4px] border border-[var(--sage)] bg-[var(--ivory)] px-3 text-sm text-[var(--ink)] outline-none focus:shadow-[0_0_0_2px_var(--emerald)]"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Boards</span>
                <button
                  type="button"
                  aria-label={`Fewer boards for window ${i + 1}`}
                  onClick={() => editWindow(i, { capacity: Math.max(0, w.capacity - 1) })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-sage)] text-[var(--emerald)]"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-medium tabular-nums text-[var(--emerald)]">{w.capacity}</span>
                <button
                  type="button"
                  aria-label={`More boards for window ${i + 1}`}
                  onClick={() => editWindow(i, { capacity: Math.min(50, w.capacity + 1) })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-sage)] text-[var(--emerald)]"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove window ${i + 1}`}
                onClick={() => {
                  setDirty(true);
                  setWindows((prev) => prev.filter((_, j) => j !== i));
                }}
                disabled={windows.length <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--emerald)] disabled:opacity-30"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button
            type="button"
            disabled={windows.length >= 6}
            onClick={() => {
              setDirty(true);
              setWindows((prev) => [...prev, { label: "", capacity: 6 }]);
            }}
            className="text-sm font-medium text-[var(--emerald)] underline underline-offset-4 disabled:opacity-40"
          >
            Add a window
          </button>
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            Open for booking
            <select
              value={daysAhead}
              onChange={(e) => {
                setDirty(true);
                setDaysAhead(Number(e.target.value));
              }}
              className="h-10 rounded-[4px] border border-[var(--sage)] bg-[var(--ivory)] px-3 text-sm"
            >
              {HORIZONS.map((h) => (
                <option key={h} value={h}>
                  {h} days ahead
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={saveTemplate}
            disabled={!dirty || saving}
            className="ml-auto rounded-[4px] bg-[var(--emerald)] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ivory)] disabled:opacity-40"
          >
            {saving ? "Saving" : "Save windows"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-[var(--gold-text)]">{error}</p>}
      </section>

      {/* Day by day */}
      <section className="rounded-[4px] bg-[var(--surface-cream)] p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-[var(--emerald)]">Upcoming days</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)] opacity-80">
          Change one day without touching the rest. Closing a window hides it from the board
          calendar. Closing the whole day stops gift and board deliveries on that date.
        </p>

        <div className="mt-6 space-y-3">
          {days.map(([day, slots]) => {
            const isClosed = closed.has(day);
            const booked = slots.reduce((n, s) => n + s.booked, 0);
            return (
              <article
                key={day}
                className={`rounded-[4px] p-4 ${isClosed ? "bg-[var(--surface-sage)]" : "bg-[var(--ivory)]"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-[var(--emerald)]">
                    {prettyDay(day)}
                    <span className="ml-3 text-xs font-normal text-[var(--muted)]">
                      {isClosed ? "Closed" : `${booked} booked`}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                      isClosed
                        ? "bg-[var(--emerald)] text-[var(--ivory)]"
                        : "bg-[var(--surface-cream)] text-[var(--emerald)]"
                    }`}
                  >
                    {isClosed ? "Reopen day" : "Close day"}
                  </button>
                </div>
                {!isClosed && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {slots.map((s) => {
                      const full = s.booked >= s.capacity;
                      return (
                        <div
                          key={s.id}
                          className={`rounded-[4px] border p-3 ${
                            s.blocked
                              ? "border-transparent bg-[var(--surface-sage)] opacity-70"
                              : "border-[var(--linen)] bg-[var(--ivory)]"
                          }`}
                        >
                          <p className="text-sm text-[var(--emerald)]">{s.window}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {s.blocked ? "Closed" : full ? `Full, ${s.booked} of ${s.capacity}` : `${s.booked} of ${s.capacity} booked`}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                aria-label={`One fewer board, ${prettyDay(s.day)} ${s.window}`}
                                onClick={() => changeCapacity(s, -1)}
                                disabled={s.blocked || s.capacity <= s.booked}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-cream)] text-[var(--emerald)] disabled:opacity-30"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums text-[var(--emerald)]">{s.capacity}</span>
                              <button
                                type="button"
                                aria-label={`One more board, ${prettyDay(s.day)} ${s.window}`}
                                onClick={() => changeCapacity(s, 1)}
                                disabled={s.blocked || s.capacity >= 50}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-cream)] text-[var(--emerald)] disabled:opacity-30"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleWindow(s)}
                              className="text-xs font-medium text-[var(--emerald)] underline underline-offset-4"
                            >
                              {s.blocked ? "Reopen" : "Close"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
