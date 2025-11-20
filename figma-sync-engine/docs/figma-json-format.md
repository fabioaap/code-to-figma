# Formato JSON Figma

Documentação completa do formato JSON produzido pelo figma-sync-engine para importação no Figma.

## Estrutura Geral

```json
{
  "version": 1,
  "metadata": {
    "storyId": "button--primary",
    "exportedAt": "2025-11-20T18:30:00Z",
    "engine": "figma-sync-engine",
    "engineVersion": "0.1.0"
  },
  "root": {
    "type": "FRAME",
    "name": "ExportedStory",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "paddingTop": 12,
    "paddingRight": 12,
    "paddingBottom": 12,
    "paddingLeft": 12,
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "CENTER",
    "children": [
      {
        "type": "TEXT",
        "characters": "Button",
        "fontSize": 14,
        "fontWeight": 500,
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 0, "g": 0, "b": 0 }
          }
        ]
      }
    ]
  }
}
```

## Campos de Nível Superior

### `version` (number, obrigatório)
Versão do schema JSON. Permite versionamento e compatibilidade futura.
- Versão atual: `1`

### `metadata` (object, opcional)
Informações sobre a origem e contexto do export.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `storyId` | string | ID da história do Storybook |
| `exportedAt` | string | Timestamp ISO 8601 do export |
| `engine` | string | Nome do engine de conversão |
| `engineVersion` | string | Versão do engine |

### `root` (object, obrigatório)
Node raiz do documento. Tipicamente um FRAME ou COMPONENT.

## Node Types

### FRAME

Node de container com suporte a Auto Layout.

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `type` | string | "FRAME" | Tipo do node |
| `name` | string | - | Nome do frame |
| `layoutMode` | string | "HORIZONTAL" \| "VERTICAL" \| "NONE" | Modo de layout |
| `itemSpacing` | number | ≥0 | Espaçamento entre filhos (px) |
| `paddingTop` | number | ≥0 | Padding superior (px) |
| `paddingRight` | number | ≥0 | Padding direito (px) |
| `paddingBottom` | number | ≥0 | Padding inferior (px) |
| `paddingLeft` | number | ≥0 | Padding esquerdo (px) |
| `primaryAxisAlignItems` | string | "MIN" \| "CENTER" \| "MAX" \| "SPACE_BETWEEN" | Alinhamento no eixo principal |
| `counterAxisAlignItems` | string | "MIN" \| "CENTER" \| "MAX" \| "BASELINE" | Alinhamento no eixo transversal |
| `width` | number | ≥0 | Largura do frame (px) |
| `height` | number | ≥0 | Altura do frame (px) |
| `fills` | array | - | Array de preenchimentos |
| `strokes` | array | - | Array de bordas |
| `cornerRadius` | number | ≥0 | Raio das bordas arredondadas |
| `children` | array | - | Array de nodes filhos |

### TEXT

Node de texto.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | "TEXT" |
| `characters` | string | Conteúdo do texto |
| `fontSize` | number | Tamanho da fonte (px) |
| `fontWeight` | number | Peso da fonte (100-900) |
| `fontFamily` | string | Nome da família da fonte |
| `lineHeight` | number \| object | Altura da linha |
| `letterSpacing` | number \| object | Espaçamento entre letras |
| `textAlignHorizontal` | string | "LEFT" \| "CENTER" \| "RIGHT" \| "JUSTIFIED" |
| `textAlignVertical` | string | "TOP" \| "CENTER" \| "BOTTOM" |
| `fills` | array | Preenchimentos do texto |

### RECTANGLE

Node de retângulo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | "RECTANGLE" |
| `name` | string | Nome do retângulo |
| `width` | number | Largura (px) |
| `height` | number | Altura (px) |
| `fills` | array | Preenchimentos |
| `strokes` | array | Bordas |
| `cornerRadius` | number | Raio das bordas |

## Propriedades Comuns

### Fills (Preenchimentos)

Array de objetos de preenchimento:

```json
"fills": [
  {
    "type": "SOLID",
    "color": { "r": 1, "g": 0, "b": 0 },
    "opacity": 1
  }
]
```

Tipos suportados:
- `SOLID`: Cor sólida
- `GRADIENT_LINEAR`: Gradiente linear (futuro)
- `IMAGE`: Preenchimento com imagem (futuro)

### Strokes (Bordas)

Array de objetos de borda, similar a fills:

