/**
 * Format numbers as Indian Rupee currency
 * Uses Indian number formatting (e.g., ₹1,00,000 instead of 100000)
 * @param {number} value - The amount to format
 * @returns {string} - Formatted currency string with ₹ symbol
 */
export const formatCurrency = (value) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.format(value || 0);
};

/**
 * Format number as Indian locale number with commas
 * @param {number} value - The number to format
 * @returns {string} - Formatted number string
 */
export const formatIndianNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value || 0);
};
