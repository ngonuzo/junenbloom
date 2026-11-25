import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { markOrderPaid, readStore, withStoreRetry, writeStore } from "@/lib/db/store";
import { createSquarePayment, squareConfigured } from "@/lib/payments/square";

export const dynamic = "force-dynamic";

function sameToken(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/**
 * Charges an order (FR-13, FR-14). The amount always comes from the order the
 * server priced, never from the browser. Called with the order's secret token,
 * so only the buyer who created it can pay for it.
 */
export async function POST(req: Request) {
  let body: { publicId?: string; token?: string; sourceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const publicId = String(body.publicId ?? "");
  const token = String(body.token ?? "");

  const store = await readStore();
  const order = store.orders.find((o) => o.publicId === publicId);
  if (!order || !token || !sameToken(order.token, token)) {
    return NextResponse.json({ ok: false, error: "We could not find that order." }, { status: 404 });
  }
  if (order.payment) return NextResponse.json({ ok: true, status: "paid" });
  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ ok: false, error: "This order can no longer be paid online." }, { status: 409 });
  }

  // Running locally without Square: mark paid so the rest of the flow can be tried.
  if (!squareConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "Payments are not set up yet." }, { status: 503 });
    }
    await withStoreRetry(() =>
      markOrderPaid(order.id, { provider: "test", id: `test-${Date.now()}`, amountCents: order.totalCents, at: new Date().toISOString() })
    );
    return NextResponse.json({ ok: true, status: "paid" });
  }

  const sourceId = String(body.sourceId ?? "");
  if (!sourceId) return NextResponse.json({ ok: false, error: "Please enter your card details." }, { status: 400 });

  // A fresh idempotency key per attempt: a retry with another card is a new charge,
  // while a double-tap of the same attempt can never charge twice.
  const attempt = await withStoreRetry(async () => {
    const s = await readStore();
    const o = s.orders.find((x) => x.id === order.id)!;
    o.paymentAttempts = (o.paymentAttempts ?? 0) + 1;
    await writeStore(s);
    return o.paymentAttempts;
  });

  const result = await createSquarePayment({
    sourceId,
    amountCents: order.totalCents,
    idempotencyKey: `${order.id}-a${attempt}`,
    referenceId: order.publicId,
    buyerEmail: order.customerEmail,
    note: `June & Bloom order ${order.publicId}`,
  });

  const payment = result.payment;
  if (payment && payment.status === "COMPLETED") {
    await withStoreRetry(() =>
      markOrderPaid(order.id, {
        provider: "square",
        id: payment.id,
        amountCents: payment.amount_money?.amount ?? order.totalCents,
        at: new Date().toISOString(),
        receiptUrl: payment.receipt_url,
      })
    );
    return NextResponse.json({ ok: true, status: "paid" });
  }
  if (payment && (payment.status === "APPROVED" || payment.status === "PENDING")) {
    // Square will confirm through the webhook; the order page shows it as processing.
    return NextResponse.json({ ok: true, status: "processing" });
  }
  return NextResponse.json({ ok: false, error: result.error, code: result.code }, { status: 402 });
}
