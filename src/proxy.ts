import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/upload",
  "/library",
  "/search",
  "/api/upload",
  "/api/library",
  "/api/search",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get(
    "trade_memory_session"
  )?.value;

  if (
    !process.env.AUTH_SESSION_TOKEN ||
    session !== process.env.AUTH_SESSION_TOKEN
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "ابتدا وارد حساب شوید.",
        },
        {
          status: 401,
        }
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/library/:path*",
    "/search/:path*",
    "/api/upload/:path*",
    "/api/library/:path*",
    "/api/search/:path*",
  ],
};
