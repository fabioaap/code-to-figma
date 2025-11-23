# 🔄 Fluxo de Implementação MVP-5

> **Documento**: Guia visual para implementar MVP-5 em 2-3 horas  
> **Públio**: Desenvolvedores, Cloud Agents  
> **Criado**: 22/11/2025  
> **Tempo estimado**: 2-3 horas (45min UI + 45min testes + 30min smoke)

---

## 1️⃣ Visão Geral (60 segundos)

```
┌──────────────────────────────────────────────────────────────┐
│  Storybook Story                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Meu Componente]                                        │ │
│  │                        ┌─────────────────────────┐      │ │
│  │                        │ Exportar para Figma     │      │ │
│  │                        │ ✅ Botão pronto        │      │ │
│  │                        └──────────┬──────────────┘      │ │
│  │                                   │                      │ │
│  │  2️⃣ TASK 1: Feedback Visual       │                      │ │
│  │  ─────────────────────────────────┼─────────────────    │ │
│  │  Adicionar:                       │                      │ │
│  │  • Spinner durante export         │                      │ │
│  │  • Duração em ms                  │                      │ │
│  │  • Mensagem de sucesso/erro       ▼                      │ │
│  │  • Validação JSON inline          Aguardando            │ │
│  │                                    
│  │  3️⃣ TASK 2: Testes (export.test.ts)                      │ │
│  │  ────────────────────────────────────────────────────    │ │
│  │  Adicionar:                                              │ │
│  │  • Mock de navigator.clipboard                           │ │
│  │  • Testes validateFigmaJson (5 casos)                    │ │
│  │  • Testes addExportMetadata (3 casos)                    │ │
│  │  • Testes de exportação (2 casos)                        │ │
│  │                                                           │ │
│  │  4️⃣ TASK 3: Smoke Test (Manual no Storybook)            │ │
│  │  ────────────────────────────────────────────────────    │ │
│  │  Validar:                                                │ │
│  │  • Clicar em "Copiar" → JSON na clipboard               │ │
│  │  • Clicar em "Baixar" → arquivo .json salvo             │ │
│  │  • Mensagens de feedback aparecem                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Resultado: ✅ MVP-5 Completo → Fluxo end-to-end Storybook → Figma pronto!
```

---

## 2️⃣ Arquivos a Editar

### Arquivo 1: `packages/storybook-addon-export/src/panel.tsx`

**Local**: Linha ~150 (onde está o botão de export)

**Mudança**: Adicionar feedback visual (duração + status)

```typescript
// ANTES (atual - linha 150):
const handleExport = async () => {
  const figmaJson = await captureAndConvert();
  await exportWithFallback(figmaJson, 'component.figma.json');
};

// DEPOIS (adicione):
const [duration, setDuration] = useState<number | null>(null);
const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

const handleExport = async () => {
  setExportStatus('exporting');
  const startTime = performance.now();
  
  try {
    const figmaJson = await captureAndConvert();
    
    // ✅ Validar JSON antes de exportar
    if (!validateFigmaJson(figmaJson)) {
      setExportStatus('error');
      return;
    }
    
    await exportWithFallback(figmaJson, 'component.figma.json');
    
    const elapsed = Math.round(performance.now() - startTime);
    setDuration(elapsed);
    setExportStatus('success');
  } catch (error) {
    setExportStatus('error');
  }
};

// Renderizar feedback no JSX:
{exportStatus === 'exporting' && (
  <p>⏳ Exportando...</p>
)}
{exportStatus === 'success' && (
  <p>✅ Exportado em {duration}ms</p>
)}
{exportStatus === 'error' && (
  <p>❌ Erro ao exportar</p>
)}
```

**Tempo**: ~45 minutos

---

### Arquivo 2: `packages/storybook-addon-export/src/export.test.ts`

**Local**: Fim do arquivo (após testes existentes)

**Mudança**: Adicionar 7-10 novos testes

