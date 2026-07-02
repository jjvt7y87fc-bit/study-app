import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "study_app_session";
const PROFILE_COOKIE = "active_profile_id";
const PUBLIC_PATHS = ["/login"];
const PROFILE_GATE_EXEMPT_PATHS = ["/profiles", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = process.env.APP_PASSWORD;

  if (!expected || cookie !== expected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isProfileGateExempt = PROFILE_GATE_EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const activeProfileId = request.cookies.get(PROFILE_COOKIE)?.value;

  if (!activeProfileId && !isProfileGateExempt) {
    const profilesUrl = new URL("/profiles", request.url);
    profilesUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(profilesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
