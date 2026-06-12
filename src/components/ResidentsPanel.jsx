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

  const filteredRows = rows
    .map((row, index) => ({ row, index, rates: calcRates(pdpm, row), hipps: hippsCode(pdpm, row) }))
    .filter(({ row, hipps }) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [row.name, row.mrn, row.ptot, row.slp, row.nsg, row.nta, hipps]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

  const nsgTotal = rows.reduce((sum, row) => sum + calcRates(pdpm, row).nsg, 0);
  const ntaTotal = rows.reduce((sum, row) => sum + calcRates(pdpm, row).nta, 0);
  const nsgAvg = rows.length ? rows.reduce((sum, row) => sum + (pdpm.cmi.NURS[row.nsg] || 0), 0) / rows.length : 0;
  const ntaAvg = rows.length ? rows.reduce((sum, row) => sum + (pdpm.cmi.NTA[row.nta] || 0), 0) / rows.length : 0;

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
    <section className="panel card active">
      <div className="toolbar">
        <button type="button" onClick={addResident}>Add Resident</button>
        <button type="button" onClick={deleteSelected}>Delete Selected Row</button>
        <button type="button" onClick={exportJson}>Export</button>
        <label className="buttonLike">
          Import
          <input type="file" accept="application/json" onChange={importJson} hidden />
        </label>
        <button type="button" onClick={resetAll}>Reset</button>
        <span className="chip">Search <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name / MRN / HIPPS / group" /></span>
        <span className="chip">As-of <input type="date" value={globalAsOf} onChange={(e) => applyAsOf(e.target.value || todayISO())} /></span>
        <span className="chip">Rates <select value={globalGeo} onChange={(e) => applyGeo(e.target.value)}><option value="urban">Urban</option><option value="rural">Rural</option></select></span>
      </div>

      <div className="card compactCard">
        <div className="grid">
          <KpiCard label="NSG TOTAL" value={money(nsgTotal)} />
          <KpiCard label="NSG AVG (CMI)" value={nsgAvg.toFixed(3)} />
          <KpiCard label="NTA TOTAL" value={money(ntaTotal)} />
          <KpiCard label="NTA AVG (CMI)" value={ntaAvg.toFixed(3)} />
        </div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th><th>MRN</th><th>Admit Date</th><th>ARD</th><th>As-of</th><th>Day</th><th>Urban/Rural</th><th>PT/OT Group</th><th>SLP Group</th><th>Nursing CMG</th><th>NTA Group</th><th className="right">NTA Pts</th><th>AI</th><th>HIPPS</th><th className="right">PT $</th><th className="right">OT $</th><th className="right">SLP $</th><th className="right">Nursing $</th><th className="right">NTA $</th><th className="right">Non-CM $</th><th className="right">Total $/day</th><th className="right">100-Day Est</th><th>NTA Detail</th>
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
                <td><span className="chip">{hipps || "—"}</span></td>
                <td className="right">{money(rates.pt)}</td>
                <td className="right">{money(rates.ot)}</td>
                <td className="right">{money(rates.slp)}</td>
                <td className="right">{money(rates.nsg)}</td>
                <td className="right">{money(rates.nta)}</td>
                <td className="right">{money(rates.nonCM)}</td>
                <td className="right"><b>{money(rates.total)}</b></td>
                <td className="right">{money(rates.est100)}</td>
                <td><button type="button" onClick={(e) => { e.stopPropagation(); onOpenNta(index); }}>NTA Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="small muted">PT/OT and NTA use Variable Per-Diem factors. HIPPS characters 1-4 are derived from PDPM groups; character 5 is the Assessment Indicator.</p>
    </section>
  );
}
