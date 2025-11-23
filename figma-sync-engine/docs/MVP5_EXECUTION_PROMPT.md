# 🚀 MVP-5 Execution Prompt — Exportação e Integração Pipeline

**Data**: 22/11/2025 | **Status**: Pronto para execução | **Responsável**: Agente Automático ou Developer

---

## 🎯 Objetivo Final

Implementar **MVP-5: Exportação para Clipboard/Download** com integração completa do pipeline `captureStoryHTML() → convertHtmlToFigma() → exportToClipboard/exportToFile()`.

**Resultado esperado ao final**:
- ✅ Painel visual do addon funciona end-to-end: captura HTML → converte em JSON → exporta (clipboard/download)
- ✅ Unit tests cobrem 100% das funções de export
- ✅ Integração manual testada em `examples/react-button` (Storybook)
- ✅ CI/CD passa em `pnpm test` e `pnpm build`
- ✅ Documentação atualizada
- ✅ Pull request criado e pronto para review

**Estimativa**: 2-3 horas de execução

---

## 📋 Checklist Pré-Requisitos

- [ ] Node.js 20.x instalado
- [ ] pnpm 8.x instalado
- [ ] Repositório clonado em `c:\Users\Educacross\Documents\code-to-figma\figma-sync-engine`
- [ ] Branch `main` atualizado (`git pull origin main`)
- [ ] Nenhuma alteração local não commitada (`git status --short` limpo)

---

## 🔧 Passo a Passo

### **Fase 1: Setup e Validação Inicial (5 min)**

```bash
# 1.1: Navegar até o diretório do projeto
cd c:\Users\Educacross\Documents\code-to-figma\figma-sync-engine

# 1.2: Instalar dependências (ou verificar se já estão ok)
pnpm install

# 1.3: Executar baseline de testes para confirmar estado atual
pnpm test
# Esperado: 105/105 testes passando (storybook-addon-export 50, autolayout 44, html-to-figma 11)

# 1.4: Executar lint (opcional, mas recomendado)
pnpm lint
```

**Critério de sucesso**: Testes passam, sem erros de lint (ou avisos aceitáveis)

---

### **Fase 2: Integração do Pipeline no Panel (20 min)**

**Objetivo**: Conectar o painel (`panel.tsx`) ao pipeline completo de conversão HTML → JSON Figma.

**Arquivo alvo**: `packages/storybook-addon-export/src/panel.tsx`

**O que fazer**:
1. Importar `convertHtmlToFigma` do pacote `html-to-figma-core`:
   ```tsx
   import { convertHtmlToFigma } from '@figma-sync-engine/html-to-figma-core';
   ```

2. Atualizar a função `handleExport` para:
   - Capturar HTML via `captureStoryHTML()` ✅ (já feito)
   - **Converter para JSON Figma** via `convertHtmlToFigma(html)` ← **NOVO**
   - Adicionar metadados via `addExportMetadata()` ✅ (já feito)
   - Exportar via `exportToClipboard()` ou `exportToFile()` ✅ (já feito)

3. Pseudocódigo da lógica esperada:
   ```tsx
   const handleExport = async () => {
       try {
           setError('');
           setStatus('capturing');

           // Passo 1: Capturar HTML
           const capture = await captureStoryHTML();
           if (!capture.html) throw new Error('Nenhum HTML capturado');

           // Passo 2: Converter HTML → JSON Figma
           const convertedJson = convertHtmlToFigma(capture.html);
           
           // Passo 3: Adicionar metadados
           const figmaJson = addExportMetadata(convertedJson, {
               storyId: state.storyId || 'unknown',
               nodeCount: capture.nodeCount,
               hasInteractiveElements: capture.hasInteractiveElements,
               captureSize: capture.html.length
           });

           setStatus('exporting');
           
           // Passo 4: Exportar
           let result;
           if (exportMethod === 'clipboard') {
               result = await exportToClipboard(figmaJson);
           } else {
               const filename = `figma-${state.storyId || 'export'}-${Date.now()}.json`;
               result = exportToFile(figmaJson, filename);
           }

           if (!result.success) throw new Error('Falha ao exportar');
           setStatus('success');
           setTimeout(() => setStatus('idle'), 3000);
       } catch (err) {
           const message = err instanceof Error ? err.message : String(err);
           setError(message);
           setStatus('error');
       }
   };
   ```

