import { useState } from "react";
import { DEFAULT_NON_CM, RATE_OVERRIDE_KEY } from "../data/pdpmData";
import { money } from "../utils/pdpmCalc";

const COMPONENTS = ["PT", "OT", "SLP", "NURS", "NTA"];

export function ConfigPanel({ pdpm, setPdpm, defaultPdpm }) {
  const [geo, setGeo] = useState("urban");
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState(() => createDraft(pdpm, "urban"));

  function createDraft(source, selectedGeo) {
    return {
      PT: source.baseRates[selectedGeo].PT,
      OT: source.baseRates[selectedGeo].OT,
      SLP: source.baseRates[selectedGeo].SLP,
      NURS: source.baseRates[selectedGeo].NURS,
      NTA: source.baseRates[selectedGeo].NTA,
      nonCM: source.nonCM?.[selectedGeo] ?? DEFAULT_NON_CM[selectedGeo],
    };
  }

  const changeGeo = (value) => {
    setGeo(value);
    setDraft(createDraft(pdpm, value));
    setStatus("");
  };

  const save = () => {
    const parsed = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, Number(String(value).replace(/[^0-9.-]/g, "")) || 0]));

    setPdpm((current) => {
      const next = structuredClone(current);
      next.baseRates[geo] = {
        PT: parsed.PT,
        OT: parsed.OT,
        SLP: parsed.SLP,
        NURS: parsed.NURS,
        NTA: parsed.NTA,
      };
      next.nonCM = { ...(next.nonCM || DEFAULT_NON_CM), [geo]: parsed.nonCM };
      localStorage.setItem(RATE_OVERRIDE_KEY, JSON.stringify({ baseRates: next.baseRates, nonCM: next.nonCM }));
      return next;
    });

    setStatus("Saved.");
  };

  const reset = () => {
    if (!window.confirm("Reset saved overrides and revert to FY defaults?")) return;
    localStorage.removeItem(RATE_OVERRIDE_KEY);
    const restored = structuredClone(defaultPdpm);
    restored.nonCM = { ...DEFAULT_NON_CM };
    setPdpm(restored);
    setDraft(createDraft(restored, geo));
    setStatus("Reset to defaults.");
  };

  return (
    <section className="panel card active">
      <div className="grid">
        <div className="card col6">
          <h3>Rate Configuration</h3>
          <p className="small muted">Adjust unadjusted Federal per-diem component bases. Changes save on this device and recalculate immediately.</p>

          <div className="toolbar">
            <span className="chip">Set</span>
            <select value={geo} onChange={(event) => changeGeo(event.target.value)}><option value="urban">Urban</option><option value="rural">Rural</option></select>
          </div>

          <div className="formGrid">
            {COMPONENTS.map((component) => (
              <label key={component}>{component} base<input inputMode="decimal" value={draft[component]} onChange={(event) => setDraft({ ...draft, [component]: event.target.value })} /></label>
            ))}
            <label>Non-Case-Mix flat per diem<input inputMode="decimal" value={draft.nonCM} onChange={(event) => setDraft({ ...draft, nonCM: event.target.value })} /></label>
          </div>

          <div className="toolbar">
            <button type="button" onClick={save}>Save</button>
            <button type="button" onClick={reset}>Reset to FY default</button>
            <span className="small muted">{status}</span>
          </div>
        </div>

        <div className="card col6">
          <h3>Current Defaults (read-only)</h3>
          <div className="tableWrap lookupTable">
            <table>
              <thead><tr><th>Geo</th><th>Component</th><th className="right">Value</th></tr></thead>
              <tbody>
                {["urban", "rural"].flatMap((area) => [
                  ...COMPONENTS.map((component) => [area, `${component} base`, defaultPdpm.baseRates[area][component]]),
                  [area, "Non-CM", DEFAULT_NON_CM[area]],
                ]).map(([area, component, value]) => <tr key={`${area}-${component}`}><td>{area}</td><td>{component}</td><td className="right">{money(value)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
