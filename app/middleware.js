import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  
  const protectedRoutes = ["/found", "/lost", "/myItems", "/userProfile"];
  const adminRoutes = ["/admin"];

  
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/loginPage", req.url));
  }

  
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL("/loginPage", req.url));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/loginPage", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/found/:path*",
    "/lost/:path*",
    "/myItems/:path*",
    "/userProfile/:path*",
    "/admin/:path*",
  ],
};
