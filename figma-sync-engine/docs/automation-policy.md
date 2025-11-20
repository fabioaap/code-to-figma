# Política de Execução Automatizada

> Objetivo: Documentar quais comandos podem ser executados automaticamente pelo agente sem necessidade de aprovação manual.

## Regras Gerais
1. O agente pode executar comandos relacionados ao fluxo de desenvolvimento do **figma-sync-engine** sem solicitar confirmação prévia.
2. Comandos devem ser focados em build, lint, testes, instalação de dependências e utilitários de diagnóstico.
3. Qualquer comando potencialmente destrutivo (ex.: remover arquivos, resetar branch, limpar banco) requer confirmação explícita do usuário.
4. Logs dos comandos executados devem ser compartilhados no chat.

## Comandos Permitidos
- `pnpm install`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm dev`
- `pnpm --filter <package> <script>`
- `git status`
- `git diff`
- Comandos de inspeção (`dir`, `ls`, `type`, `cat`)

## Procedimento
1. Agente avalia necessidade do comando.
2. Executa diretamente e aguarda conclusão.
3. Retorna no chat com resumo do resultado.
4. Em caso de erro, informa plano de correção.

## Casos que Exigem Confirmação
- Exclusão ou modificação massiva de arquivos.
- Reset/rebase de branches.
- Execução de scripts externos não versionados.

## Revisão
- Atualizar esta política a cada sprint ou quando novos scripts forem criados.
