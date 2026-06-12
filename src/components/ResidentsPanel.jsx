import { KpiCard } from "./KpiCard";
import { calcRates, createDefaultRow, hippsCode, money, todayISO } from "../utils/pdpmCalc";

const TableSelect = ({ value, options, onChange }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

export function ResidentsPanel({
  pdpm,
  rows,
  setRows,
  selectedIndex,
  setSelectedIndex,
  search,
  setSearch,
  globalAsOf,
  setGlobalAsOf,
  globalGeo,
  setGlobalGeo,
  onOpenNta,
}) {
  const updateRow = (index, patch) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const enrichedRows = rows.map((row, index) => ({ row, index, rates: calcRates(pdpm, row), hipps: hippsCode(pdpm, row) }));
  const filteredRows = enrichedRows.filter(({ row, hipps }) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [row.name, row.mrn, row.ptot, row.slp, row.nsg, row.nta, hipps].join(" ").toLowerCase().includes(q);
  });

  const totals = enrichedRows.reduce(
    (acc, item) => {
      acc.pt += item.rates.pt;
      acc.ot += item.rates.ot;
      acc.slp += item.rates.slp;
      acc.nsg += item.rates.nsg;
      acc.nta += item.rates.nta;
      acc.nonCM += item.rates.nonCM;
      acc.total += item.rates.total;
      acc.est100 += item.rates.est100;
      acc.hipps += Number(item.hipps) || 0;
      return acc;
    },
    { pt: 0, ot: 0, slp: 0, nsg: 0, nta: 0, nonCM: 0, total: 0, est100: 0, hipps: 0 }
  );

  const avgCmi = rows.length
    ? rows.reduce((sum, row) => sum + (pdpm.cmi.NURS[row.nsg] || 0) + (pdpm.cmi.NTA[row.nta] || 0), 0) / rows.length
    : 0;

  const groupTotals = enrichedRows.reduce((acc, item) => {
    const group = item.row.ptot || item.row.nta || "Unassigned";
    if (!acc[group]) acc[group] = { group, residents: 0, hipps: 0, vpd: 0 };
    acc[group].residents += 1;
    acc[group].hipps += Number(item.hipps) || 0;
    acc[group].vpd += item.rates.total;
    return acc;
  }, {});

  const applyAsOf = (value) => {
    setGlobalAsOf(value);
    if (value) setRows((current) => current.map((row) => ({ ...row, asof: value })));
  };

  const applyGeo = (value) => {
    setGlobalGeo(value);
    setRows((current) => current.map((row) => ({ ...row, geo: value })));
  };

  const addResident = () => {
    setRows((current) => [...current, createDefaultRow(pdpm, globalGeo)]);
    setSelectedIndex(rows.length);
  };

  const deleteSelected = () => {
    if (selectedIndex < 0 || rows.length <= 1) return;
    setRows((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const resetAll = () => {
    if (!window.confirm("Reset tracker to a single blank row?")) return;
    setRows([createDefaultRow(pdpm, globalGeo)]);
    setSelectedIndex(0);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ rows }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pdpm_full_tracker_export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.rows)) throw new Error("Invalid import format");
      setRows(imported.rows);
      setSelectedIndex(0);
    } catch {
      window.alert("Could not read file. Make sure it is a valid PDPM tracker export.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="dashboardScreen">
      <div className="facilityHero">
        <div className="facilityCard">
          <div className="buildingIcon">▦</div>
          <div>
            <h2>Sunrise Care Center</h2>
            <p>123 Care Way, Tampa, FL 33601</p>
          </div>
          <span className="bedBadge">305 BEDS</span>
        </div>
        <KpiCard label="Total Residents" value={rows.length} />
        <KpiCard label="Total HIPPS" value={totals.hipps.toFixed(2)} tone="green" />
        <KpiCard label="CMI" value={avgCmi.toFixed(4)} tone="purple" />
        <KpiCard label="Total VPD" value={money(totals.total)} tone="amber" />
      </div>

      <div className="dashboardGrid">
        <section className="card residentsCard">
          <div className="cardHeader">
            <div>
              <h2>Residents</h2>
              <p>Showing {filteredRows.length} of {rows.length} resident rows</p>
            </div>
            <span className="chip">As-of <input type="date" value={globalAsOf} onChange={(e) => applyAsOf(e.target.value || todayISO())} /></span>
          </div>

          <div className="toolbar">
            <button type="button" onClick={addResident}>＋ Add Resident</button>
            <button type="button" onClick={deleteSelected}>✎ Edit / Delete</button>
            <button type="button" onClick={exportJson}>⇩ Export</button>
            <label className="buttonLike">⇧ Import<input type="file" accept="application/json" onChange={importJson} hidden /></label>
            <button type="button" onClick={resetAll}>↻ Refresh</button>
            <span className="chip searchChip">Search <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name / MRN / HIPPS / group" /></span>
            <span className="chip">Rates <select value={globalGeo} onChange={(e) => applyGeo(e.target.value)}><option value="urban">Urban</option><option value="rural">Rural</option></select></span>
          </div>

          <div className="tableWrap residentTableWrap">
            <table>
              <thead>
                <tr>
                  <th>Resident</th><th>MRN</th><th>Admit</th><th>ARD</th><th>As-of</th><th>Day</th><th>Rate</th><th>PT/OT</th><th>SLP</th><th>NSG</th><th>NTA</th><th className="right">NTA Pts</th><th>AI</th><th>HIPPS</th><th className="right">Total $/day</th><th className="right">100-Day Est</th><th>NTA</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(({ row, index, rates, hipps }) => (
                  <tr key={index} className={selectedIndex === index ? "selected" : ""} onClick={() => setSelectedIndex(index)}>
                    <td><input value={row.name} onChange={(e) => updateRow(index, { name: e.target.value })} placeholder="Last, First" /></td>
                    <td><input value={row.mrn} onChange={(e) => updateRow(index, { mrn: e.target.value })} /></td>
                    <td><input type="date" value={row.admit} onChange={(e) => updateRow(index, { admit: e.target.value })} /></td>
                    <td><input type="date" value={row.ard} onChange={(e) => updateRow(index, { ard: e.target.value })} /></td>
                    <td><input type="date" value={row.asof} onChange={(e) => updateRow(index, { asof: e.target.value })} /></td>
                    <td className="right">{rates.day}</td>
                    <td><TableSelect value={row.geo} options={["urban", "rural"]} onChange={(value) => updateRow(index, { geo: value })} /></td>
                    <td><TableSelect value={row.ptot} options={pdpm.groups.ptot} onChange={(value) => updateRow(index, { ptot: value })} /></td>
                    <td><TableSelect value={row.slp} options={pdpm.groups.slp} onChange={(value) => updateRow(index, { slp: value })} /></td>
                    <td><TableSelect value={row.nsg} options={pdpm.groups.nsg} onChange={(value) => updateRow(index, { nsg: value })} /></td>
                    <td><TableSelect value={row.nta} options={pdpm.groups.nta} onChange={(value) => updateRow(index, { nta: value })} /></td>
                    <td className="right"><span className="chip">{Number(row.ntaPts || 0).toFixed(0)}</span></td>
                    <td><TableSelect value={row.ai} options={["0","1","2","3","4","5","6","7","8","9"]} onChange={(value) => updateRow(index, { ai: value })} /></td>
                    <td><span className="chip hippsChip">{hipps || "—"}</span></td>
                    <td className="right"><b>{money(rates.total)}</b></td>
                    <td className="right">{money(rates.est100)}</td>
                    <td><button type="button" onClick={(e) => { e.stopPropagation(); onOpenNta(index); }}>Detail</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rightRail">
          <section className="railCard">
            <h3>PDPM Summary</h3>
            <dl><dt>Total Residents</dt><dd>{rows.length}</dd><dt>Total HIPPS</dt><dd>{totals.hipps.toFixed(2)}</dd><dt>CMI</dt><dd>{avgCmi.toFixed(4)}</dd><dt>Total VPD</dt><dd>{money(totals.total)}</dd></dl>
          </section>
          <section className="railCard">
            <h3>PDPM Group Totals</h3>
            <table className="miniTable"><thead><tr><th>Group</th><th>Residents</th><th>VPD</th></tr></thead><tbody>{Object.values(groupTotals).slice(0, 6).map((item) => <tr key={item.group}><td>{item.group}</td><td>{item.residents}</td><td>{money(item.vpd)}</td></tr>)}</tbody></table>
          </section>
          <section className="railCard">
            <h3>Rate Configuration</h3>
            <dl><dt>Rate Type</dt><dd>{globalGeo}</dd><dt>PT Total</dt><dd>{money(totals.pt)}</dd><dt>NTA Total</dt><dd>{money(totals.nta)}</dd><dt>Non-CM</dt><dd>{money(totals.nonCM)}</dd></dl>
          </section>
        </aside>
      </div>

      <div className="lowerGrid">
        <section className="railCard actionCard"><h3>NTA Assessment</h3><p>No assessment selected.</p><button type="button" onClick={() => onOpenNta(selectedIndex)}>Open NTA Assessment</button></section>
        <section className="railCard activityCard"><h3>Recent Activity</h3><ul><li>Updated resident census and PDPM rows</li><li>Calculated HIPPS and daily totals</li><li>D1 sync status monitored</li></ul></section>
        <section className="railCard quickCard"><h3>Quick Actions</h3><div className="quickGrid"><button type="button" onClick={exportJson}>Export CSV</button><label className="buttonLike">Import<input type="file" accept="application/json" onChange={importJson} hidden /></label><button type="button" onClick={resetAll}>Backup Data</button><button type="button" onClick={() => window.print()}>Print</button></div></section>
      </div>
    </section>
  );
}
