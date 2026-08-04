# CLAUDE.md — CareProof

## Codec multiagente (obligatorio)

1. Lee [`docs/AGENT_CODEC.md`](docs/AGENT_CODEC.md)
2. Lee [`docs/session-state.json`](docs/session-state.json) ← **fuente de verdad**
3. Lee [`docs/HANDOFF.md`](docs/HANDOFF.md) y [`docs/WEB3.md`](docs/WEB3.md)
4. Ejecuta **solo** el campo `next_action`
5. Al terminar: actualiza `session-state.json` + log en `HANDOFF.md`

Otros agentes: **Grok** (shell/git) · **Z.AI** https://chat.z.ai/ (plan/review/texto).  
Prompts: [`docs/PROMPTS.md`](docs/PROMPTS.md)

## Objetivo

Portfolio Web3 sobre Next.js:

1. Arquitectura de billetera (Wagmi/Viem)
2. Flujos de transacciones
3. Contratos desplegados (Hardhat)
4. Capa on-chain (hash, access, eventos)

## Repo

- Local: `C:\Users\javier moz\Desktop\CareProof`
- Remote: https://github.com/ramsja/CareProof · branch `main`

## Reglas

- No commitear `.env*`, tokens, `*.db`, `node_modules`
- Deploy: `contracts/scripts/deploy.ts`
- On-chain = hash + access; off-chain = contenido
- Si disco lleno: no forzar `npm install`

## Stack

Next.js 14 · Wagmi 2 · Viem · Hardhat · Solidity 0.8.24 · Prisma/SQLite · Vitest · Playwright
