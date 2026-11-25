import { describe, expect, it, vi } from "vitest";
import { sendOrderPaidEmails } from "@/lib/notify/order-emails";
import type { OrderRecord } from "@/lib/db/store";

describe("order paid emails", () => {
  it("sends the buyer their private order link and the founders an alert", async () => {
    process.env.ADMIN_EMAILS = "a@example.com";
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const order = {
      publicId: "JB-2611-019", token: "tok123", customerName: "Ngozi O", customerEmail: "n@example.com",
      customerPhone: "4165550100", fulfilment: "delivery", serviceDate: "2026-12-10", window: "Afternoon",
      items: [{ nameSnapshot: "Small board", qty: 2, unitCents: 6000 }], deliveryCents: 1500, taxCents: 0,
      totalCents: 13500, needsAttention: false, payment: { provider: "square", id: "p", amountCents: 13500, at: "", receiptUrl: "https://squareup.com/r/1" },
    } as unknown as OrderRecord;
    await sendOrderPaidEmails(order, "https://example.test");
    const out = log.mock.calls.map((c) => String(c[0])).join("\n");
    log.mockRestore();
    expect(out).toContain("[email to n@example.com] Your June & Bloom order JB-2611-019");
    expect(out).toContain("https://example.test/order/JB-2611-019?t=tok123");
    expect(out).toContain("Small board × 2");
    expect(out).toContain("https://squareup.com/r/1");
    expect(out).toContain("[email to a@example.com] New order JB-2611-019");
  });
});
