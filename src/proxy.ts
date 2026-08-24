import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function noopMiddleware(_req: NextRequest) {
  return NextResponse.next();
}

let handler: (req: NextRequest) => ReturnType<typeof NextResponse.next>;

try {
  const isClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  if (isClerkConfigured) {
    // Dynamic require to avoid crashing if Clerk keys are missing
    const { clerkMiddleware } = require("@clerk/nextjs/server");
    handler = clerkMiddleware();
  } else {
    handler = noopMiddleware;
  }
} catch {
  // If Clerk import fails for any reason, fall back to noop
  handler = noopMiddleware;
}

export default handler;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
