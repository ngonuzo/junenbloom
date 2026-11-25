/**
 * Founders' sign-in (FR-80, T8.1): signed values for the session cookie and the
 * one-time email link. Uses Web Crypto only, so it runs in middleware and in
 * route handlers alike.
 *
 * Settings (Vercel environment variables):
 * - AUTH_SECRET   random secret used to sign cookies and links
 * - ADMIN_EMAILS  comma-separated allow-list, e.g. "a@x.com, b@y.com"
 *
 * When AUTH_SECRET is missing outside production (a founder running the site on
 * their own computer), the dashboard stays open as before. In production a
 * missing secret locks the dashboard instead of opening it.
 */

export const SESSION_COOKIE = "jb_admin";
export const SESSION_DAYS = 14;
export const LINK_MINUTES = 15;

export interface SessionPayload {
  kind: "session";
  email: string;
  exp: number; // ms since epoch
}

export interface LinkPayload {
  kind: "link";
  email: string;
  exp: number;
  nonce: string;
}

type Payload = SessionPayload | LinkPayload;

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

/** True only when running locally without auth configured. */
export function authBypassed(): boolean {
  return !process.env.AUTH_SECRET && process.env.NODE_ENV !== "production";
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function sign(payload: Payload, secret = process.env.AUTH_SECRET ?? ""): Promise<string> {
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

/** Returns the payload when the signature is valid and it has not expired. */
export async function verify<K extends Payload["kind"]>(
  token: string | undefined | null,
  kind: K,
  secret = process.env.AUTH_SECRET ?? "",
  now = Date.now()
): Promise<Extract<Payload, { kind: K }> | null> {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      fromB64url(sig) as BufferSource,
      enc.encode(body) as BufferSource
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload;
    if (payload.kind !== kind || typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload as Extract<Payload, { kind: K }>;
  } catch {
    return null;
  }
}

/** The signed-in founder's email from a cookie value, or null. */
export async function sessionEmail(cookieValue: string | undefined | null): Promise<string | null> {
  const s = await verify(cookieValue, "session");
  if (!s || !isAdminEmail(s.email)) return null;
  return s.email;
}

export function randomNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return b64url(b);
}
