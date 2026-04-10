function EditModal({ open, title, children, saving, onSave, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="surface-panel w-full max-w-lg p-6">
        <h3 className="text-base font-semibold text-[color:var(--text-strong)]">{title}</h3>

        <div className="mt-4 space-y-4">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary h-10 px-3 py-2 text-sm"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="btn-primary h-10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
