# 🎬 Testes E2E (End-to-End) - Simulando Uso Real

**Simular testes de UI como se fosse um usuário usando o addon na vida real.**

---

## 🎯 O que é Teste E2E?

**E2E = End-to-End** = Testa o fluxo **completo** de um usuário:

```
1. Usuário abre Storybook
   ↓
2. Clica em um componente (Button)
   ↓
3. Vê o painel "Export to Figma"
   ↓
4. Marca histórias (Primary, Secondary)
   ↓
5. Clica "Export"
   ↓
6. JSON é copiado/baixado
   ↓
7. ✅ Sucesso
```

---

## 🚀 Testes E2E Que Podemos Fazer

### 1️⃣ **Teste: Usuário clica em "Export" e copia JSON**

```typescript
// tests/e2e-export.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '../src/panel';

describe('E2E: Usuário exporta componente', () => {
  beforeEach(() => {
    // Mock do Storybook API
    vi.mock('@storybook/manager-api', () => ({
      useStorybookState: () => ({
        storyId: 'Button--primary',
        componentId: 'Button'
      })
    }));
  });

  it('usuário clica export e json é copiado', async () => {
    // 1. Renderizar painel
    render(<ExportPanel />);

    // 2. Verificar se painel carregou
    expect(screen.getByText(/Export to Figma/i)).toBeInTheDocument();

    // 3. Simular usuário clicando em "Export"
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);

    // 4. Aguardar sucesso
    await waitFor(() => {
      expect(screen.getByText(/Exportado com sucesso/i)).toBeInTheDocument();
    });

    // 5. Verificar se clipboard foi chamado
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
```

### 2️⃣ **Teste: Usuário marca múltiplas histórias**

```typescript
describe('E2E: Exportar múltiplas histórias', () => {
  it('usuário marca primary e secondary, depois exporta', async () => {
    render(<ExportPanel />);

    // 1. Encontrar checkboxes
    const primaryCheckbox = screen.getByLabelText('Primary');
    const secondaryCheckbox = screen.getByLabelText('Secondary');

    // 2. Marcar ambos
    fireEvent.click(primaryCheckbox);
    fireEvent.click(secondaryCheckbox);

    // 3. Verificar se estão marcados
    expect(primaryCheckbox).toBeChecked();
    expect(secondaryCheckbox).toBeChecked();

    // 4. Clicar export
    const exportButton = screen.getByRole('button', { name: /Export Multiple/i });
    fireEvent.click(exportButton);

    // 5. Aguardar sucesso
    await waitFor(() => {
      expect(screen.getByText(/Exportado com sucesso/i)).toBeInTheDocument();
    });

    // 6. Verificar JSON contém ambas histórias
    const clipboardCall = navigator.clipboard.writeText.mock.calls[0][0];
    const json = JSON.parse(clipboardCall);
    expect(json.stories).toHaveLength(2);
  });
});
```

### 3️⃣ **Teste: Usuário vê erro quando seleciona nada**

```typescript
describe('E2E: Validação', () => {
  it('usuário não marca nada e vê erro ao clicar export', async () => {
    render(<ExportPanel />);

    // 1. Não marcar nada

    // 2. Clicar export
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);

    // 3. Ver mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/Selecione pelo menos uma história/i)).toBeInTheDocument();
    });
  });
});
```

### 4️⃣ **Teste: Fluxo completo Storybook → Figma**

```typescript
describe('E2E: Fluxo completo Storybook → Figma', () => {
  it('usuário faz todo o fluxo de exportação', async () => {
    // 1. Render do painel
    const { rerender } = render(<ExportPanel />);
    expect(screen.getByText(/Export to Figma/i)).toBeInTheDocument();

    // 2. Simular mudança de história
    vi.mocked(useStorybookState).mockReturnValue({
      storyId: 'Button--primary',
      componentId: 'Button',
      // ... outros campos
    });
    rerender(<ExportPanel />);

    // 3. Marcar história
    const checkbox = screen.getByLabelText('Primary');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // 4. Ver preview (simulado)
    const preview = screen.getByAltText(/Preview/i);
    expect(preview).toBeInTheDocument();

    // 5. Clicar export
    const exportButton = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportButton);

    // 6. Aguardar sucesso
    await waitFor(() => {
      expect(screen.getByText(/Exportado com sucesso/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // 7. Verificar JSON estrutura
    const clipboardCall = navigator.clipboard.writeText.mock.calls[0][0];
    const json = JSON.parse(clipboardCall);
    
    expect(json).toHaveProperty('stories');
    expect(json).toHaveProperty('componentSet');
    expect(json.stories[0]).toHaveProperty('name', 'Button--primary');
    expect(json.stories[0]).toHaveProperty('html');
  });
});
```

---

## 📦 Setup para Testes E2E

### Instalar dependências
```bash
pnpm add -D @testing-library/react @testing-library/user-event jsdom vitest
```

### Configurar vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### Criar setup.ts
```typescript
import { vi } from 'vitest';
import { expect, afterEach } from 'vitest';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Mock Storybook API
vi.mock('@storybook/manager-api', () => ({
  useStorybookState: vi.fn(),
  useParameter: vi.fn(),
}));

// Cleanup após cada teste
afterEach(() => {
  vi.clearAllMocks();
});
```

---

## 🧪 Testes Completos Prontos para Copiar

