function ExpenseForm({ form, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 gap-4 items-end">
      <label className="space-y-1">
        <span className="field-label">Title</span>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Date</span>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Amount</span>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={onChange}
          min="0"
          step="0.01"
          className="field-control"
          required
        />
      </label>

      <button
        type="submit"
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
}

export default ExpenseForm;
