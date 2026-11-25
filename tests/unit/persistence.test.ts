import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { createPostgresBackend, setBackend, type StoreBackend } from "@/lib/db/persistence";
import {
  createOrderInStore,
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

  it("gives simultaneous orders distinct numbers and never oversells", async () => {
    const s = await readStore();
    const product = s.products.find((p) => p.slug === "signature-mens-box")!;
    product.trackStock = true;
    product.stockOnHand = 1;
    await writeStore(s);

    const results = await Promise.all(
      [1, 2, 3].map(() => withStoreRetry(() => createOrderInStore(orderInput("signature-mens-box"))))
    );
    const orders = results.map((r) => r.order!);
    expect(new Set(orders.map((o) => o.publicId)).size).toBe(3);
    expect(orders.filter((o) => !o.needsAttention)).toHaveLength(1);

    const after = await readStore();
    expect(after.products.find((p) => p.slug === "signature-mens-box")!.stockOnHand).toBe(0);
    expect(after.orders.filter((o) => orders.some((n) => n.id === o.id))).toHaveLength(3);
  });
});
