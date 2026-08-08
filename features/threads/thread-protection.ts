import "server-only";

import { detectBot, request, slidingWindow } from "@arcjet/next";

import { arcjetClient } from "@/infrastructure/arcjet";

/**
 * Everything Arcjet checks before a public thread page is allowed to render.
 *
 * `/t/[threadId]` has no auth gate by design (docs/scope.md, feature 8): a
 * thread's real owner and any anonymous visitor with the link both reach the
 * same page. With no signed-in user to key on, the rate limit falls back to
 * IP, the one identity Arcjet has here — weaker than chat's per-user bucket,
 * but the right backstop against a single link, or the whole route, being
 * hammered. The limit is deliberately generous: it exists to stop volumetric
 * abuse, never to make a real link fail to load for someone who was just
 * sent it.
 *
 * Bots are denied outright, same reasoning as chat: this page has no
 * legitimate crawler use case, and rich link previews are explicitly out of
 * scope (docs/scope.md).
 *
 * The check runs inside the Server Component via `request()`, not in
 * `proxy.ts`. Feature 8 first wired it into the middleware on the belief that
 * a Server Component "never sees a Request" — but `@arcjet/next` exports
 * `request()` for exactly this, and the middleware route was actively harmful:
 * Arcjet's decision engine is WebAssembly that only bundles into the Node
 * server, while Next middleware runs on the edge, so the import broke the
 * build outright. Running it here keeps the check upstream of every database
 * read on this route — the whole reason feature 8 added it — with none of the
 * edge-bundling fallout.
 */
const WINDOW_INTERVAL = "60s";
const MAX_REQUESTS_PER_WINDOW = 60;

let cached: ReturnType<typeof createProtectedClient> | null = null;

const createProtectedClient = () =>
  arcjetClient()
    .withRule(detectBot({ mode: "LIVE", allow: [] }))
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: WINDOW_INTERVAL,
        max: MAX_REQUESTS_PER_WINDOW,
      }),
    );

const protectedClient = () => (cached ??= createProtectedClient());

/**
 * Runs the rules for one `/t/[threadId]` view.
 *
 * Returns `null` when the page may render, or the plain sentence to show in
 * its place when it may not. Never surfaces an Arcjet reason verbatim: the
 * caller renders the sentence, the real one goes to the server log. An Arcjet
 * outage fails open — the page staying reachable matters more than a backstop
 * limit, and owner-only writes are enforced elsewhere regardless.
 */
export const guardThreadPage = async (): Promise<string | null> => {
  const decision = await protectedClient().protect(await request());

  if (decision.isErrored()) {
    console.error("[thread] arcjet could not reach a decision", decision.reason.message);

    return null;
  }

  if (!decision.isDenied()) {
    return null;
  }

  if (decision.reason.isRateLimit()) {
    return "Too many requests. Try again shortly.";
  }

  return "This request was blocked.";
};
