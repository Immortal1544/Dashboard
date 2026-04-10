import { useEffect, useState } from 'react';
import { toastEventName } from '../utils/toast.js';

const TOAST_STYLES = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  error: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
};

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const payload = event.detail;
      if (!payload?.id) return;

      setToasts((prev) => [...prev, payload]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toastItem) => toastItem.id !== payload.id));
      }, payload.duration || 3000);
    };

    window.addEventListener(toastEventName, handleToast);
    return () => window.removeEventListener(toastEventName, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${TOAST_STYLES[toastItem.type] || TOAST_STYLES.warning}`}
        >
          {toastItem.message}
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
