# Flux App — Deployment Guide
## Stack: React + Node/Express + MySQL (Drizzle ORM)

---

## Recommended: Deploy on Railway (All-in-one)

Railway can host your frontend, backend, AND MySQL database in one project.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/flux-app.git
git push -u origin main
```

### Step 2 — Create Railway Project

1. Go to https://railway.app and sign up (free)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `flux-app` repository

### Step 3 — Add MySQL Database

1. In your Railway project, click "+ New" → "Database" → "MySQL"
2. Once created, click the MySQL service → "Variables"
3. Copy the `DATABASE_URL` value (it looks like `mysql://root:password@host:port/railway`)

### Step 4 — Set Environment Variables

In your Railway app service, go to "Variables" and add:

```
DATABASE_URL=         (paste from MySQL service above)
JWT_SECRET=           (any long random string, 32+ chars)
NODE_ENV=production
VITE_APP_ID=flux
OWNER_OPEN_ID=admin
```

Optional (only if you use these features):
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=
BUILT_IN_FORGE_API_KEY=
OAUTH_SERVER_URL=
```

### Step 5 — Run Database Migrations

After first deploy, open Railway's terminal for your app service and run:

```bash
pnpm run db:push
```

### Step 6 — Deploy!

Railway auto-deploys on every push to `main`. Your app will be live at:
`https://your-app-name.up.railway.app`

---

## Alternative: Separate Services

| Layer | Service | Notes |
|---|---|---|
| Frontend | Vercel | Connect GitHub, auto-build |
| Backend | Render | Free Node.js hosting |
| Database | PlanetScale / Railway MySQL | Managed MySQL |

---

## Important Notes

### ⚠️ Manus Plugin Removed
The original `vite-plugin-manus-runtime` from `vite.config.ts` has been removed —
it only works inside the Manus platform and would break production builds.

### ⚠️ Package Manager
This project uses **pnpm**, not npm. Railway/Render will auto-detect this.
If deploying manually, run `pnpm install` (not `npm install`).

### ⚠️ Build Command
```bash
pnpm install
pnpm run build        # builds both frontend (Vite) and backend (esbuild)
pnpm run start        # starts production server
```

### ⚠️ Database is MySQL, not PostgreSQL
Your Drizzle config uses `dialect: "mysql"`. Use a MySQL-compatible database.
PlanetScale and Railway MySQL are both good options.

---

## Local Development

1. Create a `.env` file (copy from `.env.example`)
2. Fill in your local MySQL connection string
3. Run:
```bash
pnpm install
pnpm run db:push      # run migrations
pnpm run dev          # start dev server
```
