# Backend Service

This backend handles secure evidence uploads to Pinata and stores evidence metadata.

## Setup

1. Install dependencies:

   npm install
   npm --prefix backend install

2. Create env files:

   - Copy `.env.example` to `.env` for frontend settings.
   - Copy `backend/.env.example` to `backend/.env` for backend settings.

3. Start backend:

   npm run dev:backend

4. Start frontend:

   npm run dev

## Security Notes

- Keep Pinata secrets only in `backend/.env`.
- Never expose `PINATA_JWT`, `PINATA_API_KEY`, or `PINATA_API_SECRET` in frontend code.
- Evidence records are persisted to `backend/data/evidence-records.json` for local development.

## Maintenance

- Dry-run cleanup summary (no changes):

   npm --prefix backend run clean:test-data

- Keep newest 20 records and remove old test data (creates a backup file first):

   npm --prefix backend run clean:test-data -- --keep=20 --yes

- Remove all records (also creates a backup first):

   npm --prefix backend run clean:test-data -- --drop-all --yes

## API Notes

- Evidence list endpoint supports an optional `limit` query to reduce payload size:

   GET /api/evidence?limit=50
