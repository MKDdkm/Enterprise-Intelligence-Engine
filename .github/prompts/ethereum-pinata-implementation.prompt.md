---
description: "Implement full Ethereum + Pinata evidence flow end-to-end in an existing monorepo without breaking features"
mode: "agent"
---

You are working in my existing project. Implement full Ethereum + Pinata connection flow end-to-end without breaking current features.

Goal:

Connect wallet from frontend (MetaMask).
Upload evidence/file to Pinata IPFS.
Save returned IPFS CID and metadata to backend.
If smart contract is already used, also store CID/hash on-chain.
Show success/error states clearly in UI.
Project context:

Monorepo with backend and frontend folders.
Reuse existing web3 and backend service files if present.
Do not create duplicate wallet/upload utilities if similar code already exists.
Keep code clean and production-safe.
Tasks to perform:

Scan existing code for:
wallet connect logic
contract interaction utilities
upload/evidence APIs
Pinata/IPFS service files
Create or update env usage:
frontend: NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_CHAIN_ID, NEXT_PUBLIC_CONTRACT_ADDRESS
backend: PINATA_JWT or PINATA_API_KEY and PINATA_API_SECRET
Frontend implementation:
Add connect wallet button logic (request accounts, chain check, account display).
Add upload form with file + metadata fields.
Call backend upload endpoint.
Display CID and transaction hash (if on-chain write happens).
Backend implementation:
Add secure Pinata upload service.
Validate file type/size.
Upload file to Pinata.
Return CID, gateway URL, and metadata.
Save record in DB/model if available.
Smart contract integration (if contract exists):
Add function call to store CID/hash.
Wait for tx confirmation.
Return tx hash to frontend.
Error handling:
Wallet not installed
Wrong network
Upload failed
Contract revert
Backend validation errors
Security:
Never expose secret keys in frontend.
Keep Pinata secrets backend-only.
Sanitize input and enforce upload limits.
Final checks:
Run build/lint for both frontend and backend.
Fix any new errors created by your changes.
Provide a summary of changed files and how to test the full flow.
Acceptance criteria:

User can connect wallet.
User can upload file successfully.
CID is returned and visible.
Evidence data persists (DB and/or chain as existing architecture supports).
No secret leaks.
App compiles and runs.
After implementation, print:
