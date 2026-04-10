import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartCard from './ChartCard.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const SALES_COLOR = '#60A5FA';

const DISTRIBUTION_PALETTE = [
  '#93C5FD',
  '#7DB3FA',
  '#6BA4F7',
  '#5B95F2',
  '#4E87EA',
  '#447AD9',
  '#3E6EC8',
  '#3A63B6',
  '#3758A2',
  '#334E8D',
  '#2F4478',
  '#2A3B67'
];

function DashboardCharts({
  monthLabels,
  monthlySales,
  yearlySales,
  yearlyLabels,
  salesDistributionLabels,
  salesDistributionValues,
  selectedYear,
  topCompany
}) {
  const hasSalesData = monthlySales.some((value) => value > 0);
  const hasYearlyData = yearlySales.some((value) => value > 0);
  const hasDistributionData = salesDistributionValues.some((value) => value > 0);
  const strongestMonthIndex = monthlySales.indexOf(Math.max(...monthlySales, 0));
  const strongestMonth = strongestMonthIndex >= 0 ? monthLabels[strongestMonthIndex] : null;
  const yearlyDirection = yearlySales.length > 1 && yearlySales[yearlySales.length - 1] >= yearlySales[yearlySales.length - 2] ? 'up' : 'down';
  const selectedYearNumber = Number(selectedYear);
  const selectedYearIndex = yearlyLabels.findIndex((value) => Number(value) === selectedYearNumber);
  const selectedYearSales = selectedYearIndex >= 0 ? Number(yearlySales[selectedYearIndex] || 0) : 0;
  const previousYearSales = selectedYearIndex > 0 ? Number(yearlySales[selectedYearIndex - 1] || 0) : 0;
  const yearOverYearChange = previousYearSales > 0
    ? ((selectedYearSales - previousYearSales) / previousYearSales) * 100
    : selectedYearSales > 0
      ? 100
      : 0;
  const peakedMonthLabel = strongestMonth || 'N/A';
  const revenueInsightText = yearOverYearChange >= 0
    ? `Revenue increased by ${Math.abs(yearOverYearChange).toFixed(1)}% this year`
    : `Revenue decreased by ${Math.abs(yearOverYearChange).toFixed(1)}% this year`;
  const averageMonthlySales = selectedYearSales / 12;
  const activeSalesMonths = monthlySales.filter((value) => value > 0).length;
  const hasAnyChartData = hasSalesData || hasYearlyData || hasDistributionData;

  const tooltipStyle = {
    backgroundColor: '#111827',
    titleColor: '#F3F4F6',
    bodyColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#1F2937',
    cornerRadius: 10,
    titleFont: {
      size: 12,
      weight: '600'
    },
    bodyFont: {
      size: 12,
      weight: '500'
    },
    padding: 10,
    displayColors: false
  };

  const commonScales = {
    x: {
      grid: {
        color: 'rgba(156, 163, 175, 0.08)',
        drawBorder: false,
        drawTicks: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8
      }
    },
    y: {
      grid: {
        color: 'rgba(156, 163, 175, 0.12)',
        drawBorder: false,
        drawTicks: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 11,
          weight: '500'
        },
        maxTicksLimit: 6,
        padding: 8,
        callback: (value) => formatCurrency(value)
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 260, easing: 'easeOutQuad' },
    layout: {
      padding: {
        top: 6,
        right: 8,
        bottom: 4,
        left: 4
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: commonScales
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 260, easing: 'easeOutQuad' },
    layout: {
      padding: {
        top: 6,
        right: 8,
        bottom: 4,
        left: 4
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: commonScales
  };

  const EmptyState = ({ message }) => (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] text-sm text-[color:var(--text-muted)]">
      {message}
    </div>
  );

  return (
    <>
      <section className="mb-6 surface-panel">
        <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="section-heading">Sales Analytics</h3>
            <p className="section-subtext">Monthly and yearly sales performance from order data</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-[color:var(--text-muted)]">Sales peaked in {peakedMonthLabel}</p>
              <p className="text-xs text-[color:var(--text-muted)]">{revenueInsightText}</p>
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Top performing company: <span className="font-medium text-[color:var(--text-strong)]">{topCompany?.companyName || 'No data'}</span>
            </p>
            {!hasAnyChartData && (
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">No sales records found for current filters. Try another month or year.</p>
            )}
            <p className="mt-2 text-xs text-[color:var(--text-muted)]">Showing data for selected period.</p>
          </div>
          <div className="rounded-xl border border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] px-4 py-3 text-left md:text-right">
            <p className="text-sm text-[color:var(--text-muted)]">Total sales in {selectedYearNumber}</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--text-strong)]">{formatCurrency(selectedYearSales)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-panel">
            <p className="field-label mb-0">Year-to-date Sales</p>
            <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">{formatCurrency(selectedYearSales)}</p>
          </div>
          <div className="surface-panel">
            <p className="field-label mb-0">Average Monthly Sales</p>
            <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">{formatCurrency(averageMonthlySales)}</p>
          </div>
          <div className="surface-panel">
            <p className="field-label mb-0">Active Sales Months</p>
            <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">{activeSalesMonths}/12</p>
          </div>
          <div className="surface-panel">
            <p className="field-label mb-0">Top Company Revenue</p>
            <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">{topCompany ? formatCurrency(topCompany.revenue) : formatCurrency(0)}</p>
          </div>
        </div>
      </section>

      <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Sales Distribution" description="Share of revenue by month for the selected filters." className="h-full">
          {hasDistributionData ? (
            <div className="flex h-full flex-col gap-3">
              <Pie
                data={{
                  labels: salesDistributionLabels,
                  datasets: [
                    {
                      data: salesDistributionValues,
                      backgroundColor: DISTRIBUTION_PALETTE,
                      borderColor: '#111827',
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  animation: { duration: 260, easing: 'easeOutQuad' },
                  layout: {
                    padding: {
                      top: 6,
                      right: 8,
                      bottom: 4,
                      left: 4
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#9CA3AF',
                        boxWidth: 7,
                        boxHeight: 7,
                        font: {
                          size: 11,
                          weight: '500'
                        },
                        usePointStyle: true,
                        padding: 10
                      }
                    },
                    tooltip: {
                      ...tooltipStyle,
                      callbacks: {
                        label: (context) => `${formatCurrency(context.parsed)}`
                      }
                    }
                  }
                }}
              />
              <p className="mt-auto text-xs text-[color:var(--text-muted)]">Top contribution came from <span className="font-medium text-[color:var(--text-strong)]">{strongestMonth || 'N/A'}</span>.</p>
            </div>
          ) : (
            <EmptyState message="No chart data available" />
          )}
        </ChartCard>

        <ChartCard title="Monthly Sales" description="Revenue trend from Jan to Dec." className="h-full">
          {hasSalesData ? (
            <div className="flex h-full flex-col gap-3">
              <div className="h-[280px] flex-1 min-h-[240px]">
              <Bar
                data={{
                  labels: monthLabels,
                  datasets: [
                    {
                      label: 'Sales',
                      data: monthlySales,
                      backgroundColor: 'rgba(96, 165, 250, 0.2)',
                      borderColor: 'rgba(96, 165, 250, 0.5)',
                      borderRadius: 8,
                      borderSkipped: false,
                      borderWidth: 1,
                      maxBarThickness: 24
                    }
                  ]
                }}
                options={barOptions}
              />
              </div>
              <p className="mt-auto text-xs text-[color:var(--text-muted)]">Peak sales month: <span className="font-medium text-[color:var(--text-strong)]">{strongestMonth || 'N/A'}</span>.</p>
            </div>
          ) : (
            <EmptyState message="No chart data available" />
          )}
        </ChartCard>

        <ChartCard title="Yearly Sales" description="How annual sales are moving over time." className="h-full md:col-span-2 xl:col-span-1">
          {hasYearlyData ? (
            <div className="flex h-full flex-col gap-3">
              <div className="h-[280px] flex-1 min-h-[240px]">
              <Line
                data={{
                  labels: yearlyLabels,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: yearlySales,
                      borderColor: SALES_COLOR,
                      backgroundColor: 'rgba(96, 165, 250, 0.12)',
                      tension: 0.35,
                      fill: true,
                      borderWidth: 2.5,
                      pointRadius: 3,
                      pointHoverRadius: 4,
                      pointBackgroundColor: SALES_COLOR,
                      pointBorderColor: '#111827',
                      pointBorderWidth: 1.5
                    }
                  ]
                }}
                options={lineOptions}
              />
              </div>
              <p className="mt-auto text-xs text-[color:var(--text-muted)]">Annual momentum is trending <span className="font-medium text-[color:var(--text-strong)]">{yearlyDirection === 'up' ? 'upward' : 'downward'}</span>.</p>
            </div>
          ) : (
            <EmptyState message="No chart data available" />
          )}
        </ChartCard>
      </div>

      <p className="text-right text-[11px] text-[color:var(--text-muted)]">Powered by Om Swami Samarth Analytics</p>
    </>
  );
}

export default DashboardCharts;
