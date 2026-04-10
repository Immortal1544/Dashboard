import * as XLSX from "xlsx";

const formatToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildFilename = (filePrefix) => `${filePrefix}-${formatToday()}.xlsx`;

export const exportExcel = ({ filePrefix, sheetName, rows }) => {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
  XLSX.writeFile(workbook, buildFilename(filePrefix));
};

export const exportExcelWorkbook = ({ filePrefix, sheets }) => {
  if (!Array.isArray(sheets) || sheets.length === 0) return;

  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    if (!sheet || !Array.isArray(sheet.rows) || sheet.rows.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Sheet');
  });

  if (workbook.SheetNames.length === 0) return;

  XLSX.writeFile(workbook, buildFilename(filePrefix));
};
