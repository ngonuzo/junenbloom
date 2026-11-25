import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, authBypassed, sessionEmail } from "@/lib/auth/session";

/**
 * Only signed-in founders reach the dashboard (FR-80, T8.1).
 * The sign-in pages themselves stay open. Admin data and actions are
 * protected again on the server in each API route.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login") || authBypassed()) return NextResponse.next();

  const email = await sessionEmail(req.cookies.get(SESSION_COOKIE)?.value);
  if (email) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
