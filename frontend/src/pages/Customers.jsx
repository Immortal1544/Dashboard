import CustomerForm from '../components/CustomerForm.jsx';
import CustomerTable from '../components/CustomerTable.jsx';
import EditModal from '../components/EditModal.jsx';
import { useCustomers } from '../hooks/useCustomers.js';
import { useEffect, useState } from 'react';
import { toast } from '../utils/toast.js';

function Customers() {
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', companyId: '' });
  const {
    companies,
    customers,
    companyFilter,
    form,
    loading,
    saving,
    deletingId,
    updatingId,
    error,
    setFormField,
    setCustomerCompanyFilter,
    addCustomer,
    removeCustomer,
    editCustomer
  } = useCustomers();
  const sortedCompanies = [...companies].sort((a, b) =>
    String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' })
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleAddCustomer = async (event) => {
    const ok = await addCustomer(event);
    if (ok) toast.success('Added successfully');
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await removeCustomer(customer._id);
      toast.success('Deleted successfully');
    } catch {
      toast.error('Something went wrong');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const openEditModal = (customer) => {
    setCustomerToEdit(customer);
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      companyId: customer.company?._id || customer.company || companies[0]?._id || ''
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!customerToEdit || !editForm.name.trim()) return;
    try {
      await editCustomer(customerToEdit._id, {
        name: editForm.name,
        phone: editForm.phone,
        companyId: editForm.companyId || undefined
      });
      setCustomerToEdit(null);
      toast.success('Updated successfully');
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
        <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-heading">Customers</h2>
            <p className="section-subtext">Add and manage customer records.</p>
          </div>
          <label>
            <span className="field-label">Filter by company</span>
            <div className="w-48">
              <select
                name="companyFilter"
                value={companyFilter}
                onChange={(event) => setCustomerCompanyFilter(event.target.value)}
                className="field-control w-full"
              >
                <option value="All">All companies</option>
                {sortedCompanies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <CustomerForm form={form} companies={companies} onChange={handleChange} onSubmit={handleAddCustomer} saving={saving} />

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <CustomerTable
          customers={customers}
          loading={loading}
          deletingId={deletingId}
          updatingId={updatingId}
          onDelete={handleDeleteCustomer}
          onEdit={openEditModal}
        />
      </div>

      <EditModal
        open={Boolean(customerToEdit)}
        title="Edit customer"
        saving={updatingId === customerToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => setCustomerToEdit(null)}
      >
        <label>
          <span className="field-label">Name</span>
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
          <span className="field-label">Phone</span>
          <input
            name="phone"
            value={editForm.phone}
            onChange={handleEditChange}
            className="field-control"
          />
        </label>
      </EditModal>
    </div>
  );
}

export default Customers;
