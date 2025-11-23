# AL-7: Mapeamento de Tipografia HTML → Figma

Este documento descreve o mapeamento completo de propriedades de tipografia do HTML/CSS para nós TEXT do Figma, implementado na tarefa AL-7.

## Sumário

O módulo de tipografia extrai propriedades de fonte do CSS e as converte para o formato esperado pela API do Figma, incluindo:

- **font-family**: Extração e limpeza do nome da fonte
- **font-weight**: Mapeamento de valores numéricos (100-900) e palavras-chave CSS para estilos Figma
- **font-size**: Conversão de unidades (px, rem, em) para pixels
- **line-height**: Conversão de valores CSS (unitless, px, %) para formato Figma
- **text-align**: Mapeamento de alinhamento horizontal
- **color**: Preservação de cor do texto

## Mapeamento de Font-Weight

### Valores Numéricos CSS → Estilos Figma

| CSS Weight | Estilo Figma |
|------------|--------------|
| 100        | Thin         |
| 200        | ExtraLight   |
| 300        | Light        |
| 400        | Regular      |
| 500        | Medium       |
| 600        | SemiBold     |
| 700        | Bold         |
| 800        | ExtraBold    |
| 900        | Black        |

### Regras de Arredondamento

- Valores intermediários (ex: 450, 550) são arredondados para o múltiplo de 100 mais próximo
- Valores ≤ 0 retornam `Regular`
- Valores > 900 são limitados a `Black` (900)

### Palavras-chave CSS Suportadas

| CSS Keyword | Estilo Figma |
|-------------|--------------|
| thin        | Thin (100)   |
| extralight, ultralight | ExtraLight (200) |
| light       | Light (300)  |
| normal, regular | Regular (400) |
| medium      | Medium (500) |
| semibold, demibold | SemiBold (600) |
| bold        | Bold (700)   |
| extrabold, ultrabold | ExtraBold (800) |
| black, heavy | Black (900) |

## Estruturas de Dados

### TypographyProperties

Interface para propriedades extraídas do CSS:

```typescript
interface TypographyProperties {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number;
    lineHeight?: number | string;
    letterSpacing?: number;
    textAlign?: string;
    color?: string;
}
```

### FigmaFontName

Estrutura de fonte para Figma:

```typescript
interface FigmaFontName {
    family: string;  // ex: 'Inter', 'Roboto'
    style: string;   // ex: 'Regular', 'Bold'
}
```

### FigmaLineHeight

Estrutura de line-height para Figma:

```typescript
interface FigmaLineHeight {
    value: number;
    unit: 'PIXELS' | 'PERCENT' | 'AUTO';
}
```

## Funções Principais

### mapFontWeightToStyle(weight)

Mapeia font-weight CSS para estilo Figma.

**Exemplos:**
```typescript
mapFontWeightToStyle(400)      // 'Regular'
mapFontWeightToStyle(700)      // 'Bold'
mapFontWeightToStyle('bold')   // 'Bold'
mapFontWeightToStyle(550)      // 'SemiBold' (arredonda para 600)
```

### buildFigmaFontName(family, weight)

Constrói objeto `FigmaFontName` completo.

**Exemplos:**
```typescript
buildFigmaFontName('Inter', 700)
// { family: 'Inter', style: 'Bold' }

buildFigmaFontName('Roboto, Arial, sans-serif', 500)
// { family: 'Roboto', style: 'Medium' }
```

### parseFontSize(fontSize)

Converte font-size CSS para pixels.

**Exemplos:**
```typescript
parseFontSize('16px')    // 16
parseFontSize('1rem')    // 16 (assumindo 16px base)
parseFontSize('1.5rem')  // 24
```

### parseLineHeight(lineHeight)

Converte line-height CSS para formato Figma.

**Exemplos:**
```typescript
parseLineHeight('normal')
// { value: 0, unit: 'AUTO' }

parseLineHeight('24px')
// { value: 24, unit: 'PIXELS' }

parseLineHeight('1.5')
// { value: 150, unit: 'PERCENT' }
```

### extractTypographyFromCss(cssProps)

Extrai todas as propriedades de tipografia de um objeto CSS.

**Exemplo:**
```typescript
const css = {
    'font-family': 'Inter, sans-serif',
    'font-weight': '700',
    'font-size': '16px',
    'line-height': '1.5'
};

const result = extractTypographyFromCss(css);
// {
//   fontFamily: 'Inter, sans-serif',
//   fontWeight: '700',
//   fontSize: 16,
//   lineHeight: '1.5'
// }
```

