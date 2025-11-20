# @figma-sync-engine/html-to-figma-core

Wrapper leve sobre `@builder.io/html-to-figma` com espaço para extensões customizadas.

## Instalação

```bash
pnpm add @figma-sync-engine/html-to-figma-core
```

## Uso

### Convertendo HTML para Figma

```typescript
import { convertHtmlToFigma } from '@figma-sync-engine/html-to-figma-core';

// Em ambiente browser
const htmlString = '<div style="display: flex;"><span>Hello World</span></div>';
const figmaNodes = convertHtmlToFigma(htmlString);

// Ou com um elemento HTML existente
const element = document.querySelector('.my-component');
const figmaNodes = convertHtmlToFigma(element);

// Com opções customizadas
const figmaNodes = convertHtmlToFigma(htmlString, {
    useFrames: true,  // Usa frames ao invés de grupos (padrão: true)
    logTime: false    // Loga tempo de execução (padrão: false)
});
```

### API

#### `convertHtmlToFigma(html, options?)`

Converte HTML em estrutura Figma JSON compatível.

**Parâmetros:**

- `html` (string | HTMLElement): String HTML ou elemento HTML a ser convertido
- `options` (opcional):
  - `useFrames` (boolean, padrão: true): Se true, usa frames ao invés de grupos
  - `logTime` (boolean, padrão: false): Se true, loga tempo de execução no console

**Retorna:** Array de nodes Figma compatíveis

**Nota:** Em ambiente Node.js, strings HTML não podem ser convertidas diretamente. Você precisa:
1. Usar jsdom para criar um ambiente DOM, ou
2. Passar um HTMLElement diretamente

### Re-exports

Este pacote também re-exporta todas as funções e tipos de `@builder.io/html-to-figma`:

```typescript
import { htmlToFigma } from '@figma-sync-engine/html-to-figma-core';
// Acesso direto à função original
```

## Desenvolvimento

```bash
# Build
pnpm build

# Testes
pnpm test

# Lint
pnpm lint
```

## Roadmap

- [ ] Integração com autolayout-interpreter para pós-processamento
- [ ] Suporte nativo a jsdom para ambiente Node.js
- [ ] Normalização de propriedades CSS
- [ ] Metadados customizados
- [ ] Suporte a variantes de componentes

## Licença

MIT
