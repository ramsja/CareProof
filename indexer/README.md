# CareProof Event Indexer

This folder is the intended place for a **blockchain event indexer**.

## Why this exists

CareProof currently stores an `Activity` log when the UI confirms a wallet transaction.
That is useful, but it is **not** the same as indexing events from the chain.

A proper indexer should:

1. Connect to the local Hardhat RPC (`http://127.0.0.1:8545`)
2. Read logs from `CareProofRegistry`
3. Persist normalized rows into `IndexedEvent`
4. Track progress in `ChainCursor`
5. Avoid duplicate inserts
6. Resume after restart
7. Handle temporary RPC failures

## Database models (already added)

- `ChainCursor` — last successfully processed block per chain ID
- `IndexedEvent` — unique on `(chainId, transactionHash, logIndex)`

## Events to index

From `CareProofRegistry`:

- `RecordRegistered`
- `AccessGranted`
- `AccessRevoked`
- `RecordDeactivated`

ABI: `lib/blockchain/contractAbi.ts`  
Contract address: `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

## Stub entry point

```bash
npm run indexer
```

Currently `indexer/src/index.ts` is a stub. Implement the indexing loop there.

## Related API

```text
GET /api/indexed-events
```

Returns rows from `IndexedEvent` (empty until the indexer is implemented).

## Notes

- Local evaluation only — chain ID `31337`
- Do not store personal health content on-chain or in indexed payloads beyond event args
- Prefer advancing the cursor only after successful DB writes
