# 🔧 MVP-5 Quick Reference Card

## 📌 O que é MVP-5?

Exportação de componentes Storybook para JSON Figma, com suporte a **clipboard** (copiar) e **download** (arquivo).

---

## 🎯 Pipeline Executado

```
Storybook Component
        ↓
captureStoryHTML()          [MVP-2] ← captura HTML sanitizado
        ↓
convertHtmlToFigma()        [MVP-3] ← converte em JSON Figma
        ↓
addExportMetadata()         [MVP-5] ← adiciona metadados (__export)
        ↓
exportToClipboard()         [MVP-5] ← copia para clipboard
  ou
exportToFile()              [MVP-5] ← faz download .json
        ↓
Clipboard ou Arquivo .json
```

---

## 🚀 Comandos Rápidos

### Setup
```bash
cd figma-sync-engine
pnpm install
pnpm test          # Deve passar 105/105
```

### Desenvolvimento
```bash
pnpm dev            # Inicia Storybook em http://localhost:6006
pnpm build          # Compila todos os pacotes
pnpm test           # Roda testes
pnpm lint           # Verifica estilo
```

### Específico MVP-5
```bash
# Testes apenas do addon de exportação
pnpm --filter @figma-sync-engine/storybook-addon-export test

# Build apenas do addon
pnpm build --filter @figma-sync-engine/storybook-addon-export

# Build da exemplo Storybook
pnpm --filter @figma-sync-engine/example-react-button build
```

---

## 📝 Código Principal

### 1. Panel (`packages/storybook-addon-export/src/panel.tsx`)
Componente React que:
- Mostra informações da story
- Botão "📥 Exportar"
- Seletor de método (📋 clipboard ou 💾 download)
- Status visual (idle → capturing → exporting → success/error)

**Fluxo esperado**:
```tsx
const handleExport = async () => {
    // 1. Capturar HTML
    const capture = await captureStoryHTML();
    
    // 2. Converter em JSON Figma
    const json = convertHtmlToFigma(capture.html);
    
    // 3. Adicionar metadados
    const withMeta = addExportMetadata(json, { storyId: ... });
    
    // 4. Exportar (clipboard ou arquivo)
    const result = exportMethod === 'clipboard' 
        ? await exportToClipboard(withMeta)
        : exportToFile(withMeta, 'figma-export.json');
};
```

### 2. Export Functions (`packages/storybook-addon-export/src/export.ts`)
- `exportToClipboard(json)` → Promise<ExportResult>
  - Copia JSON para clipboard via `navigator.clipboard.writeText`
  - Retorna: `{ success, method, size, timestamp, message }`

- `exportToFile(json, filename)` → ExportResult
  - Cria blob, URL temporária, simula clique em `<a>`
  - Revogar URL e retornar resultado

- `exportWithFallback(json)` → Promise<ExportResult>
  - Tenta clipboard primeiro
  - Se falhar, fallback para download automático

### 3. Capture & Conversion (já implementado)
- `captureStoryHTML()` [MVP-2] → `{ html: string, nodeCount, hasInteractiveElements }`
- `convertHtmlToFigma(html)` [MVP-3] → `{ type: 'FRAME', name, children, ... }`

### 4. Metadata
```typescript
export interface ExportResult {
    success: boolean;
    method: 'clipboard' | 'download';
    size: number;
    timestamp: string;
    message: string;
}

export function addExportMetadata(json: any, metadata?: Record<string, any>) {
    return {
        ...json,
        __export: {
            timestamp: new Date().toISOString(),
            version: '0.1.0',
            engine: 'figma-sync-engine',
            ...metadata
        }
    };
}
```

---

## 🧪 Testes

### Estrutura (`packages/storybook-addon-export/src/export.test.ts`)
- **36 testes** cobrindo:
  - `exportToClipboard`: sucesso, erro, validação de tamanho, timestamp
  - `exportToFile`: criação blob, URL, cleanup
  - `exportWithFallback`: clipboard → download fallback
  - `validateFigmaJson`: validação de estrutura
  - `addExportMetadata`: preservação e merge de metadados
  - Edge cases: JSON grande, caracteres especiais, etc.

### Rodar Testes
```bash
pnpm --filter @figma-sync-engine/storybook-addon-export test

# Output esperado:
#   Test Files  2 passed
#   Tests  50 passed
```

---

## ✅ Checklist de Validação

Antes de considerar MVP-5 completo:

- [ ] Panel.tsx importa `convertHtmlToFigma`
- [ ] `handleExport` chama captura → conversão → exportação
- [ ] Unit tests para panel (`panel.test.tsx`) criados
- [ ] `pnpm test` passa (50/50 testes storybook-addon-export)
- [ ] `pnpm build` sem erros TypeScript
- [ ] Manual test em Storybook funciona:
  - [ ] Captura HTML
  - [ ] Converte em JSON
  - [ ] Copia para clipboard OU faz download
  - [ ] JSON contém `__export` metadata