**Validação**: Panel.tsx compila sem erros (`pnpm build --filter @figma-sync-engine/storybook-addon-export`)

---

### **Fase 3: Testar Integração Localmente (15 min)**

**Objetivo**: Validar que o pipeline funciona end-to-end no Storybook.

```bash
# 3.1: Build o addon
pnpm build --filter @figma-sync-engine/storybook-addon-export

# 3.2: Rodar Storybook localmente
pnpm dev

# 3.3: Aguardar Storybook abrir (geralmente http://localhost:6006)
#      Abrir no navegador: http://localhost:6006/?path=/docs/button--primary

# 3.4: No painel do addon "📤 Exportar para Figma":
#      - Selecionar método (📋 clipboard ou 💾 download)
#      - Clicar no botão "📥 Exportar"
#      - Verificar mensagens:
#        * "Capturando HTML..." → "Exportando..." → "✅ Exportado com sucesso!"

# 3.5: Se clipboard foi selecionado:
#      - Abrir editor de texto qualquer (Notepad, VS Code)
#      - Colar (Ctrl+V)
#      - Verificar se JSON Figma aparece (deve conter "type": "FRAME" e metadata)

# 3.6: Se download foi selecionado:
#      - Verificar se arquivo .json foi baixado em Downloads
#      - Abrir e confirmar conteúdo JSON válido
```

**Critério de sucesso**: 
- Status bar do painel muda para ✅ (sucesso)
- JSON aparece no clipboard ou arquivo é baixado
- JSON contém estrutura Figma válida (`type`, `children`, etc.)
- Metadados incluem `__export`, `storyId`, `nodeCount`, `hasInteractiveElements`

---

### **Fase 4: Testes Unitários (15 min)**

**Objetivo**: Ampliar cobertura de testes para a integração panel ↔ pipeline.

**Arquivo alvo**: `packages/storybook-addon-export/src/panel.test.tsx` (criar se não existir)

**O que testar**:
1. Mock de `captureStoryHTML`, `convertHtmlToFigma`, `exportToClipboard`, `exportToFile`
2. Verificar se `handleExport` chama funções na ordem correta
3. Verificar estados visuais (idle → capturing → exporting → success/error)
4. Verificar fallback: se clipboard falhar, tenta download (se implementado)

**Estrutura mínima esperada**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportPanel } from './panel';
import * as captureHtml from './captureHtml';
import * as convert from '@figma-sync-engine/html-to-figma-core';
import * as exportFns from './export';

vi.mock('./captureHtml');
vi.mock('@figma-sync-engine/html-to-figma-core');
vi.mock('./export');