```typescript
// Adicione ao final do arquivo:

describe('validateFigmaJson', () => {
  it('should accept valid Figma JSON structure', () => {
    const validJson = {
      type: 'FRAME',
      children: [],
      name: 'Test'
    };
    expect(validateFigmaJson(validJson)).toBe(true);
  });

  it('should reject missing required fields', () => {
    const invalidJson = { name: 'Test' }; // Sem type, children
    expect(validateFigmaJson(invalidJson)).toBe(false);
  });

  it('should reject non-object input', () => {
    expect(validateFigmaJson(null)).toBe(false);
    expect(validateFigmaJson('string')).toBe(false);
  });

  it('should validate nested structure', () => {
    const nestedJson = {
      type: 'FRAME',
      children: [
        { type: 'TEXT', content: 'Hello', name: 'Text' }
      ],
      name: 'Parent'
    };
    expect(validateFigmaJson(nestedJson)).toBe(true);
  });

  it('should handle empty children array', () => {
    const jsonWithEmpty = {
      type: 'FRAME',
      children: [],
      name: 'Empty'
    };
    expect(validateFigmaJson(jsonWithEmpty)).toBe(true);
  });
});

describe('addExportMetadata', () => {
  it('should add metadata without modifying original JSON', () => {
    const original = { type: 'FRAME', name: 'Test' };
    const metadata = { exportedAt: '2025-11-22', version: '1.0' };
    
    const result = addExportMetadata(original, metadata);
    
    expect(result.__figmaExport).toBeDefined();
    expect(result.__figmaExport.version).toBe('1.0');
  });

  it('should include timestamp in metadata', () => {
    const json = { type: 'FRAME' };
    const metadata = { exportedAt: new Date().toISOString() };
    
    const result = addExportMetadata(json, metadata);
    
    expect(result.__figmaExport.exportedAt).toBeDefined();
  });

  it('should preserve original properties', () => {
    const json = { type: 'FRAME', name: 'Original' };
    const result = addExportMetadata(json, {});
    
    expect(result.type).toBe('FRAME');
    expect(result.name).toBe('Original');
  });
});

describe('exportToClipboard', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('should copy JSON string to clipboard', async () => {
    const json = { type: 'FRAME' };
    const result = await exportToClipboard(json);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should return success status', async () => {
    const result = await exportToClipboard({ type: 'FRAME' });
    expect(result.message).toMatch(/clipboard/i);
  });
});

describe('exportToFile', () => {
  it('should create blob with JSON content', () => {
    const json = { type: 'FRAME', name: 'Test' };
    const result = exportToFile(json, 'test.figma.json');
    
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/file/i);
  });

  it('should use provided filename', () => {
    const result = exportToFile({}, 'custom-name.json');
    // Se houver um campo filename no resultado, validar
    expect(result.success).toBe(true);
  });
});
```

**Tempo**: ~45 minutos

---

### Arquivo 3: Nenhum (a lógica de export já existe!)

**Status**: As funções `exportToClipboard`, `exportToFile`, `validateFigmaJson`, `addExportMetadata` **já estão implementadas** em `export.ts`.

Você só precisa:
1. Integrá-las no `panel.tsx` (feedback visual)
2. Testá-las em `export.test.ts` (cobertura)
3. Validar no Storybook (smoke test)

---

## 3️⃣ Checklist de Implementação

### Passo 1: Preparar Ambiente (10 min)
```bash
# Criar feature branch
git checkout -b feat/mvp5-improve-export-feedback

# Validar que tudo compila
pnpm build --filter @figma-sync-engine/storybook-addon-export

# Abrir arquivos para edição
code packages/storybook-addon-export/src/panel.tsx
code packages/storybook-addon-export/src/export.test.ts
```

### Passo 2: Melhorias no Panel (45 min)
- [ ] Adicionar states `duration` e `exportStatus`
- [ ] Chamar `validateFigmaJson()` antes de exportar
- [ ] Medir tempo com `performance.now()`
- [ ] Renderizar feedback visual (spinner, duração, erro)
- [ ] Testar compilação: `pnpm build`

### Passo 3: Testes em `export.test.ts` (45 min)
- [ ] Adicionar 5 testes para `validateFigmaJson`
- [ ] Adicionar 3 testes para `addExportMetadata`
- [ ] Adicionar 2 testes para `exportToClipboard` (com mock)
- [ ] Adicionar 2 testes para `exportToFile`
- [ ] Rodar: `pnpm test --filter @figma-sync-engine/storybook-addon-export`
- [ ] Todos devem passar ✅

### Passo 4: Smoke Test (30 min)
```bash
# Rodar Storybook
pnpm run storybook --filter @figma-sync-engine/example-react-button

# No browser:
# 1. Abrir story "Button"
# 2. Clicar em "Exportar para Figma"
# 3. Verificar:
#    - Spinner aparece
#    - JSON aparece na clipboard
#    - Duração é mostrada (ex: "✅ Exportado em 245ms")
#    - Arquivo .json é baixado com sucesso

# Se tudo funcionar: ✅ MVP-5 Completo!
```

### Passo 5: Commit e Push (10 min)
```bash
# Validar tudo passa
pnpm test
pnpm lint
pnpm build

# Commit
git add packages/storybook-addon-export/
git commit -m "feat(addon): enhance MVP-5 with feedback visual and tests (#15)"

# Push para review
git push origin feat/mvp5-improve-export-feedback

# Abrir PR no GitHub
# - Título: "feat: Complete MVP-5 with feedback visual and tests"
# - Referência: "Closes #15"
# - Descrição: Ver template abaixo
```

