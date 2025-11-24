# Code to Figma

[![CI](https://github.com/fabioaap/code-to-figma/actions/workflows/ci.yml/badge.svg)](https://github.com/fabioaap/code-to-figma/actions/workflows/ci.yml)

Repositório monorepo para ferramentas de sincronização entre código e Figma.

## Projeto Principal

O projeto principal está localizado em [`figma-sync-engine/`](./figma-sync-engine/).

**figma-sync-engine** é uma ferramenta open source para exportar componentes renderizados no Storybook como JSON compatível com Figma, com suporte inicial a Auto Layout e variantes.

### Acesso rápido

- 📖 [Documentação completa](./figma-sync-engine/README.md)
- 🚀 [Início rápido](./figma-sync-engine/QUICK_START.md)
- 🤝 [Contribuindo](./figma-sync-engine/CONTRIBUTING.md)

## Objetivo

Automatizar a conversão Storybook → Figma reduzindo em até 80% o tempo de documentação e alinhamento entre design e desenvolvimento.

## Scripts na raiz do monorepo

```bash
cd figma-sync-engine
pnpm install       # instala dependências do monorepo
pnpm dev           # roda todos os pacotes em modo desenvolvimento
pnpm build         # build de todos os pacotes
pnpm lint          # lint em todos os workspaces
pnpm test          # testes (Vitest)
```

## Licença

MIT – ver [`LICENSE`](./figma-sync-engine/LICENSE).
