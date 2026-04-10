import { useCallback, useEffect, useState } from 'react';
import {
  createPurchase,
  deletePurchase,
  fetchCompanies,
  fetchProducts,
  fetchPurchases,
  updatePurchase
} from '../services/api.js';
import { MONTH_OPTIONS } from '../utils/months.js';

const monthOptions = MONTH_OPTIONS;
const yearOptions = ['All', new Date().getFullYear() - 1, new Date().getFullYear()];

const initialFilter = { month: 'All', year: 'All' };
const initialForm = {
  productId: '',
  companyId: '',
  quantity: '',
  totalAmount: '',
  date: ''
};

const buildQuery = (filter) => {
  const query = {};
  if (filter.month !== 'All') query.month = Number(filter.month);
  if (filter.year !== 'All') query.year = filter.year;
  return query;
};

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadMetadata = useCallback(async () => {
    try {
      const [fetchedProducts, fetchedCompanies] = await Promise.all([
        fetchProducts(),
        fetchCompanies()
      ]);
      setProducts(fetchedProducts);
      setCompanies(fetchedCompanies);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }, []);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPurchases(buildQuery(filter));
      setPurchases(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadMetadata();
    loadPurchases();
  }, [loadMetadata, loadPurchases]);

  useEffect(() => {
    loadPurchases();
  }, [filter, loadPurchases]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setFilterField = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const addPurchase = async (event) => {
    if (event) event.preventDefault();
    if (!form.productId || !form.companyId || !form.quantity || !form.totalAmount || !form.date) return;

    setSaving(true);
    setError('');

    try {
      const quantity = Number(form.quantity);
      const totalAmount = Number(form.totalAmount);

      await createPurchase({
        productId: form.productId,
        companyId: form.companyId,
        quantity,
        totalAmount,
        date: form.date
      });

      setForm(initialForm);

      await loadPurchases();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const editPurchase = async (purchaseId, payload) => {
    setUpdatingId(purchaseId);
    setError('');

    try {
      await updatePurchase(purchaseId, payload);
      await loadPurchases();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  const removePurchase = async (purchaseId) => {
    setDeletingId(purchaseId);
    setError('');

    try {
      await deletePurchase(purchaseId);
      await loadPurchases();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  return {
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
  };
}
