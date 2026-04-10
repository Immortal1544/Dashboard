import { useCallback, useEffect, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  fetchCompanies,
  fetchInventoryAnalytics,
  fetchProducts,
  updateProduct
} from '../services/api.js';

const initialForm = { name: '', companyId: '', unit: '' };

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({ totalProducts: 0, lowStockCount: 0 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fetchedProducts, fetchedCompanies, inventory] = await Promise.all([
        fetchProducts(),
        fetchCompanies(),
        fetchInventoryAnalytics()
      ]);

      setProducts(inventory?.items || fetchedProducts);
      setCompanies(fetchedCompanies);
      setInventorySummary(inventory?.summary || { totalProducts: fetchedProducts.length, lowStockCount: 0 });
      setLowStockItems(inventory?.lowStockItems || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addProduct = async (event) => {
    if (event) event.preventDefault();
    if (!form.name.trim() || !form.companyId || !form.unit) return false;

    setSaving(true);
    setError('');

    try {
      await createProduct({
        name: form.name,
        companyId: form.companyId,
        unit: form.unit
      });

      setForm(initialForm);
      await loadData();
      return true;
    } catch (createError) {
      setError(createError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const editProduct = async (productId, payload) => {
    setUpdatingId(productId);
    setError('');
    try {
      await updateProduct(productId, payload);
      await loadData();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  const removeProduct = async (productId) => {
    setDeletingId(productId);
    setError('');
    try {
      await deleteProduct(productId);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  return {
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
  };
}