- [ ] `docs/PROGRESS_CURRENT.md` atualizado (MVP-5 = 100%)
- [ ] Commit criado e logado (`git log --oneline`)
- [ ] PR aberto com descrição

---

## 🐛 Debug Checklist

Se algo falhar:

| Sintoma | Solução |
|---------|---------|
| Build falha com erro de import | Verificar se `convertHtmlToFigma` está exportado em `html-to-figma-core/src/index.ts` |
| Teste falha em mock | Verificar estrutura do mock: `{ html, nodeCount, hasInteractiveElements }` |
| JSON não aparece no clipboard | Testar em navegador diferente ou confirmar permissão |
| Storybook não abre | Verificar porta 6006, matar processos Node antigos |
| Git commit falha | Verificar se arquivos foram modificados: `git status --short` |

---

## 📊 Progresso Real-Time

| Item | Status | Nota |
|------|--------|------|
| Panel UI | ✅ | Já implementado (MVP-1) |
| captureStoryHTML | ✅ | Já implementado (MVP-2) |
| convertHtmlToFigma | ✅ | Já implementado (MVP-3) |
| exportToClipboard | ✅ | Implementado |
| exportToFile | ✅ | Implementado |
| exportWithFallback | ✅ | Implementado |
| panel.tsx integração | ⏳ | **FALTA**: chamar convertHtmlToFigma |
| panel.test.tsx | ⏳ | **FALTA**: criar testes de integração |
| PROGRESS_CURRENT.md | ⏳ | **FALTA**: atualizar MVP-5 = 100% |

---

## 🔗 Arquivos Importantes

```
figma-sync-engine/
├── packages/
│   ├── storybook-addon-export/
│   │   └── src/
│   │       ├── panel.tsx                 ← Componente UI (integração)
│   │       ├── export.ts                 ← Funções export (✅ pronto)
│   │       ├── export.test.ts            ← Testes export (✅ 36 testes)
│   │       ├── panel.test.tsx            ← Testes panel (⏳ create)
│   │       ├── captureHtml.ts            ← MVP-2 (✅)
│   │       └── index.ts                  ← Exports
│   │
│   ├── html-to-figma-core/
│   │   └── src/
│   │       └── index.ts                  ← convertHtmlToFigma (✅)
│   │
│   └── ...
│
├── docs/
│   ├── MVP5_EXECUTION_PROMPT.md          ← Guide detalhado (aqui!)
│   ├── MVP5_EXECUTION_SCRIPT.sh          ← Bash automation
│   ├── MVP5_EXECUTION_SCRIPT.ps1         ← PowerShell automation
│   ├── MVP5_QUICK_REFERENCE.md           ← Este arquivo
│   └── PROGRESS_CURRENT.md               ← Status geral
│
└── examples/
    └── react-button/
        └── .storybook/                   ← Configuração Storybook
```

---

## 🎓 Conceitos-Chave

### Clipboard API
```typescript
// Copia texto para clipboard
await navigator.clipboard.writeText(jsonString);

// Fallback: criar link e simular clique
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'export.json';
link.click();
URL.revokeObjectURL(url);
```

### JSON Figma Mínimo
```json
{
  "type": "FRAME",
  "name": "Exported Component",
  "children": [
    { "type": "TEXT", "content": "Hello" }
  ],
  "__export": {
    "timestamp": "2025-11-22T21:55:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "Button-Primary"
  }
}
```

### Estados do Panel
```
idle          → Inicial, botão habilitado
capturing     → Aguardando captureStoryHTML()
exporting     → Aguardando export (clipboard/file)
success       → ✅ Exportado! (timeout 3s → idle)
error         → ❌ Erro ocorreu (manual reset)
```

---

## 💡 Tips & Tricks

1. **Testar clipboard manualmente**: Após export, Ctrl+V em Notepad e verificar JSON
2. **Mock do Clipboard em Teste**: `navigator.clipboard = { writeText: vi.fn() }`
3. **Ver logs no navegador**: F12 → Console → buscar `console.log` em panel.tsx
4. **Limpar cache Turbo**: `rm -rf .turbo` (se algo estranho acontecer)
5. **Reset de estado**: Fechar aba e reabrir Storybook

---

## 🎯 Próximos MVPs Após MVP-5

- **MVP-4**: Auto Layout Engine (CSS flexbox → Figma Auto Layout)
- **MVP-6**: Plugin Figma (importa JSON e cria nodes)
- **MVP-7**: E2E Tests (Playwright, fluxo completo)

---

**Última atualização**: 22/11/2025  
**Responsável**: Equipe de Desenvolvimento  
**Status**: Pronto para implementação