### convertTypographyToFigma(typography)

Converte propriedades de tipografia para formato Figma completo.

**Exemplo:**
```typescript
const typography = {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 16,
    lineHeight: '1.5',
    textAlign: 'center'
};

const figmaProps = convertTypographyToFigma(typography);
// {
//   fontName: { family: 'Inter', style: 'Bold' },
//   fontSize: 16,
//   lineHeight: { value: 150, unit: 'PERCENT' },
//   textAlignHorizontal: 'CENTER'
// }
```

## Carregamento de Fontes no Plugin Figma

### Lista de Fallback

O plugin tenta carregar fontes em ordem de prioridade:

1. Fonte especificada no JSON
2. Inter Regular
3. Roboto Regular
4. Arial Regular
5. Helvetica Regular

### Função loadFontWithFallback

Implementa carregamento assíncrono robusto com tentativas sequenciais:

```typescript
async function loadFontWithFallback(primaryFont?: FigmaFontName): Promise<FigmaFontName> {
    // Tenta cada fonte da lista sequencialmente
    // Retorna a primeira que carregar com sucesso
    // Lança erro apenas se TODAS falharem
}
```

### Tratamento de Erros

- Se fonte primária falhar, tenta próxima da lista
- Logs informativos para cada tentativa
- Garantia de que texto sempre será renderizado
- Mensagens de erro claras em console

## Integração com html-to-figma-core

A função `convertHtmlToFigma` foi estendida para enriquecer nós TEXT automaticamente:

```typescript
const options = {
    enrichTypography: true  // padrão: true
};

const figmaJson = await convertHtmlToFigma(htmlString, options);
```

A função `enrichTextNodeWithTypography` percorre a árvore de nós recursivamente e adiciona propriedades de tipografia a todos os nós TEXT.

## Testes

O módulo possui cobertura de testes completa (89 testes passando):

- ✅ Mapeamento de font-weight (valores numéricos e palavras-chave)
- ✅ Construção de font name
- ✅ Parsing de font-size (px, rem, em)
- ✅ Parsing de line-height (px, %, unitless, auto)
- ✅ Extração de propriedades CSS
- ✅ Conversão para formato Figma
- ✅ Lista de fallback de fontes
- ✅ Edge cases (valores negativos, strings inválidas, etc)

Execute os testes:
```bash
pnpm test
```

## Exemplo de Uso Completo

### 1. HTML de Entrada

```html
<h1 style="
    font-family: Inter, sans-serif;
    font-weight: 700;
    font-size: 32px;
    line-height: 1.2;
    text-align: center;
    color: #333;
">
    Título Principal
</h1>
```

### 2. Conversão para Figma JSON

```typescript
import { convertHtmlToFigma } from '@figma-sync-engine/html-to-figma-core';

const html = '...'; // HTML acima
const figmaJson = await convertHtmlToFigma(html);
```

### 3. JSON Resultante

```json
{
    "type": "TEXT",
    "name": "h1",
    "characters": "Título Principal",
    "fontName": {
        "family": "Inter",
        "style": "Bold"
    },
    "fontSize": 32,
    "lineHeight": {
        "value": 120,
        "unit": "PERCENT"
    },
    "textAlignHorizontal": "CENTER",
    "color": "#333"
}
```

### 4. Importação no Plugin Figma

O plugin carregará a fonte Inter Bold automaticamente, com fallback para Roboto/Arial se necessário.

## Limitações Conhecidas

1. **Fontes não instaladas**: Se a fonte especificada não estiver disponível no Figma, o plugin usa fallback
2. **Variações de estilo**: Alguns estilos (ex: "Italic", "Bold Italic") não são detectados automaticamente
3. **Font-stretch**: Propriedade CSS não suportada (condensed, expanded)
4. **Font-variant**: Propriedade CSS não suportada (small-caps, etc)

## Arquivos Modificados

- `packages/autolayout-interpreter/src/typography.ts` - Novo módulo de tipografia
- `packages/autolayout-interpreter/src/typography.test.ts` - Testes completos
- `packages/autolayout-interpreter/src/index.ts` - Exporta módulo de tipografia
- `packages/figma-plugin-lite/src/code.ts` - Carregamento robusto de fontes
- `packages/html-to-figma-core/src/index.ts` - Enriquecimento de nós TEXT

## Referências

- [Figma Plugin API - Text](https://www.figma.com/plugin-docs/api/TextNode/)
- [CSS font-weight - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight)
- [CSS line-height - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
