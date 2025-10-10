import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { X } from "lucide-react"; // Import close icon

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, tone = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tone, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timerId = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      return { id: toast.id, timerId };
    });

    return () => {
      timers.forEach(({ timerId }) => clearTimeout(timerId));
    };
  }, [toasts, removeToast]);

  // Keep both `push` and `showToast` in the context for backward compatibility
  const showToast = push;

  return (
    <ToastCtx.Provider value={{ push, showToast }}>
      {children}
      <div
        className="fixed top-4 right-4 space-y-2 z-50 max-w-md"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`relative px-4 py-3 rounded-xl shadow-lg border ${
              t.tone === "error"
                ? "bg-rose-600 text-white border-rose-700"
                : t.tone === "warning"
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-slate-900 text-white border-slate-800"
            } flex items-center justify-between`}
          >
            <span className="truncate">{t.msg}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-white hover:text-slate-300 focus:outline-none"
            >
              <X className="w-4 h-4" aria-label="Close" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
