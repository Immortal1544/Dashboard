function PurchaseForm({ form, products, companies, onChange, onSubmit, saving }) {
  const sortedProducts = [...products].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));
  const sortedCompanies = [...companies].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));
  const selectedProduct = products.find((product) => product._id === form.productId);
  const selectedUnit = selectedProduct?.unit || 'piece';

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-4 gap-4 items-end">
      <label className="space-y-1">
        <span className="field-label">Product</span>
        <select
          name="productId"
          value={form.productId}
          onChange={onChange}
          className="select-control"
        >
          <option value="">Select product</option>
          {sortedProducts.map((product) => (
            <option key={product._id} value={product._id}>{product.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="field-label">Supplier</span>
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
        <span className="field-label">Unit</span>
        <input
          value={selectedUnit}
          readOnly
          className="field-control"
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Quantity ({selectedUnit})</span>
        <input
          type="number"
          min="1"
          step="1"
          name="quantity"
          value={form.quantity}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Total Amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          name="totalAmount"
          value={form.totalAmount}
          onChange={onChange}
          className="field-control"
          required
        />
      </label>

      <button
        type="submit"
        className="btn-primary col-span-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Add Purchase'}
      </button>
    </form>
  );
}

export default PurchaseForm;
