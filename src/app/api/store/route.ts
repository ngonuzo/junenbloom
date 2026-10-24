import { NextResponse } from "next/server";
import {
  readStore,
  writeStore,
  createOrderInStore,
  createInquiryInStore,
  type OrderStatus,
  type InquiryStatus,
} from "@/lib/db/store";

export async function GET() {
  const store = readStore();
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_order") {
      const { order, error } = createOrderInStore(body.payload);
      if (error || !order) {
        return NextResponse.json({ ok: false, error }, { status: 422 });
      }
      return NextResponse.json({ ok: true, order });
    }

    if (action === "create_inquiry") {
      const inquiry = createInquiryInStore(body.payload);
      return NextResponse.json({ ok: true, inquiry });
    }

    if (action === "notify_me") {
      const store = readStore();
      store.waitlistEntries.unshift({
        id: `wait-${Date.now()}`,
        name: body.payload.name || "Guest",
        email: body.payload.email,
        productSlug: body.payload.productSlug,
        createdAt: new Date().toISOString(),
      });
      writeStore(store);
      return NextResponse.json({ ok: true });
    }

    if (action === "contact_message") {
      const store = readStore();
      store.contactMessages.unshift({
        id: `msg-${Date.now()}`,
        name: body.payload.name,
        email: body.payload.email,
        topic: body.payload.topic || "General inquiry",
        message: body.payload.message,
        createdAt: new Date().toISOString(),
      });
      writeStore(store);
      return NextResponse.json({ ok: true });
    }

    if (action === "advance_order_status") {
      const store = readStore();
      const order = store.orders.find((o) => o.publicId === body.payload.publicId);
      if (order) {
        order.status = body.payload.status as OrderStatus;
        order.events.unshift({
          at: new Date().toISOString(),
          event: `Status updated to ${body.payload.status} by ${order.owner}`,
        });
        writeStore(store);
      }
      return NextResponse.json({ ok: true, order });
    }

    if (action === "adjust_stock") {
      const store = readStore();
      const product = store.products.find((p) => p.id === body.payload.productId);
      if (product) {
        product.stockOnHand = Math.max(0, product.stockOnHand + Number(body.payload.delta));
        writeStore(store);
      }
      return NextResponse.json({ ok: true, product });
    }

    if (action === "toggle_setting") {
      const store = readStore();
      const key = body.payload.key as keyof typeof store.settings;
      if (key in store.settings && typeof store.settings[key] === "boolean") {
        (store.settings[key] as boolean) = !store.settings[key];
        writeStore(store);
      }
      return NextResponse.json({ ok: true, settings: store.settings });
    }

    if (action === "advance_inquiry_status") {
      const store = readStore();
      const inq = store.inquiries.find((i) => i.publicId === body.payload.publicId);
      if (inq) {
        inq.status = body.payload.status as InquiryStatus;
        writeStore(store);
      }
      return NextResponse.json({ ok: true, inquiry: inq });
    }

    if (action === "add_product") {
      const store = readStore();
      const p = body.payload;
      const slug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      store.products.unshift({
        id: `prod-${Date.now()}`,
        slug,
        name: p.name,
        subtitle: p.subtitle || "Limited seasonal curation",
        categorySlug: p.categorySlug || "signature",
        categoryName: p.categoryName || "Signature",
        type: p.type || "gift",
        status: p.status || "live",
        priceCents: Number(p.priceCents) || 12500,
        priceIsFrom: true,
        shortDescription: p.shortDescription || "Chosen and packed by hand in Toronto.",
        contents: (p.contents || []).filter(Boolean),
        allergens: ["See individual artisan labels."],
        leadTimeHours: 72,
        trackStock: true,
        stockOnHand: Number(p.stockOnHand) || 6,
        lowStockThreshold: 2,
        featured: false,
        aspectRatio: "4:5",
        tone: "emerald",
        motif: "vessel",
        options: [
          {
            id: `opt-${Date.now()}`,
            label: "Standard Curation",
            priceCents: Number(p.priceCents) || 12500,
            stockOnHand: Number(p.stockOnHand) || 6,
          },
        ],
      });
      writeStore(store);
      return NextResponse.json({ ok: true, products: store.products });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
