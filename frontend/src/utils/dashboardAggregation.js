export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toNumber = (value) => Number(value || 0);
const isValidDate = (value) => Number.isFinite(new Date(value).getTime());

const monthTotals = (items, dateKey, amountKey, selectedYear) => {
  const totals = Array(12).fill(0);

  items.forEach((item) => {
    const date = new Date(item[dateKey]);
    if (!isValidDate(item[dateKey])) return;
    if (date.getFullYear() !== selectedYear) return;
    totals[date.getMonth()] += toNumber(item[amountKey]);
  });

  return totals;
};

const yearTotals = (orders, selectedMonth) => {
  const totals = new Map();

  orders.forEach((order) => {
    if (!isValidDate(order.orderDate)) return;
    const date = new Date(order.orderDate);
    if (selectedMonth && date.getMonth() !== selectedMonth - 1) return;
    const year = date.getFullYear();
    totals.set(year, (totals.get(year) || 0) + toNumber(order.amount));
  });

  return totals;
};

const filterByYearAndMonth = (items, dateKey, selectedYear, selectedMonth) =>
  items.filter((item) => {
    if (!isValidDate(item[dateKey])) return false;
    const date = new Date(item[dateKey]);
    if (date.getFullYear() !== selectedYear) return false;
    if (selectedMonth && date.getMonth() !== selectedMonth - 1) return false;
    return true;
  });

const applyMonthMask = (values, selectedMonth) => {
  if (!selectedMonth) return values;
  return values.map((value, index) => (index === selectedMonth - 1 ? value : 0));
};

export const aggregateDashboardData = ({
  orders,
  expenses,
  customers = [],
  selectedYear,
  selectedMonth = null,
  yearsWindow = 5
}) => {
  const ordersInSelection = filterByYearAndMonth(orders, 'orderDate', selectedYear, selectedMonth);
  const expensesInSelection = filterByYearAndMonth(expenses, 'date', selectedYear, selectedMonth);

  const monthlySales = applyMonthMask(
    monthTotals(orders, 'orderDate', 'amount', selectedYear),
    selectedMonth
  );
  const monthlyExpenses = applyMonthMask(
    monthTotals(expenses, 'date', 'amount', selectedYear),
    selectedMonth
  );
  const monthlyProfit = monthlySales.map((sales, index) => sales - monthlyExpenses[index]);

  const yearlySalesMap = yearTotals(orders, selectedMonth);
  const startYear = selectedYear - yearsWindow + 1;
  const yearlyLabels = Array.from({ length: yearsWindow }, (_, index) => startYear + index);
  const yearlySales = yearlyLabels.map((year) => yearlySalesMap.get(year) || 0);

  const totalRevenue = monthlySales.reduce((sum, value) => sum + value, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, value) => sum + value, 0);

  const customerCompanyMap = new Map(
    customers.map((customer) => [
      String(customer._id),
      {
        companyId: String(customer.company?._id || customer.company || 'unassigned'),
        companyName: customer.company?.name || 'Unassigned'
      }
    ])
  );

  const companyPerformanceMap = new Map();
  ordersInSelection.forEach((order) => {
    const customerId = String(order.customer?._id || order.customer || '');
    const customerMeta = customerCompanyMap.get(customerId);
    const key = customerMeta?.companyId || 'unassigned';
    const existing = companyPerformanceMap.get(key) || {
      companyId: key,
      companyName: customerMeta?.companyName || 'Unassigned',
      revenue: 0,
      orders: 0
    };

    existing.revenue += toNumber(order.amount);
    existing.orders += 1;
    companyPerformanceMap.set(key, existing);
  });

  const companyPerformance = Array.from(companyPerformanceMap.values()).sort((a, b) => b.revenue - a.revenue);
  const topCompany = companyPerformance[0] || null;
  const topCompanyShare = topCompany && totalRevenue > 0 ? (topCompany.revenue / totalRevenue) * 100 : 0;

  return {
    monthLabels: MONTH_LABELS,
    monthlySales,
    monthlyExpenses,
    monthlyProfit,
    yearlyLabels,
    yearlySales,
    salesDistributionLabels: MONTH_LABELS,
    salesDistributionValues: monthlySales,
    totalOrders: ordersInSelection.length,
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    companyPerformance,
    topCompany,
    topCompanyShare
  };
};
