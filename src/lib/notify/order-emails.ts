import type { OrderRecord } from "@/lib/db/store";
import { adminEmails } from "@/lib/auth/session";
import { formatCents } from "@/lib/domain/money";
import { escapeHtml, sendEmail } from "./email";
import { EMAIL_PALETTE as C } from "./email-palette";

function siteUrl(fallback: string): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, "");
}

function whenLine(o: OrderRecord): string {
  const how = o.fulfilment === "pickup" ? "Pickup" : "Delivery";
  return `${how} on ${o.serviceDate}${o.window ? `, ${o.window}` : ""}`;
}

function itemLines(o: OrderRecord): string[] {
  return o.items.map(
    (i) => `${i.nameSnapshot}${i.optionLabel ? ` (${i.optionLabel})` : ""}${i.qty > 1 ? ` × ${i.qty}` : ""}  ${formatCents(i.unitCents * i.qty)}`
  );
}

/**
 * Sent once an order is paid (FR-74): the customer's receipt with their private
 * order link, and a heads-up to the founders. Failures are logged, never shown
 * to the buyer, because the payment itself has already succeeded.
 */
export async function sendOrderPaidEmails(order: OrderRecord, origin: string): Promise<void> {
  const base = siteUrl(origin);
  const link = `${base}/order/${order.publicId}?t=${order.token}`;
  const firstName = order.customerName.split(" ")[0] || "there";
  const items = itemLines(order);
  const totals = [
    order.deliveryCents ? `Delivery  ${formatCents(order.deliveryCents)}` : "",
    order.taxCents ? `HST  ${formatCents(order.taxCents)}` : "",
    `Total paid  ${formatCents(order.totalCents)}`,
  ].filter(Boolean);

  const text = [
    `Thank you, ${firstName}.`,
    "",
    `Your order ${order.publicId} is confirmed and paid.`,
    whenLine(order),
    "",
    ...items,
    ...totals,
    "",
    `Follow your order here: ${link}`,
    order.payment?.receiptUrl ? `Card receipt from Square: ${order.payment.receiptUrl}` : "",
    "",
    "Questions? Reply to this email.",
    "June & Bloom",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  const row = (l: string) => `<p style="margin:4px 0">${escapeHtml(l)}</p>`;
  const html = `<div style="font-family:Arial,sans-serif;color:${C.ink};line-height:1.6;max-width:560px">
<p style="font-family:Georgia,serif;font-size:22px;color:${C.emerald};margin:0 0 16px">Thank you, ${escapeHtml(firstName)}.</p>
<p>Your order <strong>${escapeHtml(order.publicId)}</strong> is confirmed and paid.<br>${escapeHtml(whenLine(order))}</p>
<div style="background:${C.ivory};padding:16px 20px;border-radius:4px;margin:20px 0">${items.map(row).join("")}${totals.map(row).join("")}</div>
<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="background:${C.emerald};color:${C.ivory};padding:12px 22px;border-radius:4px;text-decoration:none;display:inline-block">Follow your order</a></p>
${order.payment?.receiptUrl ? `<p style="font-size:13px"><a href="${escapeHtml(order.payment.receiptUrl)}" style="color:${C.emerald}">Your card receipt from Square</a></p>` : ""}
<p style="font-size:13px;color:${C.muted}">Questions? Reply to this email.<br>June &amp; Bloom</p>
</div>`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject: `Your June & Bloom order ${order.publicId}`,
    text,
    html,
  });
  if (!sent.ok) console.error(`Order email for ${order.publicId} failed:`, sent.error);

  const founders = adminEmails();
  if (founders.length) {
    const alert = [
      `New paid order ${order.publicId}: ${formatCents(order.totalCents)}`,
      `${order.customerName}, ${order.customerEmail}, ${order.customerPhone}`,
      whenLine(order),
      ...items,
      order.needsAttention ? `Needs attention: ${order.attentionReason ?? ""}` : "",
      "",
      `Studio: ${base}/admin`,
    ]
      .filter(Boolean)
      .join("\n");
    const ok = await sendEmail({
      to: founders,
      subject: `${order.needsAttention ? "Needs attention: " : ""}New order ${order.publicId}, ${formatCents(order.totalCents)}`,
      text: alert,
    });
    if (!ok.ok) console.error(`Founder alert for ${order.publicId} failed:`, ok.error);
  }
}
