# Contribuindo para figma-sync-engine

Obrigado por considerar contribuir! Este guia descreve como trabalhar no projeto.

## Visão Geral
O objetivo é reduzir o tempo de documentação de componentes no Figma integrando Storybook → Figma com heurísticas de Auto Layout e variantes.

## Fluxo de Trabalho
1. Abra uma issue antes de um PR para novos recursos (exceto correção trivial).
2. Vincule a issue usando IDs do backlog (ex: `MVP-3`, `AL-2`).
3. Crie uma branch: `feat/MVP-3-conversao-basica` ou `fix/AL-1-padding-bug`.
4. Escreva testes (Vitest) para lógica e snapshots quando aplicável.
5. Execute `pnpm lint && pnpm test` antes de enviar PR.

## Commit Messages
Formato sugerido: `<tipo>(escopo): descrição curta`.
Tipos comuns:
- `feat`: novo recurso
- `fix`: correção
- `docs`: documentação
- `test`: testes
- `refactor`: alteração interna sem mudança de comportamento
- `perf`: melhoria de desempenho
- `chore`: tarefas auxiliares

Exemplos:
- `feat(autolayout): implementa AL-2 justify-content`
- `fix(conversion): corrige erro em gap múltiplo (AL-4)`

## Pull Requests
Checklist mínimo:
- Referência da issue e ID backlog.
- Descrição clara do problema e solução.
- Testes adicionados/atualizados.
- Documentação atualizada (`docs/*` se necessário).
- Sem remoção de APIs públicas sem discussão prévia.

## Estilo de Código
- TypeScript estrito.
- Evitar abreviações excessivas.
- Sem comentários redundantes – código limpo preferível.
- Prettier para formatação (`pnpm lint` já inclui verificação estilística).

## Testes
- Unitários (Vitest) para funções puras.
- Snapshot JSON para exemplos relevantes.
- Futuro: Playwright para fluxo UI plugin / Storybook.

## Backlog e Roadmap
Consulte `docs/backlog.md` para epics e IDs. Use-os em issues e PRs.

## Segurança
- Não expor segredos (o projeto não deve conter credenciais).
- Pacotes adicionados devem passar por `pnpm audit` (futuro script).

## Como Rodar Localmente
```bash
pnpm install
pnpm build
pnpm --filter @figma-sync-engine/example-react-button dev
```

## Dúvidas
Abra uma issue `question:` ou inicie discussão caso o escopo seja amplo.

Bem-vindo(a)! 🎉