describe('ExportPanel - MVP-5 Integration', () => {
    beforeEach(() => {
        // Mock implementations
        vi.mocked(captureHtml.captureStoryHTML).mockResolvedValue({
            html: '<button>Test</button>',
            nodeCount: 1,
            hasInteractiveElements: true
        });
        
        vi.mocked(convert.convertHtmlToFigma).mockReturnValue({
            type: 'FRAME',
            name: 'Captured',
            children: []
        });

        vi.mocked(exportFns.exportToClipboard).mockResolvedValue({
            success: true,
            method: 'clipboard',
            size: 100,
            timestamp: new Date().toISOString(),
            message: 'Copied'
        });
    });

    it('should call pipeline in correct order: capture → convert → export', async () => {
        render(<ExportPanel />);
        const button = screen.getByText('📥 Exportar');
        
        fireEvent.click(button);

        await waitFor(() => {
            expect(captureHtml.captureStoryHTML).toHaveBeenCalledTimes(1);
            expect(convert.convertHtmlToFigma).toHaveBeenCalledTimes(1);
            expect(exportFns.exportToClipboard).toHaveBeenCalledTimes(1);
        });
    });

    it('should show success message on export complete', async () => {
        render(<ExportPanel />);
        const button = screen.getByText('📥 Exportar');
        
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Exportado com sucesso/)).toBeInTheDocument();
        });
    });

    it('should show error message on export failure', async () => {
        vi.mocked(exportFns.exportToClipboard).mockRejectedValueOnce(
            new Error('Permission denied')
        );

        render(<ExportPanel />);
        const button = screen.getByText('📥 Exportar');
        
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Permission denied/)).toBeInTheDocument();
        });
    });

    it('should use correct export method based on selection', async () => {
        render(<ExportPanel />);
        
        const downloadBtn = screen.getByTitle('Fazer download do arquivo');
        fireEvent.click(downloadBtn);

        const exportBtn = screen.getByText('📥 Exportar');
        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(exportFns.exportToFile).toHaveBeenCalledTimes(1);
            expect(exportFns.exportToClipboard).not.toHaveBeenCalled();
        });
    });
});
```

**Executar testes**:
```bash
pnpm --filter @figma-sync-engine/storybook-addon-export test
```

**Critério de sucesso**: Todos os testes de integração panel passam

---

### **Fase 5: Validação CI/CD (10 min)**

**Objetivo**: Garantir que o projeto inteiro passa na suíte de CI.

```bash
# 5.1: Rodar suite completa de testes (como faria o CI)
pnpm test

# Esperado: 
#   - storybook-addon-export: 50+ testes
#   - html-to-figma-core: 11 testes
#   - autolayout-interpreter: 44+ testes
#   - Total: 105+ testes passando

# 5.2: Rodar lint
pnpm lint

# Esperado: Sem erros críticos (avisos aceitáveis)

# 5.3: Rodar build
pnpm build

# Esperado: Todos os pacotes compilam sem erros
```

**Critério de sucesso**: 
- `pnpm test`: PASS (todos os testes)
- `pnpm build`: PASS (sem erros de TypeScript)
- Nenhum erro crítico em lint

---

### **Fase 6: Documentação e Progresso (5 min)**

**Arquivo alvo**: `docs/PROGRESS_CURRENT.md`

**O que atualizar**:
1. Data: `22/11/2025` → `22/11/2025` (ou data atual se diferente)
2. Status do MVP-5:
   ```
   | **MVP-5** | ✅ DONE | 100% | 50/50 | Exportação completa com pipeline integrado |
   ```
3. Adicionar nota sobre implementação:
   ```markdown
   #### MVP-5: Exportação Integrada (100%)
   - ✅ Funções exportToClipboard e exportToFile
   - ✅ Integração panel.tsx com convertHtmlToFigma
   - ✅ Unit tests para panel e export (50 testes)
   - ✅ Fallback clipboard → download
   - ✅ Metadados de rastreamento (__export)
   - Implementação: 22/11/2025, executada via prompt automático
   ```

**Atualizar gráfico de barras**:
```
MVP-5     | #################### | 100%  (era 25%, agora 100%)
```

---

### **Fase 7: Commit e Pull Request (10 min)**

**Objetivo**: Registrar mudanças no git e criar PR para review.

```bash
# 7.1: Verificar status
git status --short

# Esperado: arquivos modificados listados (panel.tsx, panel.test.tsx, PROGRESS_CURRENT.md)

# 7.2: Adicionar arquivos
git add packages/storybook-addon-export/src/panel.tsx
git add packages/storybook-addon-export/src/panel.test.tsx
git add docs/PROGRESS_CURRENT.md

# 7.3: Commit com mensagem descritiva
git commit -m "feat(storybook-addon-export): MVP-5 - integrate pipeline captureHtml → convertHtmlToFigma → export

- Connect panel.tsx to full export pipeline
- Add convertHtmlToFigma integration for JSON generation
- Implement unit tests for panel export flow
- Support clipboard and download methods with fallback
- Add export metadata tracking (__export field)
- Update progress documentation (100% MVP-5)"

# 7.4: Criar feature branch (opcional, se usando workflow de PR)
# git checkout -b feat/mvp5-export-integration
# git push origin feat/mvp5-export-integration

