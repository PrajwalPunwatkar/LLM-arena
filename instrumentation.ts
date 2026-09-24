/**
 * Runs once when the server starts, and again on every server request error.
 *
 * `register` forces the environment check so a missing or malformed variable
 * crashes the process on boot, named, instead of surfacing later as a
 * confusing failure on someone's first prompt.
 *
 * `onRequestError` sends each server render, route, or action failure to
 * PostHog error tracking, because the browser only sees a redacted copy.
 */
import { type Instrumentation } from "next";

export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { serverEnv } = await import("./infrastructure/env");
  serverEnv();
};

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { captureRequestError } = await import("./infrastructure/capture-request-error");
  await captureRequestError(...args);
};
