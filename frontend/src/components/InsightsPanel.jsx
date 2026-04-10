import { formatCurrency } from '../utils/formatCurrency.js';

function InsightCard({ title, value, message, tone }) {
  return (
    <div className="card">
      <p className="field-label mb-0">{title}</p>
      <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">{value}</p>
      <p className="mt-2 text-xs text-[color:var(--text-muted)] leading-relaxed">{message}</p>
    </div>
  );
}

function InsightsPanel({ insights, companyPerformance = [] }) {
  const topCompanies = companyPerformance.slice(0, 3);

  return (
    <section className="space-y-6">
      <div>
        <h3 className="section-heading">Key Insights</h3>
        <p className="section-subtext">Performance highlights and trends</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {insights.map((insight) => (
          <InsightCard key={insight.title} title={insight.title} value={insight.value} message={insight.message} tone={insight.tone} />
        ))}
      </div>

      {topCompanies.length > 0 && (
        <div className="card">
          <h4 className="section-heading">Top Companies</h4>
          <div className="mt-4 space-y-3">
            {topCompanies.map((company, index) => (
              <div key={company.companyId} className="flex items-center justify-between pb-3 border-b border-[color:var(--surface-border)] last:border-0">
                <div>
                  <p className="font-medium text-[color:var(--text-strong)]"><span className="text-[color:var(--text-muted)]">#{index + 1}</span> {company.companyName}</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-1">{company.orders} orders</p>
                </div>
                <p className="font-semibold text-[color:var(--accent-green)]">{formatCurrency(company.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default InsightsPanel;
