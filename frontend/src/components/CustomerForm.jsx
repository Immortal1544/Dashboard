function CustomerForm({ form, companies, onChange, onSubmit, saving }) {
  const sortedCompanies = [...companies].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 gap-4 items-end">
      <label className="space-y-1">
        <span className="field-label">Name</span>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>
      <label className="space-y-1">
        <span className="field-label">Company</span>
        <select
          name="companyId"
          value={form.companyId}
          onChange={onChange}
          className="select-control"
        >
          <option value="">Select company</option>
          {sortedCompanies.map((company) => (
            <option key={company._id} value={company._id}>{company.name}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="field-label">Phone</span>
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          className="field-control"
        />
      </label>
      <button
        type="submit"
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Add Customer'}
      </button>
    </form>
  );
}

export default CustomerForm;
