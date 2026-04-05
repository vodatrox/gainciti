import { NextResponse } from "next/server";

// Auth is handled client-side via AuthProvider + ProtectedRoute
// since tokens are stored in localStorage (not accessible in middleware).
// This middleware is kept minimal for future cookie-based auth migration.

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
