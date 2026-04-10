import { useCallback, useEffect, useState } from 'react';
import { createExpense, deleteExpense, fetchBusinessOverviewAnalytics, fetchExpenses, updateExpense } from '../services/api.js';
import { MONTH_OPTIONS } from '../utils/months.js';

export const monthOptions = MONTH_OPTIONS;
export const yearOptions = ['All', new Date().getFullYear() - 1, new Date().getFullYear()];

const defaultFilter = { month: 'All', year: 'All' };
const initialForm = { title: '', date: '', amount: '' };

const buildQuery = (filter) => {
  const query = {};
  if (filter.month !== 'All') query.month = Number(filter.month);
  if (filter.year !== 'All') query.year = filter.year;
  return query;
};

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [financialOverview, setFinancialOverview] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    profit: 0
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const query = buildQuery(filter);
      const [data, overview] = await Promise.all([
        fetchExpenses(query),
        fetchBusinessOverviewAnalytics(query)
      ]);
      setExpenses(data);
      setFinancialOverview({
        totalSales: Number(overview?.totalSales || 0),
        totalPurchases: Number(overview?.totalPurchases || 0),
        totalExpenses: Number(overview?.totalExpenses || 0),
        profit: Number(overview?.profit || 0)
      });
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setFilterField = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  const addExpense = async (event) => {
    if (event) event.preventDefault();
    if (!form.title || !form.date || !form.amount) return;

    setSaving(true);
    setError('');

    try {
      await createExpense({ title: form.title, date: form.date, amount: Number(form.amount) });
      resetForm();
      await loadExpenses();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expenseId) => {
    setDeletingId(expenseId);
    setError('');
    try {
      await deleteExpense(expenseId);
      await loadExpenses();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  const editExpense = async (expenseId, payload) => {
    setUpdatingId(expenseId);
    setError('');
    try {
      await updateExpense(expenseId, payload);
      await loadExpenses();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  return {
    expenses,
    filter,
    form,
    loading,
    saving,
    deletingId,
    updatingId,
    error,
    financialOverview,
    monthOptions,
    yearOptions,
    setFormField,
    setFilterField,
    addExpense,
    removeExpense,
    editExpense
  };
}
