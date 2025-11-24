# Formato JSON Figma (Proposta Inicial)

Estrutura mínima produzida pelo pipeline:

```json
{
  "version": 1,
  "root": {
    "type": "FRAME",
    "name": "ExportedStory",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "paddingTop": 12,
    "paddingRight": 12,
    "paddingBottom": 12,
    "paddingLeft": 12,
    "children": [
      {
        "type": "TEXT",
        "characters": "Button",
        "fontSize": 14,
        "fontWeight": 500
      }
    ]
  }
}
```

## Campos Principais
- `version`: versão do schema interno.
- `root`: node raiz (FRAME ou COMPONENT dependendo do fluxo futuro).
- `layoutMode`: "HORIZONTAL" ou "VERTICAL" para Auto Layout.
- `itemSpacing`: espaçamento entre filhos.
- `padding*`: preenchimento interno.
- `children`: lista de nodes aninhados.

## Propriedades de Variante (VAR-1)

A partir da versão 0.2.0, o pipeline suporta mapeamento automático de `args` do Storybook para `variantProperties` do Figma.

### Convenção de Mapeamento

Args do Storybook são convertidos em propriedades de variante do Figma seguindo estas regras:

| Storybook Args | Figma variantProperties | Exemplo |
|----------------|-------------------------|---------|
| `variant="primary"` | `{ variant: "primary" }` | Botão primário vs secundário |
| `size="large"` | `{ size: "large" }` | Tamanhos: small, medium, large |
| `disabled={true}` | `{ state: "disabled" }` | Estados: default, hover, disabled |
| `loading={true}` | `{ state: "loading" }` | Estados de carregamento |

### Regras de Conversão

1. **String e Number**: Valores são convertidos diretamente
   - `variant="primary"` → `{ variant: "primary" }`
   - `level={1}` → `{ level: "1" }`

2. **Boolean**: Valores booleanos são mapeados para estados
   - `disabled={true}` → `{ state: "disabled" }`
   - `loading={true}` → `{ state: "loading" }`
   - `false` é ignorado (representa estado padrão)

3. **Nested Objects**: Ignorados na conversão para variantProperties

### Estrutura JSON com Variantes

```json
{
  "version": 1,
  "root": {
    "type": "COMPONENT",
    "name": "Button/Primary",
    "variantProperties": {
      "variant": "primary",
      "size": "medium"
    },
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "children": [...]
  },
  "__export": {
    "timestamp": "2025-11-24T00:00:00.000Z",
    "storyId": "example-button--primary",
    "args": {
      "variant": "primary",
      "size": "medium",
      "label": "Click me"
    }
  }
}
```

### Metadata de Exportação

O campo `__export` contém informações de rastreabilidade:
- `timestamp`: Data/hora da exportação
- `version`: Versão do engine
- `storyId`: ID da story no Storybook
- `args`: Args originais da story (para referência)
- `nodeCount`: Número de nodes no componente
- `hasInteractiveElements`: Se contém elementos interativos

## Futuro
- Tokens de design (cores, tipografia) resolvidos.
- Suporte a ComponentSet com múltiplas variantes (VAR-2, VAR-3).
- Detecção automática de estados via `data-state` (VAR-4).
