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

## Futuro
- Suporte a `variantProperties`.
- Tokens de design (cores, tipografia) resolvidos.
- Metadata de origem (storybookId, sourceUrl).
