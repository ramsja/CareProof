# Handoff unificado — CareProof

**Fuente de verdad machine-readable:** [`session-state.json`](./session-state.json)  
**Protocolo:** [`AGENT_CODEC.md`](./AGENT_CODEC.md)  
**Prompts Grok/Claude/Z.AI:** [`PROMPTS.md`](./PROMPTS.md)  
**Web3 map:** [`WEB3.md`](./WEB3.md)

> Este archivo reemplaza el handoff solo Grok↔Claude.  
> Agentes: **Grok** · **Claude** · **Z.AI** ([chat.z.ai](https://chat.z.ai/))

---

## Producto

Portal de integridad de registros (datos ficticios):

- On-chain: `keccak256`, owner, access, active — `CareProofRegistry.sol`
- Off-chain: contenido del registro — Prisma/SQLite
- Cliente: Wagmi 2 + Viem + MetaMask (31337)
- App: Next.js 14 App Router

Portfolio para rol: wallet · TX flows · contratos · capa on-chain · Next.js.

---

## Cómo rotar agentes

1. Abre `session-state.json` → mira `next_action`
2. Trabaja solo eso (o el primer `todo` si next_action está hecho)
3. Actualiza JSON + log abajo
4. Push si aplica

### Z.AI

1. Ve a https://chat.z.ai/
2. Usa **Prompt A** de `PROMPTS.md`
3. Pega `session-state.json`
4. Copia de vuelta el JSON actualizado al repo (tú o Grok/Claude lo escriben en disco)

Z.AI no tiene shell en tu PC: ideal para plan, review, texto y diffs.  
Grok/Claude aplican cambios en el filesystem.

---

## Log de sesiones

### 2026-08-04 — Grok
- Repo en ramsja/CareProof; docs Web3; bridge Claude
- Codec unificado v1 + Z.AI (chat.z.ai)
- next_action: espacio disco → npm install → tests

### Claude
- (rellenar)

### Z.AI
- (rellenar)
