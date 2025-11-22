# 🤖 Prompts para Cloud Agent — README

> Documentação completa e prompts estruturados para implementação do `figma-sync-engine`

---

## 🎯 Objetivo

Fornecer prompts de alta qualidade para Cloud Agents (Claude, GPT, etc.) e desenvolvedores implementarem tarefas do backlog de forma autônoma e bem-documentada.

---

## 📚 Biblioteca de Prompts

### 🟦 MVP-5: Exportação Clipboard e Download

**Status**: 🟡 80% Implementado  
**Prioridade**: 🔴 ALTA  
**Tempo**: 2-3 horas

#### Prompts Disponíveis:

1. **`CLOUD_AGENT_BRIEFING.md`** ⭐ **COMECE AQUI**
   - Resumo executivo
   - 3 passos simples para implementar
   - Checklist final
   - [Ler agora →](./CLOUD_AGENT_BRIEFING.md)

2. **`MVP5_QUICK_START.md`** ⚡ Para Pressa
   - TL;DR em 200 linhas
   - Arquivos a editar com prioridades
   - Exemplos mínimos de código
   - [Ler agora →](./MVP5_QUICK_START.md)

3. **`CLOUD_AGENT_MVP5_PROMPT.md`** 📖 Contexto Completo
   - Contexto do projeto (60 linhas)
   - Arquitetura e estrutura (40 linhas)
   - Tarefas detalhadas (200 linhas)
   - Guia passo a passo (150 linhas)
   - [Ler agora →](./CLOUD_AGENT_MVP5_PROMPT.md)

4. **`MVP5_CODE_EXAMPLES.md`** 💻 Snippets Prontos
   - 6 exemplos de código
   - Testes com mocks
   - Refatoração opcional
   - Checklist de implementação
   - [Ler agora →](./MVP5_CODE_EXAMPLES.md)

#### Índice de Referência:

- **`CLOUD_AGENT_PROMPTS_INDEX.md`** — Índice e FAQ
  - Quando usar cada prompt
  - Fluxo recomendado
  - FAQ
  - [Ler agora →](./CLOUD_AGENT_PROMPTS_INDEX.md)

---

### 🟩 Próximos Prompts (Planejado)

| Task | Prompt | Status | ETA |
|------|--------|--------|-----|
| AL-2: Alinhamentos | `CLOUD_AGENT_AL2_PROMPT.md` | 📋 Planejado | Após MVP-5 |
| OBS-1: Logger | `CLOUD_AGENT_OBS1_PROMPT.md` | 📋 Planejado | Após MVP-5 |
| MVP-10: Kill-switch | `CLOUD_AGENT_MVP10_PROMPT.md` | 📋 Planejado | Após MVP-5 |

---

## 🚀 Como Usar

### Opção 1: Como Cloud Agent

Copie este prompt para seu Cloud Agent:

```
Você está implementando MVP-5 do projeto figma-sync-engine.

1. Leia primeiro: docs/CLOUD_AGENT_BRIEFING.md
2. Depois consulte: docs/CLOUD_AGENT_MVP5_PROMPT.md (para detalhes)
3. Use exemplos: docs/MVP5_CODE_EXAMPLES.md

Objetivo: 80% do código já existe. Você precisa:
- Melhorar feedback visual em panel.tsx (45 min)
- Adicionar testes em export.test.ts (45 min)
- Smoke test manual em Storybook (30 min)

Comece!
```

### Opção 2: Como Desenvolvedor

1. Abra `CLOUD_AGENT_BRIEFING.md` → leia 3 passos
2. Abra `MVP5_CODE_EXAMPLES.md` → copie snippets
3. Edite `panel.tsx` e `export.test.ts` localmente
4. Rode testes e valide

### Opção 3: Para Referência Rápida

- Precisa de contexto? → `CLOUD_AGENT_MVP5_PROMPT.md`
- Precisa de código? → `MVP5_CODE_EXAMPLES.md`
- Tá com pressa? → `MVP5_QUICK_START.md`
- Perdeu o fio? → `CLOUD_AGENT_PROMPTS_INDEX.md`

---

