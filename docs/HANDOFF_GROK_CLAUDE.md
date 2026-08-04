# Puente Grok ↔ Claude — CareProof

Documento de handoff bidireccional. **Léelo al empezar** (Claude o Grok) y **actualízalo al terminar** cada sesión.

| Campo | Valor |
|-------|--------|
| **Repo local** | `C:\Users\javier moz\Desktop\CareProof` |
| **GitHub** | https://github.com/ramsja/CareProof (público, cuenta `ramsja`) |
| **Origen** | Clonado desde `RXDNCPE/CareProof` (privado) |
| **Rama** | `main` |
| **Objetivo** | Afinar el repo como portfolio Web3 (billetera, TX, contratos, capa on-chain en Next.js) |
| **Última sesión Grok** | 2026-08-04 |

---

## Cómo usar el puente

### Desde Claude Code / Claude CLI

```bash
cd "C:\Users\javier moz\Desktop\CareProof"
# Claude lee CLAUDE.md automáticamente en muchos setups.
# Si no: pega al chat:
#   "Lee CLAUDE.md y docs/HANDOFF_GROK_CLAUDE.md y continúa el trabajo abierto."
```

### Desde Grok Build

```text
Continúa CareProof. Lee docs/HANDOFF_GROK_CLAUDE.md y CLAUDE.md.
```

### Protocolo al cerrar sesión

1. Actualiza la sección **Estado** y **Cola de trabajo** abajo.
2. Anota archivos tocados y comandos que pasaron/fallaron.
3. Commit + push si el cambio está listo (`git push origin main`).
4. No commits de secretos (`.env`, `.npmrc` con tokens, `*.db`).

---

## Contexto del producto

CareProof = portal de integridad de registros (sanitarios ficticios):

- **On-chain:** solo `keccak256` + owner/access/active (`CareProofRegistry.sol`)
- **Off-chain:** título, categoría, descripción, activity (Prisma + SQLite)
- **Cliente Web3:** Wagmi v2 + Viem + MetaMask (chain local 31337)
- **App:** Next.js 14 App Router + API routes

Rol al que se orienta el portfolio:

- Arquitectura de billetera  
- Flujos de transacciones  
- Integración de contratos desplegados  
- Capa de aplicación on-chain  
- Colaboración con Full-Stack / Frontend en Next.js  

Detalle técnico: [WEB3.md](./WEB3.md)

---

## Estado (actualizar)

### Hecho

- [x] Repo privado origen descargado y publicado en `ramsja/CareProof`
- [x] Token npm en `.npmrc` eliminado (no commitear secretos); usuario debe revocar token en npmjs
- [x] `.gitignore` reforzado (`*.db`, `.npmrc`)
- [x] Fix script deploy: `package.json` → `contracts/scripts/deploy.ts`
- [x] README ampliado con tabla Web3 engineering + stack
- [x] `docs/WEB3.md` creado
- [ ] Commit + push de docs/README/package.json (pendiente si no se subió)
- [ ] `npm install` completo verificado
- [ ] Tests unitarios / contract tests / typecheck en verde
- [ ] App `npm run dev` arranca (Hardhat + deploy + Next)

### Cola de trabajo (prioridad)

1. **Verificar install y tests**
   - `npm install`
   - `npm run test`
   - `npm run contract:compile` + `npm run contract:test`
   - `npm run typecheck` (si no hay errores de paths)

2. **Afinar portfolio Web3**
   - Revisar UX de wallet / TX status / errores
   - Completar o documentar límites del indexer stub
   - Screenshots o GIFs opcionales en README
   - Topics GitHub: `web3`, `nextjs`, `solidity`, `hardhat`, `wagmi`, `viem`

3. **Calidad de repo**
   - Quitar `tsconfig.tsbuildinfo` del tracking si está versionado
   - Confirmar que no hay `prisma/prisma/dev.db` en git
   - Descripción del repo y About en GitHub alineados con Web3

4. **Postulación (opcional)**
   - Texto corto de postulación apuntando a este repo
   - Walkthrough 2 min: connect → hash → register → verify → grant access

### Bloqueos / notas

- En Windows, paths con espacio (`javier moz`) rompen a veces el credential helper de `gh`; push con token o `gh auth setup-git`.
- `contract:deploy:local` requiere Hardhat node en `http://127.0.0.1:8545`.
- Hardhat test accounts = claves públicas; nunca mainnet.

---

## Mapa rápido de archivos Web3

```
hooks/useWalletState.ts
hooks/useTransaction.ts
hooks/useContractReads.ts
lib/blockchain/{contractAbi,network,errors,eventDecoder}.ts
lib/records/{hash,normalize}.ts
contracts/CareProofRegistry.sol
contracts/scripts/deploy.ts
contracts/test/CareProofRegistry.test.ts
components/blockchain/*
components/wallet/*
scripts/dev.js
indexer/src/index.ts
app/providers.tsx
app/api/health/route.ts
```

---

## Log de sesiones

### 2026-08-04 — Grok

- Clonado CareProof, publicado en GitHub `ramsja`
- Limpieza secretos, README Web3, `docs/WEB3.md`, fix deploy path
- Seguridad PC / WhatsApp en paralelo (no relacionado al código)
- `npm install` iniciado; puede quedar incompleto si se canceló
- Creado este puente + `CLAUDE.md`

### (Claude — rellenar)

- Fecha:
- Cambios:
- Tests:
- Siguiente para Grok:

---

## Comandos de referencia

```bash
cd "C:\Users\javier moz\Desktop\CareProof"
npm install
npm run dev                 # DB + chain + deploy + Next :3000
npm run test
npm run contract:test
npm run typecheck
npm run lint

git status
git add -A
git commit -m "..."
git push origin main
```
