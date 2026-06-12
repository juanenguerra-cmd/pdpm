import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { ResidentsPanel } from "./components/ResidentsPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { LookupsPanel } from "./components/LookupsPanel";
import { ConfigPanel } from "./components/ConfigPanel";
import { NTAModal } from "./components/NTAModal";
import { PDPM, DEFAULT_NON_CM, RATE_OVERRIDE_KEY, STORAGE_KEY } from "./data/pdpmData";
import { createDefaultRow, todayISO } from "./utils/pdpmCalc";
import { useLocalStorage } from "./hooks/useLocalStorage";
import "./styles.css";

function loadPdpmWithOverrides() {
  const next = structuredClone(PDPM);
  next.nonCM = { ...DEFAULT_NON_CM };

  try {
    const raw = localStorage.getItem(RATE_OVERRIDE_KEY);
    if (!raw) return next;
    const overrides = JSON.parse(raw);
    if (overrides.baseRates) next.baseRates = { ...next.baseRates, ...overrides.baseRates };
    if (overrides.nonCM) next.nonCM = { ...next.nonCM, ...overrides.nonCM };
  } catch {
    // Keep defaults when saved overrides are invalid.
  }

  return next;
}

export default function App() {
  const defaultPdpm = useMemo(() => ({ ...structuredClone(PDPM), nonCM: { ...DEFAULT_NON_CM } }), []);
  const [pdpm, setPdpm] = useState(loadPdpmWithOverrides);
  const [rows, setRows] = useLocalStorage(STORAGE_KEY, [createDefaultRow(pdpm)]);
  const [activeTab, setActiveTab] = useState("residents");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [globalAsOf, setGlobalAsOf] = useState(todayISO());
  const [globalGeo, setGlobalGeo] = useState("urban");
  const [summaryGeo, setSummaryGeo] = useState("all");
  const [ntaModalIndex, setNtaModalIndex] = useState(null);

  const modalRow = ntaModalIndex === null ? null : rows[ntaModalIndex];

  return (
    <>
      <Header />
      <main className="wrap">
        <Tabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "residents" && (
          <ResidentsPanel
            pdpm={pdpm}
            rows={rows}
            setRows={setRows}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            search={search}
            setSearch={setSearch}
            globalAsOf={globalAsOf}
            setGlobalAsOf={setGlobalAsOf}
            globalGeo={globalGeo}
            setGlobalGeo={setGlobalGeo}
            onOpenNta={setNtaModalIndex}
          />
        )}

        {activeTab === "summary" && <SummaryPanel pdpm={pdpm} rows={rows} summaryGeo={summaryGeo} setSummaryGeo={setSummaryGeo} />}
        {activeTab === "lookups" && <LookupsPanel pdpm={pdpm} />}
        {activeTab === "config" && <ConfigPanel pdpm={pdpm} setPdpm={setPdpm} defaultPdpm={defaultPdpm} />}
      </main>

      <footer className="imprint">© 2025 Developed by Juan Enguerra</footer>

      <NTAModal pdpm={pdpm} row={modalRow} rowIndex={ntaModalIndex} setRows={setRows} onClose={() => setNtaModalIndex(null)} />
    </>
  );
}
