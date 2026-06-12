export function KpiCard({ label, value, className = "col3" }) {
  return (
    <div className={`kpi ${className}`}>
      <div className="l">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}