### Teste 1: Exportar com sucesso
```typescript
// e2e-export-success.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from '../src/panel';
import { useStorybookState } from '@storybook/manager-api';

vi.mock('@storybook/manager-api');

describe('E2E: Export Success Flow', () => {
  beforeEach(() => {
    vi.mocked(useStorybookState).mockReturnValue({
      storyId: 'button--primary',
      componentId: 'button',
      parameters: {},
    } as any);

    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
  });

  it('deve exportar componente com sucesso', async () => {
    render(<ExportPanel />);

    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
```

### Teste 2: Múltiplas histórias
```typescript
// e2e-export-multiple.test.ts
describe('E2E: Export Multiple Stories', () => {
  it('deve exportar 2+ histórias selecionadas', async () => {
    render(<ExportPanel />);

    fireEvent.click(screen.getByLabelText('Primary'));
    fireEvent.click(screen.getByLabelText('Secondary'));

    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
    });

    const json = JSON.parse(navigator.clipboard.writeText.mock.calls[0][0]);
    expect(json.stories.length).toBe(2);
  });
});
```

### Teste 3: Performance
```typescript
// e2e-performance.test.ts
describe('E2E: Performance', () => {
  it('deve exportar em menos de 2 segundos', async () => {
    const start = performance.now();

    render(<ExportPanel />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000); // 2 segundos
  });
});
```

### Teste 4: Validação de erro
```typescript
// e2e-validation-error.test.ts
describe('E2E: Validation Error', () => {
  it('deve mostrar erro se nada foi selecionado', async () => {
    render(<ExportPanel />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(screen.getByText(/selecione/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎮 Como Rodar Testes E2E

```bash
# Rodar todos os testes E2E
pnpm test -- e2e

# Rodar um teste específico
pnpm test -- e2e-export-success.test.ts

# Modo watch (reexecuta ao salvar)
pnpm test -- e2e --watch

# Com coverage detalhado
pnpm test -- e2e --coverage
```

---

## 🔍 Verificar o que o Teste Faz

Cada teste verifica:

| O que | Comando |
|------|---------|
| **UI apareceu** | `expect(screen.getByText(...)).toBeInTheDocument()` |
| **Usuário clicou** | `fireEvent.click(button)` |
| **Estado mudou** | `expect(checkbox).toBeChecked()` |
| **JSON foi copiado** | `expect(clipboard.writeText).toHaveBeenCalled()` |
| **Tempo de execução** | `expect(duration).toBeLessThan(2000)` |
| **Conteúdo do JSON** | `expect(json.stories.length).toBe(2)` |

---

## 📊 Exemplo: Teste Real de Exportação

```typescript
// e2e-real-export.test.ts
describe('E2E: Usuário Real Exportando Button Component', () => {
  it('fluxo: abrir → selecionar → exportar → sucesso', async () => {
    // SETUP
    vi.mocked(useStorybookState).mockReturnValue({
      storyId: 'Button--Primary',
      componentId: 'Button',
    } as any);

    // RENDER
    render(<ExportPanel />);
    expect(screen.getByText(/Export to Figma/i)).toBeInTheDocument();

    // USUÁRIO SELECIONA HISTÓRIAS
    fireEvent.click(screen.getByLabelText('Primary'));
    fireEvent.click(screen.getByLabelText('Secondary'));
    fireEvent.click(screen.getByLabelText('Large'));

    // USUÁRIO CLICA EXPORT
    const exportBtn = screen.getByRole('button', { name: /Export Multiple/i });
    const startTime = performance.now();
    fireEvent.click(exportBtn);

    // AGUARDA SUCESSO
    await waitFor(() => {
      expect(screen.getByText(/✅ Exportado com sucesso/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const duration = performance.now() - startTime;

    // VERIFICA RESULTADO
    const clipboardCall = navigator.clipboard.writeText.mock.calls[0][0];
    const exportedJson = JSON.parse(clipboardCall);

    expect(exportedJson).toMatchObject({
      stories: [
        expect.objectContaining({
          name: 'Button--Primary',
          variant: 'primary',
          html: expect.any(String),
        }),
        expect.objectContaining({
          name: 'Button--Secondary',
          variant: 'secondary',
          html: expect.any(String),
        }),
        expect.objectContaining({
          name: 'Button--Large',
          variant: 'large',
          html: expect.any(String),
        }),
      ],
      componentSet: expect.any(Object),
      metadata: expect.any(Object),
    });

    // VERIFICA PERFORMANCE
    expect(duration).toBeLessThan(2000);

    // VERIFICA JSON VÁLIDO
    expect(exportedJson).toHaveProperty('stories');
    expect(exportedJson.stories).toHaveLength(3);
    expect(exportedJson.componentSet).toBeDefined();
  });
});
```

---

## ✅ Checklist: Testes E2E

- [ ] Instalar `@testing-library/react`
- [ ] Criar `vitest.config.ts` com `environment: 'jsdom'`
- [ ] Criar `test/setup.ts` com mocks
- [ ] Criar `e2e-export-success.test.ts`
- [ ] Criar `e2e-export-multiple.test.ts`
- [ ] Rodar `pnpm test -- e2e`
- [ ] Verificar se todos passam ✅
- [ ] Adicionar coverage com `pnpm test -- e2e --coverage`

---

## 🚀 Próximos Passos

1. **Criar arquivo de teste E2E** em `src/test/e2e-export.test.ts`
2. **Instalar dependências**: `@testing-library/react`
3. **Rodar teste**: `pnpm test -- e2e`
4. **Ver se passa**: ✅
5. **Iterar**: Adicionar mais cenários

---

**Agora você tem testes que simulam um usuário REAL usando o addon!** 🎬✨
