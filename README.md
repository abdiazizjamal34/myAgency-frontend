# Finance Frontend (Modular)

Componentized React (Vite + Tailwind) UI for your finance CRUD API.

## Structure
- `src/components/` — `RecordForm`, `RecordsTable`, `TotalsCards`, `Layout`
- `src/hooks/useRecords.js` — data fetching + totals
- `src/services/api.js` — Axios client and CRUD methods
- `src/App.jsx` — wires components together

## Run
```bash
cp .env.example .env
npm install
npm run dev
```
Set `VITE_API_BASE` if your backend is on a different origin.