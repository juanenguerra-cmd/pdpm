# PDPM LTC Tracker — Modular React Version

## How to run

```bash
npm install
npm run dev
```

## Main changes from the single-file HTML version

- Moved PDPM source data to `src/data/pdpmData.js`.
- Moved calculation logic to pure utility functions in `src/utils/pdpmCalc.js`.
- Replaced manual DOM rendering with React state and reusable components.
- Added `useLocalStorage` hook for autosave.
- Split UI into tabs/panels: Residents, Summary, Lookups, Config, and NTA Modal.
- Fixed duplicate/conflicting CSS by consolidating layout rules in `src/styles.css`.
- Added missing Non-Case-Mix defaults and a real `DEFAULT_NON_CM` source.
- Avoided mutation during render; global As-of and Geo now update rows through event handlers.

## Suggested next enhancements

- Add TypeScript interfaces for PDPM rows and rate data.
- Add unit tests for `calcRates`, `hippsCode`, `dayInStay`, and NTA grouping.
- Add validation warnings when As-of date is before Admit Date.
- Add CSV/XLSX export for reports.
- Add facility header/footer print template.
