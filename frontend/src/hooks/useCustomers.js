import { useCallback, useEffect, useState } from 'react';
import { createCustomer, deleteCustomer, fetchCompanies, fetchCustomers, updateCustomer } from '../services/api.js';

const initialForm = { name: '', phone: '', companyId: '' };

export function useCustomers() {
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('All');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const loadCompanies = useCallback(async () => {
    const data = await fetchCompanies();
    setCompanies(data);
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (companyFilter !== 'All') {
        query.companyId = companyFilter;
      }
      const data = await fetchCustomers(query);
      setCustomers(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [companyFilter]);

  useEffect(() => {
    loadCompanies().catch((fetchError) => setError(fetchError.message));
  }, [loadCompanies]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomer = async (event) => {
    if (event) event.preventDefault();
    if (!form.name.trim()) return false;

    setSaving(true);
    setError('');

    try {
      await createCustomer({
        name: form.name,
        phone: form.phone,
        companyId: form.companyId || undefined
      });
      setForm(initialForm);
      await loadCustomers();
      return true;
    } catch (createError) {
      setError(createError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setCustomerCompanyFilter = (value) => {
    setCompanyFilter(value);
  };

  const removeCustomer = async (customerId) => {
    setDeletingId(customerId);
    setError('');
    try {
      await deleteCustomer(customerId);
      await loadCustomers();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  const editCustomer = async (customerId, payload) => {
    setUpdatingId(customerId);
    setError('');
    try {
      await updateCustomer(customerId, payload);
      await loadCustomers();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  return {
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
  };
}
