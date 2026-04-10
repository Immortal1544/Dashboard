function CompanyForm({ form, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 gap-4 items-end">
      <label className="space-y-1 col-span-3">
        <span className="field-label">Company name</span>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>

      <button
        type="submit"
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Add Company'}
      </button>
    </form>
  );
}

export default CompanyForm;
