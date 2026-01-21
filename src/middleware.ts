import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Token cookie name - must match the one in auth.ts
const TOKEN_COOKIE_NAME = "auth-token";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/api/auth/login"];

// API routes that should return JSON errors instead of redirects
const API_ROUTES = ["/api"];

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Check if it's an API route
  const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route));

  // Static files and _next paths should pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If user has a valid token and tries to access login page, redirect to dashboard
  if (pathname === "/" && token) {
    const isValid = await verifyToken(token);
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Public routes don't need auth check (except for redirect logic above)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!token) {
    // API routes return JSON error
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verify token
  const isValidToken = await verifyToken(token);

  if (!isValidToken) {
    // Clear invalid token
    const response = isApiRoute
      ? NextResponse.json(
          { success: false, message: "Token expired or invalid" },
          { status: 401 }
        )
      : NextResponse.redirect(new URL("/", request.url));

    // Clear the invalid cookie
    response.cookies.set(TOKEN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  // Token is valid, allow request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth/login).*)",
    "/api/:path*",
  ],
};
