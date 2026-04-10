import { useCallback, useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchCustomerMonthlyAnalytics,
  fetchCustomerSummaryAnalytics,
  fetchDashboardAnalytics,
  fetchBusinessOverviewAnalytics,
  fetchCompanySalesAnalytics,
  fetchCustomers,
  fetchSales,
  fetchMonthlySalesAnalytics,
  fetchTopCustomersAnalytics,
  fetchYearlySalesAnalytics
} from '../services/api.js';
import { MONTH_LABELS } from '../utils/dashboardAggregation.js';
import { MONTH_OPTIONS } from '../utils/months.js';

const toMonthTotals = (monthlyRows) => {
  const monthIndexByLabel = MONTH_LABELS.reduce((map, label, index) => {
    map.set(label, index);
    return map;
  }, new Map());
  const totals = Array(12).fill(0);

  monthlyRows.forEach((row) => {
    const index = monthIndexByLabel.get(row.month);
    if (typeof index !== 'number') return;
    totals[index] = Number(row.total || 0);
  });

  return totals;
};

const toYearlySeriesFromDashboard = (dashboardData, yearlyRows) => {
  const dashboardLabels = dashboardData?.yearlyComparison?.labels;
  const dashboardSales = dashboardData?.yearlyComparison?.sales;

  if (Array.isArray(dashboardLabels) && Array.isArray(dashboardSales)) {
    return {
      labels: dashboardLabels.map((year) => Number(year)),
      sales: dashboardSales.map((value) => Number(value || 0))
    };
  }

  const sorted = [...yearlyRows].sort((a, b) => Number(a.year) - Number(b.year));
  return {
    labels: sorted.map((row) => Number(row.year)),
    sales: sorted.map((row) => Number(row.total || 0))
  };
};

const calculateChangePercentage = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
};

const summarizeCurrentPeriodSales = (orders) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousYear = currentYear - 1;

  let currentMonthSales = 0;
  let previousMonthSales = 0;
  let currentYearSales = 0;
  let previousYearSales = 0;

  orders.forEach((order) => {
    const date = new Date(order.orderDate);
    if (!Number.isFinite(date.getTime())) return;

    const amount = Number(order.totalAmount || 0);
    const orderYear = date.getFullYear();
    const orderMonth = date.getMonth();

    if (orderYear === currentYear) {
      currentYearSales += amount;
      if (orderMonth === currentMonth) {
        currentMonthSales += amount;
      }
    }

    if (orderYear === previousYear) {
      previousYearSales += amount;
    }

    if (orderYear === previousMonthYear && orderMonth === previousMonth) {
      previousMonthSales += amount;
    }
  });

  return {
    currentMonthSales,
    previousMonthSales,
    currentYearSales,
    previousYearSales,
    monthOverMonthChange: calculateChangePercentage(currentMonthSales, previousMonthSales),
    yearOverYearChange: calculateChangePercentage(currentYearSales, previousYearSales)
  };
};

