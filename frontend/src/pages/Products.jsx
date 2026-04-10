import { useState } from 'react';
import EditModal from '../components/EditModal.jsx';
import ProductForm from '../components/ProductForm.jsx';
import ProductTable from '../components/ProductTable.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { PRODUCT_UNIT_OPTIONS } from '../utils/productUnits.js';
import { useEffect } from 'react';
import { toast } from '../utils/toast.js';

function Products() {
  const [productToEdit, setProductToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', companyId: '', unit: 'piece' });
  const {
    products,
    companies,
    inventorySummary,
    lowStockItems,
    form,
    loading,
    saving,
    updatingId,
    deletingId,
    error,
    setFormField,
    addProduct,
    editProduct,
    removeProduct
  } = useProducts();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleAddProduct = async (event) => {
    const ok = await addProduct(event);
    if (ok) toast.success('Added successfully');
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setEditForm({
      name: product.name || '',
      companyId: product.company?._id || product.company || companies[0]?._id || '',
      unit: product.unit || 'piece'
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!productToEdit || !editForm.name.trim() || !editForm.companyId || !editForm.unit) return;

    try {
      await editProduct(productToEdit._id, {
        name: editForm.name,
        companyId: editForm.companyId,
        unit: editForm.unit
      });
      setProductToEdit(null);
      toast.success('Updated successfully');
    } catch {
      toast.error('Something went wrong');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;

    try {
      await removeProduct(product._id);
      toast.success('Deleted successfully');
    } catch {
      toast.error('Something went wrong');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  useEffect(() => {
    if (error) toast.error('Something went wrong');
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="surface-panel p-6">
        <div className="mb-6">
          <h2 className="section-heading">Products</h2>
          <p className="section-subtext">Create and manage saleable products by company.</p>
        </div>

        <ProductForm
          form={form}
          companies={companies}
          onChange={handleChange}
          onSubmit={handleAddProduct}
          saving={saving}
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="surface-panel">
            <p className="field-label mb-0">Tracked Products</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--text-strong)]">{inventorySummary.totalProducts}</p>
          </div>
          <div className="surface-panel">
            <p className="field-label mb-0">Low Stock Alerts</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--accent-red)]">{inventorySummary.lowStockCount}</p>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            Low stock detected for: {lowStockItems.slice(0, 5).map((item) => item.name).join(', ')}
            {lowStockItems.length > 5 ? ` and ${lowStockItems.length - 5} more` : ''}.
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <div className="mt-6">
          <ProductTable
            products={products}
            loading={loading}
            updatingId={updatingId}
            deletingId={deletingId}
            onEdit={openEditModal}
            onDelete={handleDeleteProduct}
          />
        </div>
      </div>

      <EditModal
        open={Boolean(productToEdit)}
        title="Edit product"
        saving={updatingId === productToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => setProductToEdit(null)}
      >
        <label>
          <span className="field-label">Product Name</span>
          <input
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>

        <label>
          <span className="field-label">Company</span>
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

        <label>
          <span className="field-label">Unit</span>
          <select
            name="unit"
            value={editForm.unit}
            onChange={handleEditChange}
            className="select-control"
          >
            {PRODUCT_UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </label>
      </EditModal>
    </div>
  );
}

export default Products;
