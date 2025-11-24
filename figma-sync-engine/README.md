# figma-sync-engine

Ferramenta open source para exportar componentes renderizados no Storybook como JSON compatível com Figma, com suporte inicial a Auto Layout e variantes. Inspira-se e estende capacidades de `@builder.io/html-to-figma`, html.to.design e story.to.design.

## Objetivo
Automatizar a conversão Storybook → Figma reduzindo em até 80% o tempo de documentação e alinhamento entre design e desenvolvimento.

## Pacotes
- `storybook-addon-export`: Addon que adiciona botão "Exportar para Figma" e captura HTML da história ativa. Inclui logger estruturado (MVP-9) e kill-switch (MVP-10).
- `html-to-figma-core`: Fork/light wrapper sobre `@builder.io/html-to-figma` para extensões futuras.
- `autolayout-interpreter`: Pós-processa o JSON para aplicar heurísticas de Auto Layout (gap, padding, alinhamento). Suporta `align-items` e `justify-content` mapeados corretamente (AL-2).
- `figma-plugin-lite`: Plugin que importa JSON e cria nodes recursivamente no canvas com suporte a FRAME, TEXT e RECTANGLE (MVP-6).

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

## Variantes e Exportação Múltipla (VAR-2)

O addon agora suporta exportação de múltiplas stories simultaneamente para criar um ComponentSet no Figma.

### Como Usar

1. **Modo Single (padrão)**: Exporta apenas a story atualmente selecionada
2. **Modo Multi-Seleção**: Ative o botão "Modo Multi-Seleção" para selecionar múltiplas stories via checkboxes

### Formato de Saída

- **Single story**: Gera um JSON com `type: 'FRAME'`
- **Múltiplas stories**: Gera um JSON com `type: 'COMPONENT_SET'` contendo array `variants[]`

```json
{
  "type": "COMPONENT_SET",
  "name": "Button",
  "variants": [
    {
      "type": "FRAME",
      "name": "Primary",
      "storyId": "example-button--primary",
      "__html": "...",
      "variantIndex": 0
    },
    {
      "type": "FRAME",
      "name": "Secondary",
      "storyId": "example-button--secondary",
      "__html": "...",
      "variantIndex": 1
    }
  ],
  "__export": {
    "type": "multi-variant",
    "variantCount": 2,
    "timestamp": "2025-11-24T04:00:00.000Z"
  }
}
```

### Convenção de Mapeamento (VAR-1)

O mapeamento de args do Storybook para propriedades de variante do Figma será documentado em versões futuras. Por enquanto, o nome da story é usado como identificador da variante.

## Roadmap MVP
1. Capturar HTML da história atual
2. Converter via html-to-figma-core
3. Pós-processar com autolayout-interpreter
4. Exportar `.figma.json` (clipboard / download)
5. Importar plugin Figma e gerar nodes

## Segurança & Guardrails
- **Kill-switch** (MVP-10): Variável de ambiente `VITE_FIGMA_EXPORT_ENABLED` permite desabilitar exportação temporariamente para manutenção
- **Logs estruturados** (MVP-9): Logger com níveis (debug, info, warn, error) sem PII, configurável via `VITE_LOG_LEVEL`
- Testes de regressão e snapshot nos exemplos

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
# Kill-switch de segurança (MVP-10)
VITE_FIGMA_EXPORT_ENABLED=true  # false para desabilitar exportação

# Nível de log (MVP-9)
VITE_LOG_LEVEL=info  # debug | info | warn | error
```

## Contribuição
Pull requests são bem-vindos. Abra issues para discutir heurísticas de Auto Layout, suporte a variantes ou melhorias de desempenho.

## Licença
MIT – ver `LICENSE`.
