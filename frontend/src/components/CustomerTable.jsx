import { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

function CustomerTable({ customers, loading, deletingId, updatingId, onDelete, onEdit }) {
  const rows = useMemo(
    () =>
      customers.map((customer) => ({
        ...customer,
        companyName: customer.company?.name || '—',
        phoneText: customer.phone || '—'
      })),
    [customers]
  );

  const columns = [
    {
      key: 'name',
      label: 'Name',
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
      key: 'phoneText',
      label: 'Phone',
      sortable: true,
      render: (row) => <span className="text-[color:var(--text-soft)]">{row.phoneText}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
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
      emptyText="No results found for selected filters"
      enableSearch
      searchPlaceholder="Search..."
      searchKeys={['name', 'companyName', 'phoneText']}
      initialSort={{ key: 'name', direction: 'asc' }}
    />
  );
}

export default CustomerTable;
