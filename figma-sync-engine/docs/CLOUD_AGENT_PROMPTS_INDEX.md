# 📋 Prompts para Cloud Agent — Sumário

Este documento lista todos os prompts criados para desbloquear o desenvolvimento do `figma-sync-engine`.

---

## 📌 Prompts Disponíveis

### 1. **CLOUD_AGENT_MVP5_PROMPT.md** — Implementação Completa do MVP-5
**Quando usar**: Para contexto completo, arquitetura, e guia passo a passo.

- **Tamanho**: Extenso (~800 linhas)
- **Público**: Cloud agents, time técnico
- **Conteúdo**:
  - Contexto do projeto
  - Status de implementação atual
  - Tarefas detalhadas com exemplos de código
  - Guia de 4 passos: revisar `panel.tsx`, completar testes, smoke test, validar
  - Referências internas

**Quando usar**: 
- Primeira vez trabalhar no MVP-5
- Precisa entender contexto completo
- Quer exemplos de código detalhados

---

### 2. **MVP5_QUICK_START.md** — TL;DR (2-3 horas)
**Quando usar**: Para começar rapidamente sem ler tudo.

- **Tamanho**: Compacto (~200 linhas)
- **Público**: Desenvolvedores experientes, cloud agents prontos
- **Conteúdo**:
  - O que fazer em 3 passos
  - Arquivos a editar com prioridades
  - Exemplos de código mínimos
  - Checklist antes de PR

**Quando usar**:
- Já conhece o projeto
- Quer implementar rápido
- Precisa apenas de pontos-chave

---

## 🎯 Fluxo Recomendado

```
┌─────────────────────────────────────────┐
│  Cloud Agent começa MVP-5               │
└────────┬────────────────────────────────┘
         │
         ├─→ "Preciso de contexto completo?"
         │   └─→ Ler: CLOUD_AGENT_MVP5_PROMPT.md ✓
         │
         ├─→ "Já conheço o projeto, quer implementar?"
         │   └─→ Ler: MVP5_QUICK_START.md ✓
         │
         └─→ "Pronto pra codar agora?"
             └─→ Ir direto a: packages/storybook-addon-export/src/panel.tsx
```

---

## 📂 Arquivos Criados

| Arquivo | Tipo | Linhas | Objetivo |
|---------|------|--------|----------|
| `docs/CLOUD_AGENT_MVP5_PROMPT.md` | Prompt Completo | ~850 | Contexto + implementação detalhada |
| `docs/MVP5_QUICK_START.md` | Quick Reference | ~200 | TL;DR pronto pra usar |
| `docs/testing.md` | Documentação | ~40 | Como rodar testes (já criado) |

---

## 🚀 Como Usar Este Prompt

1. **Compartilhe o link com seu Cloud Agent**:
   ```
   Leia: docs/CLOUD_AGENT_MVP5_PROMPT.md (contexto completo)
   ou
   Leia: docs/MVP5_QUICK_START.md (rápido)
   ```

2. **Ou copie o conteúdo direto**:
   - Abra `CLOUD_AGENT_MVP5_PROMPT.md`
   - Copie tudo (Ctrl+A)
   - Cole no seu prompt do Cloud Agent

3. **Ou use como referência durante implementação**:
   - Abra em split-screen
   - Consulte conforme precisa

---

## 📊 Status Atual (22/11/2025)

| Task | Status | Bloqueador | Próximo |
|------|--------|-----------|---------|
| MVP-1 a MVP-4 | ✅ Concluído | — | MVP-5 |
| **MVP-5** | 🟡 80% Pronto | Testes + feedback visual | Implementar passo 1-3 |
| MVP-6 a MVP-12 | ⏳ Bloqueado | MVP-5 | Após MVP-5 ✅ |
| AL-2 | ⏳ Bloqueado | — | Após MVP-5 |
| OBS-1 | ⏳ Bloqueado | MVP-5 | Após MVP-5 |

---

## 🔗 Contexto Relacionado

- **Backlog geral**: `docs/backlog.md`
- **Issues abertas**: GitHub repository > Issues (#13-#20)
- **Documentação de testes**: `docs/testing.md`
- **Documentação de arquitetura**: `docs/architecture.md`

---

## ❓ FAQ

**P: Qual prompt devo usar?**
R: Se é primeira vez → `CLOUD_AGENT_MVP5_PROMPT.md`. Se já conhece → `MVP5_QUICK_START.md`.

**P: O código já está pronto?**
R: 80%. Faltam melhorias em `panel.tsx` (feedback visual) e testes em `export.test.ts`.

**P: Quanto tempo leva?**
R: ~2-3 horas com os passos detalhados.

**P: E se algo quebrar?**
R: Está em feature branch (`feat/mvp5-*`). Fácil reverter. Consulte `docs/CONTRIBUTING.md`.

---

**Última atualização**: 22/11/2025  
**Autor**: GitHub Copilot (Full Stack Programmer Mode)  
**Status**: Pronto para Cloud Agent começar MVP-5 ✅
