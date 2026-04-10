import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';

const MONTH_COUNT = 12;
const DEFAULT_YEARS_WINDOW = 5;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getOptionalCustomerMatch = (customerId) => (customerId ? { customer: customerId } : {});

const getYearBoundaries = (yearValue) => {
  const year = Number(yearValue) || new Date().getFullYear();
  return {
    year,
    start: new Date(year, 0, 1),
    end: new Date(year + 1, 0, 1)
  };
};

const mapMonthlySalesRows = (rows) =>
  rows
    .map((row) => {
      const monthNumber = Number(row._id);
      if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) return null;
      return {
        month: MONTH_LABELS[monthNumber - 1],
        total: Number(row.total || 0)
      };
    })
    .filter(Boolean);

const mapYearlySalesRows = (rows) =>
  rows.map((row) => ({
    year: Number(row._id),
    total: Number(row.total || 0)
  }));

const mapCompanySalesRows = (rows) =>
  rows.map((row) => ({
    companyId: String(row.companyId || 'unassigned'),
    companyName: row.companyName || 'Unassigned',
    revenue: Number(row.total || 0),
    orders: Number(row.orders || 0)
  }));

const getMonthlyTrendArray = (items) => {
  const values = Array(MONTH_COUNT).fill(0);
  items.forEach((item) => {
    const monthIndex = Number(item._id) - 1;
    if (monthIndex >= 0 && monthIndex < MONTH_COUNT) {
      values[monthIndex] = Number(item.total || 0);
    }
  });
  return values;
};

const toMonthArray = (groupedItems) => {
  const values = Array(MONTH_COUNT).fill(0);
  groupedItems.forEach((item) => {
    const monthIndex = Number(item._id) - 1;
    if (monthIndex >= 0 && monthIndex < MONTH_COUNT) {
      values[monthIndex] = Number(item.total || 0);
    }
  });
  return values;
};

const toYearMap = (groupedItems) => {
  const map = new Map();
  groupedItems.forEach((item) => {
    map.set(Number(item._id), Number(item.total || 0));
  });
  return map;
};

const addMonthConstraint = (match, field, monthValue) => {
  if (!monthValue) return;
  match.$expr = { $eq: [{ $month: `$${field}` }, monthValue] };
};

const buildDateRangeFilter = (query, field, yearValue) => {
  const range = {};

  if (query.startDate) {
    const parsedStart = new Date(query.startDate);
    if (Number.isFinite(parsedStart.getTime())) {
      range.$gte = parsedStart;
    }
  }

  if (query.endDate) {
    const parsedEnd = new Date(query.endDate);
    if (Number.isFinite(parsedEnd.getTime())) {
      range.$lte = parsedEnd;
    }
  }

  if (Object.keys(range).length > 0) {
    return { [field]: range };
  }

  if (yearValue !== undefined && yearValue !== null && yearValue !== '') {
    const { start, end } = getYearBoundaries(yearValue);
    return { [field]: { $gte: start, $lt: end } };
  }

  return {};
};

const buildOrderMatch = (query) => {
  const orderDateMatch = buildDateRangeFilter(query, 'orderDate', query.year);
  const customerMatch = getOptionalCustomerMatch(query.customerId || null);

  return {
    ...orderDateMatch,
    ...customerMatch
  };
};

