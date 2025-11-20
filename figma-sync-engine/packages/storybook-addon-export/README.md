# @figma-sync-engine/storybook-addon-export

Storybook addon que adiciona um painel "Figma Export" para exportar histórias do Storybook como JSON compatível com Figma.

## Instalação

```bash
pnpm add @figma-sync-engine/storybook-addon-export
```

## Configuração

No arquivo `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(tsx|ts)'],
    addons: [
        '@storybook/addon-essentials',
        '@figma-sync-engine/storybook-addon-export/preset',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
};
export default config;
```

## Uso

1. Abra o Storybook no seu navegador
2. Selecione uma história
3. Abra o painel "Figma Export" na parte inferior
4. Clique no botão "Exportar JSON"
5. O addon captura o HTML da história e inicia o pipeline de exportação

## Arquitetura

O addon consiste em três componentes principais:

### 1. Register (Manager)
- **Arquivo**: `src/register.ts`
- **Função**: Registra o painel no Storybook Manager (UI do addon)
- **API**: Usa `@storybook/manager-api` para registrar o painel

### 2. Panel (Manager)
- **Arquivo**: `src/panel.tsx`
- **Função**: Interface do usuário do addon
- **Funcionalidades**:
  - Mostra a história atual
  - Botão para exportar
  - Estados: idle, working, done
  - Emite evento `EVENT_EXPORT_REQUEST` via canal de comunicação

### 3. Preview Decorator (Preview)
- **Arquivo**: `src/preview.ts`
- **Função**: Roda no iframe da preview (onde as histórias são renderizadas)
- **Funcionalidades**:
  - Escuta eventos `EVENT_EXPORT_REQUEST`
  - Captura o HTML da história do DOM
  - TODO: Integrar com `html-to-figma-core` para conversão
  - TODO: Pós-processar com `autolayout-interpreter`
  - TODO: Gerar JSON e disponibilizar para download/clipboard

## Comunicação Panel ↔ Preview

O addon usa o sistema de canais do Storybook para comunicação bidirecional:

```
Manager (Panel)                Preview (Decorator)
     |                              |
     |  EVENT_EXPORT_REQUEST        |
     |----------------------------->|
     |                              |
     |                        [Captura HTML]
     |                        [Converte para JSON]
     |                              |
     |  TODO: Retornar resultado    |
     |<-----------------------------|
     |                              |
```

## Eventos

### EVENT_EXPORT_REQUEST
- **Origem**: Panel (Manager)
- **Destino**: Preview Decorator
- **Payload**: `{ storyId: string }`
- **Ação**: Inicia o processo de exportação da história

## Próximos Passos (MVP)

1. ✅ Implementar comunicação Panel ↔ Preview
2. ✅ Capturar HTML da história
3. ⏳ Integrar com `html-to-figma-core` para conversão HTML → JSON
4. ⏳ Pós-processar com `autolayout-interpreter`
5. ⏳ Gerar arquivo `.figma.json` para download/clipboard
6. ⏳ Adicionar feedback visual no painel (sucesso/erro)
7. ⏳ Adicionar testes unitários

## Desenvolvimento

```bash
# Build
pnpm build

# Lint
pnpm lint

# Watch mode
pnpm dev
```

## Estrutura de Arquivos

```
src/
├── index.ts        # Exporta componentes públicos
├── register.ts     # Registra o painel no Storybook Manager
├── panel.tsx       # Componente React do painel
├── preview.ts      # Decorator que roda no preview iframe
├── preset.ts       # Configuração automática do addon
└── shared.ts       # Constantes compartilhadas (IDs, eventos)
```

## Referências

- [Storybook Addon API](https://storybook.js.org/docs/react/addons/addon-api)
- [Backlog MVP-1](../../docs/backlog.md#epic-1-mvp-export-storybook--figma)
- [Arquitetura](../../docs/architecture.md)
