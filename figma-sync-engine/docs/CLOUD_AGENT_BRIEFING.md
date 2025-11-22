# 🚀 Cloud Agent Briefing — MVP-5 Ready to Go

**Data**: 22 de novembro de 2025  
**Status**: ✅ 80% Pronto, Testes e Feedback Necessários  
**Esforço Estimado**: 2-3 horas  
**Impacto**: Desbloqueia MVP-6, OBS-1, PERF-1

---

## 📌 Contexto em 60 Segundos

O projeto `figma-sync-engine` é um motor que converte componentes Storybook em JSON Figma automaticamente.

**Pipeline Atual**:
```
Storybook Story → HTML Capture → Figma JSON → Auto Layout → Export
     ✅                ✅               ✅           ✅          🟡
```

**MVP-5** é a etapa final: **Exportar** (clipboard ou download).

---

## 📚 Prompts Disponíveis

### 1. **Para Começar Rápido** (Recomendado)
📄 **`docs/MVP5_QUICK_START.md`**
- TL;DR em 200 linhas
- 3 passos: panel, testes, smoke test
- Código pronto pra copiar/colar

### 2. **Para Contexto Completo**
📄 **`docs/CLOUD_AGENT_MVP5_PROMPT.md`**
- Contexto completo do projeto
- Arquitetura e estrutura
- Guia passo a passo detalhado
- Referências internas

### 3. **Para Exemplos de Código**
📄 **`docs/MVP5_CODE_EXAMPLES.md`**
- Snippets prontos pra copiar
- Testes com mocks
- Refatoração de estilos

### 4. **Para Navegar**
📄 **`docs/CLOUD_AGENT_PROMPTS_INDEX.md`**
- Índice de todos os prompts
- Quando usar cada um
- FAQ

---

## ⚡ Comece Aqui: 3 Passos

### Passo 1: Melhorar `panel.tsx` (45 min)

**Arquivo**: `packages/storybook-addon-export/src/panel.tsx`

**Mudanças Necessárias**:
```typescript
// 1. Adicionar state para duração
const [duration, setDuration] = useState<number | null>(null);

// 2. No handleExport, medir tempo
const startTime = performance.now();
// ... export logic ...
const duration = Math.round(performance.now() - startTime);
setDuration(duration);

// 3. Renderizar duração
{status === 'success' && <p>✅ Exportado em {duration}ms</p>}

// 4. Validar JSON
import { validateFigmaJson, addExportMetadata } from './export';
if (!validateFigmaJson(figmaJson)) throw new Error('JSON inválido');
figmaJson = addExportMetadata(figmaJson, { storyId: state.storyId });
```

**Validar**:
```bash
pnpm build --filter @figma-sync-engine/storybook-addon-export
```

### Passo 2: Testes em `export.test.ts` (45 min)

**Arquivo**: `packages/storybook-addon-export/src/export.test.ts`

**Adicionar Testes**:
- ✅ `validateFigmaJson` (5 casos)
- ✅ `addExportMetadata` (3 casos)
- ✅ `exportToClipboard` com mock (2 casos)

**Ver exemplos**: `docs/MVP5_CODE_EXAMPLES.md`

**Validar**:
```bash
pnpm test --filter @figma-sync-engine/storybook-addon-export
# Esperado: Cobertura ≥80%, todos passam
```

### Passo 3: Smoke Test (30 min)

**Executar**:
```bash
pnpm build
pnpm dev
# No navegador: http://localhost:6006
# Testar copiar e baixar em examples/react-button
```

**Checklist**:
- [ ] Botão "Copiar" funciona → "✅ Exportado em XXms"
- [ ] Copiar → JSON válido no clipboard
- [ ] Botão "Baixar" gera `component.figma.json`
- [ ] Arquivo tem estrutura JSON válida

---

## 🎯 Arquivos a Editar

| Arquivo | Linhas | Mudança | Prioridade |
|---------|--------|---------|-----------|
| `panel.tsx` | ~212 | Feedback + validação | 🔴 ALTA |
| `export.test.ts` | ~100 | Adicionar testes | 🟡 MÉDIA |
| `export.ts` | ~155 | Apenas revisar | 🟢 BAIXA |

---

## ✅ Checklist Final

Antes de fazer commit:

```bash
# 1. Testes
pnpm test --filter @figma-sync-engine/storybook-addon-export
# Esperado: ✓ Todos passam, cobertura ≥80%

# 2. Lint
pnpm lint
# Esperado: ✓ Sem erros críticos

# 3. Build
pnpm build
# Esperado: ✓ Addon compila

# 4. Smoke Test Manual
# (Abrir Storybook e testar copiar/baixar)
```

---

## 🔄 Git Workflow

```bash
# 1. Feature branch
git checkout -b feat/mvp5-improve-export-feedback

# 2. Implementar (passos 1-3 acima)

# 3. Commit
git add packages/storybook-addon-export/
git commit -m "feat(addon): enhance MVP-5 with feedback and tests (#15)"

# 4. Push e PR
git push origin feat/mvp5-improve-export-feedback
# Abrir PR no GitHub, referenciar issue #15
```

---

## 📖 Referências Rápidas

| Recurso | Local |
|---------|-------|
| Prompt Completo | `docs/CLOUD_AGENT_MVP5_PROMPT.md` |
| Quick Start | `docs/MVP5_QUICK_START.md` |
| Exemplos de Código | `docs/MVP5_CODE_EXAMPLES.md` |
| Índice de Prompts | `docs/CLOUD_AGENT_PROMPTS_INDEX.md` |
| Issue #15 | GitHub → figma-sync-engine → Issues |
| Backlog | `docs/backlog.md` |

---

## 🆘 Se Ficar Preso

1. **"Qual arquivo editar?"** → `docs/MVP5_QUICK_START.md` seção "Arquivos a Editar"
2. **"Como fazer o teste?"** → `docs/MVP5_CODE_EXAMPLES.md` seção "Testes"
3. **"Contexto completo?"** → `docs/CLOUD_AGENT_MVP5_PROMPT.md`
4. **"Erro de build?"** → Rodar `pnpm test:watch` para debug rápido

---

## 🎁 Bônus: O Que Desbloqueia

Após MVP-5 pronto:

- ✅ **MVP-6**: Plugin Figma importa JSON → frame criado
- ✅ **OBS-1**: Logger de exports com métricas
- ✅ **PERF-1**: Benchmark de performance
- 🎯 **Validação end-to-end**: Designer consegue exportar e importar via UI

---

## 📊 Status Resumido

| Fase | Status | Bloqueador |
|------|--------|-----------|
| 1. Captura HTML | ✅ Feito | Nenhum |
| 2. Conversão JSON | ✅ Feito | Nenhum |
| 3. Auto Layout | ✅ Feito | Nenhum |
| **4. Exportação (MVP-5)** | 🟡 80% | Feedback visual + testes |
| 5. Plugin Figma | ⏳ Bloqueado | Aguarda MVP-5 |

---

**Tempo total esperado: 2-3 horas**  
**Próximo: Após MVP-5, AL-2 (align-items/justify-content)**  
**Suporte**: Consulte prompts acima ou abra issue no GitHub

---

**Boa sorte! Você é o penúltimo passo para fluxo completo Storybook → Figma. 🚀**
