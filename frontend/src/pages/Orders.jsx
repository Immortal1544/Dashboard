import OrderForm from '../components/OrderForm.jsx';
import OrderFilters from '../components/OrderFilters.jsx';
import OrderTable from '../components/OrderTable.jsx';
import EditModal from '../components/EditModal.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { useEffect, useState } from 'react';
import { exportExcel } from '../utils/excelExport.js';
import { toast } from '../utils/toast.js';

function Orders() {
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    productId: '',
    customerId: '',
    orderDate: '',
    quantity: '',
    totalAmount: '',
    paymentStatus: 'Pending',
    paidAmount: ''
  });
  const {
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
  } = useOrders();
  const selectedEditProduct = products.find((product) => product._id === editForm.productId);
  const selectedEditUnit = selectedEditProduct?.unit || 'piece';
  const editTotalAmount = Number(editForm.totalAmount || 0);
  const normalizedEditPaidAmount =
    editForm.paymentStatus === 'Paid'
      ? editTotalAmount
      : editForm.paymentStatus === 'Pending'
        ? 0
        : Number(editForm.paidAmount || 0);
  const editRemainingAmount = Math.max(editTotalAmount - normalizedEditPaidAmount, 0);

  const handleExportExcel = () => {
    const rows = orders.map((order) => {
      const totalAmount = Number(order.totalAmount || 0);
      const paidAmount = Number(order.paidAmount || 0);
      const remainingAmount = Number(order.remainingAmount ?? Math.max(totalAmount - paidAmount, 0));
      const paymentStatus =
        order.paymentStatus ||
        (remainingAmount <= 0 && totalAmount > 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending');

      return {
        Product: order.product?.name || 'N/A',
        Customer: order.customer?.name || 'Unknown',
        Quantity: Number(order.quantity || 0),
        'Total Amount': totalAmount,
        'Payment Status': paymentStatus,
        'Paid Amount': paidAmount,
        'Remaining Amount': remainingAmount,
        Date: order.orderDate ? String(order.orderDate).slice(0, 10) : ''
      };
    });

    exportExcel({
      filePrefix: 'sales-export',
      sheetName: 'Sales',
      rows
    });

    toast.success('Sales exported successfully');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterField(name, value);
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await removeOrder(order._id);
      toast.success('Sale deleted successfully');
    } catch {
      toast.error('Failed to delete sale');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const openEditModal = (order) => {
    const total = Number(order.totalAmount || 0);
    const existingPaid = Number(order.paidAmount || 0);
    const existingRemaining = Number(order.remainingAmount || Math.max(total - existingPaid, 0));
    const derivedStatus =
      order.paymentStatus ||
      (existingRemaining <= 0 && total > 0 ? 'Paid' : existingPaid > 0 ? 'Partial' : 'Pending');

    setOrderToEdit(order);
    setEditForm({
      productId: order.product?._id || order.product || products[0]?._id || '',
      customerId: order.customer?._id || order.customer || customers[0]?._id || '',
      orderDate: order.orderDate ? String(order.orderDate).slice(0, 10) : '',
      quantity: order.quantity || 1,
      totalAmount: total,
      paymentStatus: derivedStatus,
      paidAmount: derivedStatus === 'Partial' ? existingPaid : ''
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (
      !orderToEdit ||
      !editForm.productId ||
      !editForm.customerId ||
      !editForm.orderDate ||
      !editForm.quantity ||
      !editForm.totalAmount ||
      !editForm.paymentStatus
    ) {
      return;
    }

    if (editForm.paymentStatus === 'Partial' && (editForm.paidAmount === '' || editForm.paidAmount === undefined)) {
      return;
    }

    try {
      await editOrder(orderToEdit._id, {
        productId: editForm.productId,
        customerId: editForm.customerId,
        orderDate: editForm.orderDate,
        quantity: Number(editForm.quantity),
        totalAmount: Number(editForm.totalAmount),
        paymentStatus: editForm.paymentStatus,
        paidAmount: editForm.paymentStatus === 'Partial' ? Number(editForm.paidAmount || 0) : undefined
      });
      setOrderToEdit(null);
      toast.success('Sale updated successfully');
    } catch {
      toast.error('Failed to update sale');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="surface-panel p-6">
        <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-heading">Sales</h2>
            <p className="section-subtext">Track new sales and billing history.</p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={orders.length === 0}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export Excel
          </button>
        </div>

        <OrderForm form={form} customers={customers} products={products} onChange={handleFormChange} onSubmit={addOrder} saving={saving} />

        <OrderFilters
          filter={filter}
          monthOptions={monthOptions}
          yearOptions={yearOptions}
          customers={customers}
          onChange={handleFilterChange}
        />

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <OrderTable
          orders={orders}
          loading={loading}
          deletingId={deletingId}
          updatingId={updatingId}
          onDelete={handleDeleteOrder}
          onEdit={openEditModal}
        />
      </div>

      <EditModal
        open={Boolean(orderToEdit)}
        title="Edit sale"
        saving={updatingId === orderToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => setOrderToEdit(null)}
      >
        <label>
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
        <label>
          <span className="field-label">Customer</span>
          <select
            name="customerId"
            value={editForm.customerId}
            onChange={handleEditChange}
            className="select-control"
          >
            <option value="">Select customer</option>
            {[...customers].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' })).map((customer) => (
              <option key={customer._id} value={customer._id}>{customer.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Order Date</span>
          <input
            type="date"
            name="orderDate"
            value={editForm.orderDate}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
        <label>
          <span className="field-label">Unit</span>
          <input
            value={selectedEditUnit}
            readOnly
            className="field-control"
          />
        </label>
        <label>
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
        <label>
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
        <label>
          <span className="field-label">Payment Status</span>
          <select
            name="paymentStatus"
            value={editForm.paymentStatus}
            onChange={handleEditChange}
            className="select-control"
          >
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </label>

        {editForm.paymentStatus === 'Partial' && (
          <label>
            <span className="field-label">Paid Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              max={editForm.totalAmount || 0}
              name="paidAmount"
              value={editForm.paidAmount}
              onChange={handleEditChange}
              className="field-control"
              required
            />
          </label>
        )}

        <label className="space-y-2">
          <span className="field-label">Remaining Amount</span>
          <input
            value={editRemainingAmount.toFixed(2)}
            readOnly
            className="field-control"
          />
        </label>
      </EditModal>
    </div>
  );
}

export default Orders;
