# BR BioAge Platform

Clinical intelligence platform for [Beyond Remedy](https://beyondremedyny.com) — unified patient intake, BioAge scoring, lab extraction, and report cards.

## Monorepo structure

| Package | Description |
|---------|-------------|
| `packages/shared` | Scoring engine, intake sections, lab mapping |
| `apps/api` | Express REST API (port 3001) |
| `apps/web` | React + Vite patient/clinician UI (port 5173) |
| `prisma/` | PostgreSQL schema & migrations |

## Setup

1. Copy `.env.example` to `.env` and fill in credentials.
2. `npm install` (from repo root)
3. `npm run db:push` or `npm run db:migrate`
4. `npm run dev` — runs API + web concurrently

## Reference files

Port exact logic from these when available:

- `BR_BioAge_Intake_v3.jsx` → `packages/shared/src/intake/sections.ts`
- `BR_BioAge_Scoring_System.xlsx` → `packages/shared/src/scoring/`
- `BR_BioAge_Report_Card_v4.jsx` → `apps/web/src/components/`

## PDF reports

On **Publish & Send**, the API renders a print-ready 1200px HTML report via Puppeteer, uploads to S3, and emails the patient a PDF link.

- Local: `puppeteer` downloads Chromium automatically
- Railway/Linux: set `PUPPETEER_EXECUTABLE_PATH` to your Chromium binary
- Disable: `SKIP_PDF_GENERATION=true`

## 90-day retest reminders

Reminders fire ~**85 days** after a published report (if no newer final report exists).

| Method | How |
|--------|-----|
| In-process cron | `ENABLE_RETEST_CRON=true` (default schedule `0 9 * * *`) |
| Manual / CI | `npm run job:retest-reminders` |
| HTTP (Railway cron) | `POST /api/cron/retest-reminders` with header `x-cron-secret: $CRON_SECRET` |

Run migration for `retestReminderSentAt` on `ReportCard`.

## Deployment

- **Web:** Vercel (`apps/web`)
- **API + DB:** Railway (`apps/api` + PostgreSQL)
