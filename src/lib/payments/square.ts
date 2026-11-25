import crypto from "node:crypto";

/**
 * Square payments (replaces Stripe in FR-13). Card details are typed into
 * Square's own form and never reach this server; the browser sends only a
 * one-time token, and the server charges the amount it calculated itself.
 *
 * Settings (Vercel environment variables):
 * - SQUARE_ACCESS_TOKEN                 secret
 * - NEXT_PUBLIC_SQUARE_APPLICATION_ID   public, used by the payment form
 * - NEXT_PUBLIC_SQUARE_LOCATION_ID      public, the location paid into
 * - SQUARE_ENVIRONMENT                  "sandbox" or "production"
 * - SQUARE_WEBHOOK_SIGNATURE_KEY        secret, from the webhook subscription
 * - SQUARE_WEBHOOK_URL                  optional; the exact subscription URL
 */

export const SQUARE_VERSION = "2026-11-18";
export const DEFAULT_WEBHOOK_URL = "https://www.juneandbloomlifestyle.com/api/square/webhook";

export type SquareEnv = "sandbox" | "production";

export function squareEnv(): SquareEnv {
  return process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
}

export function squareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN &&
      process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID &&
      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  );
}

function apiBase(): string {
  return squareEnv() === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
}

export interface SquarePayment {
  id: string;
  status: string; // APPROVED, PENDING, COMPLETED, CANCELED, FAILED
  amount_money?: { amount: number; currency: string };
  reference_id?: string;
  receipt_url?: string;
}

export interface SquareResult {
  payment?: SquarePayment;
  /** A message safe to show the buyer when the charge did not go through. */
  error?: string;
  code?: string;
}

const DECLINE_MESSAGES: Record<string, string> = {
  CARD_DECLINED: "Your card was declined. Please try another card.",
  GENERIC_DECLINE: "Your card was declined. Please try another card.",
  INSUFFICIENT_FUNDS: "Your card was declined for insufficient funds.",
  CVV_FAILURE: "The security code did not match. Please check it and try again.",
  ADDRESS_VERIFICATION_FAILURE: "The postal code did not match your card. Please check it.",
  INVALID_EXPIRATION: "The expiry date is not valid. Please check it.",
  EXPIRATION_FAILURE: "This card has expired. Please use another card.",
  INVALID_CARD: "Those card details are not valid. Please check them.",
  CARD_DECLINED_VERIFICATION_REQUIRED: "Your bank needs to verify this payment. Please try again.",
  TRANSACTION_LIMIT: "This payment is over your card's limit. Please try another card.",
  INVALID_ACCOUNT: "Your card was declined. Please try another card.",
};

/** Charges the card token for the given amount (in cents, CAD). */
export async function createSquarePayment(input: {
  sourceId: string;
  amountCents: number;
  idempotencyKey: string;
  referenceId: string;
  buyerEmail?: string;
  note?: string;
}): Promise<SquareResult> {
  const res = await fetch(`${apiBase()}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_id: input.sourceId,
      idempotency_key: input.idempotencyKey.slice(0, 45),
      amount_money: { amount: input.amountCents, currency: "CAD" },
      location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      reference_id: input.referenceId.slice(0, 40),
      buyer_email_address: input.buyerEmail?.slice(0, 255) || undefined,
      note: input.note?.slice(0, 500),
      autocomplete: true,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    payment?: SquarePayment;
    errors?: Array<{ code?: string; detail?: string; category?: string }>;
  };
  if (data.payment && res.ok) return { payment: data.payment };
  const code = data.errors?.[0]?.code ?? `HTTP_${res.status}`;
  if (!DECLINE_MESSAGES[code]) console.error("Square payment error", res.status, JSON.stringify(data.errors));
  return {
    payment: data.payment,
    code,
    error: DECLINE_MESSAGES[code] ?? "The payment did not go through. Please try again, or contact us.",
  };
}

/** Looks a payment up directly with Square (used to double-check webhooks). */
export async function getSquarePayment(id: string): Promise<SquarePayment | null> {
  const res = await fetch(`${apiBase()}/v2/payments/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { payment?: SquarePayment };
  return data.payment ?? null;
}

/**
 * Square signs each webhook with HMAC-SHA256 over the notification URL
 * followed by the raw body, base64-encoded, in x-square-hmacsha256-signature.
 */
export function isValidSquareSignature(
  rawBody: string,
  signature: string | null,
  key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "",
  notificationUrl = process.env.SQUARE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL
): boolean {
  if (!signature || !key) return false;
  const expected = crypto.createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
