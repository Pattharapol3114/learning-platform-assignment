export default function ErrorState({ title = "Something went wrong", message, onRetry, children }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl">⚠️</div>
      <h3 className="text-lg font-semibold text-rose-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-rose-700">{message}</p>}
      {children}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}
