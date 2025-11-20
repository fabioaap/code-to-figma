# figma-sync-engine

Ferramenta open source para exportar componentes renderizados no Storybook como JSON compatível com Figma, com suporte inicial a Auto Layout e variantes. Inspira-se e estende capacidades de `@builder.io/html-to-figma`, html.to.design e story.to.design.

## Objetivo
Automatizar a conversão Storybook → Figma reduzindo em até 80% o tempo de documentação e alinhamento entre design e desenvolvimento.

## Pacotes
- `storybook-addon-export`: Addon que adiciona botão "Exportar para Figma" e captura HTML da história ativa.
- `html-to-figma-core`: Fork/light wrapper sobre `@builder.io/html-to-figma` para extensões futuras.
- `autolayout-interpreter`: Pós-processa o JSON para aplicar heurísticas básicas de Auto Layout (gap, padding, alinhamento).
- `figma-plugin-lite`: Plugin mínimo que permite colar/importar JSON e criar nodes no canvas.
- `logger`: Logger estruturado para observabilidade sem PII.

## Exemplo
`examples/react-button` contém um componente simples para testar fluxo de exportação.

## Scripts (raiz)
```bash
pnpm install       # instala dependências do monorepo
pnpm dev           # roda todos os pacotes em modo desenvolvimento
pnpm build         # build de todos os pacotes
pnpm lint          # lint em todos os workspaces
pnpm test          # testes (Vitest / futura suíte Playwright)
pnpm audit         # executa auditoria de segurança
```

## Arquitetura (Clean)
Camadas: Domain → Application → Infrastructure → Interface. Ver `docs/architecture.md` para visão detalhada e `docs/figma-json-format.md` para o formato de saída.

## Formato JSON Figma
O engine gera JSON estruturado compatível com a API do Figma. Ver `docs/figma-json-format.md` para documentação completa do formato, incluindo:
- Estrutura de nodes (FRAME, TEXT, RECTANGLE)
- Propriedades de Auto Layout
- Mapeamento CSS → Figma
- Exemplos completos

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
- Auditoria de dependências via `pnpm audit`

## FAQ

### Como o figma-sync-engine se compara a html.to.design?
O figma-sync-engine é focado em integração com Storybook e automação do fluxo de documentação. Diferenças principais:
- Integração nativa com Storybook via addon
- Suporte avançado a Auto Layout com mapeamento completo de align-items e justify-content
- Logger estruturado para observabilidade
- Arquitetura extensível para futuras features (variantes, tokens)

### Quais propriedades CSS são suportadas?
Atualmente suportamos:
- `display: flex` → Auto Layout
- `flex-direction` → layoutMode (HORIZONTAL/VERTICAL)
- `gap` → itemSpacing
- `padding` → paddingTop/Right/Bottom/Left
- `justify-content` → primaryAxisAlignItems
- `align-items` → counterAxisAlignItems

Ver `docs/autolayout-engine.md` para tabela completa de mapeamentos.

### Como funciona a conversão de variantes?
Variantes estão no roadmap (EPIC 3). A implementação planejada incluirá:
- Detecção de variantes via story args
- Geração de ComponentSet no Figma
- Suporte a múltiplas stories selecionadas

### O que acontece com componentes complexos?
Componentes muito complexos (>500 nodes) podem ter:
- Tempo de conversão maior
- Possíveis limitações de fidelidade visual
- Recomendamos usar o logger para monitorar performance

### Como contribuir?
Leia `CONTRIBUTING.md` para diretrizes completas. Resumo:
1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Faça suas alterações seguindo o padrão Conventional Commits
4. Execute testes e lint
5. Abra um Pull Request

### Quais são as limitações conhecidas?
Limitações atuais:
- Variantes não suportadas (em desenvolvimento)
- Não traduz flex-grow/flex-shrink
- Gap composto (row/column) não suportado
- Wrapping de flex não suportado
- Imagens e efeitos visuais limitados

Ver `docs/backlog.md` para roadmap completo.

### Como reportar bugs ou sugerir features?
- Bugs: Abra um issue com label `bug` incluindo passos para reproduzir
- Features: Abra um issue com label `enhancement` descrevendo o caso de uso
- Vulnerabilidades: Reporte privadamente via security advisory

### O projeto está pronto para produção?
O projeto está em versão MVP (0.1.0). Recomendado para:
- ✅ Experimentação e validação de conceito
- ✅ Projetos internos e protótipos
- ⚠️ Produção: aguardar versão 1.0.0 com cobertura completa

## Contribuição
Pull requests são bem-vindos. Abra issues para discutir heurísticas de Auto Layout, suporte a variantes ou melhorias de desempenho. Ver `CONTRIBUTING.md` para guia completo.

## Licença
MIT – ver `LICENSE`.
