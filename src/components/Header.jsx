export function Header({ syncStatus = 'Loading...' }) {
  return (
    <header>
      <div className="row">
        <h1>Full PDPM Long-Term Care Tracker</h1>
        <span className="pill">FY2026 • Unadjusted Federal Components + Case-Mix + VPD</span>
        <span className="pill">Cloudflare Workers + D1 Ready</span>
        <span className="pill">{syncStatus}</span>
      </div>
    </header>
  );
}
