# Arquitetura

A arquitetura segue princípios de Clean Architecture e separação clara de responsabilidades.

## Camadas
- Domain: Regras de negócio de interpretação de layout e estrutura do JSON Figma.
- Application: Orquestra fluxo de conversão (captura HTML → conversão base → pós-processamento Auto Layout → exportação).
- Infrastructure: Integrações com Storybook, Figma Plugin API, parser HTML/CSS.
- Interface: Addon do Storybook e UI do plugin Figma.

## Fluxo MVP
1. Storybook addon obtém HTML da história.
2. `html-to-figma-core` converte HTML em JSON inicial.
3. `autolayout-interpreter` aplica heurísticas para gap, padding, alignment.
4. Addon disponibiliza JSON para clipboard/download.
5. Plugin Figma importa JSON e gera nodes.

## Decisões
- Monorepo com Turbo + PNPM para pipelines rápidas.
- Interpretação de Auto Layout heurística (baseada em CSS flex).
- Extensibilidade futura para variantes (CSS data-attributes / story args).

## Próximos Passos
- Snapshot comparando HTML original e representação Figma.
- Mapeamento completo de propriedades de texto / cores / bordas.
