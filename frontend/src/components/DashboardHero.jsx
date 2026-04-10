import { formatCurrency } from '../utils/formatCurrency.js';

function DashboardHero({ revenue, profit }) {
  return (
    <section className="mb-6 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="surface-panel">
          <p className="field-label mb-0">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">{formatCurrency(revenue)}</p>
        </div>
        <div className="surface-panel">
          <p className="field-label mb-0">Profit</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">{formatCurrency(profit)}</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
