# SOSChain (HerShield Guardian)

SOSChain is a women safety SOS platform that combines fast emergency reporting with tamper-evident blockchain proof.

## Core Stack

- Frontend: React + Vite + Tailwind CSS
- Wallet integration: MetaMask
- Blockchain: Ethereum Sepolia
- Smart contract: Solidity evidence registry (CID anchoring)
- Off-chain evidence storage: IPFS via Pinata
- Backend API: Node.js + Express
- Operational persistence: JSON file store for development (`backend/backend/data/evidence-records.json`)

## Architecture

1. User submits SOS evidence (description + media/audio).
2. Backend validates upload and sends file to Pinata.
3. Pinata returns CID and gateway URL.
4. Backend stores evidence metadata and CID in the evidence store.
5. Police flow writes CID on-chain from MetaMask-enabled dashboard.
6. Transaction hash is persisted and shown in police UI.
7. Police verifies transaction on Etherscan to confirm immutable timestamped proof.

## Chain-of-Custody Model

1. Evidence file hash identity is represented by CID (content addressing).
2. CID is committed to blockchain through contract write.
3. Tx hash links to immutable on-chain event/time.
4. Police verifies CID-to-tx consistency through Etherscan.

This provides integrity proof that evidence reference was not altered after submission.

## Security Controls Implemented

- File type and size restrictions on upload
- CORS policy with localhost development allowances
- In-memory rate limiting for upload/read/tx update APIs
- Optional police endpoint protection via `POLICE_DASHBOARD_TOKEN`
- Audit logging for evidence list reads, uploads, and tx-hash update actions
- Secrets stored server-side in backend `.env`

## Threat Model Summary

- Tampering with evidence metadata: mitigated by CID anchoring and tx hash verification
- API abuse/flooding: mitigated by endpoint-level rate limits
- Unauthorized police API access: mitigated when `POLICE_DASHBOARD_TOKEN` is set
- Operational log gaps: mitigated by audit log (`backend/backend/data/audit-log.jsonl`)

## Reliability Features

- Police dashboard auto-refreshes evidence list every 10 seconds
- Failed tx-hash persistence is queued client-side and retried automatically
- Manual retry control is available from police UI for queued tx-hash saves

## Environment Setup

Root `.env`:

```env
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_sepolia_contract>
VITE_CONTRACT_ADDRESS=<deployed_sepolia_contract>
VITE_API_BASE_URL=http://localhost:3001
VITE_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io/tx/
```

Backend `.env`:

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:8084
MAX_UPLOAD_BYTES=15728640
POLICE_DASHBOARD_TOKEN=
PINATA_JWT=
PINATA_API_KEY=
PINATA_API_SECRET=
```

## Run

1. Start backend from `backend/` with `npm run dev`.
2. Start frontend from root with `npm run dev`.
3. Open police dashboard and connect wallet for on-chain writes.
