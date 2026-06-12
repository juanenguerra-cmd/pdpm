const TABS = [
  { id: 'residents', label: 'Residents', icon: '👥', hint: 'Census + rates' },
  { id: 'summary', label: 'Summary', icon: '📊', hint: 'Totals + trends' },
  { id: 'lookups', label: 'Lookups', icon: '📚', hint: 'CMI + NTA' },
  { id: 'config', label: 'Config', icon: '⚙️', hint: 'Rate setup' },
];

export function Tabs({ activeTab, onChange }) {
  return (
    <nav className="tabs" aria-label="PDPM tracker navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tabIcon" aria-hidden="true">{tab.icon}</span>
          <span className="tabCopy">
            <span>{tab.label}</span>
            <small>{tab.hint}</small>
          </span>
        </button>
      ))}
    </nav>
  );
}
