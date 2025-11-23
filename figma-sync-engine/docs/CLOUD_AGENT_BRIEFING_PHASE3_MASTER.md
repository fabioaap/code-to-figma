# Cloud Agent Briefing - Phase 3: Master Plan (Road to 100%)

> **Contexto**: O projeto atingiu 68% de maturidade. O Core (MVP-1 a MVP-12) está completo.
> **Objetivo**: Zerar o backlog restante (Epics 2, 3, 4, 6, 7, 8) dividindo em 3 Sprints lógicos de alto impacto.

## 🗺️ Estratégia de Execução

Para resolver todos os épicos restantes de forma eficiente, dividiremos o trabalho em 3 Sprints sequenciais.

### 🚀 Sprint 3: Fidelidade Visual & Tokens (Foco: Designer)
**Objetivo**: Garantir que o que é exportado se parece exatamente com o Storybook e usa tokens.
**Estimativa**: 6-8h

1.  **AL-3 (Direction Fallback)**: Garantir que containers sem flex-direction explícito tenham fallback correto.
2.  **AL-7 (Typography)**: Mapear `font-family`, `font-weight`, `font-size`, `line-height` para nós TEXT do Figma.
3.  **TOK-1 (Color Tokens)**: Extrair cores hexadecimais para um dicionário de tokens (`colors.json`).
4.  **TOK-2 (Typography Tokens)**: Extrair estilos de texto para tokens.

### 🧩 Sprint 4: Variantes & Componentes (Foco: Arquitetura)
**Objetivo**: Transformar histórias isoladas em Component Sets organizados.
**Estimativa**: 6-8h

1.  **VAR-1 (Convention)**: Definir como `args` do Storybook viram propriedades de variante.
2.  **VAR-2 (Multi-export)**: Permitir selecionar e exportar múltiplas histórias de uma vez.
3.  **VAR-3 (ComponentSet)**: No plugin, agrupar os frames exportados em um `ComponentSet` do Figma.

### 🛡️ Sprint 5: Produção & Escala (Foco: Engenharia)
**Objetivo**: Performance, Segurança e Documentação final.
**Estimativa**: 4-6h

1.  **PERF-1 (Benchmark)**: Script para medir tempo de conversão.
2.  **SEC-1 (Audit)**: Rodar auditoria de dependências e corrigir vulnerabilidades.
3.  **DOC-4 (CI Badge)**: Adicionar status do build no README.
4.  **OBS-2 (Sanitization)**: Garantir que nenhum dado sensível vá para os logs.

---

## 🤖 Prompt de Ativação (Sprint 3)

Copie e cole o prompt abaixo para iniciar a **Sprint 3** (Fidelidade Visual):

```text
Você é o Cloud Agent responsável pela Sprint 3 do figma-sync-engine.
Referência: docs/CLOUD_AGENT_BRIEFING_PHASE3_MASTER.md

Sua missão é elevar a fidelidade visual da exportação.

Tarefas:
1. Implementar AL-3: Fallback de direção no `autolayout-interpreter`.
2. Implementar AL-7: Mapeamento completo de tipografia em `html-to-figma-core` e `figma-plugin-lite`.
3. Implementar TOK-1 e TOK-2: Extração básica de tokens de cor e tipografia.

Arquivos foco:
- packages/autolayout-interpreter/src/index.ts
- packages/html-to-figma-core/src/index.ts
- packages/figma-plugin-lite/src/code.ts

Critérios de Aceite:
- Textos devem ter fonte, peso e tamanho corretos no Figma.
- Cores devem ser identificadas (ex: "blue-500") se possível, ou hex exato.
- Testes unitários para os novos mapeamentos.

Execute passo a passo, mantendo o build verde.
```

---

## 📋 Checklist de Arquivos para Sprint 3

### AL-3: Direction Fallback
- [ ] Editar `packages/autolayout-interpreter/src/index.ts`
- [ ] Adicionar lógica para inferir direção se `flex-direction` for inválido/ausente.

### AL-7: Typography
- [ ] Editar `packages/html-to-figma-core/src/index.ts`: Capturar computed styles de fonte.
- [ ] Editar `packages/figma-plugin-lite/src/code.ts`: Ler props de fonte e aplicar `figma.loadFontAsync`.

### TOK-1 & TOK-2: Tokens
- [ ] Criar `packages/html-to-figma-core/src/tokens.ts`: Lógica de extração.
- [ ] Integrar no payload JSON final.
