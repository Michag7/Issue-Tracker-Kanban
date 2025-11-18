import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  // Temporarily disabled next-intl middleware to fix routing issues
  // Will re-enable after fixing the configuration
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
