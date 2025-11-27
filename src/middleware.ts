import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/portfolio",
  "/recommendations",
  "/market",
  "/chat",
  "/learn",
  "/settings",
  "/onboarding",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies or local storage is not accessible in middleware
  // We'll use a simpler approach with cookies
  const token = request.cookies.get("auth-storage");

  // Parse the auth state from the persisted storage
  let isAuthenticated = false;
  if (token?.value) {
    try {
      const parsed = JSON.parse(token.value);
      isAuthenticated = !!parsed.state?.accessToken;
    } catch {
      isAuthenticated = false;
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
