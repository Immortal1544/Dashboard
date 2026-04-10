function ChartCard({ title, description, children, className = '' }) {
  return (
    <section className={`surface-panel flex h-full flex-col ${className}`}>
      <div className="mb-5">
        <h2 className="section-heading">{title}</h2>
        {description && <p className="section-subtext">{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export default ChartCard;
