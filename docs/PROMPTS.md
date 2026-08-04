# Prompts listos — Grok · Claude · Z.AI

Copia el bloque del agente que uses.

---

## Z.AI — https://chat.z.ai/

### Prompt A — Continuar CareProof (code review + plan)

```
Actúa como ingeniero Web3 senior. Proyecto: CareProof (Next.js + Wagmi/Viem + Hardhat + Solidity + Prisma).
Repo: https://github.com/ramsja/CareProof

Lee el JSON de estado y responde en español:
1) Resumen del estado (3 bullets)
2) Plan ordenado para next_action y todo[]
3) Riesgos (disco, secretos, multi-agente)
4) session-state.json COMPLETO actualizado (mismo schema codec v1)

Reglas: on-chain solo hash+access; no inventar claves; deploy en contracts/scripts/deploy.ts; chain 31337.

SESSION_STATE:
```

*(Pega debajo el contenido de `docs/session-state.json`)*

### Prompt B — Generar parche / diff

```
Dado este archivo y el objetivo Web3 de CareProof, propón un diff unificado (unified diff)
o el archivo completo listo para copiar. Explica el cambio en 2 frases.
Objetivo: [describe el cambio]
Archivo: [ruta]
Contenido actual:
```

### Prompt C — Texto de postulación Web3

```
Redacta en español (120-180 palabras) una candidatura a "Desarrollador Web3"
usando CareProof como prueba: wallet architecture, transaction flows,
deployed contracts, on-chain app layer, colaboración Next.js.
Enlace: https://github.com/ramsja/CareProof
Tono profesional, sin exagerar compliance médico.
```

---

## Claude Code

```
Lee CLAUDE.md, docs/AGENT_CODEC.md y docs/session-state.json.
Ejecuta next_action. Al terminar actualiza session-state.json y docs/HANDOFF.md.
```

---

## Grok Build

```
CODEC CareProof. Lee docs/AGENT_CODEC.md y docs/session-state.json. Ejecuta next_action.
```
