import { useEffect, useMemo, useState } from 'react';
import SkeletonBlock from './SkeletonBlock.jsx';

function DataTable({
  columns,
  rows,
  rowKey,
  loading,
  emptyText = 'No data available',
  enableSearch = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  initialSort = null
}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState(initialSort);

  useEffect(() => {
    if (!enableSearch) {
      setSearchTerm('');
      return;
    }

    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [enableSearch, searchInput]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, rows.length, searchTerm]);

  const filteredRows = useMemo(() => {
    if (!enableSearch || !searchTerm) return rows;

    const keys = searchKeys.length > 0 ? searchKeys : columns.map((column) => column.key);
    return rows.filter((row) =>
      keys.some((key) => String(row?.[key] ?? '').toLowerCase().includes(searchTerm))
    );
  }, [columns, enableSearch, rows, searchKeys, searchTerm]);

  const sortedRows = useMemo(() => {
    if (!sortState?.key) return filteredRows;

    const targetColumn = columns.find((column) => column.key === sortState.key);
    const accessor = targetColumn?.sortAccessor;

    return [...filteredRows].sort((left, right) => {
      const leftValue = accessor ? accessor(left) : left?.[sortState.key];
      const rightValue = accessor ? accessor(right) : right?.[sortState.key];

      const leftComparable = typeof leftValue === 'string' ? leftValue.toLowerCase() : leftValue;
      const rightComparable = typeof rightValue === 'string' ? rightValue.toLowerCase() : rightValue;

      if (leftComparable == null && rightComparable == null) return 0;
      if (leftComparable == null) return 1;
      if (rightComparable == null) return -1;

      if (leftComparable > rightComparable) return sortState.direction === 'asc' ? 1 : -1;
      if (leftComparable < rightComparable) return sortState.direction === 'asc' ? -1 : 1;
      return 0;
    });
  }, [columns, filteredRows, sortState]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + pageSize);

  const toggleSort = (key, sortable) => {
    if (!sortable) return;

    setSortState((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const hasNoResults = !loading && enableSearch && rows.length > 0 && filteredRows.length === 0;

  return (
    <div className="space-y-4">
      <div className="mb-4 mt-4 flex items-center justify-between gap-4">
        {enableSearch ? (
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full max-w-sm rounded-lg border border-[#374151] bg-[#1F2937] px-3 text-sm text-white outline-none"
          />
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="select-control h-10 w-24"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>}

      <div className="table-shell max-h-[460px] overflow-auto">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`table-th sticky top-0 z-10 bg-[color:var(--surface)] ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => toggleSort(column.key, column.sortable)}
                >
                  <div className={`inline-flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{column.label}</span>
                    {sortState?.key === column.key && (
                      <span className="text-[10px] text-[color:var(--text-muted)]">{sortState.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="table-body">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="table-row">
                  {columns.map((column) => (
                    <td key={`${column.key}-${index}`} className="table-td">
                      <SkeletonBlock className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">
                  {hasNoResults ? 'No matching results found' : emptyText}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr key={rowKey(row)} className="table-row">
                  {columns.map((column) => (
                    <td key={`${rowKey(row)}-${column.key}`} className={`table-td ${column.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {column.render ? column.render(row) : row?.[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)]">
        <span>
          Showing {Math.min(sortedRows.length, startIndex + 1)}-{Math.min(sortedRows.length, startIndex + pageSize)} of {sortedRows.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-primary h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>{currentPage}/{totalPages}</span>
          <button
            type="button"
            className="btn-primary h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
