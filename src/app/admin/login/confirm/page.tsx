"use client";

import React, { useEffect, useState } from "react";
import { MonogramMark } from "@/components/brand/Wordmark";

/**
 * Opened from the sign-in email. The token sits after "#" so it never reaches
 * server logs, and signing in needs a tap, because some email apps open links
 * automatically to scan them, which would otherwise use the link up.
 */
export default function AdminLoginConfirmPage() {
  const [token, setToken] = useState("");
  const [state, setState] = useState<"ready" | "working" | "error">("ready");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(window.location.hash.slice(1));
    // Remove the token from the address bar and history.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function signIn() {
    setState("working");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.replace("/admin");
        return;
      }
      setMessage(data.error ?? "This link has expired or was already used.");
      setState("error");
    } catch {
      setMessage("We could not reach the server. Please try again.");
      setState("error");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--ivory)] px-4 py-16">
      <div className="w-full max-w-md rounded-[4px] bg-[var(--surface-cream)] p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <MonogramMark size={40} />
        </div>
        <h1 className="mt-5 font-heading text-2xl text-[var(--emerald)]">Welcome back</h1>

        {state === "error" ? (
          <div className="mt-6 space-y-4" role="alert">
            <p className="text-sm text-[var(--ink)]">{message}</p>
            <a
              href="/admin/login"
              className="inline-block rounded-[4px] bg-[var(--emerald)] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--ivory)]"
            >
              Send a new link
            </a>
          </div>
        ) : !token ? (
          <p className="mt-6 text-sm text-[var(--ink)]">
            This page needs the link from your sign-in email.{" "}
            <a href="/admin/login" className="font-medium text-[var(--emerald)] underline underline-offset-4">
              Send a new link
            </a>
          </p>
        ) : (
          <button
            type="button"
            onClick={signIn}
            disabled={state === "working"}
            className="mt-6 w-full rounded-[4px] bg-[var(--emerald)] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--ivory)] disabled:opacity-60"
          >
            {state === "working" ? "Signing in" : "Sign in to the studio"}
          </button>
        )}
      </div>
    </main>
  );
}