---

## 4️⃣ Template de Pull Request

```markdown
## 🎯 Objetivo
Completar MVP-5: Export de componentes Storybook para Figma com feedback visual e testes.

## 📝 Mudanças
- ✅ Feedback visual no panel.tsx (duração + status)
- ✅ Validação JSON inline antes de exportar
- ✅ 7-10 testes novos em export.test.ts
- ✅ Smoke test validado

## ✅ Checklist
- [ ] Código compila sem erros
- [ ] Todos os testes passam (`pnpm test`)
- [ ] ESLint passa (`pnpm lint`)
- [ ] Smoke test validado (Storybook manual)
- [ ] Nenhuma regressão em MVP-4, MVP-6, etc

## 🔗 Relacionado a
Closes #15 (MVP-5: Feedback visual e testes)

## 📊 Impacto
- Desbloqueia: MVP-6 (plugin completo), MVP-9 (logger), OBS-1 (observabilidade)
- Fluxo E2E pronto: Storybook → JSON → Figma
```

---

## 5️⃣ Validação Final

### Critérios de Sucesso
- ✅ Código compila: `pnpm build` sem erros
- ✅ Testes passam: `pnpm test` com cobertura adequada
- ✅ Lint passa: `pnpm lint` com max 4 warnings
- ✅ Smoke test manual: Copiar/Baixar funcionam
- ✅ Feedback visual: Spinner, duração, status aparecem

### Como Validar Cada Um

```bash
# 1. Compilação
pnpm build --filter @figma-sync-engine/storybook-addon-export
# Esperado: ✅ Build successful

# 2. Testes
pnpm test --filter @figma-sync-engine/storybook-addon-export
# Esperado: ✅ Tests pass (12+ testes)

# 3. Lint
pnpm lint
# Esperado: ✅ ESLint passed (pode ter 4 warnings)

# 4. Smoke test (manual)
pnpm storybook --filter example-react-button
# Esperado:
#  - Story abre
#  - Botão "Exportar para Figma" visível
#  - Clique dispara feedback visual
#  - JSON na clipboard ou arquivo baixado
```

---

## 6️⃣ Tempo Total: 2h 45min (flexível)

| Tarefa | Tempo | Acumulado |
|--------|-------|-----------|
| Setup | 10 min | 10 min |
| Panel feedback | 45 min | 55 min |
| Testes | 45 min | 1h 40min |
| Smoke test | 30 min | 2h 10min |
| Commit/Push | 10 min | 2h 20min |
| Margem de segurança | 25 min | 2h 45min |

---

## 7️⃣ Roadmap após MVP-5

```
✅ MVP-5 Completo
  ↓
🚀 MVP-6 + MVP-9 (paralelo, 2-3h cada)
  ├─ MVP-6: Plugin importa JSON
  └─ MVP-9: Logger de export
  ↓
🚀 AL-2 + OBS-1 (paralelo, 4-6h)
  ├─ AL-2: Alinhamentos (flex justify-content)
  └─ OBS-1: Observabilidade em painel
  ↓
✅ E2E Funcional (Storybook → Figma → Canvas)
```

---

## ⚠️ Armadilhas Comuns

### ❌ Armadilha 1: Esquecer `validateFigmaJson`
**Problema**: Exportar JSON inválido causa erro em MVP-6

**Solução**: Sempre chamar `validateFigmaJson(json)` antes de `exportWithFallback()`

### ❌ Armadilha 2: Não resetar states
**Problema**: Feedback visual fica stuck em "loading"

**Solução**: Sempre `setExportStatus('idle')` antes de novo export

### ❌ Armadilha 3: Mock de clipboard errado
**Problema**: Testes falham porque `navigator.clipboard` undefined

**Solução**: Ver exemplo de mock em `MVP5_CODE_EXAMPLES.md`

### ❌ Armadilha 4: Esquecer de integrar `addExportMetadata`
**Problema**: JSON sem metadados de export

**Solução**: Chamar `addExportMetadata(figmaJson, { exportedAt, version })` antes de exportar

---

## 🎁 Próximas Etapas Após Conclusão

1. **Commit e Push**: Feature branch para main
2. **Merge**: Quando reviewer aprova
3. **Trigger**: MVP-6 pode começar
4. **Timeline**: 24/25 de novembro (próximo 1-2 dias)

---

**Status**: 🚀 Pronto para começar!  
**Tempo Total**: 2h 45min  
**Responsável**: Desenvolvedor ou Cloud Agent  
**Bloqueador Removido**: Nenhum (código 80% pronto)

Boa sorte! 🍀
