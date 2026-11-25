/**
 * Sends email through Resend's HTTP API (FR-74).
 * Settings: RESEND_API_KEY (secret) and EMAIL_FROM, e.g. "June & Bloom <info@juneandbloomlifestyle.com>".
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; error?: string }> {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      // Local runs without Resend: show the email in the terminal instead.
      console.log(`\n[email to ${String(msg.to)}] ${msg.subject}\n${msg.text}\n`);
      return { ok: true };
    }
    return { ok: false, error: "Email is not set up (RESEND_API_KEY, EMAIL_FROM)." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend responded ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Email failed" };
  }
}

/** Escapes text for safe use inside an HTML email. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
