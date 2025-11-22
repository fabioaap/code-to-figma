# Cloud Agent Prompt — MVP-5: Exportação Clipboard e Download

## Contexto do Projeto

**Projeto**: `figma-sync-engine` — Motor de sincronização Storybook → Figma JSON  
**Repositório**: https://github.com/fabioaap/code-to-figma  
**Tech Stack**: PNPM Monorepo + Turbo, TypeScript, React + Storybook, Vitest  
**Status Geral**: MVP base funcional (MVPs 1-4, 6-8, 11-12 entregues). Pipeline estável (issue #13 e #14 resolvidas).

---

## Objetivo: MVP-5 — Exportação Clipboard e Download

### User Story
> Como usuário do addon Storybook quero escolher copiar para a área de transferência ou baixar um `.figma.json` para importar no Figma.

### Critérios de Aceite
- [ ] Botão "Exportar" integra pipeline completo: captura HTML → conversão → Auto Layout → exportação.
- [ ] Opção "Copiar para Clipboard" usa `navigator.clipboard.writeText()` com fallback e exibe feedback ("Copiado!").
- [ ] Opção "Baixar Arquivo" gera `component-name.figma.json` e inicia download.
- [ ] Painel exibe estados visuais: idle, capturing, exporting, success (com duração), error (com mensagem).
- [ ] Testes unitários cobrem ambos os cenários (clipboard e download).
- [ ] Smoke test manual no exemplo `examples/react-button` (Button.stories.tsx).

### Prioridade & Impacto
- **Prioridade**: Must  
- **Bloqueadores**: Nenhum (dependências MVP-1 até MVP-4 já entregues).  
- **Desbloqueia**: MVP-6 (plugin importa JSON), OBS-1 (logger), PERF-1 (benchmark).

---

## Estrutura de Código Atual

### Pacote Principal: `packages/storybook-addon-export/`

```
packages/storybook-addon-export/
├── src/
│   ├── index.ts              # Exports públicos
│   ├── register.ts           # Registro do addon no Storybook
│   ├── panel.tsx             # UI do painel (PRECISA ATUALIZAR)
│   ├── manager.ts            # Integração com Storybook Manager
│   ├── captureHtml.ts        # Captura HTML da história ativa
│   ├── export.ts             # Exporta JSON + Auto Layout (VERIFICAR)
│   ├── shared.ts             # Constantes de eventos/mensagens
│   └── __tests__/            # Testes existentes
├── package.json              # Dependencies + build scripts
└── tsconfig.json
```

### Funções Dependentes (Já Implementadas)

1. **`captureHtml.ts`**
   - Função: `captureStoryHTML(iframeElement: HTMLIFrameElement): Promise<string>`
   - Retorna: HTML bruto sanitizado da história.

2. **`export.ts`**
   - Função: `convertHtmlToFigmaJson(html: string): Promise<FigmaNode>`
   - Função: `applyAutoLayout(nodes: FigmaNode[]): FigmaNode[]`
   - Retorna: JSON Figma com Auto Layout aplicado.

3. **`panel.tsx`**
   - Componente React atual: botão básico sem integração de exportação.
   - **PRECISA ATUALIZAR** para incluir lógica de clipboard + download.

---

## Tarefas Detalhadas

### Passo 1: Revisar e Melhorar `panel.tsx`

**Arquivo**: `packages/storybook-addon-export/src/panel.tsx`

O painel já existe e tem a lógica básica. Melhorias necessárias:

1. **Adicionar feedback com duração**:
   ```typescript
   const startTime = performance.now();
   // ... export logic ...
   const duration = performance.now() - startTime;
   setStatus('success'); // Exibir "✅ Exportado em 245ms"
   ```

2. **Melhorar tratamento de erros**:
   - Exibir mensagem clara (ex: "Erro: Nenhum HTML capturado").
   - Log em console para debugging.

3. **Adicionar validação com `validateFigmaJson`**:
   ```typescript
   import { validateFigmaJson } from './export';
   
   if (!validateFigmaJson(figmaJson)) {
     throw new Error('JSON Figma inválido');
   }
   ```

4. **Refatorar estilos** (opcional):
   - Usar CSS modules ou Tailwind ao invés de estilos inline.

---

### Passo 2: Completar Testes em `export.test.ts`

**Arquivo**: `packages/storybook-addon-export/src/export.test.ts`

Adicionar cobertura para:

```typescript
import { exportToClipboard, exportToFile, exportWithFallback, validateFigmaJson, addExportMetadata } from './export';

describe('exportToClipboard', () => {
  it('deve retornar success=true com método clipboard', async () => {
    // Mock navigator.clipboard.writeText
    const mockJson = { type: 'FRAME', name: 'Test' };
    const result = await exportToClipboard(mockJson);
    expect(result.success).toBe(true);
    expect(result.method).toBe('clipboard');
    expect(result.size).toBeGreaterThan(0);
  });

  it('deve lançar erro se Clipboard API não disponível', async () => {
    // Simular ausência de navigator.clipboard
    const mockJson = { type: 'FRAME' };
    await expect(exportToClipboard(mockJson)).rejects.toThrow();
  });
});

describe('exportToFile', () => {
  it('deve criar download com filename correto', () => {
    const mockJson = { type: 'FRAME', name: 'MyButton' };
    const result = exportToFile(mockJson, 'my-button.figma.json');
    expect(result.success).toBe(true);
    expect(result.method).toBe('download');
    expect(result.message).toContain('my-button.figma.json');
  });
});

describe('validateFigmaJson', () => {
  it('deve retornar true para JSON válido', () => {
    const validJson = { type: 'FRAME', children: [] };
    expect(validateFigmaJson(validJson)).toBe(true);
  });

  it('deve retornar false para JSON sem type', () => {
    const invalidJson = { name: 'Test' };
    expect(validateFigmaJson(invalidJson)).toBe(false);
  });
});

describe('addExportMetadata', () => {
  it('deve adicionar timestamp e versão', () => {
    const json = { type: 'FRAME' };
    const result = addExportMetadata(json, { storyId: 'button-primary' });
    expect(result.__export.timestamp).toBeDefined();
    expect(result.__export.engine).toBe('figma-sync-engine');
    expect(result.__export.storyId).toBe('button-primary');
  });
});
```

---

### Passo 3: Smoke Test Manual em Storybook

**Arquivo**: `examples/react-button/Button.stories.tsx`

Executar:

```bash
# Terminal 1: Build do monorepo
pnpm build

# Terminal 2: Iniciar Storybook
cd examples/react-button
pnpm storybook

# No navegador:
# 1. Abrir http://localhost:6006 (ou porta sugerida)
# 2. Selecionar história "Button"
# 3. Procurar painel "Figma Export" (lado direito)
# 4. Testar "Copiar para Clipboard"
#    - Clicar botão → "✅ Exportado em XXms"
#    - Colar em editor → valida JSON válido com __export metadata
# 5. Testar "Baixar Arquivo"
#    - Clicar botão → arquivo "figma-button.json" baixado
#    - Validar estrutura JSON
```

---

### Passo 4: Validar Integração Completa

Executar na raiz:

```bash
pnpm test --filter @figma-sync-engine/storybook-addon-export
pnpm lint
pnpm build
```

---

## Status de Implementação Atual

### Código Existente

#### ✅ `panel.tsx` (Parcialmente Implementado)
O painel já tem:
- Estados básicos: `idle`, `capturing`, `exporting`, `success`, `error`.
- Seletor de método: `clipboard` vs `download`.
- Integração com `useStorybookState()` para obter `storyId`.
- Chamadas para `captureStoryHTML()`, `addExportMetadata()`, `exportToClipboard()`, `exportToFile()`.

**O que precisa melhorar:**
- Feedback visual mais robusto (duração, spinner em detalhes).
- Tratamento de erros mais claro.
- Estilos inline podem ser refatorados para CSS/className.
- Garantir que funções de `export.ts` estejam totalmente implementadas.

#### ✅ `export.ts` (Completamente Implementado)
Todas as funções já existem e estão funcionais:
- `exportToClipboard(json): Promise<ExportResult>` — Copia para clipboard com fallback.
- `exportToFile(json, filename): ExportResult` — Faz download como arquivo `.json`.
- `exportWithFallback(json, filename): Promise<ExportResult>` — Tenta clipboard, fallback para download.
- `validateFigmaJson(json): boolean` — Valida estrutura Figma.
- `addExportMetadata(json, metadata): any` — Adiciona timestamp e metadados.

Retornam interface `ExportResult`: `{ success, method, size, timestamp, message }`.

#### ✅ `captureHtml.ts` (Existe)
- Função `captureStoryHTML()` já captura HTML da história.
- Retorna `{ html, nodeCount, hasInteractiveElements }`.

#### ✅ `shared.ts` (Existe)
- Constantes de eventos e mensagens já estão lá.

---

## Guia de Implementação Passo a Passo

### Status Atual: 80% Pronto

O código de exportação já está 80% implementado. Faltam apenas:

1. **Melhorias no painel (`panel.tsx`)**: Feedback visual mais robusto e tratamento de erros melhorado.
2. **Testes mais completos**: `export.test.ts` precisa de cobertura total.
3. **Smoke test manual**: Validar fluxo completo end-to-end.

---

### Passo 1: Revisar e Melhorar `panel.tsx`

---

## Checklist Final

Antes de submeter a PR, validar:

```bash
# 1. Testes passam
pnpm test --filter @figma-sync-engine/storybook-addon-export
# Esperado: Todos os testes passam, cobertura ≥80%

# 2. Lint passa
pnpm lint
# Esperado: Sem erros (apenas avisos permitidos)

# 3. Build passa
pnpm build --filter @figma-sync-engine/storybook-addon-export
# Esperado: Addon compila sem erros

# 4. Smoke test manual em Storybook
pnpm dev
# 1. Clicar "Copiar para Clipboard" → Validar feedback e JSON no editor
# 2. Clicar "Baixar Arquivo" → Validar arquivo gerado
```

---

## Referências Internas

- **Captura HTML**: `packages/storybook-addon-export/src/captureHtml.ts`
- **Conversão JSON**: `packages/storybook-addon-export/src/export.ts`
- **Tipos Figma**: `packages/html-to-figma-core/src/index.ts` (estrutura `FigmaNode`)
- **Documentação JSON**: `docs/figma-json-format.md`
- **Backlog/Issue**: #15 (MVP-5)

---

## Notas Importantes

1. **storyId/componentName**: Extrair de `context.storyId` ou usar fallback genérico ("component").
2. **Sanitização JSON**: Já é feita em `captureHtml.ts` e `convertHtmlToFigmaJson`.
3. **Fallback Clipboard**: Importante para compatibilidade com navegadores antigos.
4. **Estados Visuais**: Use ícones simples (📸, ⚙️, ✓, ✗) ou componentes UI existentes (se houver design system).
5. **Tratamento de Erro**: Exibir mensagem clara ao usuário (ex: "Erro ao capturar HTML: iframe inacessível").

---

## Definição de Pronto (DoD)

- [x] Tipos TypeScript definidos (`ExportState`, `ExportResult`).
- [x] Funções `exportToClipboard` e `exportToFile` implementadas.
- [x] Painel React com estados visuais e botões funcionais.
- [x] Testes unitários com cobertura ≥80%.
- [x] Smoke test manual validado em `examples/react-button`.
- [x] Build sem erros: `pnpm build --filter @figma-sync-engine/storybook-addon-export`.
- [x] Lint sem erros: `pnpm lint`.
- [x] PR aberto referenciando #15.

---

## Sugestão de Commits

```bash
feat(addon): implement clipboard export for Figma JSON
feat(addon): implement file download for Figma JSON
feat(addon): add visual feedback states to export panel
test(addon): add unit tests for export functions
```

---

**Bom trabalho! Qualquer dúvida sobre contexto ou implementação, consulte este prompt novamente.**
