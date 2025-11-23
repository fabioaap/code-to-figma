# @figma-sync-engine/color-tokens

Módulo de extração e gerenciamento de tokens de cor para Figma.

## Objetivo

Automatizar a extração de cores hexadecimais do JSON Figma e criar um dicionário de tokens reutilizáveis, reduzindo duplicação e facilitando manutenção de design systems.

## Funcionalidades

- ✅ Extração automática de cores de nodes Figma
- ✅ Geração de nomes semânticos para cores comuns
- ✅ Contagem de uso de cada cor
- ✅ Substituição de valores de cor por referências de tokens
- ✅ Suporte a múltiplos formatos (fills, backgroundColor, color)
- ✅ Serialização/deserialização de tokens

## Instalação

```bash
pnpm add @figma-sync-engine/color-tokens
```

## Uso Básico

### Extrair tokens de cor

```typescript
import { extractColorTokens } from '@figma-sync-engine/color-tokens';

const figmaJson = {
  type: 'FRAME',
  fills: [
    { type: 'SOLID', color: { r: 1, g: 0, b: 0 } }
  ],
  children: [
    {
      type: 'TEXT',
      color: '#ffffff'
    }
  ]
};

const result = extractColorTokens(figmaJson);

console.log(result.tokens);
// {
//   red: { name: 'red', value: '#ff0000', usage: 1 },
//   white: { name: 'white', value: '#ffffff', usage: 1 }
// }

console.log(result.figmaJson.fills[0].colorToken);
// 'red'
```

### Serializar tokens

```typescript
import { serializeColorTokens } from '@figma-sync-engine/color-tokens';

const json = serializeColorTokens(result.tokens);
// Salvar em colors.json
```

### Converter cores

```typescript
import { rgbToHex, hexToRgb } from '@figma-sync-engine/color-tokens';

// RGB normalizado (0-1) para hex
const hex = rgbToHex({ r: 0.149, g: 0.388, b: 0.922 });
// '#2663eb'

// Hex para RGB normalizado
const rgb = hexToRgb('#2563eb');
// { r: 0.149, g: 0.388, b: 0.922 }
```

## API

### `extractColorTokens(figmaJson)`

Extrai todas as cores de um JSON Figma e retorna um dicionário de tokens.

**Parâmetros:**
- `figmaJson`: Object - JSON no formato Figma

**Retorna:**
```typescript
{
  tokens: Record<string, ColorToken>;
  figmaJson: any; // JSON com referências aos tokens
}
```

### `rgbToHex(color)`

Converte cor RGB normalizada (0-1) para hexadecimal.

**Parâmetros:**
- `color`: FigmaColor - `{ r: number, g: number, b: number }`

**Retorna:** string - Cor hexadecimal (#RRGGBB)

### `hexToRgb(hex)`

Converte cor hexadecimal para RGB normalizado.

**Parâmetros:**
- `hex`: string - Cor hexadecimal (#RGB ou #RRGGBB)

**Retorna:** FigmaColor | null

### `generateColorName(hex, index)`

Gera nome semântico para cor baseado em heurísticas.

**Parâmetros:**
- `hex`: string - Cor hexadecimal
- `index`: number - Índice da cor no conjunto

**Retorna:** string - Nome do token

### `serializeColorTokens(tokens)`

Serializa tokens de cor para JSON.

**Parâmetros:**
- `tokens`: Record<string, ColorToken>

**Retorna:** string - JSON formatado

### `deserializeColorTokens(json)`

Carrega tokens de cor de uma string JSON.

**Parâmetros:**
- `json`: string - String JSON com tokens

**Retorna:** Record<string, ColorToken>

## Tipos

### ColorToken

```typescript
interface ColorToken {
  name: string;
  value: string; // hex color
  usage: number; // quantas vezes é usado
}
```

### FigmaColor

```typescript
interface FigmaColor {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
}
```

## Cores Reconhecidas

O módulo reconhece automaticamente cores comuns e atribui nomes semânticos:

- `#ffffff` → `white`
- `#000000` → `black`
- `#ff0000` → `red`
- `#00ff00` → `green`
- `#0000ff` → `blue`
- `#ffff00` → `yellow`
- `#ff00ff` → `magenta`
- `#00ffff` → `cyan`
- `#808080` → `gray`
- E mais...

Cores não reconhecidas recebem nomes genéricos como `color-1`, `color-2`, etc.

## Integração

Este módulo é usado por:
- `@figma-sync-engine/storybook-addon-export` para exportar JSON com tokens de cor
- Potencialmente por outros pacotes do ecossistema

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Build
pnpm build

# Testes
pnpm test

# Lint
pnpm lint
```

## Licença

MIT
