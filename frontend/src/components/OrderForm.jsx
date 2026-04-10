function OrderForm({ form, customers, products, onChange, onSubmit, saving }) {
  const sortedProducts = [...products].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));
  const sortedCustomers = [...customers].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));
  const selectedProduct = products.find((product) => product._id === form.productId);
  const selectedUnit = selectedProduct?.unit || 'piece';
  const totalAmountValue = Number(form.totalAmount || 0);
  const normalizedPaidAmount =
    form.paymentStatus === 'Paid'
      ? totalAmountValue
      : form.paymentStatus === 'Pending'
        ? 0
        : Number(form.paidAmount || 0);
  const remainingAmount = Math.max(totalAmountValue - normalizedPaidAmount, 0);

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
        <span className="field-label">Customer</span>
        <select
          name="customerId"
          value={form.customerId}
          onChange={onChange}
          className="select-control"
        >
          <option value="">Select customer</option>
          {sortedCustomers.map((customer) => (
            <option key={customer._id} value={customer._id}>{customer.name}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="field-label">Order Date</span>
        <input
          type="date"
          name="orderDate"
          value={form.orderDate}
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
          name="quantity"
          value={form.quantity}
          onChange={onChange}
          min="1"
          step="1"
          className="field-control"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Total Amount</span>
        <input
          type="number"
          name="totalAmount"
          value={form.totalAmount}
          onChange={onChange}
          min="0"
          step="0.01"
          className="field-control"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="field-label">Payment Status</span>
        <select
          name="paymentStatus"
          value={form.paymentStatus}
          onChange={onChange}
          className="select-control"
        >
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </label>

      {form.paymentStatus === 'Partial' && (
        <label className="space-y-1">
          <span className="field-label">Paid Amount</span>
          <input
            type="number"
            name="paidAmount"
            value={form.paidAmount}
            onChange={onChange}
            min="0"
            step="0.01"
            max={form.totalAmount || 0}
            className="field-control"
            required
          />
        </label>
      )}

      <label className="space-y-1">
        <span className="field-label">Remaining Amount</span>
        <input
          type="number"
          value={remainingAmount.toFixed(2)}
          readOnly
          className="field-control"
        />
      </label>

      <button
        type="submit"
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Add Sale'}
      </button>
    </form>
  );
}

export default OrderForm;
