# AGENT CODEC v1 — CareProof

Protocolo **único** para intercambiar contexto entre:

| Agente | Canal | Entry |
|--------|--------|--------|
| **Grok** | Grok Build / CLI | Este codec + `session-state.json` |
| **Claude** | Claude Code / Desktop | `CLAUDE.md` → este codec |
| **Z.AI** | [chat.z.ai](https://chat.z.ai/) (GLM) | Prompt en `docs/PROMPTS.md` + este codec |

Todos leen/escriben el **mismo** estado. No hay handoffs paralelos divergentes.

---

## Formato del codec (obligatorio)

Estado vivo en: [`session-state.json`](./session-state.json)  
Narrativa humana en: [`HANDOFF.md`](./HANDOFF.md)

### Campos de `session-state.json`

```json
{
  "codec_version": "1.0",
  "project": "CareProof",
  "repo_local": "C:\\Users\\javier moz\\Desktop\\CareProof",
  "repo_remote": "https://github.com/ramsja/CareProof",
  "branch": "main",
  "goal": "Portfolio Web3: wallet, TX, contratos, capa on-chain en Next.js",
  "last_agent": "grok|claude|zai",
  "last_updated": "ISO-8601",
  "status": "in_progress|blocked|ready_for_review",
  "done": ["..."],
  "todo": ["..."],
  "blocked": ["..."],
  "files_touched": ["..."],
  "commands_ok": ["..."],
  "commands_failed": ["..."],
  "next_action": "Una sola acción prioritaria",
  "notes": "Libre, corto"
}
```

### Reglas del codec

1. **Al iniciar:** leer `session-state.json` + `HANDOFF.md` + `WEB3.md`.
2. **Antes de editar:** `git status` (no pisar trabajo ajeno).
3. **Al cerrar:** actualizar `session-state.json` y una línea en log de `HANDOFF.md`.
4. **Commit** si hay cambios listos; **no** secretos (`.env`, tokens, `*.db`).
5. Un solo `next_action` a la vez (evita thrashing entre agentes).
6. Si el disco está lleno: no `npm install` masivo; liberar espacio primero.

---

## Frases de arranque (copiar/pegar)

### Grok
```text
CODEC CareProof. Lee docs/AGENT_CODEC.md y docs/session-state.json. Ejecuta next_action.
```

### Claude
```text
Lee CLAUDE.md, docs/AGENT_CODEC.md y docs/session-state.json. Ejecuta next_action y actualiza el codec al terminar.
```

### Z.AI (chat.z.ai)
```text
Eres un ingeniero Web3/Full-Stack. Proyecto CareProof en GitHub ramsja/CareProof.
Lee este estado JSON (session-state) y la guía WEB3 que te pegaré.
Objetivo: portfolio wallet + transacciones + contratos + capa on-chain en Next.js.
Responde con: (1) plan breve, (2) diffs o archivos concretos, (3) session-state.json actualizado completo.
No inventes secretos ni claves. Mantén on-chain solo hash+access; off-chain el contenido.
Estado actual:
<<<pegar docs/session-state.json>>>
```

---

## Roles sugeridos (para no solaparse)

| Agente | Fortaleza en este proyecto |
|--------|----------------------------|
| **Grok** | Shell Windows, git/gh, firewall, arranque local, commits/push |
| **Claude** | Refactor profundo, tests, calidad de código TypeScript/Solidity |
| **Z.AI** | Revisión de diseño, redacción README/postulación, propuestas de arquitectura, code review textual |

Cualquiera puede hacer cualquier tarea si el otro no está; actualiza el codec.

---

## Mapa mínimo Web3

```
hooks/useWalletState.ts | useTransaction.ts | useContractReads.ts
lib/blockchain/* | lib/records/*
contracts/CareProofRegistry.sol | contracts/scripts/deploy.ts
components/blockchain/* | components/wallet/*
scripts/dev.js | indexer/
```

Deploy path: `hardhat run contracts/scripts/deploy.ts --network localhost`  
Chain local: `31337` · RPC `http://127.0.0.1:8545`
