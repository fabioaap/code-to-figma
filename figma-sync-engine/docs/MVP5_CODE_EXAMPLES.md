# 💻 Exemplos de Código — MVP-5

Snippets prontos para copiar/colar durante implementação.

---

## 1. Melhorar Feedback em `panel.tsx`

### Adicionar State para Duração

```typescript
// No início do componente
const [duration, setDuration] = useState<number | null>(null);

// Na função handleExport
const handleExport = async () => {
    try {
        setError('');
        setStatus('capturing');
        
        const startTime = performance.now(); // ← ADICIONAR ISTO
        
        // ... resto do código ...
        
        const duration = Math.round(performance.now() - startTime); // ← ADICIONAR ISTO
        setDuration(duration); // ← ADICIONAR ISTO
        
        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            setDuration(null); // ← RESETAR ISTO
        }, 3000);
    } catch (err) {
        // ...
    }
};
```

### Renderizar Duração na UI

```typescript
// Na parte de renderização (dentro do return)
{status === 'success' && (
    <p>✅ Exportado com sucesso em {duration}ms</p>
)}

{status === 'error' && (
    <p>❌ Erro: {error}</p>
)}
```

---

## 2. Validar JSON Antes de Exportar

### Importar e Usar `validateFigmaJson`

```typescript
// No topo do arquivo
import { 
    exportToClipboard, 
    exportToFile, 
    validateFigmaJson,    // ← ADICIONAR
    addExportMetadata     // ← ADICIONAR
} from './export';

// Na função handleExport, após criar figmaJson
if (!validateFigmaJson(figmaJson)) {
    throw new Error(
        'JSON Figma inválido. Verifique se captureHtml ou converter retornaram estrutura correta.'
    );
}

// Adicionar metadados
figmaJson = addExportMetadata(figmaJson, {
    storyId: state.storyId || 'unknown',
    nodeCount: capture?.nodeCount || 0,
    duration: Math.round(performance.now() - startTime)
});
```

---

## 3. Melhorar Logs de Erro

### Usar Console e Exibir Melhor

```typescript
const handleExport = async () => {
    try {
        // ...
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        // Log detalhado no console para debugging
        console.error('[Figma Export Error]', {
            storyId: state.storyId,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
        
        setError(errorMessage);
        setStatus('error');
        
        // Auto-reset após 5 segundos
        setTimeout(() => setStatus('idle'), 5000);
    }
};
```

---

## 4. Testes em `export.test.ts`

### Teste Básico de Validação

```typescript
import { validateFigmaJson, addExportMetadata } from './export';
import { describe, it, expect } from 'vitest';

describe('validateFigmaJson', () => {
    it('deve aceitar FRAME válido', () => {
        const validJson = {
            type: 'FRAME',
            name: 'MyComponent',
            children: []
        };
        expect(validateFigmaJson(validJson)).toBe(true);
    });

    it('deve aceitar TEXT válido', () => {
        const textJson = {
            type: 'TEXT',
            characters: 'Hello'
        };
        expect(validateFigmaJson(textJson)).toBe(true);
    });

    it('deve rejeitar sem type', () => {
        const invalidJson = { name: 'test' };
        expect(validateFigmaJson(invalidJson)).toBe(false);
    });

    it('deve rejeitar type inválido', () => {
        const invalidJson = { type: 'INVALID_TYPE' };
        expect(validateFigmaJson(invalidJson)).toBe(false);
    });

    it('deve rejeitar null/undefined', () => {
        expect(validateFigmaJson(null)).toBe(false);
        expect(validateFigmaJson(undefined)).toBe(false);
    });
});
```

### Teste de Metadados

```typescript
describe('addExportMetadata', () => {
    it('deve adicionar __export com timestamp', () => {
        const json = { type: 'FRAME' };
        const result = addExportMetadata(json);
        
        expect(result.__export).toBeDefined();
        expect(result.__export.timestamp).toBeDefined();
        expect(result.__export.version).toBe('0.1.0');
        expect(result.__export.engine).toBe('figma-sync-engine');
    });

    it('deve preservar dados originais', () => {
        const json = { type: 'FRAME', name: 'Test' };
        const result = addExportMetadata(json);
        
        expect(result.type).toBe('FRAME');
        expect(result.name).toBe('Test');
    });

    it('deve aceitar metadados customizados', () => {
        const json = { type: 'FRAME' };
        const metadata = { storyId: 'button-primary', nodeCount: 42 };
        const result = addExportMetadata(json, metadata);
        
        expect(result.__export.storyId).toBe('button-primary');
        expect(result.__export.nodeCount).toBe(42);
    });
});
```

