import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatQuantityWithUnit } from '../utils/productUnits.js';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

function PurchaseTable({ purchases, loading, updatingId, deletingId, onEdit, onDelete }) {
  const rows = useMemo(
    () =>
      purchases.map((purchase) => ({
        ...purchase,
        productName: purchase.product?.name || 'N/A',
        companyName: purchase.company?.name || 'N/A',
        dateValue: purchase.date ? new Date(purchase.date).getTime() : 0,
        dateText: purchase.date ? new Date(purchase.date).toLocaleDateString() : '-',
        quantityText: formatQuantityWithUnit(purchase.quantity, purchase.product?.unit),
        totalAmountValue: Number(purchase.totalAmount || 0)
      })),
    [purchases]
  );

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.productName}</span>
    },
    {
      key: 'companyName',
      label: 'Supplier',
      sortable: true,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.companyName}</span>
    },
    {
      key: 'dateText',
      label: 'Date',
      sortable: true,
      sortAccessor: (row) => row.dateValue,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.dateText}</span>
    },
    {
      key: 'quantityText',
      label: 'Qty',
      sortable: false,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.quantityText}</span>
    },
    {
      key: 'totalAmountValue',
      label: 'Total',
      sortable: true,
      sortAccessor: (row) => row.totalAmountValue,
      render: (row) => <span className="font-medium text-[color:var(--accent-blue)]">{formatCurrency(row.totalAmountValue)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => onEdit(row)}
            disabled={updatingId === row._id || deletingId === row._id}
            className="btn-icon disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            disabled={updatingId === row._id || deletingId === row._id}
            className="btn-icon disabled:cursor-not-allowed disabled:opacity-60"
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
      searchPlaceholder="Search purchases by product or supplier"
      searchKeys={['productName', 'companyName']}
      initialSort={{ key: 'dateText', direction: 'desc' }}
    />
  );
}

export default PurchaseTable;
