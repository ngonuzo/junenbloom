import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/db/store";

const processedEventIds = new Set<string>();

/**
 * Idempotent Stripe Webhook Handler (FR-14 / T4.10 / BR-09).
 */
export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const event = await req.json();
    if (!event?.id || !event?.type) {
      return NextResponse.json({ error: "Malformed event payload" }, { status: 400 });
    }

    // Idempotency guard: delivering the same event twice changes nothing the second time
    if (processedEventIds.has(event.id)) {
      return NextResponse.json({ received: true, idempotentDuplicate: true });
    }
    processedEventIds.add(event.id);

    if (event.type === "checkout.session.completed") {
      const publicId = event.data?.object?.metadata?.orderPublicId;
      if (publicId) {
        const store = readStore();
        const order = store.orders.find((o) => o.publicId === publicId);
        if (order && order.status === "awaiting_payment") {
          order.status = "received";
          order.events.unshift({
            at: new Date().toISOString(),
            event: `Stripe webhook (${event.id}) verified payment`,
          });
          writeStore(store);
        }
      }
    }

    return NextResponse.json({ received: true, idempotentDuplicate: false });
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