## 📊 Status dos Prompts

| Prompt | Tamanho | Completude | Útil Para |
|--------|---------|-----------|-----------|
| BRIEFING | 200 lin | ✅ 100% | Começar rápido |
| QUICK START | 200 lin | ✅ 100% | Pressa |
| MVP5 PROMPT | 850 lin | ✅ 100% | Contexto |
| CODE EXAMPLES | 350 lin | ✅ 100% | Copiar/colar |
| PROMPTS INDEX | 180 lin | ✅ 100% | Navegar |

---

## 🎓 Estrutura de Um Prompt Bom

Todos os prompts seguem este padrão:

1. **Contexto** (5-10 min leitura)
   - Objetivo
   - Stack tecnológico
   - Status atual

2. **Tarefas** (passo a passo)
   - O que fazer
   - Onde fazer
   - Como validar

3. **Exemplos** (código)
   - Snippets prontos
   - Testes
   - Edge cases

4. **Checklist** (antes de commitar)
   - Testes passam
   - Lint passa
   - Build passa

---

## 📈 Roadmap de Prompts

**Fase 1** (MVP-5): ✅ Completo
- `CLOUD_AGENT_BRIEFING.md`
- `MVP5_QUICK_START.md`
- `CLOUD_AGENT_MVP5_PROMPT.md`
- `MVP5_CODE_EXAMPLES.md`

**Fase 2** (AL-2, OBS-1, MVP-10): 📋 Planejado
- Estrutura similar
- Código preparado
- Exemplos prontos

**Fase 3** (VAR-1, TOK-1, etc): 🔮 Futuro

---

## 🤝 Contribuir com Prompts

Se está criando um novo prompt:

1. **Use este template**:
   ```markdown
   # Prompt Title
   
   **Status**: 80% Ready / In Progress / Planned
   **Time**: X hours
   **Priority**: Must / Should / Could
   
   ## Context (2-3 min)
   ## Current Implementation (10 min)
   ## Tasks (step by step)
   ## Code Examples (copy/paste)
   ## Checklist (before commit)
   ```

2. **Mantenha simples**: Max 1000 linhas
3. **Adicione exemplos**: Código sempre
4. **Referencie**: Links internos
5. **Atualize este README**

---

## 📞 Suporte

- **Erro ao implementar?** → Consulte o prompt relevante
- **Contexto confuso?** → Leia `architecture.md`
- **Issue relacionada?** → Abra/comente em GitHub #15, #16, #17, #19, #20

---

## 📄 Documentação Relacionada

Consulte também:

- `docs/backlog.md` — Backlog completo
- `docs/architecture.md` — Arquitetura do projeto
- `docs/testing.md` — Como rodar testes
- `docs/figma-json-format.md` — Formato JSON Figma
- `CONTRIBUTING.md` — Guia de contribuição

---

## ✨ Prompts Recentes

| Data | Prompt | Versão |
|------|--------|--------|
| 22/11/2025 | `CLOUD_AGENT_BRIEFING.md` | 1.0 |
| 22/11/2025 | `MVP5_QUICK_START.md` | 1.0 |
| 22/11/2025 | `CLOUD_AGENT_MVP5_PROMPT.md` | 1.0 |
| 22/11/2025 | `MVP5_CODE_EXAMPLES.md` | 1.0 |
| 22/11/2025 | `CLOUD_AGENT_PROMPTS_INDEX.md` | 1.0 |

---

## 🎯 TL;DR

1. **Para começar MVP-5**: Leia `CLOUD_AGENT_BRIEFING.md`
2. **Para detalhes**: Leia `CLOUD_AGENT_MVP5_PROMPT.md`
3. **Para código**: Copie de `MVP5_CODE_EXAMPLES.md`
4. **Para navegar**: Use `CLOUD_AGENT_PROMPTS_INDEX.md`

---

**Última atualização**: 22 de novembro de 2025  
**Mantido por**: GitHub Copilot (Full Stack Programmer Mode)  
**Status**: ✅ Pronto para Cloud Agents

---

Boa sorte! O MVP-5 é o penúltimo passo para um fluxo completo. 🚀
