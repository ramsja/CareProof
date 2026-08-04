# CLAUDE.md — CareProof

Instrucciones de proyecto para **Claude Code** (y cualquier agente).  
Handoff completo con Grok: [docs/HANDOFF_GROK_CLAUDE.md](docs/HANDOFF_GROK_CLAUDE.md)  
Guía Web3: [docs/WEB3.md](docs/WEB3.md)

## Objetivo

Afinar este repositorio como **portfolio de ingeniero Web3** sobre una app **Next.js** existente:

1. Arquitectura de billetera (Wagmi/Viem)
2. Flujos de transacciones (ciclo de vida completo)
3. Integración de contratos desplegados (Hardhat + ABI)
4. Capa de aplicación on-chain (registro hash, access control, eventos)

## Repo

- Path: `C:\Users\javier moz\Desktop\CareProof`
- Remote: `https://github.com/ramsja/CareProof`
- Branch: `main`

## Stack

Next.js 14 · React 18 · Wagmi 2 · Viem · Hardhat · Solidity 0.8.24 · Prisma/SQLite · Vitest · Playwright

## Reglas

- **No** commitear `.env`, `.env.local`, `.npmrc` con tokens, `*.db`, `node_modules/`
- **No** inventar claves privadas ni usar Hardhat keys fuera de local
- Preferir cambios pequeños, testeables; actualizar `docs/HANDOFF_GROK_CLAUDE.md` al cerrar
- Mantener separación: on-chain = hash + access; off-chain = contenido del registro
- El deploy script correcto es `contracts/scripts/deploy.ts` (no `scripts/deploy.ts` en raíz)

## Prioridad actual

1. `npm install` si falta `node_modules`
2. Hacer pasar `npm run test` y `npm run contract:test`
3. Verificar `npm run dev` (puerto 3000 + Hardhat 8545)
4. Pulir README / UX Web3 / docs según fallos encontrados
5. Commit + push a `origin/main`

## Arranque

```bash
npm install
npm run dev
```

Primera ejecución: Prisma migrate/seed, Hardhat node, deploy `CareProofRegistry`, Next.js.

## Al terminar tu sesión

Actualiza la sección **Log de sesiones** y **Estado** en `docs/HANDOFF_GROK_CLAUDE.md` para que Grok pueda continuar.
