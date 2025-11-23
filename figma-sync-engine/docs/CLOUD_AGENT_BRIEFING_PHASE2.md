# Cloud Agent Briefing - Phase 2: Plugin & Advanced Layout

> **Contexto**: O MVP-5 foi concluído com sucesso. O pipeline de exportação gera um JSON válido com feedback visual.
> **Objetivo**: Implementar o lado do Plugin Figma (MVP-6) para consumir esse JSON, melhorar a fidelidade do layout (AL-2), adicionar observabilidade (MVP-9) e segurança (MVP-10).

## 🎯 Objetivos da Sessão

Você deve executar as seguintes tarefas, priorizando a qualidade e a robustez do código.

### 1. MVP-6: Plugin Figma Importador (Prioridade Alta)
**Arquivo alvo**: `packages/figma-plugin-lite/src/code.ts`
**Estimativa**: 4-6h (mas tente ser eficiente)

O plugin atual apenas cria um Frame raiz e textos simples. Ele precisa ser capaz de reconstruir a árvore de componentes recursivamente.

**Requisitos Técnicos**:
- [ ] Refatorar `code.ts` para usar uma função recursiva `createNode(nodeData)`.
- [ ] Suportar tipos de node: `FRAME`, `TEXT`, `RECTANGLE`.
- [ ] Mapear propriedades visuais básicas:
    - `fills` (Solid Color)
    - `strokes` & `strokeWeight`
    - `cornerRadius`
    - `opacity`
- [ ] Mapear propriedades de Auto Layout:
    - `layoutMode` (HORIZONTAL/VERTICAL)
    - `primaryAxisAlignItems` (MIN, MAX, CENTER, SPACE_BETWEEN)
    - `counterAxisAlignItems` (MIN, MAX, CENTER)
    - `padding` (Top, Right, Bottom, Left)
    - `itemSpacing` (Gap)
- [ ] Tratamento de erro: Se o JSON for inválido ou tiver tipos desconhecidos, notificar o usuário via `figma.notify`.

### 2. AL-2: Auto Layout Avançado (Prioridade Alta)
**Arquivo alvo**: `packages/autolayout-interpreter/src/index.ts`
**Estimativa**: 1-2h

Melhorar a interpretação de estilos CSS para propriedades Figma.

**Requisitos Técnicos**:
- [ ] Mapear `justify-content` do CSS para `primaryAxisAlignItems` do Figma.
    - `flex-start` -> `MIN`
    - `center` -> `CENTER`
    - `flex-end` -> `MAX`
    - `space-between` -> `SPACE_BETWEEN`
- [ ] Mapear `align-items` do CSS para `counterAxisAlignItems` do Figma.
    - `flex-start` -> `MIN`
    - `center` -> `CENTER`
    - `flex-end` -> `MAX`
- [ ] Considerar a direção (`flex-direction`) para garantir que Primary/Counter estejam corretos.

### 3. MVP-9: Logger de Exportação (Prioridade Média - Paralelo)
**Arquivo alvo**: `packages/storybook-addon-export/src/utils/logger.ts` (criar)
**Estimativa**: 1h

Criar um mecanismo simples de log para ajudar no debug de usuários.

**Requisitos Técnicos**:
- [ ] Criar classe/módulo `Logger`.
- [ ] Métodos: `info`, `warn`, `error`.
- [ ] Formato: `[FigmaSync] <Timestamp> <Level>: <Message> {metadata}`.
- [ ] Integrar no `panel.tsx` para logar: "Iniciando exportação", "Sucesso (tamanho X bytes)", "Erro".
- [ ] **Privacidade**: Não logar conteúdo do HTML ou textos do usuário, apenas metadados (IDs, tamanhos, tempos).

### 4. MVP-10: Kill-switch (Prioridade Baixa)
**Arquivo alvo**: `packages/storybook-addon-export/src/panel.tsx`
**Estimativa**: 30min

Mecanismo de segurança para desativar o addon globalmente se necessário.

**Requisitos Técnicos**:
- [ ] Verificar existência de flag global `window.FIGMA_SYNC_DISABLED` ou variável de ambiente `STORYBOOK_FIGMA_SYNC_DISABLED`.
- [ ] Se `true`, renderizar mensagem "Exportação desativada temporariamente" no lugar do botão.

---

## 📝 Plano de Execução Sugerido

1.  **Setup**: Verifique se o build está passando (`pnpm build`).
2.  **AL-2 (Interpreter)**: Comece pela lógica de interpretação. É pura lógica e fácil de testar.
    *   Edite `packages/autolayout-interpreter/src/index.ts`.
    *   Adicione testes em `packages/autolayout-interpreter/tests/interpret.test.ts`.
3.  **MVP-6 (Plugin)**: Implemente a recursão no plugin.
    *   Edite `packages/figma-plugin-lite/src/code.ts`.
    *   Como testar: Use o JSON gerado pelo Storybook (MVP-5) e cole no plugin rodando no Figma (ou mock se não tiver acesso visual). *Nota: Como agente, foque na correção do código TypeScript.*
4.  **MVP-9 & MVP-10 (Addon)**: Implemente o Logger e o Kill-switch no addon.
5.  **Validação Final**: Rode `pnpm test` e `pnpm build`.

## 🛡️ Definição de Pronto (DoD)

- [ ] `pnpm build` passa em todos os pacotes.
- [ ] `pnpm test` passa (especialmente novos testes de AL-2).
- [ ] Plugin compila sem erros de TypeScript.
- [ ] Código segue padrões do projeto (sem `any` desnecessário).
