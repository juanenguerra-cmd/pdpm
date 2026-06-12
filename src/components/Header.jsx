export function Header({ syncStatus = 'Loading...' }) {
  const lowerStatus = String(syncStatus).toLowerCase();
  const isSynced = lowerStatus.includes('sync') || lowerStatus.includes('saved') || lowerStatus.includes('ready');

  return (
    <header className="appHeader">
      <div className="brandBlock">
        <div className="brandMark">PD</div>
        <div>
          <div className="eyebrow">FY2026 PDPM / LTC Revenue Intelligence</div>
          <h1>PDPM Long-Term Care Tracker</h1>
          <p className="headerSubtitle">Resident-level HIPPS, CMI, VPD, NTA, and daily rate tracking with Cloudflare D1 readiness.</p>
        </div>
      </div>

      <div className="headerActions">
        <span className="statusPill">FY2026</span>
        <span className="statusPill">Workers + D1</span>
        <span className={`syncPill ${isSynced ? 'ok' : ''}`}>
          <span className="syncDot" />
          {syncStatus}
        </span>
      </div>
    </header>
  );
}
