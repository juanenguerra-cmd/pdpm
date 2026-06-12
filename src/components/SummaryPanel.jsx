import { calcRates, hippsCode, money } from "../utils/pdpmCalc";
import { KpiCard } from "./KpiCard";

export function SummaryPanel({ pdpm, rows, summaryGeo, setSummaryGeo }) {
  const visibleRows = rows.filter((row) => summaryGeo === "all" || row.geo === summaryGeo);

  const totals = visibleRows.reduce(
    (acc, row) => {
      const rates = calcRates(pdpm, row);
      acc.pt += rates.pt;
      acc.ot += rates.ot;
      acc.slp += rates.slp;
      acc.nsg += rates.nsg;
      acc.nta += rates.nta;
      acc.nonCM += rates.nonCM;
      acc.total += rates.total;
      acc.est100 += rates.est100;
      return acc;
    },
    { pt: 0, ot: 0, slp: 0, nsg: 0, nta: 0, nonCM: 0, total: 0, est100: 0 }
  );

  return (
    <section className="panel card active">
      <div className="grid">
        <KpiCard label="Residents" value={visibleRows.length} />
        <KpiCard label="Total $/day (all residents)" value={money(totals.total)} />
        <KpiCard label="100-day estimate (all residents)" value={money(totals.est100)} />
        <KpiCard label="Avg $/day per resident" value={money(visibleRows.length ? totals.total / visibleRows.length : 0)} />

        <div className="card col12">
          <div className="toolbar noMarginBottom">
            <span className="chip">Filter: <select value={summaryGeo} onChange={(e) => setSummaryGeo(e.target.value)}><option value="all">All</option><option value="urban">Urban</option><option value="rural">Rural</option></select></span>
          </div>
          <div className="tableWrap summaryTable">
            <table>
              <thead>
                <tr><th>Resident</th><th>HIPPS</th><th className="right">PT $</th><th className="right">OT $</th><th className="right">SLP $</th><th className="right">Nursing $</th><th className="right">NTA $</th><th className="right">Non-CM $</th><th className="right">Total $/day</th><th className="right">100-Day Est</th></tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => {
                  const rates = calcRates(pdpm, row);
                  return (
                    <tr key={index}>
                      <td>{row.name}</td><td><span className="chip">{hippsCode(pdpm, row) || "—"}</span></td><td className="right">{money(rates.pt)}</td><td className="right">{money(rates.ot)}</td><td className="right">{money(rates.slp)}</td><td className="right">{money(rates.nsg)}</td><td className="right">{money(rates.nta)}</td><td className="right">{money(rates.nonCM)}</td><td className="right"><b>{money(rates.total)}</b></td><td className="right">{money(rates.est100)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr><th className="right" colSpan="2">Totals</th><th className="right">{money(totals.pt)}</th><th className="right">{money(totals.ot)}</th><th className="right">{money(totals.slp)}</th><th className="right">{money(totals.nsg)}</th><th className="right">{money(totals.nta)}</th><th className="right">{money(totals.nonCM)}</th><th className="right">{money(totals.total)}</th><th className="right">{money(totals.est100)}</th></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
