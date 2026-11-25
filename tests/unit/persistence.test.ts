import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { createPostgresBackend, setBackend, type StoreBackend } from "@/lib/db/persistence";
import {
  createOrderInStore,
  markOrderPaid,
  readStore,
  StoreConflictError,
  withStoreRetry,
  writeStore,
} from "@/lib/db/store";

let db: PGlite;
let backend: StoreBackend;

beforeEach(async () => {
  db = new PGlite();
  backend = createPostgresBackend(async (text, params) => (await db.query(text, params)).rows as Array<Record<string, unknown>>);
  setBackend(backend);
});

afterEach(async () => {
  setBackend(null);
  await db.close();
});

const orderInput = (slug: string) => ({
  items: [{ productSlug: slug, qty: 1 }],
  fulfilment: "pickup" as const,
  postalCode: "",
  recipientName: "Test",
  recipientPhone: "4165550100",
  addressLine: "",
  city: "",
  serviceDate: "2026-12-10",
  window: "Afternoon",
  giftNote: "",
  allergyNotes: "",
  customerName: "Test",
  customerEmail: "test@example.com",
  customerPhone: "4165550100",
  marketingOptIn: false,
});

describe("Postgres store", () => {
  it("seeds an empty database with the starting catalogue", async () => {
    const store = await readStore();
    expect(store.products.length).toBeGreaterThan(0);
    expect((await backend.load())?.data).toBeTruthy();
  });

  it("keeps changes between reads", async () => {
    const a = await readStore();
    a.settings.bannerText = "Saved to Postgres";
    await writeStore(a);
    expect((await readStore()).settings.bannerText).toBe("Saved to Postgres");
  });

  it("refuses a save based on stale data", async () => {
    const a = await readStore();
    const b = await readStore();
    a.settings.bannerText = "first";
    await writeStore(a);
    b.settings.bannerText = "second";
    await expect(writeStore(b)).rejects.toBeInstanceOf(StoreConflictError);
    expect((await readStore()).settings.bannerText).toBe("first");
  });

  it("retries clashing changes so both survive", async () => {
    const add = (word: string) =>
      withStoreRetry(async () => {
        const s = await readStore();
        s.settings.notifyEmails = [...s.settings.notifyEmails, word];
        await writeStore(s);
      });
    await Promise.all(["a@x.com", "b@x.com", "c@x.com"].map(add));
    const emails = (await readStore()).settings.notifyEmails;
    expect(emails).toEqual(expect.arrayContaining(["a@x.com", "b@x.com", "c@x.com"]));
  });

  it("gives simultaneous paid orders distinct numbers and never oversells", async () => {
    const s = await readStore();
    const product = s.products.find((p) => p.slug === "signature-mens-box")!;
    product.trackStock = true;
    product.stockOnHand = 1;
    await writeStore(s);

    // Three buyers check out at once while one box is left...
    const created = await Promise.all(
      [1, 2, 3].map(() => withStoreRetry(() => createOrderInStore(orderInput("signature-mens-box"))))
    );
    const orders = created.map((r) => r.order!);
    expect(new Set(orders.map((o) => o.publicId)).size).toBe(3);
    expect(orders.every((o) => o.status === "awaiting_payment")).toBe(true);

    // ...and all three payments land together: one gets the box, two are flagged.
    const paid = await Promise.all(
      orders.map((o, i) =>
        withStoreRetry(() =>
          markOrderPaid(o.id, { provider: "square", id: `pay-${i}`, amountCents: o.totalCents, at: new Date().toISOString() })
        )
      )
    );
    expect(paid.filter((r) => !r.order!.needsAttention)).toHaveLength(1);
    const after = await readStore();
    expect(after.products.find((p) => p.slug === "signature-mens-box")!.stockOnHand).toBe(0);
  });

  it("refuses checkout when an item is already sold out", async () => {
    const s = await readStore();
    const product = s.products.find((p) => p.slug === "signature-mens-box")!;
    product.trackStock = true;
    product.stockOnHand = 0;
    await writeStore(s);
    const r = await createOrderInStore(orderInput("signature-mens-box"));
    expect(r.order).toBeUndefined();
    expect(r.error).toMatch(/sold out/);
  });

  it("marks an order paid once, however many times it is told", async () => {
    const { order } = await createOrderInStore(orderInput("signature-mens-box"));
    const stockBefore = (await readStore()).products.find((p) => p.id === order!.items[0].productId)!.stockOnHand;
    const pay = { provider: "square" as const, id: "pay-1", amountCents: order!.totalCents, at: new Date().toISOString() };
    const first = await markOrderPaid(order!.id, pay);
    const second = await markOrderPaid(order!.id, pay);
    expect(first.alreadyPaid).toBe(false);
    expect(second.alreadyPaid).toBe(true);
    const after = await readStore();
    const saved = after.orders.find((o) => o.id === order!.id)!;
    expect(saved.status).toBe("received");
    expect(saved.payment?.id).toBe("pay-1");
    const product = after.products.find((p) => p.id === order!.items[0].productId)!;
    if (product.trackStock) expect(product.stockOnHand).toBe(stockBefore - 1);
  });

  it("flags a payment that does not match the order total", async () => {
    const { order } = await createOrderInStore(orderInput("signature-mens-box"));
    const r = await markOrderPaid(order!.id, { provider: "square", id: "p", amountCents: 1, at: new Date().toISOString() });
    expect(r.order!.needsAttention).toBe(true);
  });
  it("books one window place per board and refuses more than fit", async () => {
    const s = await readStore();
    const board = s.products.find((p) => p.type === "board")!;
    const slot = s.slots.find((x) => !x.blocked && x.booked === 0)!;
    slot.capacity = 3;
    board.trackStock = false;
    await writeStore(s);
    const input = (qty: number) => ({ ...orderInput(board.slug), slotId: slot.id, items: [{ productSlug: board.slug, optionId: board.options[0]?.id, qty }] });

    const tooMany = await createOrderInStore(input(4));
    expect(tooMany.error).toMatch(/room for 3 more boards/);

    const { order } = await createOrderInStore(input(2));
    await markOrderPaid(order!.id, { provider: "square", id: "p", amountCents: order!.totalCents, at: new Date().toISOString() });
    expect((await readStore()).slots.find((x) => x.id === slot.id)!.booked).toBe(2);
  });
});
