import type { Instrumentation } from "next";

/**
 * Runs once when the server starts.
 *
 * The only job here is to force the environment check so a missing or
 * malformed variable crashes the process on boot, named, instead of surfacing
 * later as a confusing failure on someone's first prompt.
 */
export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { serverEnv } = await import("./infrastructure/env");
  serverEnv();
};

/**
 * Runs for every error the server catches while it renders a page, runs a
 * route handler or a server action, or runs the proxy. Without this, a server
 * failure only reaches PostHog as the browser's redacted placeholder with no
 * stack, which cannot be debugged.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { reportServerError } = await import("./infrastructure/report-server-error");
  await reportServerError(error, request, context);
};
