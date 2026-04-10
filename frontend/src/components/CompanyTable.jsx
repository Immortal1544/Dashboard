import { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DataTable from './DataTable.jsx';

function CompanyTable({ companies, loading, deletingId, updatingId, onDelete, onEdit }) {
  const columns = [
    {
      key: 'name',
      label: 'Company',
      sortable: true,
      render: (row) => <span className="font-medium text-[color:var(--text-strong)]">{row.name}</span>
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

  const rows = useMemo(() => companies, [companies]);

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row._id}
      loading={loading}
      emptyText="No data available"
      searchPlaceholder="Search companies"
      searchKeys={['name']}
      initialSort={{ key: 'name', direction: 'asc' }}
    />
  );
}

export default CompanyTable;
