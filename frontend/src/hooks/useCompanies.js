import { useCallback, useEffect, useState } from 'react';
import { createCompany, deleteCompany, fetchCompanies, updateCompany } from '../services/api.js';

const initialForm = { name: '' };

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCompany = async (event) => {
    if (event) event.preventDefault();
    if (!form.name.trim()) return false;

    setSaving(true);
    setError('');
    try {
      await createCompany(form);
      setForm(initialForm);
      await loadCompanies();
      return true;
    } catch (createError) {
      setError(createError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const removeCompany = async (companyId) => {
    setDeletingId(companyId);
    setError('');
    try {
      await deleteCompany(companyId);
      await loadCompanies();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  const editCompany = async (companyId, payload) => {
    setUpdatingId(companyId);
    setError('');
    try {
      await updateCompany(companyId, payload);
      await loadCompanies();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  return {
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
  };
}
