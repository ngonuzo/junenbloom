"use client";

import React, { useState } from "react";
import { MonogramMark } from "@/components/brand/Wordmark";

/** Founders' sign-in: request a one-time email link (FR-80, T8.1). */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });
      const data = await res.json();
      setMessage(data.message ?? data.error ?? "");
      setState(data.ok ? "sent" : "error");
    } catch {
      setMessage("We could not reach the server. Please try again.");
      setState("error");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--ivory)] px-4 py-16">
      <div className="w-full max-w-md rounded-[4px] bg-[var(--surface-cream)] p-8 sm:p-10">
        <div className="flex items-center gap-3">
          <MonogramMark size={36} />
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold-text)]">Private studio</p>
            <h1 className="font-heading text-2xl text-[var(--emerald)]">Sign in</h1>
          </div>
        </div>

        {state === "sent" ? (
          <div className="mt-8 space-y-3" role="status">
            <p className="font-heading text-xl text-[var(--emerald)]">Check your email.</p>
            <p className="text-sm text-[var(--ink)]">{message}</p>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="text-sm font-medium text-[var(--emerald)] underline underline-offset-4"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="block text-sm font-medium text-[var(--emerald)]">
                Your email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-[4px] border border-[var(--sage)] bg-[var(--ivory)] px-3.5 text-[0.9375rem] text-[var(--ink)] outline-none focus:shadow-[0_0_0_2px_var(--emerald)]"
              />
              <p className="text-xs text-[var(--muted)]">We will email you a link that signs you in.</p>
            </div>
            {state === "error" && (
              <p className="rounded-[4px] bg-[var(--surface-sage)] p-3 text-sm text-[var(--emerald)]" role="alert">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-[4px] bg-[var(--emerald)] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--ivory)] disabled:opacity-60"
            >
              {state === "sending" ? "Sending" : "Email me a sign-in link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
