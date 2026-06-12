const TABS = [
  ["residents", "Residents"],
  ["summary", "Summary"],
  ["lookups", "Lookups & NTA Helper"],
  ["config", "Config"],
];

export function Tabs({ activeTab, onChange }) {
  return (
    <div className="tabs">
      {TABS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`tab ${activeTab === id ? "active" : ""}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
