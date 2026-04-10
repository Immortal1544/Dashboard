import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE'];

const buildCustomerMonthlyDatasets = (monthLabels, customerMonthly, customerSummary) => {
  const topCustomers = [...customerSummary]
    .sort((a, b) => b.totalPurchase - a.totalPurchase)
    .slice(0, 6)
    .map((item) => item.customerName);

  if (topCustomers.length === 0) return [];

  const monthIndexByLabel = monthLabels.reduce((map, label, index) => {
    map.set(label, index);
    return map;
  }, new Map());

  const totalsByCustomer = new Map(topCustomers.map((name) => [name, Array(monthLabels.length).fill(0)]));

  customerMonthly.forEach((item) => {
    if (!totalsByCustomer.has(item.customerName)) return;
    const index = monthIndexByLabel.get(item.month);
    if (typeof index !== 'number') return;
    totalsByCustomer.get(item.customerName)[index] = Number(item.totalPurchase || 0);
  });

  return topCustomers.map((name, index) => ({
    label: name,
    data: totalsByCustomer.get(name),
    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
    borderRadius: 6,
    maxBarThickness: 18
  }));
};

function CustomerAnalyticsSection({ monthLabels, customerSummary, customerMonthly, topCustomerThisMonth, loading }) {
  const datasets = buildCustomerMonthlyDatasets(monthLabels, customerMonthly, customerSummary);
  const hasChartData = datasets.some((dataset) => dataset.data.some((value) => value > 0));
  const highlightedCustomer = topCustomerThisMonth?.topCustomer;

  return (
    <section className="surface-panel">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="section-heading">Customer Analytics</h2>
          <p className="section-subtext">Customer purchase behavior and monthly comparison for selected filters.</p>
        </div>
        <div className="surface-panel">
          <p className="field-label mb-0">Top Customer this month</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--text-strong)]">
            {loading ? 'Loading...' : topCustomerThisMonth ? `${topCustomerThisMonth.topCustomer}` : 'No data available'}
          </p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            {loading ? 'Loading...' : topCustomerThisMonth ? `${topCustomerThisMonth.month}: ${formatCurrency(topCustomerThisMonth.amount)}` : 'No data available'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="table-shell">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="table-th">Customer</th>
                <th className="table-th text-right">Total Purchase</th>
                <th className="table-th text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">Loading...</td>
                </tr>
              ) : customerSummary.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-sm text-[color:var(--text-muted)]">No data available</td>
                </tr>
              ) : (
                customerSummary.map((item) => {
                  const isTop = highlightedCustomer && highlightedCustomer === item.customerName;

                  return (
                    <tr key={item.customerName} className={`table-row ${isTop ? 'bg-[color:var(--accent-blue)]/10' : ''}`}>
                      <td className="table-td font-medium text-[color:var(--text-strong)]">{item.customerName}</td>
                      <td className="table-td text-right font-medium text-[color:var(--accent-blue)]">{formatCurrency(item.totalPurchase)}</td>
                      <td className="table-td text-right text-[color:var(--text-soft)]">{item.totalOrders}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="surface-panel">
          <p className="section-heading">Monthly Purchase Comparison</p>
          <p className="section-subtext">Top customers by total purchase across months.</p>
          <div className="mt-4 h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] text-sm text-[color:var(--text-muted)]">
                Loading...
              </div>
            ) : hasChartData ? (
              <Bar
                data={{
                  labels: monthLabels,
                  datasets
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#9CA3AF',
                        boxWidth: 10,
                        boxHeight: 10,
                        font: {
                          size: 11,
                          weight: '500'
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: '#9CA3AF',
                        font: { size: 11, weight: '500' }
                      }
                    },
                    y: {
                      grid: { color: 'rgba(156, 163, 175, 0.12)' },
                      ticks: {
                        color: '#9CA3AF',
                        font: { size: 11, weight: '500' },
                        callback: (value) => formatCurrency(value)
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] text-sm text-[color:var(--text-muted)]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerAnalyticsSection;
