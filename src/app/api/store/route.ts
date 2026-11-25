import { NextResponse } from "next/server";
import {
  readStore,
  writeStore,
  withStoreRetry,
  StoreConflictError,
  createOrderInStore,
  createInquiryInStore,
  ensureRollingSlots,
  dayIso,
  type OrderStatus,
  type InquiryStatus,
} from "@/lib/db/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  let body: { action?: string; payload?: Record<string, unknown> & { [k: string]: any } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  try {
    // Each action reads, changes and saves the store; a save clash reruns it from a fresh read.
    return await withStoreRetry(() => handle(body));
  } catch (err) {
    if (err instanceof StoreConflictError) {
      return NextResponse.json({ ok: false, error: "We were busy. Please try again." }, { status: 503 });
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handle(body: any): Promise<NextResponse> {
  {
    const { action } = body;

    if (action === "create_order") {
      const { order, error } = await createOrderInStore(body.payload);
      if (error || !order) {
        return NextResponse.json({ ok: false, error }, { status: 422 });
      }
      return NextResponse.json({ ok: true, order });
    }

    if (action === "create_inquiry") {
      const inquiry = await createInquiryInStore(body.payload);
      return NextResponse.json({ ok: true, inquiry });
    }

    if (action === "notify_me") {
      const store = await readStore();
      store.waitlistEntries.unshift({
        id: `wait-${Date.now()}`,
        name: body.payload.name || "Guest",
        email: body.payload.email,
        productSlug: body.payload.productSlug,
        createdAt: new Date().toISOString(),
      });
      await writeStore(store);
      return NextResponse.json({ ok: true });
    }

    if (action === "contact_message") {
      const store = await readStore();
      store.contactMessages.unshift({
        id: `msg-${Date.now()}`,
        name: body.payload.name,
        email: body.payload.email,
        phone:
          typeof body.payload.phone === "string" && body.payload.phone.trim()
            ? body.payload.phone.trim().slice(0, 40)
            : undefined,
        topic: body.payload.topic || "General inquiry",
        message: body.payload.message,
        createdAt: new Date().toISOString(),
      });
      await writeStore(store);
      return NextResponse.json({ ok: true });
    }

    if (action === "advance_order_status") {
      const store = await readStore();
      const order = store.orders.find((o) => o.publicId === body.payload.publicId);
      if (order) {
        order.status = body.payload.status as OrderStatus;
        order.events.unshift({
          at: new Date().toISOString(),
          event: `Status updated to ${body.payload.status} by ${order.owner}`,
        });
        await writeStore(store);
      }
      return NextResponse.json({ ok: true, order });
    }

    if (action === "adjust_stock") {
      const store = await readStore();
      const product = store.products.find((p) => p.id === body.payload.productId);
      if (product) {
        product.stockOnHand = Math.max(0, product.stockOnHand + Number(body.payload.delta));
        await writeStore(store);
      }
      return NextResponse.json({ ok: true, product });
    }

    if (action === "toggle_setting") {
      const store = await readStore();
      const key = body.payload.key as keyof typeof store.settings;
      if (key in store.settings && typeof store.settings[key] === "boolean") {
        (store.settings[key] as boolean) = !store.settings[key];
        await writeStore(store);
      }
      return NextResponse.json({ ok: true, settings: store.settings });
    }

    // Board slots (FR-86). Saving the windows applies to every upcoming day.
    if (action === "save_board_windows") {
      const store = await readStore();
      const raw = Array.isArray(body.payload?.windows) ? body.payload.windows : [];
      const seen = new Set<string>();
      const windows = raw
        .map((w: { label?: unknown; capacity?: unknown }) => ({
          label: String(w?.label ?? "").trim().slice(0, 40),
          capacity: Math.min(50, Math.max(0, Math.round(Number(w?.capacity) || 0))),
        }))
        .filter((w: { label: string }) => w.label && !seen.has(w.label) && seen.add(w.label))
        .slice(0, 6);
      if (windows.length === 0) {
        return NextResponse.json({ ok: false, error: "Add at least one window." }, { status: 422 });
      }
      const daysAhead = Math.min(90, Math.max(7, Math.round(Number(body.payload?.daysAhead) || 21)));
      const today = dayIso(0);
      const labels = new Set(windows.map((w: { label: string }) => w.label));
      // Upcoming windows no longer offered are removed unless someone has booked them.
      store.slots = store.slots.filter((s) => s.day < today || s.booked > 0 || labels.has(s.window));
      for (const s of store.slots) {
        const w = windows.find((x: { label: string }) => x.label === s.window);
        if (s.day >= today && w) s.capacity = Math.max(w.capacity, s.booked);
      }
      store.settings.boardWindows = windows;
      store.settings.boardDaysAhead = daysAhead;
      ensureRollingSlots(store);
      await writeStore(store);
      return NextResponse.json({ ok: true, settings: store.settings });
    }

    if (action === "update_slot") {
      const store = await readStore();
      const slot = store.slots.find((s) => s.id === body.payload?.id);
      if (!slot) return NextResponse.json({ ok: false, error: "Slot not found." }, { status: 404 });
      if (body.payload.capacity !== undefined) {
        const cap = Math.round(Number(body.payload.capacity));
        if (Number.isFinite(cap)) slot.capacity = Math.min(50, Math.max(slot.booked, cap));
      }
      if (typeof body.payload.blocked === "boolean") slot.blocked = body.payload.blocked;
      await writeStore(store);
      return NextResponse.json({ ok: true, slot });
    }

    if (action === "toggle_closed_date") {
      const store = await readStore();
      const day = String(body.payload?.day ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 422 });
      }
      const closed = new Set(store.settings.blockedDates);
      if (closed.has(day)) closed.delete(day);
      else closed.add(day);
      store.settings.blockedDates = [...closed].sort();
      await writeStore(store);
      return NextResponse.json({ ok: true, blockedDates: store.settings.blockedDates });
    }

    if (action === "advance_inquiry_status") {
      const store = await readStore();
      const inq = store.inquiries.find((i) => i.publicId === body.payload.publicId);
      if (inq) {
        inq.status = body.payload.status as InquiryStatus;
        await writeStore(store);
      }
      return NextResponse.json({ ok: true, inquiry: inq });
    }

    if (action === "add_product") {
      const store = await readStore();
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
      await writeStore(store);
      return NextResponse.json({ ok: true, products: store.products });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }
}
