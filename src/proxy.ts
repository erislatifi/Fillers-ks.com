import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { REF_COOKIE, REF_MAX_AGE } from "./lib/referral";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intl(request);
  // Sales agents share links like /sq?ref=ARBEN — remember the code so the order placed
  // later is credited to them (see src/lib/referral.ts).
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Za-z0-9_-]{1,40}$/.test(ref)) {
    response.cookies.set(REF_COOKIE, ref.toUpperCase(), {
      maxAge: REF_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|admin|print|tools|agjent|_next|_vercel|.*\\..*).*)"],
};
