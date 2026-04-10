function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirming = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-6 shadow-lg">
        <h3 className="text-base font-semibold text-[color:var(--text-strong)]">{title}</h3>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary h-10 px-3 py-2 text-sm"
            disabled={confirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-lg bg-[color:var(--accent-red)] px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={confirming}
          >
            {confirming ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
