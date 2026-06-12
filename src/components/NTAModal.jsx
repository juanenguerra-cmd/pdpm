import { ntaGroupFromPoints, sumNTAPoints } from "../utils/pdpmCalc";

export function NTAModal({ pdpm, row, rowIndex, setRows, onClose }) {
  if (!row) return null;

  const selected = new Set(row.ntaSelectedKeys || []);

  const updateSelected = (key, checked) => {
    const nextSelected = new Set(selected);
    if (checked) nextSelected.add(key);
    else nextSelected.delete(key);

    const keys = [...nextSelected];
    const points = sumNTAPoints(pdpm.ntaItems, keys);

    setRows((current) => current.map((candidate, index) => index === rowIndex ? {
      ...candidate,
      ntaSelectedKeys: keys,
      ntaPts: points,
      nta: ntaGroupFromPoints(points),
    } : candidate));
  };

  const setAll = () => {
    const keys = pdpm.ntaItems.map((item) => item.key);
    const points = sumNTAPoints(pdpm.ntaItems, keys);
    setRows((current) => current.map((candidate, index) => index === rowIndex ? { ...candidate, ntaSelectedKeys: keys, ntaPts: points, nta: ntaGroupFromPoints(points) } : candidate));
  };

  const clearAll = () => {
    setRows((current) => current.map((candidate, index) => index === rowIndex ? { ...candidate, ntaSelectedKeys: [], ntaPts: 0, nta: "NF" } : candidate));
  };

  return (
    <div className="modalBackdrop" onClick={(event) => event.target.className === "modalBackdrop" && onClose()}>
      <div className="modal">
        <div className="toolbar modalToolbar">
          <div className="chip">NTA Scoring — {row.name || `Resident ${rowIndex + 1}`}</div>
          <div className="button-row"><button type="button" onClick={setAll}>Select All</button><button type="button" onClick={clearAll}>Clear</button><button type="button" onClick={onClose}>Done</button></div>
        </div>
        <h3>Select NTA conditions/services for this resident</h3>
        <p className="small muted">Points are summed; NTA group is derived automatically.</p>
        <div className="list">
          {pdpm.ntaItems.map((item) => (
            <label className="item" key={item.key}>
              <input type="checkbox" checked={selected.has(item.key)} onChange={(event) => updateSelected(item.key, event.target.checked)} />
              <span><b>{item.key}</b><span className="muted">{item.desc}</span></span>
              <span className="pts">{item.points}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
