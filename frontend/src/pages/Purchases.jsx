import { useState } from 'react';
import EditModal from '../components/EditModal.jsx';
import PurchaseForm from '../components/PurchaseForm.jsx';
import PurchaseTable from '../components/PurchaseTable.jsx';
import { usePurchases } from '../hooks/usePurchases.js';
import { exportExcel } from '../utils/excelExport.js';
import { useEffect } from 'react';
import { toast } from '../utils/toast.js';

function Purchases() {
  const [purchaseToEdit, setPurchaseToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    productId: '',
    companyId: '',
    quantity: '',
    totalAmount: '',
    date: ''
  });
  const {
    purchases,
    products,
    companies,
    filter,
    form,
    loading,
    saving,
    updatingId,
    deletingId,
    error,
    monthOptions,
    yearOptions,
    setFormField,
    setFilterField,
    addPurchase,
    editPurchase,
    removePurchase
  } = usePurchases();
  const selectedEditProduct = products.find((product) => product._id === editForm.productId);
  const selectedEditUnit = selectedEditProduct?.unit || 'piece';
  const handleExportExcel = () => {
    const rows = purchases.map((purchase) => ({
      Product: purchase.product?.name || 'N/A',
      Company: purchase.company?.name || 'N/A',
      Quantity: Number(purchase.quantity || 0),
      'Total Amount': Number(purchase.totalAmount || 0),
      Date: purchase.date ? String(purchase.date).slice(0, 10) : ''
    }));

    exportExcel({
      filePrefix: 'purchases-export',
      sheetName: 'Purchases',
      rows
    });

    toast.success('Purchases exported successfully');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterField(name, value);
  };

  const openEditModal = (purchase) => {
    setPurchaseToEdit(purchase);
    setEditForm({
      productId: purchase.product?._id || purchase.product || products[0]?._id || '',
      companyId: purchase.company?._id || purchase.company || companies[0]?._id || '',
      quantity: purchase.quantity || '',
      totalAmount: purchase.totalAmount || '',
      date: purchase.date ? String(purchase.date).slice(0, 10) : ''
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!purchaseToEdit || !editForm.productId || !editForm.companyId || !editForm.quantity || !editForm.totalAmount || !editForm.date) return;

    const quantity = Number(editForm.quantity);
    const totalAmount = Number(editForm.totalAmount);

    try {
      await editPurchase(purchaseToEdit._id, {
        productId: editForm.productId,
        companyId: editForm.companyId,
        quantity,
        totalAmount,
        date: editForm.date
      });
      setPurchaseToEdit(null);
      toast.success('Purchase updated successfully');
    } catch {
      toast.error('Failed to update purchase');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const handleDeletePurchase = async (purchase) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;

    try {
      await removePurchase(purchase._id);
      toast.success('Purchase deleted successfully');
    } catch {
      toast.error('Failed to delete purchase');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="surface-panel p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-heading">Purchases</h2>
            <p className="section-subtext">Enter supplier bills and track purchase totals.</p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={purchases.length === 0}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export Excel
          </button>
        </div>

        <PurchaseForm
          form={form}
          products={products}
          companies={companies}
          onChange={handleFormChange}
          onSubmit={addPurchase}
          saving={saving}
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label>
            <span className="field-label">Filter month</span>
            <select
              name="month"
              value={filter.month}
              onChange={handleFilterChange}
              className="select-control"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">Filter year</span>
            <select
              name="year"
              value={filter.year}
              onChange={handleFilterChange}
              className="select-control"
            >
              {yearOptions.map((value) => (
                <option key={value} value={value}>{value === 'All' ? 'All years' : String(value)}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <div className="mt-6">
          <PurchaseTable
            purchases={purchases}
            loading={loading}
            updatingId={updatingId}
            deletingId={deletingId}
            onEdit={openEditModal}
            onDelete={handleDeletePurchase}
          />
        </div>
      </div>

      <EditModal
        open={Boolean(purchaseToEdit)}
        title="Edit purchase"
        saving={updatingId === purchaseToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => setPurchaseToEdit(null)}
      >
        <label className="space-y-1.5">
          <span className="field-label">Product</span>
          <select
            name="productId"
            value={editForm.productId}
            onChange={handleEditChange}
            className="select-control"
          >
            <option value="">Select product</option>
            {[...products].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' })).map((product) => (
              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="field-label">Supplier</span>
          <select
            name="companyId"
            value={editForm.companyId}
            onChange={handleEditChange}
            className="select-control"
          >
            <option value="">Select company</option>
            {[...companies].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' })).map((company) => (
              <option key={company._id} value={company._id}>{company.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="field-label">Date</span>
          <input
            type="date"
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="field-label">Unit</span>
          <input
            value={selectedEditUnit}
            readOnly
            className="field-control"
          />
        </label>
        <label className="space-y-1.5">
          <span className="field-label">Quantity ({selectedEditUnit})</span>
          <input
            type="number"
            min="1"
            step="1"
            name="quantity"
            value={editForm.quantity}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="field-label">Total Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            name="totalAmount"
            value={editForm.totalAmount}
            onChange={handleEditChange}
            className="field-control"
          />
        </label>
      </EditModal>
    </div>
  );
}

export default Purchases;
