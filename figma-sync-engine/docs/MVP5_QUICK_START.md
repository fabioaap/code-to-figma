# Quick Start — MVP-5 para Cloud Agent

**Tempo estimado**: 2-3 horas de implementação.

## TL;DR — O que Fazer

O código está 80% pronto. Você precisa:

### 1️⃣ Melhorar `panel.tsx` (45 min)
- Adicionar feedback de duração: `const duration = performance.now() - startTime`.
- Validar JSON com `validateFigmaJson(figmaJson)`.
- Melhorar mensagens de erro com `console.error()`.
- Refatorar estilos inline (opcional).

### 2️⃣ Completar Testes em `export.test.ts` (45 min)
- Testar `exportToClipboard` (mock `navigator.clipboard`).
- Testar `exportToFile` (mock `URL.createObjectURL`).
- Testar `validateFigmaJson`.
- Testar `addExportMetadata`.

### 3️⃣ Smoke Test Manual (30 min)
```bash
pnpm build
pnpm dev
# No navegador: http://localhost:6006
# Testar copiar e baixar em examples/react-button
```

---

## Arquivos a Editar

| Arquivo | Mudança | Prioridade |
|---------|---------|-----------|
| `packages/storybook-addon-export/src/panel.tsx` | Melhorar feedback visual | 🔴 ALTA |
| `packages/storybook-addon-export/src/export.test.ts` | Adicionar testes | 🟡 MÉDIA |
| `packages/storybook-addon-export/src/export.ts` | Validar (já completo) | 🟢 BAIXA |

---

## Exemplos de Código

### Melhorar Feedback em `panel.tsx`

**Antes:**
```typescript
setStatus('success');
setTimeout(() => setStatus('idle'), 3000);
```

**Depois:**
```typescript
const startTime = performance.now();
// ... export logic ...
const duration = Math.round(performance.now() - startTime);
setStatus('success');
// Componente renderiza: "✅ Exportado em 245ms"
setTimeout(() => setStatus('idle'), 3000);
```

### Validar JSON antes de Exportar

**Adicionar:**
```typescript
import { validateFigmaJson, addExportMetadata } from './export';

// Após converter para JSON:
if (!validateFigmaJson(figmaJson)) {
  throw new Error('JSON Figma gerado é inválido. Verifique captureHtml ou converter.');
}

// Adicionar metadados:
figmaJson = addExportMetadata(figmaJson, {
  storyId: state.storyId || 'unknown',
  nodeCount: capture.nodeCount,
  duration: Math.round(performance.now() - startTime)
});
```

### Teste Simples em `export.test.ts`

```typescript
import { validateFigmaJson, addExportMetadata } from './export';

describe('validateFigmaJson', () => {
  it('deve aceitar FRAME válido', () => {
    expect(validateFigmaJson({ type: 'FRAME', children: [] })).toBe(true);
  });

  it('deve rejeitar sem type', () => {
    expect(validateFigmaJson({ name: 'test' })).toBe(false);
  });
});

describe('addExportMetadata', () => {
  it('deve adicionar __export com timestamp', () => {
    const result = addExportMetadata({ type: 'FRAME' });
    expect(result.__export.timestamp).toBeDefined();
    expect(result.__export.version).toBe('0.1.0');
  });
});
```

---

## Comando para Começar Agora

```bash
# Clone/pull do repo
cd C:\Users\Educacross\Documents\code-to-figma\figma-sync-engine

# Criar feature branch
git checkout -b feat/mvp5-improve-export-feedback

# Abrir arquivos para editar
code packages/storybook-addon-export/src/panel.tsx
code packages/storybook-addon-export/src/export.test.ts

# Quando pronto, rodar validação
pnpm test --filter @figma-sync-engine/storybook-addon-export
pnpm lint
pnpm build

# Se tudo passar, fazer commits
git add packages/storybook-addon-export/
git commit -m "feat(addon): enhance MVP-5 export feedback and tests (#15)"
git push origin feat/mvp5-improve-export-feedback

# Abrir PR no GitHub
```

---

## Checklist Antes de Submeter PR

- [ ] `panel.tsx` exibe duração em feedback de sucesso.
- [ ] `validateFigmaJson` é chamado antes de exportar.
- [ ] Erros exibem mensagens claras no painel e console.
- [ ] `export.test.ts` tem ≥5 testes de cobertura.
- [ ] `pnpm test` passa sem erros.
- [ ] `pnpm lint` passa sem erros.
- [ ] `pnpm build` compila sem avisos críticos.
- [ ] Smoke test manual validou copiar e baixar.

---

## Se Ficar Preso

1. Consulte `docs/CLOUD_AGENT_MVP5_PROMPT.md` para contexto completo.
2. Verifique `packages/storybook-addon-export/src/export.ts` (funções já existem).
3. Rode `pnpm test --filter @figma-sync-engine/storybook-addon-export -- --watch` para debug.
4. Procure por `TODO` ou `FIXME` nos arquivos.

---

**Sucesso! Este é o último passo do MVP. Após MVP-5 estar pronto, o fluxo completo Storybook → Figma estará funcional.**
