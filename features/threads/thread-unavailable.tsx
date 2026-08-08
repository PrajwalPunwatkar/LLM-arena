import Link from "next/link";

/**
 * The calm stand-in the thread page renders when Arcjet turns a request away
 * (features/threads/thread-protection.ts) — a generous rate limit tripped, or
 * a non-browser client denied outright. It borrows the notice shape from
 * `app/(shell)/error.tsx` but not its destructive red: being asked to slow
 * down is an expected backstop, not something breaking, so the tone stays
 * neutral. The one action that helps is reloading the same thread, offered as
 * a plain link because there is no client state here to reset.
 */
export const ThreadUnavailable = ({
  message,
  threadId,
}: {
  readonly message: string;
  readonly threadId: string;
}) => (
  <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:py-24">
    <div className="border-input bg-muted/40 rounded-xl border px-4 py-3.5">
      <p className="text-sm leading-relaxed">{message}</p>
      <Link
        href={`/t/${threadId}`}
        className="border-input hover:bg-muted mt-3 inline-block rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
      >
        Try again
      </Link>
    </div>
  </div>
);