```json
"strokes": [
  {
    "type": "SOLID",
    "color": { "r": 0, "g": 0, "b": 0 },
    "opacity": 1
  }
]
```

### Colors (Cores)

Objeto RGB com valores de 0 a 1:

```json
{
  "r": 0.5,
  "g": 0.5,
  "b": 0.5
}
```

## Auto Layout

O Auto Layout permite layouts responsivos similares ao Flexbox.

### Layout Mode

- `HORIZONTAL`: Layout horizontal (flex-direction: row)
- `VERTICAL`: Layout vertical (flex-direction: column)
- `NONE`: Sem auto layout (posicionamento absoluto)

### Alinhamento

**Primary Axis** (eixo principal - direção do layout):
- `MIN`: Início (flex-start)
- `CENTER`: Centro
- `MAX`: Fim (flex-end)
- `SPACE_BETWEEN`: Espaçamento entre itens

**Counter Axis** (eixo transversal - perpendicular ao layout):
- `MIN`: Início
- `CENTER`: Centro
- `MAX`: Fim
- `BASELINE`: Linha de base do texto

### Mapeamento CSS → Figma

| CSS | Figma |
|-----|-------|
| `display: flex` | `layoutMode: "HORIZONTAL"` (padrão) ou `"VERTICAL"` |
| `flex-direction: row` | `layoutMode: "HORIZONTAL"` |
| `flex-direction: column` | `layoutMode: "VERTICAL"` |
| `gap: 8px` | `itemSpacing: 8` |
| `padding: 12px` | `paddingTop/Right/Bottom/Left: 12` |
| `justify-content: center` | `primaryAxisAlignItems: "CENTER"` |
| `align-items: center` | `counterAxisAlignItems: "CENTER"` |

## Exemplo Completo

```json
{
  "version": 1,
  "metadata": {
    "storyId": "button--primary",
    "exportedAt": "2025-11-20T18:30:00Z",
    "engine": "figma-sync-engine",
    "engineVersion": "0.1.0"
  },
  "root": {
    "type": "FRAME",
    "name": "Button Primary",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "paddingTop": 12,
    "paddingRight": 16,
    "paddingBottom": 12,
    "paddingLeft": 16,
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "CENTER",
    "cornerRadius": 4,
    "fills": [
      {
        "type": "SOLID",
        "color": { "r": 0.2, "g": 0.4, "b": 1 },
        "opacity": 1
      }
    ],
    "children": [
      {
        "type": "TEXT",
        "characters": "Click me",
        "fontSize": 14,
        "fontWeight": 500,
        "fontFamily": "Inter",
        "fills": [
          {
            "type": "SOLID",
            "color": { "r": 1, "g": 1, "b": 1 }
          }
        ]
      }
    ]
  }
}
```

## Limitações Atuais

- **Variantes**: Não suportado ainda (roadmap EPIC 3)
- **Components**: Todos exports são FRAME, não COMPONENT
- **Tokens**: Tokens de design não são resolvidos automaticamente
- **Imagens**: Preenchimentos de imagem não implementados
- **Efeitos**: Sombras e blur não suportados
- **Máscaras**: Clipping masks não suportadas

## Futuro

### EPIC 3: Variantes & Componentes

```json
{
  "root": {
    "type": "COMPONENT_SET",
    "name": "Button",
    "children": [
      {
        "type": "COMPONENT",
        "name": "variant=primary",
        "variantProperties": {
          "variant": "primary"
        }
      }
    ]
  }
}
```

### EPIC 6: Design Tokens

```json
{
  "tokens": {
    "colors": {
      "primary": { "r": 0.2, "g": 0.4, "b": 1 }
    },
    "typography": {
      "body": {
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": 400
      }
    }
  },
  "root": {
    "fills": [
      {
        "type": "SOLID",
        "colorToken": "primary"
      }
    ]
  }
}
```

## Validação

Para validar o JSON gerado:

1. Verificar que `version` é um número
2. Verificar que `root` existe e tem um `type` válido
3. Validar que valores numéricos são não-negativos onde aplicável
4. Verificar que cores RGB estão entre 0 e 1
5. Validar que enums (layoutMode, align, etc.) têm valores válidos

## Referências

- [Figma Plugin API - Nodes](https://www.figma.com/plugin-docs/api/nodes/)
- [Figma Plugin API - Properties](https://www.figma.com/plugin-docs/api/properties/)
- [Auto Layout](https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-Auto-layout)