# 7.5: Ou fazer push direto para main (se allowed)
# git push origin main
```

**Mensagem de commit sugerida** (copie e cole):
```
feat(storybook-addon-export): MVP-5 - integrate pipeline captureHtml → convertHtmlToFigma → export

- Connect panel.tsx to full export pipeline
- Add convertHtmlToFigma integration for JSON generation
- Implement unit tests for panel export flow
- Support clipboard and download methods with fallback
- Add export metadata tracking (__export field)
- Update progress documentation (100% MVP-5)

Closes: MVP-5
Tests: 50/50 passing (storybook-addon-export)
CI: ✅ pnpm test, pnpm build
```

**Título de PR sugerido**:
```
MVP-5: Implement export pipeline integration (HTML → JSON Figma → clipboard/download)
```

**Descrição de PR sugerida**:
```markdown
## MVP-5: Export Pipeline Integration

### 🎯 Objetivo
Completar MVP-5 integrando o painel de exportação com o pipeline completo:
captureStoryHTML → convertHtmlToFigma → exportToClipboard/exportToFile

### ✅ Implementado
- [x] Integração de `convertHtmlToFigma` no panel.tsx
- [x] Pipeline: capture → convert → export (com metadados)
- [x] Suporte a clipboard e download com fallback
- [x] Unit tests para integração panel (mock do pipeline completo)
- [x] Validação manual em Storybook (examples/react-button)
- [x] CI/CD: pnpm test + pnpm build ✅

### 🧪 Testes
- Todos os 50 testes do storybook-addon-export passam
- Suite completa (105 testes total) passa
- Teste manual: export funciona end-to-end em Storybook

### 📊 Progresso
- MVP-5: **100% ✅** (era 25%, agora completo)
- Pronto para MVP-6 (Plugin Figma)

### 🔗 Links
- [Progresso Atual](docs/PROGRESS_CURRENT.md)
- [Backlog](docs/backlog.md)
- [Architectural Design](docs/architecture.md)

Checklist:
- [x] Testes passando
- [x] Lint sem erros críticos
- [x] Build successful
- [x] Documentação atualizada
- [x] Manual testing completado
```

---

## 🧠 Decisões Arquiteturais Importantes

### Por que essa ordem?
1. **Capturar HTML** primeiro: garantir que temos DOM limpo e sanitizado (MVP-2).
2. **Converter para JSON Figma**: transformar HTML em estrutura Figma válida (MVP-3).
3. **Adicionar metadados**: rastrear origem, timestamp, variante (para debugging).
4. **Exportar**: clipboard preferencial (UX rápida), fallback para download (compat).

### Fluxo de Dados
```
Storybook (componentId)
    ↓
captureStoryHTML() → { html: string, nodeCount, hasInteractiveElements }
    ↓
convertHtmlToFigma(html) → { type: 'FRAME', name, children, ... }
    ↓
addExportMetadata(json) → { ...json, __export: { timestamp, version, storyId, ... } }
    ↓
exportToClipboard(json) / exportToFile(json) → ExportResult { success, method, size, message }
    ↓
