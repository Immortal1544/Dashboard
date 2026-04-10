import StatCard from '../components/StatCard.jsx';
import DashboardCharts from '../components/DashboardCharts.jsx';
import InsightsPanel from '../components/InsightsPanel.jsx';
import CustomerAnalyticsSection from '../components/CustomerAnalyticsSection.jsx';
import QuickDropdown from '../components/QuickDropdown.jsx';
import SkeletonBlock from '../components/SkeletonBlock.jsx';
import { CustomersIcon, OrdersIcon, RevenueIcon } from '../components/Icons.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { exportExcelWorkbook } from '../utils/excelExport.js';
import { toast } from '../utils/toast.js';

const getTrend = (values) => {
  if (!values || values.length < 2) return 0;
  const current = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

function Dashboard() {
  const {
    companies,
    customers,
    filters,
    monthOptions,
    yearOptions,
    totalOrders,
    loading,
    error,
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
    topCustomerThisMonth
  } = useDashboard();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (name === 'companyId') {
      setFilterField('companyId', value);
      setFilterField('customerId', 'All');
      return;
    }

    setFilterField(name, value);
  };

  const revenueTrend = getTrend(monthlySales);
  const purchaseTrend = getTrend(monthlyPurchases);
  const orderTrend = getTrend(monthlySales.map((value, index) => value - (monthlyPurchases[index] || 0)));
  const sortedCompanies = [...companies].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' }));
  const sortedCustomers = [...customers].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' }));
  const selectedCompanyName = filters.companyId === 'All'
    ? 'All companies'
    : sortedCompanies.find((company) => company._id === filters.companyId)?.name || 'Unknown company';
  const selectedCustomerName = filters.customerId === 'All'
    ? 'All customers'
    : sortedCustomers.find((customer) => customer._id === filters.customerId)?.name || 'Unknown customer';
  const bestMonthIndex = monthlySales.indexOf(Math.max(...monthlySales, 0));
  const bestMonthLabel = bestMonthIndex >= 0 ? monthLabels[bestMonthIndex] : 'N/A';
  const bestMonthValue = bestMonthIndex >= 0 ? Number(monthlySales[bestMonthIndex] || 0) : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const selectedYearForFile = filters.year === 'All' ? String(new Date().getFullYear()) : String(filters.year);

  const activeFilterChips = [
    filters.month !== 'All' ? { key: 'month', label: monthOptions.find((option) => option.value === filters.month)?.label || filters.month } : null,
    filters.year !== String(new Date().getFullYear()) ? { key: 'year', label: String(filters.year) } : null,
    filters.companyId !== 'All' ? { key: 'companyId', label: selectedCompanyName } : null,
    filters.customerId !== 'All' ? { key: 'customerId', label: selectedCustomerName } : null
  ].filter(Boolean);

  const insights = [
    {
      title: 'Margin quality',
      value: `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%`,
      message: totalProfit >= 0 ? 'Current margin remains healthy for the selected period.' : 'Margin is negative. Prioritize cost controls.',
      tone: totalProfit >= 0 ? 'emerald' : 'slate'
    },
    {
      title: 'Spend pressure',
      value: `${purchaseTrend >= 0 ? '+' : ''}${purchaseTrend.toFixed(1)}%`,
      message: purchaseTrend > revenueTrend ? 'Purchases are rising faster than sales.' : 'Purchase growth is within acceptable range.',
      tone: purchaseTrend > revenueTrend ? 'slate' : 'indigo'
    },
    {
      title: 'Growth signal',
      value: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(1)}%`,
      message: revenueTrend >= 0 ? 'Revenue momentum is positive over the latest period.' : 'Revenue dipped. Consider a recovery campaign.',
      tone: revenueTrend >= 0 ? 'indigo' : 'slate'
    },
    {
      title: 'Top company',
      value: topCompany ? topCompany.companyName : 'No data',
      message: topCompany
        ? `${topCompanyShare.toFixed(1)}% of revenue from ${topCompany.orders} orders in this period.`
        : 'No company-linked sales in this period yet.',
      tone: topCompany ? 'emerald' : 'slate'
    }
  ];

  const handleExportAnalytics = () => {
    const summaryRows = [
      { Metric: 'Total Revenue', Value: Number(totalRevenue || 0) },
      { Metric: 'Total Purchases', Value: Number(totalPurchases || 0) },
      { Metric: 'Total Expenses', Value: Number(totalExpenses || 0) },
      { Metric: 'Total Profit', Value: Number(totalProfit || 0) },
      { Metric: 'Total Orders', Value: Number(totalOrders || 0) },
      { Metric: 'Selected Year', Value: filters.year },
      { Metric: 'Selected Company', Value: filters.companyId === 'All' ? 'All companies' : filters.companyId },
      { Metric: 'Selected Customer', Value: filters.customerId === 'All' ? 'All customers' : filters.customerId },
    ];

    const monthlyRows = monthLabels.map((label, index) => ({
      Month: label,
      Sales: Number(monthlySales[index] || 0),
      Purchases: Number(monthlyPurchases[index] || 0),
      Profit: Number(monthlyProfit[index] || 0)
    }));

    const yearlyRows = yearlyLabels.map((year, index) => ({
      Year: year,
      Sales: Number(yearlySales[index] || 0)
    }));

    const companyRows = companyPerformance.map((item) => ({
      Company: item.companyName || 'Unassigned',
      Revenue: Number(item.revenue || 0),
      Orders: Number(item.orders || 0)
    }));

    const filePrefix = `sales-report-${selectedYearForFile}`;

    exportExcelWorkbook({
      filePrefix,
      sheets: [
        { name: 'Summary', rows: summaryRows },
        { name: 'Monthly', rows: monthlyRows },
        { name: 'Yearly', rows: yearlyRows },
        { name: 'Companies', rows: companyRows }
      ]
    });

    toast.success('Excel export completed');
  };

  const removeFilterChip = (key) => {
    if (key === 'month') {
      setFilterField('month', 'All');
      return;
    }
    if (key === 'year') {
      setFilterField('year', String(new Date().getFullYear()));
      return;
    }
    if (key === 'companyId') {
      setFilterField('companyId', 'All');
      setFilterField('customerId', 'All');
      return;
    }
    setFilterField('customerId', 'All');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">All data is based on selected filters</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
          <QuickDropdown
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            options={monthOptions.map((option) => ({ value: option.value, label: option.label }))}
            placeholder="Month"
            noResultsText="No results found"
            wrapperClassName="w-32"
            triggerClassName="w-32"
          />

          <QuickDropdown
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            options={yearOptions.map((option) => ({ value: option, label: String(option) }))}
            placeholder="Year"
            noResultsText="No results found"
            wrapperClassName="w-32"
            triggerClassName="w-32"
          />

          <div className="w-48">
            <select
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
              className="field-control w-full"
            >
              <option value="All">All companies</option>
              {sortedCompanies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <select
              name="customerId"
              value={filters.customerId}
              onChange={handleFilterChange}
              className="field-control w-full"
            >
              <option value="All">All customers</option>
              {sortedCustomers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportAnalytics}
            className="btn-primary"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="btn-primary"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.length > 0 ? (
            activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeFilterChip(chip.key)}
                className="btn-primary h-10 rounded-full px-3 text-xs"
              >
                <span>{chip.label}</span>
                <span className="text-white/70">✕</span>
              </button>
            ))
          ) : (
            <p className="text-xs text-[color:var(--text-muted)]">No active filters</p>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto btn-primary"
          >
            Clear All Filters
          </button>
        </div>
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">Showing results for selected filters</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {loading ? (
          <>
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={`kpi-skeleton-${index}`} className={`surface-panel p-5 ${index < 2 ? 'lg:col-span-6' : index < 4 ? 'lg:col-span-6' : 'lg:col-span-4'}`}>
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="mt-3 h-8 w-40" />
                <SkeletonBlock className="mt-3 h-3 w-52" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="lg:col-span-6">
              <StatCard
                title="Current Month Sales"
                value={formatCurrency(currentMonthSales)}
                subtitle={`Previous month: ${formatCurrency(previousMonthSales)}`}
                trend={monthOverMonthChange}
                trendLabel="vs previous month"
                icon={<RevenueIcon className="h-5 w-5" />}
                tone="indigo"
              />
            </div>
            <div className="lg:col-span-6">
              <StatCard
                title="Current Year Sales"
                value={formatCurrency(currentYearSales)}
                subtitle={`Previous year: ${formatCurrency(previousYearSales)}`}
                trend={yearOverYearChange}
                trendLabel="vs previous year"
                icon={<RevenueIcon className="h-5 w-5" />}
                tone="indigo"
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-2">
              <StatCard title="Orders" value={totalOrders} subtitle="Transactions" trend={orderTrend} trendLabel="trend" icon={<OrdersIcon className="h-5 w-5" />} tone="sky" />
              <StatCard title="Customers" value={customers.length} subtitle="Total active" icon={<CustomersIcon className="h-5 w-5" />} tone="slate" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
              <StatCard
                title="Top Customer"
                value={topCustomerThisMonth?.topCustomer || 'No data'}
                subtitle={topCustomerThisMonth ? `${topCustomerThisMonth.month}: ${formatCurrency(topCustomerThisMonth.amount)}` : 'No customer data'}
                icon={<CustomersIcon className="h-5 w-5" />}
                tone="indigo"
              />
              <StatCard
                title="Top Company"
                value={topCompany?.companyName || 'No data'}
                subtitle={topCompany ? `${formatCurrency(topCompany.revenue)} revenue` : 'No company data'}
                icon={<RevenueIcon className="h-5 w-5" />}
                tone="sky"
              />
              <StatCard
                title="Best Month"
                value={bestMonthLabel}
                subtitle={`${formatCurrency(bestMonthValue)} | Margin ${profitMargin.toFixed(1)}%`}
                trend={monthOverMonthChange}
                trendLabel="monthly growth"
                icon={<OrdersIcon className="h-5 w-5" />}
                tone="slate"
              />
            </div>
          </>
        )}
      </div>

      <div className="surface-panel p-5">
        <h3 className="section-heading">Top Performing Products</h3>
        <p className="section-subtext">Highest revenue products for current filters.</p>
        <div className="mt-3 space-y-2">
          {loading ? (
            <p className="py-10 text-center text-sm text-[color:var(--text-muted)]">Loading...</p>
          ) : topProducts.length > 0 ? (
            topProducts.slice(0, 3).map((product) => (
              <div key={product.name} className="flex items-center justify-between rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] px-3 py-2 text-sm">
                <span className="text-[color:var(--text-soft)]">{product.name}</span>
                <span className="font-medium text-[color:var(--text-strong)]">{formatCurrency(product.revenue)}</span>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-[color:var(--text-muted)]">No data available</p>
          )}
        </div>
      </div>

      <InsightsPanel insights={insights} companyPerformance={companyPerformance} />

      {error && (
        <div className="rounded-lg border border-[color:var(--accent-red)] bg-[rgba(239,68,68,0.1)] p-4 text-[color:var(--accent-red)] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-6">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-56 w-full" />
          <SkeletonBlock className="h-56 w-full" />
        </div>
      ) : (
        <>
          <DashboardCharts
            monthLabels={monthLabels}
            monthlySales={monthlySales}
            yearlySales={yearlySales}
            yearlyLabels={yearlyLabels}
            salesDistributionLabels={salesDistributionLabels}
            salesDistributionValues={salesDistributionValues}
            selectedYear={filters.year}
            topCompany={topCompany}
          />

          <CustomerAnalyticsSection
            monthLabels={monthLabels}
            customerSummary={customerSummary}
            customerMonthly={customerMonthly}
            topCustomerThisMonth={topCustomerThisMonth}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
