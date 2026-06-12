export function Header({ syncStatus = 'Loading...' }) {
  const status = String(syncStatus || 'Ready');

  return (
    <header className="topbar">
      <div className="topbarBrand">
        <div className="topbarLogo">PD</div>
        <div>
          <h1>PDPM LTC Tracker</h1>
          <span>FY 2026</span>
        </div>
      </div>

      <div className="topbarActions">
        <button type="button" className="ghostBtn">⇩ Export CSV</button>
        <button type="button" className="ghostBtn">▣ Export PDF</button>
        <button type="button" className="ghostBtn">⇧ Import CSV</button>
        <button type="button" className="outlineBtn">⚙ Settings</button>
        <span className="syncPill"><span className="syncDot" />{status}</span>
      </div>
    </header>
  );
}
