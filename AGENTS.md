# Multi-agent — Grok · Claude · Z.AI

| Agente | Canal | Entrada |
|--------|--------|---------|
| **Grok** | Grok Build | `docs/AGENT_CODEC.md` + `docs/session-state.json` |
| **Claude** | Claude Code | `CLAUDE.md` → codec |
| **Z.AI** | [chat.z.ai](https://chat.z.ai/) | `docs/PROMPTS.md` (pegar JSON) |

**Codec unificado:** [docs/AGENT_CODEC.md](docs/AGENT_CODEC.md)  
**Estado:** [docs/session-state.json](docs/session-state.json)  
**Handoff:** [docs/HANDOFF.md](docs/HANDOFF.md)

## Reglas

1. Un solo `next_action` activo en `session-state.json`.
2. `git status` antes de editar.
3. Al cerrar: actualizar JSON + log en HANDOFF.
4. Sin secretos en git.
5. Z.AI propone; Grok/Claude aplican en disco cuando haga falta.

## Arranque rápido

- Grok: `CODEC CareProof. Lee docs/AGENT_CODEC.md y session-state.json.`
- Claude: `Lee CLAUDE.md y docs/session-state.json. Ejecuta next_action.`
- Z.AI: copiar **Prompt A** de `docs/PROMPTS.md` + pegar el JSON.
