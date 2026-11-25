import { SESSION_COOKIE, authBypassed, sessionEmail } from "./session";

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/**
 * The signed-in founder for this request, or null.
 * Locally without AUTH_SECRET the dashboard stays open ("local").
 */
export async function adminFromRequest(req: Request): Promise<string | null> {
  if (authBypassed()) return "local";
  return sessionEmail(readCookie(req.headers.get("cookie"), SESSION_COOKIE));
}
