# figma-sync-engine

Ferramenta open source para exportar componentes renderizados no Storybook como JSON compatível com Figma, com suporte inicial a Auto Layout e variantes. Inspira-se e estende capacidades de `@builder.io/html-to-figma`, html.to.design e story.to.design.

## Objetivo
Automatizar a conversão Storybook → Figma reduzindo em até 80% o tempo de documentação e alinhamento entre design e desenvolvimento.

## Pacotes
- `storybook-addon-export`: Addon que adiciona botão "Exportar para Figma" e captura HTML da história ativa.
- `html-to-figma-core`: Fork/light wrapper sobre `@builder.io/html-to-figma` para extensões futuras.
- `autolayout-interpreter`: Pós-processa o JSON para aplicar heurísticas básicas de Auto Layout (gap, padding, alinhamento).
- `figma-plugin-lite`: Plugin mínimo que permite colar/importar JSON e criar nodes no canvas.

## Exemplo
`examples/react-button` contém um componente simples para testar fluxo de exportação.

## Scripts (raiz)
```bash
pnpm install       # instala dependências do monorepo
pnpm dev           # roda todos os pacotes em modo desenvolvimento
pnpm build         # build de todos os pacotes
pnpm lint          # lint em todos os workspaces
pnpm test          # testes (Vitest / futura suíte Playwright)
```

## Arquitetura (Clean)
Camadas: Domain → Application → Infrastructure → Interface. Ver `docs/architecture.md` para visão detalhada e `docs/figma-json-format.md` para o formato de saída.

## Formato JSON Figma
Placeholder inicial – será detalhado em `docs/figma-json-format.md`.

## Auto Layout
O interpretador lê propriedades CSS (display:flex, flex-direction, gap, padding, align-items, justify-content) e traduz para campos Figma equivalentes. Detalhes em `docs/autolayout-engine.md`.

## Roadmap MVP
1. Capturar HTML da história atual
2. Converter via html-to-figma-core
3. Pós-processar com autolayout-interpreter
4. Exportar `.figma.json` (clipboard / download)
5. Importar plugin Figma e gerar nodes

## Segurança & Guardrails
- Kill-switch e TTL para funcionalidades experimentais (futuro)
- Logs estruturados sem PII
- Testes de regressão e snapshot nos exemplos

## Contribuição
Pull requests são bem-vindos. Abra issues para discutir heurísticas de Auto Layout, suporte a variantes ou melhorias de desempenho.

## Licença
MIT – ver `LICENSE`.
