# Auto Layout Engine

Heurísticas iniciais suportadas (base Flexbox):

| CSS | Figma | Notas |
| --- | ----- | ----- |
| display:flex | layoutMode | Somente flex containers |
| flex-direction:row | layoutMode: HORIZONTAL | |
| flex-direction:column | layoutMode: VERTICAL | |
| gap | itemSpacing | Converte px → número inteiro |
| padding, margin (container) | paddingTop/Right/Bottom/Left | Margins internas só via padding |
| align-items:flex-start | primaryAxisAlign / counterAxisAlign | Mapeado conforme direção |
| align-items:center | ... | |
| justify-content | primaryAxisAlign | |

## Processo
1. Inspeção do DOM pós-conversão base.
2. Identificação de frames que representam containers flex.
3. Anotação dos campos Figma suportados.

## Limitações
- Não traduz ainda grow/shrink.
- Overflows ignorados.
- Gap múltiplo (row/column separadamente) não suportado.

## Futuro
- Suporte a wrap.
- Detecção de variantes via atributos/args.
- Mapeamento de estilos de texto avançados.
