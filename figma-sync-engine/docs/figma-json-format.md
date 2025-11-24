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

## Formato com Variantes (VAR-3)

Para suportar ComponentSet, o JSON pode incluir um array de variantes:

```json
{
  "name": "Button",
  "variants": [
    {
      "type": "FRAME",
      "name": "variant=primary",
      "variantProperties": {
        "variant": "primary"
      },
      "layoutMode": "HORIZONTAL",
      "itemSpacing": 8,
      "paddingTop": 12,
      "paddingRight": 12,
      "paddingBottom": 12,
      "paddingLeft": 12,
      "children": [...]
    },
    {
      "type": "FRAME",
      "name": "variant=secondary",
      "variantProperties": {
        "variant": "secondary"
      },
      "layoutMode": "HORIZONTAL",
      "itemSpacing": 8,
      "paddingTop": 12,
      "paddingRight": 12,
      "paddingBottom": 12,
      "paddingLeft": 12,
      "children": [...]
    }
  ]
}
```

### Regras para ComponentSet
- Array `variants` deve conter no mínimo 2 elementos
- Cada variante deve ser um FRAME válido
- O plugin converte automaticamente frames em components
- Components são agrupados usando `figma.combineAsVariants()`
- `variantProperties` define as propriedades de variação (ex: variant, size, state)
- Auto Layout é preservado em cada variante

## Futuro
- Tokens de design (cores, tipografia) resolvidos.
- Metadata de origem (storybookId, sourceUrl).
