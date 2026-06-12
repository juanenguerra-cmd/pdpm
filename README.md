# PDPM LTC Tracker — React + Cloudflare Workers + D1

A modular React/Vite PDPM LTC Tracker prepared for GitHub, Cloudflare Workers, and Cloudflare D1 persistence.

## What is included

- React/Vite frontend
- Cloudflare Worker API
- Cloudflare D1 database migration
- Wrangler configuration
- GitHub Actions deployment workflow
- Local fallback storage when D1 is unavailable
- Import/export JSON support

## Project structure

```text
pdpm-react-modular/
├─ .github/workflows/deploy-cloudflare.yml
├─ migrations/0001_schema.sql
├─ worker/index.ts
├─ wrangler.toml
├─ package.json
├─ index.html
└─ src/
   ├─ App.jsx
   ├─ main.jsx
   ├─ components/
   ├─ data/
   ├─ hooks/
   ├─ services/
   └─ utils/
```

## Local React-only development

```bash
npm install
npm run dev
```

This runs the Vite frontend. The app will use browser local storage if the Cloudflare API is not available.

## Cloudflare local development with D1

Create the local D1 schema:

```bash
npm install
npm run d1:migrate:local
npm run build
npm run cf:dev
```

Open the Wrangler local URL. The frontend and `/api/*` routes will run together through the Worker.

## Create the remote D1 database

```bash
npm run d1:create
```

Cloudflare will return a `database_id`. Copy it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "pdpm_ltc_tracker"
database_id = "YOUR_REAL_DATABASE_ID"
```

Apply the migration remotely:

```bash
npm run d1:migrate:remote
```

Deploy:

```bash
npm run cf:deploy
```

## GitHub deployment

1. Push this folder to a GitHub repository.
2. In GitHub repository settings, add these secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Confirm `wrangler.toml` has the correct D1 `database_id`.
4. Push to `main` or run the workflow manually.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Check Worker health |
| GET | `/api/residents` | Load all resident rows from D1 |
| POST | `/api/residents` | Replace/sync all resident rows |
| POST | `/api/resident` | Upsert one resident row |
| DELETE | `/api/resident/:id` | Delete one resident row |

## Database table

The D1 table stores each resident row as JSON so the UI can evolve without frequent schema changes.

```sql
resident_rows (
  id TEXT PRIMARY KEY,
  position INTEGER,
  data TEXT,
  created_at TEXT,
  updated_at TEXT
)
```

## Notes before production use

This starter does not include authentication. Before using with real resident data, add access control, audit logging, and facility-approved privacy/security review. Avoid storing PHI until your deployment has proper safeguards.
