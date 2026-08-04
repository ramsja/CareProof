# CareProof

**Blockchain Record Integrity and Access Portal**  
by [TechHavenLabs](https://technavenlabs.com)

CareProof demonstrates how cryptographic hashing and a smart contract registry can establish tamper-evident healthcare records without storing personal health information on-chain. Only the `keccak256` hash of a normalised record is registered in the smart contract — all descriptive data is stored locally.

---

## Features

- **Wallet-based identity** — MetaMask-compatible wallet is the only authentication required
- **Deterministic record hashing** — identical records always produce the same `keccak256` hash
- **On-chain hash registry** — `CareProofRegistry` Solidity contract on a local Hardhat network
- **Integrity verification** — compare the local record hash with the on-chain registered hash at any time
- **Access management** — grant and revoke read access per wallet address, with signed transactions
- **Record deactivation** — deactivate a record while preserving its on-chain history
- **Full transaction lifecycle** — awaiting signature → submitted → pending → confirmed / rejected / reverted
- **Decoded contract events** — `RecordRegistered`, `AccessGranted`, `AccessRevoked`, `RecordDeactivated`
- **Activity log** — persistent local record of all blockchain events
- **Event indexer scaffolding** — `ChainCursor` / `IndexedEvent` models, stub indexer, and `GET /api/indexed-events` (for blockchain-backend evaluation work)

---

## Architecture

```
Browser (Next.js)          Local Machine
┌─────────────────┐        ┌──────────────────────┐
│  React + Wagmi  │◄──────►│  Next.js API Routes  │
│  Viem + TanStack│        │  Prisma + SQLite DB  │
└────────┬────────┘        └──────────▲───────────┘
         │ wallet_sendTransaction     │
         ▼                            │ indexed logs (to implement)
┌─────────────────┐                   │
│  MetaMask       │            ┌──────┴───────┐
└────────┬────────┘            │  indexer/    │
         │                     │  (stub)      │
         │ eth_sendRawTransaction└──────▲───────┘
         ▼                              │
┌─────────────────────────────┐         │
│  Hardhat Node               │─────────┘
│  CareProofRegistry.sol      │  getLogs / watch
│  http://127.0.0.1:8545      │
└─────────────────────────────┘
```

**On-chain (blockchain):** hash, owner address, creator address, timestamp, active flag, access grants  
**Off-chain (local SQLite):** record title, category, provider, description, date, transaction metadata, activity log, indexed events (via indexer)

> **Note:** `Activity` rows are written by the app after wallet transactions.  
> `IndexedEvent` rows should be written by a chain indexer reading contract logs. These are different paths.

---

## Prerequisites

- Node.js 18+
- npm 9+
- MetaMask (or compatible browser wallet extension)
- Git

---

## Quick Start

```bash
npm install
npm run dev
```

That's it. The first run will automatically:
1. Generate the Prisma client
2. Create and migrate the SQLite database
3. Seed fictional records
4. Start a local Hardhat blockchain node in the background
5. Deploy the CareProofRegistry smart contract
6. Write the contract address to `.env.local`
7. Start the Next.js dev server at http://localhost:3000

**On subsequent runs**, if the contract is already deployed and the database exists, setup is skipped and startup is near-instant.

> **Wallet setup:** After the app opens, click **"Add CareProof Local"** on the dashboard to add the local network to MetaMask automatically.

---

## Manual Setup (alternative)

If you prefer manual control over each step:

```bash
# Terminal 1 — Hardhat node
npm run chain

# Terminal 2 — Deploy + DB + App
npm run db:setup
npm run contract:deploy:local
npm run dev:next
```

After starting the Hardhat node, configure MetaMask:

| Setting       | Value                     |
|---------------|---------------------------|
| Network Name  | CareProof Local           |
| RPC URL       | http://127.0.0.1:8545     |
| Chain ID      | 31337                     |
| Currency      | ETH                       |

The dashboard provides an **Add CareProof Local** button that calls `wallet_addEthereumChain` automatically.

> **Development accounts:** Hardhat prints 20 funded test accounts on startup. Their private keys are publicly known — never use them on mainnet or with real funds.

---

## Running Tests

```bash
# Unit tests (Vitest)
npm run test

# Contract tests (Hardhat)
npm run contract:test

# End-to-end tests (Playwright) — requires running app on port 3000
npm run test:e2e

# TypeScript check
npm run typecheck

# Lint
npm run lint
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | **Full auto-start** — DB, Hardhat node, contract deploy, Next.js |
| `npm run dev:next` | Start Next.js only (use when chain is already running) |
| `npm run build` | Create production build |
| `npm run start` | Start production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run chain` | Start local Hardhat node |
| `npm run contract:compile` | Compile Solidity contract |
| `npm run contract:test` | Run Hardhat contract tests |
| `npm run contract:deploy:local` | Deploy to local Hardhat node |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed fictional records |
| `npm run db:setup` | Migrate + seed in one step |
| `npm run db:studio` | Open Prisma Studio |
| `npm run indexer` | Run blockchain event indexer stub (`indexer/src/index.ts`) |
| `npm run dev:all` | Start Hardhat + Next.js together |

---

## Project Structure

```
careproof/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── records/            # POST /api/records, GET /api/records
│   │   │   └── [id]/           # GET /api/records/:id, PATCH /api/records/:id
│   │   ├── activity/           # GET + POST /api/activity
│   │   ├── indexed-events/     # GET /api/indexed-events (indexer-backed)
│   │   └── health/             # GET /api/health
│   ├── dashboard/              # /dashboard
│   ├── records/
│   │   ├── new/                # /records/new
│   │   └── [id]/               # /records/:id
│   ├── activity/               # /activity
│   ├── about/                  # /about
│   ├── layout.tsx
│   ├── page.tsx                # / (landing)
│   └── providers.tsx           # Wagmi + TanStack Query
├── indexer/                    # Blockchain event indexer (stub for evaluation)
│   ├── README.md
│   └── src/index.ts
├── components/
│   ├── blockchain/             # TransactionStatus, VerificationPanel, AccessManager, EnvironmentHealth
│   ├── records/                # RecordCard, RecordFilters, ActivityLog
│   ├── wallet/                 # WalletButton, WalletPanel
│   ├── layout/                 # SiteHeader, SiteFooter
│   └── ui/                     # Badge, Button, Card, Dialog, FormField, HashDisplay, Tabs…
├── contracts/
│   ├── CareProofRegistry.sol
│   ├── scripts/deploy.ts
│   └── test/CareProofRegistry.test.ts
├── hooks/
│   ├── useWalletState.ts       # All wallet states + network actions
│   ├── useTransaction.ts       # Full transaction lifecycle
│   └── useContractReads.ts     # Contract view calls
├── lib/
│   ├── blockchain/             # ABI, event decoder, error utils, network config
│   ├── records/                # normalize.ts, hash.ts
│   ├── validation/             # Zod schemas
│   ├── db.ts                   # Prisma singleton
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── components/             # React Testing Library tests
│   └── e2e/                    # Playwright tests
├── types/index.ts
├── .env.example
├── hardhat.config.ts
├── next.config.ts
└── README.md
```

---

## Troubleshooting

**"Contract not deployed" in health panel**  
Run `npm run chain` first, then `npm run contract:deploy:local` and copy the address into `.env.local`.

**MetaMask shows wrong network**  
Click "Add CareProof Local" in the dashboard, or add the network manually (Chain ID 31337, RPC http://127.0.0.1:8545).

**Database errors**  
Run `npm run db:setup` to apply migrations and seed data.

**Transaction fails with "nonce too high"**  
Reset your MetaMask account: Settings → Advanced → Reset Account. This clears the local nonce cache.

**Hardhat node not running**  
Ensure `npm run chain` is active in a separate terminal before deploying or sending transactions.

---

## Security Notes

- CareProof never requests seed phrases, recovery phrases, or wallet passwords
- Only fictional sample data is used — no real patient records
- This application does not claim HIPAA, GDPR, or any medical/legal compliance
- `LOCAL_DEPLOYER_PRIVATE_KEY` is optional, server-side only, and must never hold real funds
- Never prefix private keys or secrets with `NEXT_PUBLIC_`
- Hardhat test accounts have publicly known keys — use them for local development only

---

## Known Limitations

- Shared record discovery uses a local activity cache; full on-chain log indexing is not implemented
- WalletConnect support requires a free project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- Not optimised for production scale
- No email or off-chain notifications for access grants

---

*CareProof is a TechHavenLabs evaluation project.*
