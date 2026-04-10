import { useMemo } from 'react';
import { formatQuantityWithUnit } from '../utils/productUnits.js';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

function ProductTable({ products, loading, updatingId, deletingId, onEdit, onDelete }) {
  const rows = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        companyName: product.company?.name || 'N/A',
        purchasedText: formatQuantityWithUnit(product.purchasedQuantity ?? 0, product.unit),
        soldText: formatQuantityWithUnit(product.soldQuantity ?? 0, product.unit),
        stockText: formatQuantityWithUnit(product.stock ?? 0, product.unit),
        stockValue: Number(product.stock ?? 0)
      })),
    [products]
  );

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.name}</span>
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.companyName}</span>
    },
    {
      key: 'purchasedText',
      label: 'Purchased',
      sortable: false,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.purchasedText}</span>
    },
    {
      key: 'soldText',
      label: 'Sold',
      sortable: false,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.soldText}</span>
    },
    {
      key: 'stockValue',
      label: 'Stock',
      sortable: true,
      sortAccessor: (row) => row.stockValue,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.stockText}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortAccessor: (row) => (row.lowStock ? 0 : 1),
      render: (row) =>
        row.lowStock ? (
          <span className="rounded-full border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/10 px-2 py-1 text-xs text-[color:var(--accent-red)]">
            Low Stock
          </span>
        ) : (
          <span className="rounded-full border border-[color:var(--accent-green)] bg-[color:var(--accent-green)]/10 px-2 py-1 text-xs text-[color:var(--accent-green)]">
            In Stock
          </span>
        )
    },
    {
      key: 'actions',
      label: 'Actions',
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
      enableSearch
      searchPlaceholder="Search..."
      searchKeys={['name', 'companyName']}
      initialSort={{ key: 'name', direction: 'asc' }}
    />
  );
}

export default ProductTable;