### Teste Mock de Clipboard

```typescript
import { exportToClipboard } from './export';
import { vi } from 'vitest'; // Para mock

describe('exportToClipboard', () => {
    it('deve copiar para clipboard com sucesso', async () => {
        // Mock do navigator.clipboard
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: mockWriteText },
            writable: true
        });

        const json = { type: 'FRAME', name: 'Test' };
        const result = await exportToClipboard(json);

        expect(mockWriteText).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.method).toBe('clipboard');
        expect(result.size).toBeGreaterThan(0);
    });

    it('deve lançar erro se Clipboard não disponível', async () => {
        // Simular navegador sem Clipboard
        const clipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            writable: true
        });

        const json = { type: 'FRAME' };
        
        try {
            await exportToClipboard(json);
            throw new Error('Should have thrown');
        } catch (err) {
            expect(err).toBeDefined();
        } finally {
            // Restaurar
            Object.defineProperty(navigator, 'clipboard', {
                value: clipboard,
                writable: true
            });
        }
    });
});
```

---

## 5. Refatorar Estilos (Opcional)

### De Styles Inline para CSS Modules

**Antes:**
```typescript
const styles = {
    container: { padding: '16px', backgroundColor: '#fafafa' },
    button: { padding: '8px 16px', backgroundColor: '#007bff' }
};

<div style={styles.container}>
```

**Depois (CSS Module):**

Criar `panel.module.css`:
```css
.container {
    padding: 16px;
    background-color: #fafafa;
    border-radius: 8px;
}

.button {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.success {
    color: #28a745;
}

.error {
    color: #dc3545;
}
```

Em `panel.tsx`:
```typescript
import styles from './panel.module.css';

export const ExportPanel: React.FC = () => {
    return (
        <div className={styles.container}>
            {status === 'success' && <p className={styles.success}>✅ Exportado!</p>}
            {status === 'error' && <p className={styles.error}>❌ Erro!</p>}
            <button className={styles.button} onClick={handleExport}>
                Exportar
            </button>
        </div>
    );
};
```

---

## 6. Checklist de Implementação

Copie e marque conforme progride:

```markdown
## MVP-5 Implementação

### panel.tsx
- [ ] Adicionar `startTime` e `duration` no estado
- [ ] Renderizar duração no feedback de sucesso
- [ ] Importar `validateFigmaJson` e `addExportMetadata`
- [ ] Validar JSON antes de exportar
- [ ] Melhorar logs de erro com `console.error`
- [ ] Testar manualmente em Storybook

### export.test.ts
- [ ] Teste de `validateFigmaJson` (5 casos)
- [ ] Teste de `addExportMetadata` (3 casos)
- [ ] Teste de `exportToClipboard` com mock (2 casos)
- [ ] Teste de `exportToFile` (2 casos)
- [ ] Rodar: `pnpm test --filter @figma-sync-engine/storybook-addon-export`

### Validação Final
- [ ] `pnpm build --filter @figma-sync-engine/storybook-addon-export` — ✓
- [ ] `pnpm lint` — ✓
- [ ] `pnpm test` — ✓ (cobertura ≥80%)
- [ ] Smoke test manual em Storybook — ✓

### Commit e PR
- [ ] `git commit -m "feat(addon): enhance MVP-5 with feedback and tests (#15)"`
- [ ] Abrir PR no GitHub
- [ ] Referenciar issue #15
```

---

## 📝 Dicas Gerais

1. **Use TypeScript Strict**: Se falha tipo, é porque estrutura está errada.
2. **Console.log abundante**: Durante desenvolvimento, use para debugar.
3. **Vitest Watch**: `pnpm test --filter @figma-sync-engine/storybook-addon-export -- --watch` para dev rápido.
4. **Storybook Dev**: `pnpm dev` enquanto testa interface visual.
5. **Git Frequente**: Faça commits pequenos e frequentes (`git add . && git commit -m "..."`).

---

**Sucesso na implementação! Qualquer erro, consulte `docs/CLOUD_AGENT_MVP5_PROMPT.md` ou abra issue #15 com detalhes.**
