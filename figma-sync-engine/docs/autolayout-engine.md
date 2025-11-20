# Auto Layout Engine

Heurísticas iniciais suportadas (base Flexbox):

| CSS | Figma | Notas |
| --- | ----- | ----- |
| display:flex | layoutMode | Somente flex containers |
| flex-direction:row | layoutMode: HORIZONTAL | |
| flex-direction:column | layoutMode: VERTICAL | |
| gap | itemSpacing | Converte px → número inteiro |
| padding, margin (container) | paddingTop/Right/Bottom/Left | Margins internas só via padding |
| align-items:flex-start | counterAxisAlignItems: MIN | Mapeado conforme direção |
| align-items:center | counterAxisAlignItems: CENTER | |
| align-items:flex-end | counterAxisAlignItems: MAX | |
| align-items:baseline | counterAxisAlignItems: BASELINE | |
| justify-content:flex-start | primaryAxisAlignItems: MIN | |
| justify-content:center | primaryAxisAlignItems: CENTER | |
| justify-content:flex-end | primaryAxisAlignItems: MAX | |
| justify-content:space-between | primaryAxisAlignItems: SPACE_BETWEEN | |

## Processo
1. Inspeção do DOM pós-conversão base.
2. Identificação de frames que representam containers flex.
3. Anotação dos campos Figma suportados.

## Alinhamento (implementado)
O engine agora mapeia completamente as propriedades de alinhamento do Flexbox para Figma:

- **justify-content** (eixo principal): Controla o alinhamento dos itens ao longo da direção do layout
  - `flex-start` / `start` → `MIN`
  - `center` → `CENTER`
  - `flex-end` / `end` → `MAX`
  - `space-between` → `SPACE_BETWEEN`

- **align-items** (eixo transversal): Controla o alinhamento perpendicular à direção do layout
  - `flex-start` / `start` → `MIN`
  - `center` → `CENTER`
  - `flex-end` / `end` → `MAX`
  - `baseline` → `BASELINE`

## Limitações
- Não traduz ainda grow/shrink.
- Overflows ignorados.
- Gap múltiplo (row/column separadamente) não suportado.
- `space-around` e `space-evenly` não mapeados (Figma não possui equivalentes diretos).

## Futuro
- Suporte a wrap.
- Detecção de variantes via atributos/args.
- Mapeamento de estilos de texto avançados.