Clipboard (ou arquivo .json baixado)
```

### Tratamento de Erros
- Se `captureStoryHTML` falha → erro em "Capturando HTML..."
- Se `convertHtmlToFigma` falha → erro em "Exportando..."
- Se `exportToClipboard` falha → tenta `exportToFile` (fallback automático via `exportWithFallback`)
- Se ambas falham → mensagem de erro no painel + log

---

## 🛡️ Garantias de Qualidade

| Aspecto | Verificação |
|---------|-----------|
| **TypeScript** | `pnpm build` sem erros, strict mode ativo |
| **Testes** | 50+ testes unitários, 100% passing |
| **Lint** | `pnpm lint` sem erros críticos |
| **Manual** | Testado no Storybook com Button example |
| **CI/CD** | GitHub Actions workflow passa |
| **Documentação** | `docs/PROGRESS_CURRENT.md` atualizado |

---

## 📈 Métricas de Sucesso (Definição de Pronto)

- [ ] Panel.tsx importa `convertHtmlToFigma` e chama no pipeline
- [ ] Panel.test.tsx cobre fluxo integration com mocks do pipeline completo
- [ ] `pnpm test` passa com 50+ testes (storybook-addon-export)
- [ ] `pnpm build` sucesso, sem erros TypeScript
- [ ] Manual test em Storybook funciona: capture → convert → export
- [ ] Clipboard ou download produz JSON válido com metadados
- [ ] `docs/PROGRESS_CURRENT.md` atualizado para MVP-5 = 100%
- [ ] Commit com mensagem descritiva registrado
- [ ] PR criado com descrição e checklist

---

## ⏱️ Timeline Estimada

| Fase | Duração | Tarefas |
|------|---------|--------|
| **1. Setup** | 5 min | Install, validate baseline |
| **2. Integration** | 20 min | Connect panel to pipeline |
| **3. Local Testing** | 15 min | Manual test in Storybook |
| **4. Unit Tests** | 15 min | Write panel.test.tsx |
| **5. CI/CD** | 10 min | Validate pnpm test + build |
| **6. Docs** | 5 min | Update PROGRESS_CURRENT.md |
| **7. PR** | 10 min | Commit and open PR |
| **Total** | ~2-3h | Completo e pronto para merge |

---

## 🚨 Pontos de Atenção

1. **Import de `convertHtmlToFigma`**: Validar que o pacote `html-to-figma-core` está exportando a função corretamente.
2. **Mocking em testes**: Garantir que os mocks de `captureStoryHTML` e `convertHtmlToFigma` retornam estruturas realistas.
3. **Fallback de clipboard**: Se `navigator.clipboard` não disponível, `exportWithFallback` deve chamar `exportToFile` automaticamente.
4. **Tamanho de JSON**: Se JSON > 1MB, considerar adicionar compressão ou warning futuro.
5. **CORS / Permissões**: Em produção, validar permissões de clipboard em contextos inseguros.

---

## 🔄 Próximos Passos Após MVP-5

1. **MVP-4 (Auto Layout Engine)**: Após exportação funcionar, implementar AL-1...AL-7 para converter CSS → Auto Layout Figma.
2. **MVP-6 (Plugin Figma)**: Criar plugin que importa JSON e cria frames/nodes no Figma.
3. **MVP-7 (E2E Tests)**: Teste completo Storybook → Figma com Playwright.

---

## 📞 Suporte e Debugging

Se algo falhar:

1. **Erro no build TypeScript**:
   - Rodar `pnpm --filter @figma-sync-engine/storybook-addon-export build` para ver erro exato
   - Verificar imports (ex.: `convertHtmlToFigma` está exportado em `index.ts` do html-to-figma-core?)

2. **Teste falhando**:
   - Rodar `pnpm --filter @figma-sync-engine/storybook-addon-export test` com `-t "test name"` para isolar
   - Verificar mocks: são realistas? Faltam propriedades?

3. **Storybook não abre**:
   - `pnpm dev` abre em http://localhost:6006, aguardar build completo
   - Se porta ocupada, matar processos Node: `lsof -i :6006` (macOS/Linux) ou usar outra porta

4. **JSON não aparece no clipboard**:
   - Verificar console do navegador (F12) para erros
   - Testar em navegador diferente (Chrome vs. Firefox)
   - Fallback para download deve funcionar mesmo se clipboard falhar

---

## ✅ Checklist Final

Antes de marcar como "pronto para review":

- [ ] Código compila sem erros (`pnpm build`)
- [ ] Testes passam (`pnpm test`)
- [ ] Lint ok (`pnpm lint`)
- [ ] Manual testing em Storybook completo e OK
- [ ] Commit com mensagem clara criado
- [ ] Documentação atualizada (`PROGRESS_CURRENT.md`)
- [ ] PR aberto com descrição detalhada
- [ ] Nenhum arquivo não-commitado em Working Tree

---

**Pronto para começar? Execute Fase 1 (Setup) e reporte qualquer bloqueador.**

Boa sorte! 🚀

