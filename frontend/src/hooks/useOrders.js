import { useCallback, useEffect, useState } from 'react';
import { createSale, deleteOrder, fetchCustomers, fetchProducts, fetchSales, updateOrder } from '../services/api.js';
import { MONTH_OPTIONS } from '../utils/months.js';

export const monthOptions = MONTH_OPTIONS;
export const yearOptions = ['All', new Date().getFullYear() - 1, new Date().getFullYear()];

const initialFilter = { month: 'All', year: 'All', customerId: 'All' };
const initialForm = {
  productId: '',
  customerId: '',
  orderDate: '',
  quantity: '',
  totalAmount: '',
  paymentStatus: 'Pending',
  paidAmount: ''
};

const buildQuery = (filter) => {
  const query = {};
  if (filter.month !== 'All') query.month = Number(filter.month);
  if (filter.year !== 'All') query.year = filter.year;
  if (filter.customerId !== 'All') query.customerId = filter.customerId;
  return query;
};

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      const [fetchedCustomers, fetchedProducts] = await Promise.all([
        fetchCustomers(),
        fetchProducts()
      ]);
      setCustomers(fetchedCustomers);
      setProducts(fetchedProducts);
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = buildQuery(filter);
      const data = await fetchSales(query);
      setOrders(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadCustomers();
    loadOrders();
  }, [loadCustomers, loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [filter, loadOrders]);

  const setFormField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setFilterField = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  const addOrder = async (event) => {
    if (event) event.preventDefault();
    if (!form.productId || !form.customerId || !form.orderDate || !form.quantity || !form.totalAmount || !form.paymentStatus) return;
    if (form.paymentStatus === 'Partial' && (form.paidAmount === '' || form.paidAmount === undefined)) return;

    setSaving(true);
    setError('');

    try {
      const quantity = Number(form.quantity);
      const totalAmount = Number(form.totalAmount);
      const paidAmount =
        form.paymentStatus === 'Partial'
          ? Number(form.paidAmount || 0)
          : undefined;

      await createSale({
        productId: form.productId,
        customerId: form.customerId,
        orderDate: form.orderDate,
        quantity,
        totalAmount,
        paymentStatus: form.paymentStatus,
        paidAmount
      });
      resetForm();
      await loadOrders();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeOrder = async (orderId) => {
    setDeletingId(orderId);
    setError('');
    try {
      await deleteOrder(orderId);
      await loadOrders();
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    } finally {
      setDeletingId('');
    }
  };

  const editOrder = async (orderId, payload) => {
    setUpdatingId(orderId);
    setError('');
    try {
      await updateOrder(orderId, payload);
      await loadOrders();
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    } finally {
      setUpdatingId('');
    }
  };

  return {
    orders,
    customers,
    products,
    filter,
    form,
    loading,
    saving,
    deletingId,
    updatingId,
    error,
    monthOptions,
    yearOptions,
    setFormField,
    setFilterField,
    addOrder,
    removeOrder,
    editOrder
  };
}
