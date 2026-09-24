import "server-only";

import { type Instrumentation } from "next";
import { z } from "zod";

import { serverEnv } from "./env";
import { posthogServer } from "./posthog";

/**
 * Sends a server render, route, or action failure to PostHog error tracking.
 *
 * In production React redacts a Server Components error before it reaches the
 * browser, so the browser SDK only ever sees a placeholder message with no
 * stack. The real error only exists here, on the server, which makes this the
 * one place the actual message and the `digest` can be captured. The digest is
 * the same value the browser error boundary receives, so it joins the two
 * halves of one failure.
 *
 * The browser SDK's cookie supplies the person and session, so the exception
 * lands on the same person and replay as the client error. Request headers are
 * not sent: they carry the Clerk session cookie.
 */

type RequestErrorArgs = Parameters<Instrumentation.onRequestError>;

const posthogCookieSchema = z.object({
  distinct_id: z.string().min(1).optional(),
  $sesid: z
    .tuple([z.unknown(), z.string().min(1)])
    .rest(z.unknown())
    .optional(),
});

type PostHogIdentity = Readonly<{ distinctId?: string; sessionId?: string }>;

const readPostHogIdentity = (
  cookieHeader: string | string[] | undefined,
  posthogKey: string,
): PostHogIdentity => {
  const cookieName = `ph_${posthogKey}_posthog`;
  const raw = [cookieHeader ?? []]
    .flat()
    .flatMap((header) => header.split(";"))
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);

  if (!raw) return {};

  try {
    const parsed = posthogCookieSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) return {};
    return { distinctId: parsed.data.distinct_id, sessionId: parsed.data.$sesid?.[1] };
  } catch {
    return {};
  }
};

const readDigest = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "digest" in error
    ? String(error.digest)
    : undefined;

export const captureRequestError = async (
  ...[error, request, context]: RequestErrorArgs
): Promise<void> => {
  try {
    const { distinctId, sessionId } = readPostHogIdentity(
      request.headers.cookie,
      serverEnv().NEXT_PUBLIC_POSTHOG_KEY,
    );

    // Immediate, not batched: the request can end and a serverless instance
    // can freeze before a queued event would flush.
    await posthogServer().captureExceptionImmediate(error, distinctId, {
      $session_id: sessionId,
      digest: readDigest(error),
      path: request.path,
      method: request.method,
      ...context,
    });
  } catch (captureError) {
    console.error("[instrumentation] could not report a request error", captureError);
  }
};
