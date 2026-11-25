import { NextResponse, type NextRequest } from "next/server";
import { readStore, writeStore, withStoreRetry } from "@/lib/db/store";
import {
  LINK_MINUTES,
  SESSION_COOKIE,
  SESSION_DAYS,
  adminEmails,
  isAdminEmail,
  randomNonce,
  sign,
  verify,
} from "@/lib/auth/session";
import { adminFromRequest } from "@/lib/auth/guard";
import { escapeHtml, sendEmail } from "@/lib/notify/email";

export const dynamic = "force-dynamic";

const MAX_LINKS_PER_WINDOW = 5;
const SAME_REPLY = {
  ok: true,
  message: `If that email can sign in, a link is on its way. It works once, for ${LINK_MINUTES} minutes.`,
};

function siteOrigin(req: NextRequest): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
}

/** Who is signed in (used by the dashboard's sign-out bar). */
export async function GET(req: NextRequest) {
  const email = await adminFromRequest(req);
  return NextResponse.json({ email });
}

export async function POST(req: NextRequest) {
  let body: { action?: string; email?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (!process.env.AUTH_SECRET || adminEmails().length === 0) {
    return NextResponse.json(
      { ok: false, error: "Sign-in is not set up yet (AUTH_SECRET and ADMIN_EMAILS)." },
      { status: 503 }
    );
  }

  // 1. Send a one-time link. The reply never reveals whether the email is allowed.
  if (body.action === "request") {
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
    if (!isAdminEmail(email)) return NextResponse.json(SAME_REPLY);

    const allowed = await withStoreRetry(async () => {
      const store = await readStore();
      const now = Date.now();
      const auth = (store.adminAuth ??= { usedNonces: [], requests: [] });
      auth.requests = auth.requests.filter((r) => now - r.at < LINK_MINUTES * 60_000);
      if (auth.requests.filter((r) => r.email === email).length >= MAX_LINKS_PER_WINDOW) return false;
      auth.requests.push({ email, at: now });
      await writeStore(store);
      return true;
    });
    if (!allowed) return NextResponse.json(SAME_REPLY);

    const token = await sign({
      kind: "link",
      email,
      exp: Date.now() + LINK_MINUTES * 60_000,
      nonce: randomNonce(),
    });
    const url = `${siteOrigin(req)}/admin/login/confirm#${token}`;
    const sent = await sendEmail({
      to: email,
      subject: "Your June & Bloom studio sign-in link",
      text: `Sign in to the June & Bloom studio:\n\n${url}\n\nThis link works once, for ${LINK_MINUTES} minutes. If you did not ask for it, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#032A19;line-height:1.6">
<p style="font-family:Georgia,serif;font-size:20px;color:#122620;margin:0 0 16px">June &amp; Bloom studio</p>
<p>Tap the button to sign in. It works once, for ${LINK_MINUTES} minutes.</p>
<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#122620;color:#FDFBF7;padding:12px 22px;border-radius:4px;text-decoration:none;display:inline-block">Sign in to the studio</a></p>
<p style="font-size:13px;color:#455F4F">If you did not ask for this, you can ignore this email.</p>
</div>`,
    });
    if (!sent.ok) {
      console.error("Sign-in email failed:", sent.error);
      return NextResponse.json({ ok: false, error: "We could not send the email. Please try again shortly." }, { status: 502 });
    }
    return NextResponse.json(SAME_REPLY);
  }

  // 2. Exchange the link for a session cookie (once only).
  if (body.action === "verify") {
    const link = await verify(body.token, "link");
    if (!link || !isAdminEmail(link.email)) {
      return NextResponse.json({ ok: false, error: "This link has expired or was already used." }, { status: 401 });
    }
    const fresh = await withStoreRetry(async () => {
      const store = await readStore();
      const now = Date.now();
      const auth = (store.adminAuth ??= { usedNonces: [], requests: [] });
      auth.usedNonces = auth.usedNonces.filter((n) => n.exp > now);
      if (auth.usedNonces.some((n) => n.nonce === link.nonce)) return false;
      auth.usedNonces.push({ nonce: link.nonce, exp: link.exp });
      await writeStore(store);
      return true;
    });
    if (!fresh) {
      return NextResponse.json({ ok: false, error: "This link has expired or was already used." }, { status: 401 });
    }

    const session = await sign({
      kind: "session",
      email: link.email,
      exp: Date.now() + SESSION_DAYS * 86_400_000,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 86_400,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
