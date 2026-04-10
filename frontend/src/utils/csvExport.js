export const exportCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(','), ...rows.map((row) => headers.map((field) => {
    const value = row[field] ?? '';
    const safeValue = String(value).replace(/"/g, '""');
    return `"${safeValue}"`;
  }).join(','))];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};
