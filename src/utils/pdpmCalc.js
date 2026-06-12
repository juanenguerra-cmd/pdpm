import { DEFAULT_NON_CM } from "../data/pdpmData";

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const money = (value) =>
  (Number.isFinite(Number(value)) ? Number(value) : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

export function dayInStay(admitDate, asOfDate) {
  if (!admitDate || !asOfDate) return 1;

  const admit = new Date(`${admitDate}T00:00:00`);
  const asOf = new Date(`${asOfDate}T00:00:00`);

  if (Number.isNaN(admit.getTime()) || Number.isNaN(asOf.getTime())) return 1;

  const diff = Math.floor((asOf - admit) / 86_400_000) + 1;
  return Math.max(1, diff);
}

export function vpdFactor(schedule = [], day = 1) {
  const normalizedDay = Math.max(1, Math.floor(Number(day) || 1));
  return schedule.find((range) => normalizedDay >= range.start && normalizedDay <= range.end)?.factor ?? 1;
}

export function ntaGroupFromPoints(points) {
  const pts = Number(points || 0);
  if (pts >= 12) return "NA";
  if (pts >= 9) return "NB";
  if (pts >= 6) return "NC";
  if (pts >= 3) return "ND";
  if (pts >= 1) return "NE";
  return "NF";
}

export function sumNTAPoints(items = [], selectedKeys = []) {
  const selected = new Set(selectedKeys);
  return items.reduce((sum, item) => sum + (selected.has(item.key) ? Number(item.points || 0) : 0), 0);
}

export function hippsCode(pdpm, row) {
  const ptLetter = pdpm.hippsMaps.ptot_group_to_letter[row.ptot] || "";
  const slpLetter = pdpm.hippsMaps.slp_group_to_letter[row.slp] || "";
  const nsgLetter = pdpm.hippsMaps.nsg_group_to_letter[row.nsg] || "";
  const ntaLetter = pdpm.hippsMaps.nta_group_to_letter[row.nta] || "";
  const ai = row.ai || "1";

  return ptLetter && slpLetter && nsgLetter && ntaLetter
    ? `${ptLetter}${slpLetter}${nsgLetter}${ntaLetter}${ai}`
    : "";
}

export function calcRates(pdpm, row) {
  const geo = row.geo || "urban";
  const base = pdpm.baseRates[geo];
  const nonCMBase = pdpm.nonCM?.[geo] ?? DEFAULT_NON_CM[geo] ?? 0;
  const day = dayInStay(row.admit, row.asof);

  const ptCmi = pdpm.cmi.PT[row.ptot] || 0;
  const otCmi = pdpm.cmi.OT[row.ptot] || 0;
  const slpCmi = pdpm.cmi.SLP[row.slp] || 0;
  const nsgCmi = pdpm.cmi.NURS[row.nsg] || 0;
  const ntaCmi = pdpm.cmi.NTA[row.nta] || 0;

  const pt = base.PT * ptCmi * vpdFactor(pdpm.vpd.ptot, day);
  const ot = base.OT * otCmi * vpdFactor(pdpm.vpd.ptot, day);
  const slp = base.SLP * slpCmi;
  const nsg = base.NURS * nsgCmi;
  const nta = base.NTA * ntaCmi * vpdFactor(pdpm.vpd.nta, day);
  const nonCM = Number(nonCMBase);
  const total = pt + ot + slp + nsg + nta + nonCM;

  let est100 = 0;
  for (let d = 1; d <= 100; d += 1) {
    est100 +=
      base.PT * ptCmi * vpdFactor(pdpm.vpd.ptot, d) +
      base.OT * otCmi * vpdFactor(pdpm.vpd.ptot, d) +
      slp +
      nsg +
      base.NTA * ntaCmi * vpdFactor(pdpm.vpd.nta, d) +
      nonCM;
  }

  return { day, pt, ot, slp, nsg, nta, nonCM, total, est100 };
}

export function createDefaultRow(pdpm, geo = "urban") {
  return {
    name: "",
    mrn: "",
    admit: todayISO(),
    ard: "",
    asof: todayISO(),
    geo,
    ptot: "TA",
    slp: "SA",
    nsg: pdpm.groups.nsg[0],
    nta: "NF",
    ntaPts: 0,
    ntaSelectedKeys: [],
    ai: "1",
  };
}
