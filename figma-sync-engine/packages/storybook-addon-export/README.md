# @figma-sync-engine/storybook-addon-export

Addon do Storybook para exportar histórias renderizadas para formato JSON do Figma.

## Funcionalidades

- ✅ Captura HTML da história renderizada
- ✅ Converte para estrutura JSON compatível com Figma
- ✅ Aplica heurísticas de Auto Layout (flexbox → Figma)
- ✅ Exporta via clipboard ou download
- ✅ Painel com feedback visual completo
- ✅ Suporte a TypeScript

## Instalação

```bash
pnpm add @figma-sync-engine/storybook-addon-export
```

## Configuração

### 1. Registrar o addon

No arquivo `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(tsx|ts)'],
    addons: [
        '@storybook/addon-essentials',
        '@figma-sync-engine/storybook-addon-export/register',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
};

export default config;
```

### 2. Configurar preview

No arquivo `.storybook/preview.ts`:

```typescript
import '@figma-sync-engine/storybook-addon-export/preview';

// Resto da configuração do preview...
```

## Uso

1. Execute o Storybook normalmente
2. Selecione uma história
3. Abra o painel "Figma Export" na barra inferior
4. Clique em "Exportar JSON"
5. Use os botões "Copiar" ou "Download" para exportar o JSON

## Formato do JSON Exportado

```json
{
  "version": 1,
  "root": {
    "type": "FRAME",
    "name": "ComponentName",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "paddingTop": 12,
    "paddingRight": 12,
    "paddingBottom": 12,
    "paddingLeft": 12,
    "children": [
      {
        "type": "TEXT",
        "characters": "Button Text",
        "fontSize": 14,
        "fontWeight": 500
      }
    ]
  },
  "metadata": {
    "storyId": "button--primary",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Pipeline de Exportação

1. **Captura**: Extrai HTML do elemento `#storybook-root`
2. **Conversão**: Transforma DOM em estrutura de nodes Figma
3. **Auto Layout**: Aplica heurísticas de flexbox → Auto Layout do Figma
4. **Exportação**: Disponibiliza via clipboard ou download

## Arquitetura

- `preview.ts`: Roda no iframe do preview, escuta eventos e executa captura
- `panel.tsx`: UI do painel no manager com estados de loading/sucesso/erro
- `export.ts`: Pipeline de conversão HTML → Figma JSON
- `utils.ts`: Utilitários de clipboard e download
- `shared.ts`: Tipos e constantes compartilhadas

## Desenvolvimento

```bash
# Build
pnpm build

# Testes
pnpm test

# Lint
pnpm lint
```

## Limitações Atuais

- Conversão básica de HTML para Figma (não usa toda capacidade do @builder.io/html-to-figma)
- Suporte limitado a propriedades CSS complexas
- Auto Layout aplicado apenas a elementos com flexbox explícito

## Roadmap

- [ ] Integração completa com @builder.io/html-to-figma
- [ ] Suporte a variantes de componentes
- [ ] Resolução de design tokens (cores, tipografia)
- [ ] Exportação de múltiplas histórias em batch
- [ ] Sincronização bidirecional Figma ↔ Storybook

## Licença

MIT
