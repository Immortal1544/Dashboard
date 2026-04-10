import CompanyForm from '../components/CompanyForm.jsx';
import CompanyTable from '../components/CompanyTable.jsx';
import EditModal from '../components/EditModal.jsx';
import { useCompanies } from '../hooks/useCompanies.js';
import { useEffect, useState } from 'react';
import { toast } from '../utils/toast.js';

function Companies() {
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const {
    companies,
    form,
    loading,
    saving,
    deletingId,
    updatingId,
    error,
    setFormField,
    addCompany,
    removeCompany,
    editCompany
  } = useCompanies();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleAddCompany = async (event) => {
    const ok = await addCompany(event);
    if (ok) {
      toast.success('Added successfully');
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await removeCompany(company._id);
      toast.success('Deleted successfully');
    } catch {
      toast.error('Something went wrong');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const openEditModal = (company) => {
    setCompanyToEdit(company);
    setEditName(company.name || '');
  };

  const handleEditSave = async () => {
    if (!companyToEdit || !editName.trim()) return;
    try {
      await editCompany(companyToEdit._id, { name: editName });
      setCompanyToEdit(null);
      setEditName('');
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
        <div className="mb-6">
          <h2 className="section-heading">Companies</h2>
          <p className="section-subtext">Manage companies linked to customers and sales.</p>
        </div>

        <CompanyForm form={form} onChange={handleChange} onSubmit={handleAddCompany} saving={saving} />

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <CompanyTable
          companies={companies}
          loading={loading}
          deletingId={deletingId}
          updatingId={updatingId}
          onDelete={handleDeleteCompany}
          onEdit={openEditModal}
        />
      </div>

      <EditModal
        open={Boolean(companyToEdit)}
        title="Edit company"
        saving={updatingId === companyToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => {
          setCompanyToEdit(null);
          setEditName('');
        }}
      >
        <label>
          <span className="field-label">Company name</span>
          <input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            className="field-control"
            required
          />
        </label>
      </EditModal>
    </div>
  );
}

export default Companies;
