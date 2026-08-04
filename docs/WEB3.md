# CareProof — Web3 integration notes

This document maps the codebase to the responsibilities of a **Web3 engineer** integrating blockchain into a **Next.js** product alongside Full-Stack and Frontend teams.

## 1. Wallet architecture

| Piece | Location |
|-------|----------|
| Connection / disconnect / network switch | `hooks/useWalletState.ts` |
| Chain config & `wallet_addEthereumChain` params | `lib/blockchain/network.ts` |
| UI | `components/wallet/WalletButton.tsx`, `WalletPanel.tsx` |
| Wagmi + Query providers | `app/providers.tsx` |

**States exposed to the UI:** `no_wallet`, `disconnected`, `connecting`, `connected`, `wrong_network`, `rejected`.

Design goals:

- Single source of truth for wallet status (components stay thin)
- Explicit wrong-network handling before any write
- Injected wallet first (MetaMask); WalletConnect optional via env

## 2. Transaction flows

| Piece | Location |
|-------|----------|
| Lifecycle hook | `hooks/useTransaction.ts` |
| Status UI | `components/blockchain/TransactionStatus.tsx` |
| Wallet / contract error mapping | `lib/blockchain/errors.ts` |
| Receipt → decoded events | `lib/blockchain/eventDecoder.ts` |

**Lifecycle:**

```
idle → awaiting_signature → submitted → pending → confirmed
                                              ↘ rejected | reverted | failed
```

Writes covered:

- Register record hash
- Grant access
- Revoke access
- Deactivate record

## 3. Deployed contract integration

| Piece | Location |
|-------|----------|
| Contract | `contracts/CareProofRegistry.sol` |
| Deploy | `contracts/scripts/deploy.ts` |
| Tests | `contracts/test/CareProofRegistry.test.ts` |
| App ABI | `lib/blockchain/contractAbi.ts` |
| View hooks | `hooks/useContractReads.ts` |
| Auto deploy in dev | `scripts/dev.js` → writes `NEXT_PUBLIC_CONTRACT_ADDRESS` |

Local network:

| Setting | Value |
|---------|-------|
| Chain ID | `31337` |
| RPC | `http://127.0.0.1:8545` |
| Name | CareProof Local |

## 4. On-chain application layer

**Stored on-chain (minimal):**

- `dataHash` (bytes32)
- `owner` / `creator`
- `createdAt`, `active`
- per-record access map (viewer → bool)

**Never on-chain:** title, description, provider, free-text PHI — those live in Prisma/SQLite.

**App surfaces:**

- Register + verify integrity — `components/blockchain/VerificationPanel.tsx`
- Access control — `components/blockchain/AccessManager.tsx`
- Environment health (RPC + contract) — `components/blockchain/EnvironmentHealth.tsx`, `app/api/health`
- Activity / indexed events APIs — `app/api/activity`, `app/api/indexed-events`
- Indexer stub — `indexer/src/index.ts`

## 5. Working with Full-Stack & Frontend

Suggested ownership split:

| Team | Owns |
|------|------|
| Web3 | ABI, hooks, contract, deploy, network config, TX UX, event decode |
| Full-Stack | Prisma models, REST routes, seed, activity persistence |
| Frontend | Layout, forms, filters, copy, visual states consuming hooks |

Contracts (interfaces):

- Env: `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL`
- Types: `types/index.ts` (`TransactionState`, record DTOs, health status)
- Hash pipeline: `lib/records/normalize.ts` + `lib/records/hash.ts` (must match what is registered on-chain)

## 6. Commands (Web3 day-to-day)

```bash
npm run chain                 # Hardhat node
npm run contract:compile
npm run contract:test
npm run contract:deploy:local
npm run indexer               # event indexer stub
npm run test                  # unit (hash, validation, errors, …)
npm run dev                   # DB + chain + deploy + Next.js
```

## 7. Security notes (integration)

- Never put private keys in `NEXT_PUBLIC_*`
- Hardhat accounts are public test keys only
- App does not request seed phrases
- Sample data is fictional — not a HIPAA/GDPR compliance claim

---

*Use this file as a talking point in interviews: walk from wallet connect → hash → register TX → verify → grant access.*
