import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  success: { ring: "ring-emerald-200", icon: "✓", iconBg: "bg-emerald-100 text-emerald-700" },
  error: { ring: "ring-rose-200", icon: "!", iconBg: "bg-rose-100 text-rose-700" },
  info: { ring: "ring-sky-200", icon: "i", iconBg: "bg-sky-100 text-sky-700" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { variant = "info", title, duration = 4000 } = {}) => {
      const id = ++nextId.current;
      setToasts((list) => [...list, { id, message, variant, title }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message, opts) => show(message, { ...opts, variant: "success" }),
      error: (message, opts) => show(message, { ...opts, variant: "error" }),
      info: (message, opts) => show(message, { ...opts, variant: "info" }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={`toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ${style.ring}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.iconBg}`}>
                {style.icon}
              </span>
              <div className="min-w-0 flex-1">
                {toast.title && <p className="font-semibold text-slate-900">{toast.title}</p>}
                <p className="text-sm text-slate-600">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
