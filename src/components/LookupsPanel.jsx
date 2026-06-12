export function LookupsPanel({ pdpm }) {
  const cmiRows = [
    ...pdpm.groups.ptot.map((group) => ["PT", group, pdpm.cmi.PT[group]]),
    ...pdpm.groups.ptot.map((group) => ["OT", group, pdpm.cmi.OT[group]]),
    ...pdpm.groups.slp.map((group) => ["SLP", group, pdpm.cmi.SLP[group]]),
    ...pdpm.groups.nsg.map((group) => ["Nursing", group, pdpm.cmi.NURS[group]]),
    ...pdpm.groups.nta.map((group) => ["NTA", group, pdpm.cmi.NTA[group]]),
  ];

  return (
    <section className="panel card active">
      <div className="grid">
        <div className="card col6">
          <h3>CMIs (FY2026)</h3>
          <p className="small muted">Case-mix indexes used by the calculator.</p>
          <div className="tableWrap lookupTable">
            <table>
              <thead><tr><th>Component</th><th>Group</th><th className="right">CMI</th></tr></thead>
              <tbody>{cmiRows.map(([component, group, cmi]) => <tr key={`${component}-${group}`}><td>{component}</td><td>{group}</td><td className="right">{Number(cmi).toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="card col6">
          <h3>NTA Scoring Helper</h3>
          <p className="small muted">Select conditions from the resident-row NTA Detail button. Points are summed and the NTA group is derived automatically.</p>
          <div className="toolbar"><span className="chip">0→NF • 1-2→NE • 3-5→ND • 6-8→NC • 9-11→NB • 12+→NA</span></div>
          <details>
            <summary>View available NTA items ({pdpm.ntaItems.length})</summary>
            <ul className="small ntaList">
              {pdpm.ntaItems.map((item) => <li key={item.key}>{item.key} ({item.points}) — {item.desc}</li>)}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
