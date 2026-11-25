import { NextResponse } from "next/server";
import { markOrderPaid, readStore, withStoreRetry } from "@/lib/db/store";
import { getSquarePayment, isValidSquareSignature, type SquarePayment } from "@/lib/payments/square";

export const dynamic = "force-dynamic";

/**
 * Square's backup notice that a payment went through (FR-14). If a buyer closes
 * the page right after paying, this still marks the order paid. Only signed
 * notices are accepted, and repeats change nothing.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidSquareSignature(raw, req.headers.get("x-square-hmacsha256-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: { payment?: SquarePayment } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (event.type !== "payment.updated" && event.type !== "payment.created") {
    return NextResponse.json({ ok: true });
  }

  const notified = event.data?.object?.payment;
  if (!notified?.id || notified.status !== "COMPLETED" || !notified.reference_id) {
    return NextResponse.json({ ok: true });
  }

  // Confirm with Square directly rather than trusting the notice alone.
  const payment = (await getSquarePayment(notified.id)) ?? null;
  if (!payment || payment.status !== "COMPLETED") return NextResponse.json({ ok: true });

  const store = await readStore();
  const order = store.orders.find((o) => o.publicId === payment.reference_id);
  if (order) {
    await withStoreRetry(() =>
      markOrderPaid(order.id, {
        provider: "square",
        id: payment.id,
        amountCents: payment.amount_money?.amount ?? 0,
        at: new Date().toISOString(),
        receiptUrl: payment.receipt_url,
      })
    );
  }
  return NextResponse.json({ ok: true });
}
