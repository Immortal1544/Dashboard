import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatQuantityWithUnit } from '../utils/productUnits.js';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

const statusClasses = {
  Paid: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  Pending: 'border-rose-200 bg-rose-100 text-rose-700',
  Partial: 'border-amber-200 bg-amber-100 text-amber-700'
};

const resolvePaymentView = (order) => {
  const total = Number(order.totalAmount || 0);
  const paid = Number(order.paidAmount || 0);
  const remaining = Number.isFinite(order.remainingAmount)
    ? Number(order.remainingAmount || 0)
    : Math.max(total - paid, 0);

  let status = order.paymentStatus;
  if (!status) {
    if (remaining <= 0 && total > 0) status = 'Paid';
    else if (paid > 0) status = 'Partial';
    else status = 'Pending';
  }

  return {
    total,
    paid,
    remaining,
    status
  };
};

function OrderTable({ orders, loading, deletingId, updatingId, onDelete, onEdit }) {
  const rows = useMemo(
    () =>
      orders.map((order) => {
        const payment = resolvePaymentView(order);
        return {
          ...order,
          productName: order.product?.name || 'N/A',
          customerName: order.customer?.name || 'Unknown',
          orderDateValue: order.orderDate ? new Date(order.orderDate).getTime() : 0,
          orderDateText: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-',
          quantityText: formatQuantityWithUnit(order.quantity || 1, order.product?.unit),
          totalValue: payment.total,
          paidValue: payment.paid,
          remainingValue: payment.remaining,
          paymentStatusResolved: payment.status
        };
      }),
    [orders]
  );

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.productName}</span>
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.customerName}</span>
    },
    {
      key: 'orderDateText',
      label: 'Order Date',
      sortable: true,
      sortAccessor: (row) => row.orderDateValue,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.orderDateText}</span>
    },
    {
      key: 'quantityText',
      label: 'Qty',
      sortable: false,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.quantityText}</span>
    },
    {
      key: 'totalValue',
      label: 'Total Amount',
      sortable: true,
      sortAccessor: (row) => row.totalValue,
      render: (row) => <span className="font-medium text-[color:var(--accent-blue)]">{formatCurrency(row.totalValue)}</span>
    },
    {
      key: 'paidValue',
      label: 'Paid Amount',
      sortable: true,
      sortAccessor: (row) => row.paidValue,
      render: (row) => <span className="text-[color:var(--text-soft)]">{formatCurrency(row.paidValue)}</span>
    },
    {
      key: 'remainingValue',
      label: 'Remaining Amount',
      sortable: true,
      sortAccessor: (row) => row.remainingValue,
      render: (row) => <span className="text-[color:var(--text-soft)]">{formatCurrency(row.remainingValue)}</span>
    },
    {
      key: 'paymentStatusResolved',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[row.paymentStatusResolved] || statusClasses.Pending}`}>
          {row.paymentStatusResolved}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="space-x-2 text-right">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="btn-icon disabled:opacity-50"
            disabled={updatingId === row._id}
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="btn-icon disabled:opacity-50"
            disabled={deletingId === row._id}
            title="Delete"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row._id}
      loading={loading}
      emptyText="No data available"
      enableSearch
      searchPlaceholder="Search..."
      searchKeys={['productName', 'customerName', 'paymentStatusResolved']}
      initialSort={{ key: 'orderDateText', direction: 'desc' }}
    />
  );
}

export default OrderTable;
