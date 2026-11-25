"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/domain/money";
import { SQUARE_CARD_STYLE } from "@/lib/payments/square-style";

/* Minimal types for Square's Web Payments SDK (loaded from Square's CDN). */
interface SquareCard {
  attach(selector: string): Promise<void>;
  tokenize(details?: Record<string, unknown>): Promise<{
    status: string;
    token?: string;
    errors?: Array<{ message?: string }>;
  }>;
  destroy(): Promise<void>;
}
interface SquarePayments {
  card(options?: { style?: unknown }): Promise<SquareCard>;
}
declare global {
  interface Window {
    Square?: { payments(appId: string, locationId: string): SquarePayments };
  }
}

const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
// Sandbox application IDs start with "sandbox-"; each environment has its own script.
const SDK_URL = APP_ID.startsWith("sandbox-")
  ? "https://sandbox.web.squarecdn.com/v1/square.js"
  : "https://web.squarecdn.com/v1/square.js";

let sdkPromise: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (window.Square) return Promise.resolve();
  sdkPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      sdkPromise = null;
      reject(new Error("Square could not load"));
    };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

/**
 * The Pay step (FR-11, FR-13). Card details are typed into Square's secure
 * frame; only a one-time token reaches our server, which charges the amount it
 * calculated for this order.
 */
export function SquarePayment({
  publicId,
  token,
  totalCents,
  buyer,
  onPaid,
}: {
  publicId: string;
  token: string;
  totalCents: number;
  buyer: { name: string; email: string; phone: string; postalCode?: string };
  onPaid: (status: "paid" | "processing") => void;
}) {
  const cardRef = useRef<SquareCard | null>(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const testMode = !APP_ID || !LOCATION_ID;

  useEffect(() => {
    if (testMode) return;
    let cancelled = false;
    (async () => {
      try {
        await loadSdk();
        if (cancelled || !window.Square) return;
        const payments = window.Square.payments(APP_ID, LOCATION_ID);
        const card = await payments.card({ style: SQUARE_CARD_STYLE });
        if (cancelled) return void card.destroy();
        await card.attach("#square-card");
        cardRef.current = card;
        setReady(true);
      } catch {
        if (!cancelled) setError("The secure card form could not load. Please refresh the page and try again.");
      }
    })();
    return () => {
      cancelled = true;
      cardRef.current?.destroy().catch(() => {});
      cardRef.current = null;
    };
  }, [testMode]);

  async function pay() {
    setPaying(true);
    setError("");
    try {
      let sourceId: string | undefined;
      if (!testMode) {
        const card = cardRef.current;
        if (!card) throw new Error("not ready");
        const [givenName, ...rest] = buyer.name.trim().split(/\s+/);
        // Square decides from these details whether the bank must verify the buyer (3-D Secure).
        const result = await card.tokenize({
          amount: (totalCents / 100).toFixed(2),
          currencyCode: "CAD",
          intent: "CHARGE",
          customerInitiated: true,
          sellerKeyedIn: false,
          billingContact: {
            givenName,
            familyName: rest.join(" ") || undefined,
            email: buyer.email,
            phone: buyer.phone,
            countryCode: "CA",
            postalCode: buyer.postalCode || undefined,
          },
        });
        if (result.status !== "OK" || !result.token) {
          setError(result.errors?.[0]?.message ?? "Please check your card details.");
          setPaying(false);
          return;
        }
        sourceId = result.token;
      }
      const res = await fetch("/api/square/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, token, sourceId }),
      });
      const data = await res.json();
      if (data.ok) {
        onPaid(data.status === "processing" ? "processing" : "paid");
        return;
      }
      setError(data.error ?? "The payment did not go through. Please try again.");
    } catch {
      setError("We could not complete the payment. Please check your connection and try again.");
    }
    setPaying(false);
  }

  return (
    <div>
      {testMode ? (
        <p className="rounded-card bg-cream px-4 py-3 t-small text-emerald">
          Test mode: Square is not connected here, so no card is needed and nothing is charged.
        </p>
      ) : (
        <div>
          <div id="square-card" className="min-h-[5.5rem]" aria-busy={!ready} />
          {!ready && !error && <p className="t-small text-muted">Loading the secure card form…</p>}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-card bg-cream px-4 py-3 t-small text-emerald">
          {error}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        className="mt-6 w-full"
        onClick={pay}
        disabled={paying || (!testMode && !ready)}
      >
        {paying ? "Processing" : `Pay ${formatCents(totalCents)}`}
      </Button>
      <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-muted">
        Secure payment by Square. Your card details go straight to Square and never reach our site.
      </p>
    </div>
  );
}
