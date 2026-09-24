import "server-only";

import type { Instrumentation } from "next";

import { serverEnv } from "./env";
import { posthogServer } from "./posthog";

type ErrorRequest = Parameters<Instrumentation.onRequestError>[1];
type ErrorContext = Parameters<Instrumentation.onRequestError>[2];

/**
 * Sends a server exception to PostHog error tracking with its real message and
 * stack. In production the browser only ever sees React's redacted placeholder
 * and a `digest`, so this is the one copy that can be debugged.
 *
 * The event carries the same `digest` the error boundaries send from the
 * browser, and the person and session from the browser's PostHog cookie, so the
 * server copy and the client copy of one failure land on the same person and
 * replay and can be joined on `digest`.
 */
const readBrowserIdentity = (
  request: ErrorRequest,
): { readonly distinctId?: string; readonly sessionId?: string } => {
  const header = request.headers.cookie;
  const cookies = Array.isArray(header) ? header.join("; ") : header;
  if (!cookies) return {};

  const name = `ph_${serverEnv().NEXT_PUBLIC_POSTHOG_KEY}_posthog=`;
  const raw = cookies
    .split("; ")
    .find((cookie) => cookie.startsWith(name))
    ?.slice(name.length);
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return {};
    const { distinct_id, $sesid } = parsed as { distinct_id?: unknown; $sesid?: unknown };

    return {
      distinctId: typeof distinct_id === "string" ? distinct_id : undefined,
      sessionId:
        Array.isArray($sesid) && typeof $sesid[1] === "string" ? $sesid[1] : undefined,
    };
  } catch {
    return {};
  }
};

export const reportServerError = async (
  error: unknown,
  request: ErrorRequest,
  context: ErrorContext,
): Promise<void> => {
  const { distinctId, sessionId } = readBrowserIdentity(request);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  await posthogServer().captureExceptionImmediate(error, distinctId, {
    digest,
    $session_id: sessionId,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
