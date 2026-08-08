import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Next 16 renamed the middleware entry point from `middleware.ts` to
 * `proxy.ts`. The file name is the only thing that changed.
 *
 * This runs Clerk on every request so `auth()` resolves on the server. It
 * gates no route by sign-in: which routes require a signed-in user was decided
 * in feature 8 (public threads are readable without an account, only sending a
 * prompt and voting need sign-in), and that stands.
 *
 * Arcjet is deliberately *not* imported here. Its decision engine is
 * WebAssembly that only bundles cleanly into the Node server, and this file
 * runs on the edge, so importing it broke the build. `/t/[threadId]`'s Arcjet
 * cover now runs inside that page's Server Component via `request()`
 * (features/threads/thread-protection.ts, docs/scope.md feature 8).
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*)|api|trpc)(.*)",
  ],
};