export function useDashboard() {
  const currentYear = new Date().getFullYear();
  const defaultFilters = {
    month: 'All',
    year: String(currentYear),
    companyId: 'All',
    customerId: 'All'
  };
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState({
    monthLabels: [],
    monthlySales: [],
    monthlyPurchases: [],
    monthlyProfit: [],
    yearlyLabels: [],
    yearlySales: [],
    salesDistributionLabels: [],
    salesDistributionValues: [],
    totalOrders: 0,
    totalRevenue: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalProfit: 0,
    currentMonthSales: 0,
    previousMonthSales: 0,
    currentYearSales: 0,
    previousYearSales: 0,
    monthOverMonthChange: 0,
    yearOverYearChange: 0,
    companyPerformance: [],
    topCompany: null,
    topCompanyShare: 0,
    topProducts: [],
    customerSummary: [],
    customerMonthly: [],
    topCustomersByMonth: [],
    topCustomerThisMonth: null
  });
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthOptions = MONTH_OPTIONS;

  const yearOptions = Array.from({ length: 6 }, (_, index) => String(currentYear - index));

  const buildSalesQuery = () => {
    const query = {};
    if (filters.companyId !== 'All') query.companyId = filters.companyId;
    if (filters.customerId !== 'All') query.customerId = filters.customerId;
    return query;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const salesQuery = buildSalesQuery();
      const selectedMonth = filters.month === 'All' ? null : Number(filters.month);

      const [
        companyData,
        customerData,
        salesData,
        dashboardData,
        businessOverviewData,
        monthlySalesData,
        yearlySalesData,
        companySalesData,
        customerSummaryData,
        customerMonthlyData,
        topCustomersData
      ] = await Promise.all([
        fetchCompanies(),
        fetchCustomers({ companyId: filters.companyId !== 'All' ? filters.companyId : undefined }),
        fetchSales(salesQuery),
        fetchDashboardAnalytics({
          year: Number(filters.year),
          month: selectedMonth || undefined,
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchBusinessOverviewAnalytics({
          year: Number(filters.year),
          month: selectedMonth || undefined,
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchMonthlySalesAnalytics({
          year: Number(filters.year),
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchYearlySalesAnalytics({
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchCompanySalesAnalytics({
          year: Number(filters.year),
          month: selectedMonth || undefined,
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchCustomerSummaryAnalytics({
          year: Number(filters.year),
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchCustomerMonthlyAnalytics({
          year: Number(filters.year),
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        }),
        fetchTopCustomersAnalytics({
          year: Number(filters.year),
          companyId: filters.companyId !== 'All' ? filters.companyId : undefined,
          customerId: filters.customerId !== 'All' ? filters.customerId : undefined
        })
      ]);

      const monthlySales = Array.isArray(dashboardData?.monthlySales)
        ? dashboardData.monthlySales.map((value) => Number(value || 0))
        : toMonthTotals(monthlySalesData);
      const monthlyPurchases = Array.isArray(dashboardData?.monthlyPurchases)
        ? dashboardData.monthlyPurchases.map((value) => Number(value || 0))
        : Array(12).fill(0);
      const monthlyProfit = Array.isArray(dashboardData?.monthlyProfit)
        ? dashboardData.monthlyProfit.map((value) => Number(value || 0))
        : Array(12).fill(0);
      const yearlySeries = toYearlySeriesFromDashboard(dashboardData, yearlySalesData);
      const currentPeriodSummary = summarizeCurrentPeriodSales(salesData);
      const totalRevenue = Number(businessOverviewData?.totalSales ?? 0);
      const totalPurchases = Number(businessOverviewData?.totalPurchases ?? 0);
      const totalExpenses = Number(businessOverviewData?.totalExpenses ?? 0);
      const totalProfit = Number(businessOverviewData?.profit ?? 0);
      const normalizedCustomerSummary = Array.isArray(customerSummaryData)
        ? customerSummaryData.map((item) => ({
          customerName: item.customerName || 'Unknown',
          totalPurchase: Number(item.totalPurchase || 0),
          totalOrders: Number(item.totalOrders || 0),
          totalQuantity: Number(item.totalQuantity || 0)
        }))
        : [];
      const normalizedCustomerMonthly = Array.isArray(customerMonthlyData)
        ? customerMonthlyData.map((item) => ({
          customerName: item.customerName || 'Unknown',
          month: item.month || 'N/A',
          monthNumber: Number(item.monthNumber || 0),
          totalPurchase: Number(item.totalPurchase || 0)
        }))
        : [];
      const normalizedTopCustomers = Array.isArray(topCustomersData)
        ? topCustomersData.map((item) => ({
          month: item.month || 'N/A',
          monthNumber: Number(item.monthNumber || 0),
          topCustomer: item.topCustomer || 'Unknown',
          amount: Number(item.amount || 0)
        }))
        : [];
      const currentMonthNumber = selectedMonth || new Date().getMonth() + 1;
      const productRevenueMap = new Map();

      salesData.forEach((sale) => {
        const productName = sale.product?.name || sale.productName || 'Unknown';
        const total = Number(sale.totalAmount || 0);
        const currentTotal = productRevenueMap.get(productName) || 0;
        productRevenueMap.set(productName, currentTotal + total);
      });

      const topProducts = Array.from(productRevenueMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const topCustomerThisMonth =
        normalizedTopCustomers.find((item) => item.monthNumber === currentMonthNumber) ||
        normalizedTopCustomers[normalizedTopCustomers.length - 1] ||
        null;

      const mergedAnalytics = {
        monthLabels: MONTH_LABELS,
        monthlySales,
        monthlyPurchases,
        monthlyProfit,
        salesDistributionLabels: MONTH_LABELS,
        salesDistributionValues: monthlySales,
        yearlyLabels: yearlySeries.labels,
        yearlySales: yearlySeries.sales,
        totalOrders: salesData.length,
        totalRevenue,
        totalPurchases,
        totalExpenses,
        totalProfit,
        currentMonthSales: currentPeriodSummary.currentMonthSales,
        previousMonthSales: currentPeriodSummary.previousMonthSales,
        currentYearSales: currentPeriodSummary.currentYearSales,
        previousYearSales: currentPeriodSummary.previousYearSales,
        monthOverMonthChange: currentPeriodSummary.monthOverMonthChange,
        yearOverYearChange: currentPeriodSummary.yearOverYearChange,
        companyPerformance: companySalesData?.companies || [],
        topCompany: companySalesData?.topCompany || null,
        topCompanyShare: Number(companySalesData?.topCompanyShare || 0),
        topProducts,
        customerSummary: normalizedCustomerSummary,
        customerMonthly: normalizedCustomerMonthly,
        topCustomersByMonth: normalizedTopCustomers,
        topCustomerThisMonth
      };

      setCompanies(companyData);
      setCustomers(customerData);
      setAnalytics(mergedAnalytics);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [filters.companyId, filters.customerId, filters.month, filters.year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setFilterField = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const monthLabels = analytics.monthLabels;
  const monthlySales = analytics.monthlySales;
  const monthlyPurchases = analytics.monthlyPurchases;
  const monthlyProfit = analytics.monthlyProfit;
  const yearlyLabels = analytics.yearlyLabels;
  const yearlySales = analytics.yearlySales;
  const salesDistributionLabels = analytics.salesDistributionLabels;
  const salesDistributionValues = analytics.salesDistributionValues;
  const totalRevenue = analytics.totalRevenue;
  const totalPurchases = analytics.totalPurchases;
  const totalExpenses = analytics.totalExpenses;
  const totalProfit = analytics.totalProfit;
  const currentMonthSales = analytics.currentMonthSales;
  const previousMonthSales = analytics.previousMonthSales;
  const currentYearSales = analytics.currentYearSales;
  const previousYearSales = analytics.previousYearSales;
  const monthOverMonthChange = analytics.monthOverMonthChange;
  const yearOverYearChange = analytics.yearOverYearChange;
  const companyPerformance = analytics.companyPerformance;
  const topCompany = analytics.topCompany;
  const topCompanyShare = analytics.topCompanyShare;
  const topProducts = analytics.topProducts;
  const customerSummary = analytics.customerSummary;
  const customerMonthly = analytics.customerMonthly;
  const topCustomersByMonth = analytics.topCustomersByMonth;
  const topCustomerThisMonth = analytics.topCustomerThisMonth;
  const totalOrders = analytics.totalOrders;

  return {
    companies,
    customers,
    filters,
    monthOptions,
    yearOptions,
    loading,
    error,
    year: Number(filters.year),
    setFilterField,
    resetFilters,
    monthLabels,
    monthlySales,
    monthlyPurchases,
    monthlyProfit,
    yearlySales,
    yearlyLabels,
    salesDistributionLabels,
    salesDistributionValues,
    totalOrders,
    totalRevenue,
    totalPurchases,
    totalExpenses,
    totalProfit,
    currentMonthSales,
    previousMonthSales,
    currentYearSales,
    previousYearSales,
    monthOverMonthChange,
    yearOverYearChange,
    companyPerformance,
    topCompany,
    topCompanyShare,
    topProducts,
    customerSummary,
    customerMonthly,
    topCustomersByMonth,
    topCustomerThisMonth
  };
}
