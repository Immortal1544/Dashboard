import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

function ExpenseTable({ expenses, loading, deletingId, updatingId, onDelete, onEdit }) {
  const rows = useMemo(
    () =>
      expenses.map((expense) => ({
        ...expense,
        dateValue: expense.date ? new Date(expense.date).getTime() : 0,
        dateText: expense.date ? new Date(expense.date).toLocaleDateString() : '-',
        amountValue: Number(expense.amount || 0)
      })),
    [expenses]
  );

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.title}</span>
    },
    {
      key: 'dateText',
      label: 'Date',
      sortable: true,
      sortAccessor: (row) => row.dateValue,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.dateText}</span>
    },
    {
      key: 'amountValue',
      label: 'Amount',
      sortable: true,
      sortAccessor: (row) => row.amountValue,
      render: (row) => <span className="font-medium text-[color:var(--accent-red)]">{formatCurrency(row.amountValue)}</span>
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
      searchPlaceholder="Search expenses by title"
      searchKeys={['title']}
      initialSort={{ key: 'dateText', direction: 'desc' }}
    />
  );
}

export default ExpenseTable;
