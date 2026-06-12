export function KpiCard({ label, value, className = "col3", tone = "blue" }) {
  return (
    <div className={`kpi ${className} tone-${tone}`}>
      <div className="kpiTopline">
        <div className="l">{label}</div>
        <div className="kpiSpark" aria-hidden="true" />
      </div>
      <div className="v">{value}</div>
    </div>
  );
}
