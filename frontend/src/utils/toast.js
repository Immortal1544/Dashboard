const TOAST_EVENT = 'app:toast';

export const emitToast = (type, message, duration = 3000) => {
  if (!message) return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        message,
        duration
      }
    })
  );
};

export const toast = {
  success: (message, duration) => emitToast('success', message, duration),
  error: (message, duration) => emitToast('error', message, duration),
  warning: (message, duration) => emitToast('warning', message, duration)
};

export const toastEventName = TOAST_EVENT;