export const getMonthlySalesAnalytics = async (req, res, next) => {
  try {
    const customerMatch = getOptionalCustomerMatch(req.query.customerId || null);
    const orderDateMatch = buildDateRangeFilter(req.query, 'orderDate', req.query.year);

    const monthlyRows = await Order.aggregate([
      {
        $match: {
          ...customerMatch,
          ...orderDateMatch
        }
      },
      {
        $group: {
          _id: { $month: '$orderDate' },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const response = mapMonthlySalesRows(monthlyRows);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getYearlySalesAnalytics = async (req, res, next) => {
  try {
    const customerMatch = getOptionalCustomerMatch(req.query.customerId || null);
    const orderDateMatch = buildDateRangeFilter(req.query, 'orderDate');

    const yearlyRows = await Order.aggregate([
      {
        $match: {
          ...customerMatch,
          ...orderDateMatch
        }
      },
      {
        $group: {
          _id: { $year: '$orderDate' },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const response = mapYearlySalesRows(yearlyRows);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCompanySalesAnalytics = async (req, res, next) => {
  try {
    const selectedMonth = Number(req.query.month) || null;
    const customerMatch = getOptionalCustomerMatch(req.query.customerId || null);
    const orderDateMatch = buildDateRangeFilter(req.query, 'orderDate', req.query.year);

    const orderMatch = {
      ...customerMatch,
      ...orderDateMatch
    };
    addMonthConstraint(orderMatch, 'orderDate', selectedMonth);

    const rows = await Order.aggregate([
      { $match: orderMatch },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $addFields: {
          customerInfo: { $arrayElemAt: ['$customerInfo', 0] }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customerInfo.company',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      {
        $addFields: {
          companyInfo: { $arrayElemAt: ['$companyInfo', 0] }
        }
      },
      {
        $group: {
          _id: {
            companyId: { $ifNull: ['$companyInfo._id', 'unassigned'] },
            companyName: { $ifNull: ['$companyInfo.name', 'Unassigned'] }
          },
          total: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          companyId: '$_id.companyId',
          companyName: '$_id.companyName',
          total: 1,
          orders: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    const companies = mapCompanySalesRows(rows);
    const topCompany = companies[0] || null;
    const totalSales = companies.reduce((sum, item) => sum + item.revenue, 0);
    const topCompanyShare = topCompany && totalSales > 0 ? (topCompany.revenue / totalSales) * 100 : 0;

    res.json({
      companies,
      topCompany,
      totalSales,
      topCompanyShare
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerSummaryAnalytics = async (req, res, next) => {
  try {
    const orderMatch = buildOrderMatch(req.query);

    const rows = await Order.aggregate([
      { $match: orderMatch },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $addFields: {
          customerName: {
            $ifNull: [{ $arrayElemAt: ['$customerInfo.name', 0] }, 'Unknown']
          }
        }
      },
      {
        $group: {
          _id: '$customerName',
          totalPurchase: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ['$quantity', 1] } }
        }
      },
      { $sort: { totalPurchase: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          customerName: '$_id',
          totalPurchase: { $ifNull: ['$totalPurchase', 0] },
          totalOrders: { $ifNull: ['$totalOrders', 0] },
          totalQuantity: { $ifNull: ['$totalQuantity', 0] }
        }
      }
    ]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getCustomerMonthlyAnalytics = async (req, res, next) => {
  try {
    const orderMatch = buildOrderMatch(req.query);

    const rows = await Order.aggregate([
      { $match: orderMatch },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $addFields: {
          customerName: {
            $ifNull: [{ $arrayElemAt: ['$customerInfo.name', 0] }, 'Unknown']
          }
        }
      },
      {
        $group: {
          _id: {
            customerName: '$customerName',
            month: { $month: '$orderDate' }
          },
          totalPurchase: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.customerName': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          customerName: '$_id.customerName',
          month: {
            $arrayElemAt: [MONTH_LABELS, { $subtract: ['$_id.month', 1] }]
          },
          monthNumber: '$_id.month',
          totalPurchase: { $ifNull: ['$totalPurchase', 0] }
        }
      }
    ]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getTopCustomersAnalytics = async (req, res, next) => {
  try {
    const orderMatch = buildOrderMatch(req.query);

    const rows = await Order.aggregate([
      { $match: orderMatch },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $addFields: {
          customerName: {
            $ifNull: [{ $arrayElemAt: ['$customerInfo.name', 0] }, 'Unknown']
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$orderDate' },
            customerName: '$customerName'
          },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.month': 1, amount: -1 } },
      {
        $group: {
          _id: '$_id.month',
          topCustomer: { $first: '$_id.customerName' },
          amount: { $first: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $arrayElemAt: [MONTH_LABELS, { $subtract: ['$_id', 1] }]
          },
          monthNumber: '$_id',
          topCustomer: 1,
          amount: { $ifNull: ['$amount', 0] }
        }
      }
    ]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getBusinessOverviewAnalytics = async (req, res, next) => {
  try {
    const selectedMonth = Number(req.query.month) || null;
    const orderDateMatch = buildDateRangeFilter(req.query, 'orderDate', req.query.year);
    const purchaseDateMatch = buildDateRangeFilter(req.query, 'date', req.query.year);
    const expenseDateMatch = buildDateRangeFilter(req.query, 'date', req.query.year);
    addMonthConstraint(orderDateMatch, 'orderDate', selectedMonth);
    addMonthConstraint(purchaseDateMatch, 'date', selectedMonth);
    addMonthConstraint(expenseDateMatch, 'date', selectedMonth);

    const [salesTotalRow, purchaseTotalRow, expenseTotalRow] = await Promise.all([
      Order.aggregate([
        { $match: { ...orderDateMatch } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Purchase.aggregate([
        { $match: { ...purchaseDateMatch } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: { ...expenseDateMatch } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalSales = Number(salesTotalRow[0]?.total || 0);
    const totalPurchases = Number(purchaseTotalRow[0]?.total || 0);
    const totalExpenses = Number(expenseTotalRow[0]?.total || 0);
    const profit = totalSales - totalPurchases - totalExpenses;

    res.json({
      totalSales,
      totalPurchases,
      totalExpenses,
      profit
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryAnalytics = async (req, res, next) => {
  try {
    const lowStockThreshold = Math.max(0, Number(req.query.lowStockThreshold) || 10);

    const items = await Product.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      {
        $addFields: {
          companyInfo: { $arrayElemAt: ['$companyInfo', 0] }
        }
      },
      {
        $lookup: {
          from: 'purchases',
          let: { productId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
            { $group: { _id: null, quantity: { $sum: '$quantity' } } }
          ],
          as: 'purchaseTotals'
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
            { $group: { _id: null, quantity: { $sum: { $ifNull: ['$quantity', 1] } } } }
          ],
          as: 'salesTotals'
        }
      },
      {
        $addFields: {
          purchasedQuantity: { $ifNull: [{ $arrayElemAt: ['$purchaseTotals.quantity', 0] }, 0] },
          soldQuantity: { $ifNull: [{ $arrayElemAt: ['$salesTotals.quantity', 0] }, 0] }
        }
      },
      {
        $addFields: {
          stock: { $subtract: ['$purchasedQuantity', '$soldQuantity'] }
        }
      },
      {
        $addFields: {
          lowStock: { $lte: ['$stock', lowStockThreshold] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          unit: 1,
          company: {
            _id: '$companyInfo._id',
            name: '$companyInfo.name'
          },
          purchasedQuantity: 1,
          soldQuantity: 1,
          stock: 1,
          lowStock: 1
        }
      },
      { $sort: { lowStock: -1, stock: 1, name: 1 } }
    ]);

    const lowStockItems = items.filter((item) => item.lowStock);

    res.json({
      lowStockThreshold,
      summary: {
        totalProducts: items.length,
        lowStockCount: lowStockItems.length
      },
      items,
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const selectedYear = Number(req.query.year) || new Date().getFullYear();
    const yearsWindow = Math.max(1, Number(req.query.years) || DEFAULT_YEARS_WINDOW);
    const selectedMonth = Number(req.query.month) || null;
    const customerId = req.query.customerId || null;

    const endOfYear = new Date(selectedYear + 1, 0, 1);
    const comparisonStartYear = selectedYear - yearsWindow + 1;
    const comparisonStartDate = new Date(comparisonStartYear, 0, 1);

    const orderMatch = {
      ...buildDateRangeFilter(req.query, 'orderDate', selectedYear)
    };
    if (customerId) {
      orderMatch.customer = customerId;
    }
    addMonthConstraint(orderMatch, 'orderDate', selectedMonth);

    const purchaseMatch = {
      ...buildDateRangeFilter(req.query, 'date', selectedYear)
    };
    addMonthConstraint(purchaseMatch, 'date', selectedMonth);

    const expenseMatch = {
      ...buildDateRangeFilter(req.query, 'date', selectedYear)
    };
    addMonthConstraint(expenseMatch, 'date', selectedMonth);

    const yearlyOrderMatch = { orderDate: { $gte: comparisonStartDate, $lt: endOfYear } };
    if (customerId) {
      yearlyOrderMatch.customer = customerId;
    }
    addMonthConstraint(yearlyOrderMatch, 'orderDate', selectedMonth);

    const yearlyPurchaseMatch = { date: { $gte: comparisonStartDate, $lt: endOfYear } };
    addMonthConstraint(yearlyPurchaseMatch, 'date', selectedMonth);

    const yearlyExpenseMatch = { date: { $gte: comparisonStartDate, $lt: endOfYear } };
    addMonthConstraint(yearlyExpenseMatch, 'date', selectedMonth);

    const [
      monthlySalesRaw,
      monthlyPurchasesRaw,
      monthlyExpensesRaw,
      yearlySalesRaw,
      yearlyPurchasesRaw,
      yearlyExpensesRaw,
      salesDistributionRaw,
      yearlyOrderCount
    ] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: { $month: '$orderDate' }, total: { $sum: '$totalAmount' } } }
      ]),
      Purchase.aggregate([
        { $match: purchaseMatch },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { $match: yearlyOrderMatch },
        { $group: { _id: { $year: '$orderDate' }, total: { $sum: '$totalAmount' } } }
      ]),
      Purchase.aggregate([
        { $match: yearlyPurchaseMatch },
        { $group: { _id: { $year: '$date' }, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: yearlyExpenseMatch },
        { $group: { _id: { $year: '$date' }, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { $match: orderMatch },
        {
          $lookup: {
            from: 'customers',
            localField: 'customer',
            foreignField: '_id',
            as: 'customerInfo'
          }
        },
        {
          $addFields: {
            customerName: {
              $ifNull: [{ $arrayElemAt: ['$customerInfo.name', 0] }, 'Unknown']
            }
          }
        },
        { $group: { _id: '$customerName', total: { $sum: '$totalAmount' } } },
        { $sort: { total: -1 } },
        { $limit: 8 }
      ]),
      Order.countDocuments(orderMatch)
    ]);

    const monthlySales = toMonthArray(monthlySalesRaw);
    const monthlyPurchases = toMonthArray(monthlyPurchasesRaw);
  const monthlyExpenses = toMonthArray(monthlyExpensesRaw);
  const monthlyProfit = monthlySales.map((sales, index) => sales - monthlyPurchases[index] - monthlyExpenses[index]);

    const salesByYearMap = toYearMap(yearlySalesRaw);
    const purchasesByYearMap = toYearMap(yearlyPurchasesRaw);
  const expensesByYearMap = toYearMap(yearlyExpensesRaw);

  const allYears = [...new Set([...salesByYearMap.keys(), ...purchasesByYearMap.keys(), ...expensesByYearMap.keys(), selectedYear])].sort((a, b) => a - b);
    const minYear = Math.max(allYears[0], selectedYear - yearsWindow + 1);
    const comparisonYears = allYears.filter((year) => year >= minYear);

    const yearlySales = comparisonYears.map((year) => salesByYearMap.get(year) || 0);
    const yearlyPurchases = comparisonYears.map((year) => purchasesByYearMap.get(year) || 0);
  const yearlyExpenses = comparisonYears.map((year) => expensesByYearMap.get(year) || 0);
  const yearlyProfit = comparisonYears.map((year, index) => yearlySales[index] - yearlyPurchases[index] - yearlyExpenses[index]);

    const distributionLabels = salesDistributionRaw.map((row) => row._id);
    const distributionValues = salesDistributionRaw.map((row) => Number(row.total || 0));

    const totalSales = monthlySales.reduce((sum, value) => sum + value, 0);
    const totalPurchases = monthlyPurchases.reduce((sum, value) => sum + value, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, value) => sum + value, 0);
    const totalProfit = totalSales - totalPurchases - totalExpenses;

    res.json({
      year: selectedYear,
      monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monthlySales,
      monthlyPurchases,
      monthlyExpenses,
      monthlyProfit,
      salesDistribution: {
        labels: distributionLabels,
        values: distributionValues
      },
      yearlyComparison: {
        labels: comparisonYears,
        sales: yearlySales,
        purchases: yearlyPurchases,
        expenses: yearlyExpenses,
        profit: yearlyProfit
      },
      totals: {
        orders: yearlyOrderCount,
        sales: totalSales,
        purchases: totalPurchases,
        expenses: totalExpenses,
        profit: totalProfit
      },
      filters: {
        month: selectedMonth,
        year: selectedYear,
        customerId
      }
    });
  } catch (error) {
    next(error);
  }
};
