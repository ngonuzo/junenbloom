"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";

/** "Notify me" for sample products (T4.5): one email, sent once, when the box goes live. */
export function NotifyMeForm({
  productSlug,
  productName,
  surface = "ivory",
}: {
  productSlug: string;
  productName: string;
  surface?: "ivory" | "cream";
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const inputId = `notify-${productSlug}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notify_me", payload: { email, productSlug } }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="flex items-start gap-3 py-2 t-small text-emerald">
        <CheckIcon size={16} className="mt-0.5 text-gold-text" />
        <span>
          Noted. We will email you once when {productName} is ready to order.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor={inputId} className="block text-[0.875rem] font-medium text-emerald">
        Be the first to know
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={`h-12 min-w-0 flex-1 rounded-card px-4 text-[1rem] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--emerald)] ${
            surface === "cream" ? "bg-ivory" : "bg-cream"
          }`}
        />
        <Button type="submit" size="md" disabled={state === "sending"}>
          Notify me
        </Button>
      </div>
      <p className="text-[0.8125rem] text-muted">
        {state === "error"
          ? "That did not go through. Please try again."
          : "One email when this box is available. Nothing else."}
      </p>
    </form>
  );
}
