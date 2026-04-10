function StatCard({ title, value, subtitle, trend, trendLabel, icon, tone = 'indigo', valueClassName = '' }) {
  const trendColor = trend >= 0 ? 'text-[color:var(--accent-green)]' : 'text-[color:var(--accent-red)]';

  return (
    <div className="surface-panel card-hover h-full">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <p className="field-label mb-0">{title}</p>
          <p className={`mt-2 text-2xl font-semibold ${valueClassName || 'text-[color:var(--text-strong)]'}`}>{value}</p>
          {typeof trend === 'number' && (
            <p className={`mt-2 text-xs ${trendColor}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% {trendLabel || 'vs prev'}
            </p>
          )}
          {subtitle && <p className="mt-2 text-xs text-[color:var(--text-muted)]">{subtitle}</p>}
        </div>
        {icon && (
          <div className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-hover)] p-2 text-[color:var(--text-muted)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
