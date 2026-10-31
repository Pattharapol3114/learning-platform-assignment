// Shown whenever Team 06 data is unavailable (down / 404 / timeout / bad data).
// Deliberately calm styling: this is a degraded state, not a page failure.
export default function SubmissionFallback({ reason, onRetry, retrying = false }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">⚠️</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-amber-900">Submissions are unavailable right now</h3>
          <p className="mt-1 text-sm text-amber-800">
            The Submission service (Team 06) is temporarily not responding. The assignment details above are unaffected. Please try again later.
          </p>
          {reason && (
            <details className="mt-3 text-xs text-amber-700">
              <summary className="cursor-pointer select-none hover:text-amber-900">Technical details</summary>
              <code className="mt-1 block break-all rounded bg-amber-100/70 px-2 py-1 font-mono">{reason}</code>
            </details>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-medium text-amber-800 shadow-sm ring-1 ring-amber-300 hover:bg-amber-100 disabled:opacity-60"
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
}
