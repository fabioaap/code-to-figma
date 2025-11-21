# Guia de Testes e Validação

Este documento descreve como executar os testes e validar o pipeline do projeto `figma-sync-engine`.

## Comandos de Teste

O projeto utiliza **Vitest** para testes unitários e de integração.

### Executar todos os testes (Modo CI)
Para rodar todos os testes de uma vez (sem modo watch):

```bash
pnpm test
```

Este comando executa `turbo run test`, que dispara `vitest run --passWithNoTests` em todos os pacotes.

### Executar testes em modo Watch (Desenvolvimento)
Para rodar testes continuamente enquanto desenvolve:

```bash
# Exemplo para um pacote específico
cd packages/autolayout-interpreter
pnpm vitest
```

Ou via filtro do Turbo na raiz:

```bash
pnpm turbo run test --filter=@figma-sync-engine/autolayout-interpreter -- --watch
```

## Estrutura de Testes

- **Unitários**: Localizados junto aos arquivos fonte (`src/*.test.ts`) ou na pasta `tests/`.
- **Integração**: Testam a comunicação entre módulos (ex: `html-to-figma-core` gerando input para `autolayout-interpreter`).

## Validação de Qualidade (Lint & Audit)

Antes de submeter PRs, execute:

```bash
pnpm lint
pnpm audit --audit-level=moderate
```

> **Nota sobre Auditoria**: Atualmente existe uma vulnerabilidade conhecida em `esbuild` (dependência de desenvolvimento via Vite/Storybook). Isso não afeta o código de produção do plugin ou addon, mas pode gerar aviso no `pnpm audit`.

## Solução de Problemas Comuns

### `pnpm test` trava ou não termina
Verifique se os scripts `test` nos `package.json` dos pacotes estão configurados como `vitest run`. Se estiverem apenas como `vitest`, eles entrarão em modo watch por padrão.

### Erros de dependência no Storybook
Certifique-se de que as versões do `@storybook/*` estão alinhadas (atualmente `^7.6.17`). Versões misturadas ou inexistentes (ex: `8.6.x` antes do lançamento) causam falha na instalação.
