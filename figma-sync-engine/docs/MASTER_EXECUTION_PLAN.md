# Master Execution Plan - Code-to-Figma

Este documento define a estratégia algorítmica para resolver todas as issues pendentes do projeto, respeitando dependências técnicas para evitar conflitos.

## 🧠 Algoritmo de Dependência

O grafo de execução foi montado seguindo estas regras:
1.  **Core > Abstraction**: Resolver lógica de layout/estilo antes de extrair tokens.
2.  **Definition > Implementation**: Definir convenções antes de codar features.
3.  **Producer > Consumer**: O Addon (quem gera o JSON) deve ser atualizado antes do Plugin (quem lê o JSON).

### 🚦 Fila de Execução Sequencial

| Ordem | Issue | Sprint | Dependência | Justificativa |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **#27 [AL-3]** | Sprint 3 | *Nenhuma* | Fundamental para o layout correto de qualquer componente. |
| **2** | **#28 [AL-7]** | Sprint 3 | *Nenhuma* | Fundamental para renderização de texto correta. |
| **3** | **#29 [TOK-1]** | Sprint 3 | *Nenhuma* | Extração de cores é independente, mas beneficia-se de estrutura estável. |
| **4** | **#30 [TOK-2]** | Sprint 3 | #28 [AL-7] | Precisa que o parser de tipografia (#28) esteja maduro para extrair tokens corretamente. |
| **5** | **#31 [VAR-1]** | Sprint 4 | *Nenhuma* | Define a "regra do jogo" para variantes. |
| **6** | **#32 [VAR-2]** | Sprint 4 | #31 [VAR-1] | Implementa a exportação baseada na regra definida em #31. |
| **7** | **#33 [VAR-3]** | Sprint 4 | #32 [VAR-2] | O plugin precisa receber o JSON multi-story gerado por #32. |
| **8** | **#35 [SEC-1]** | Sprint 5 | *Nenhuma* | Tarefa isolada de manutenção. |
| **9** | **#34 [PERF-1]** | Sprint 5 | *Todas acima* | O benchmark deve medir a performance do sistema "completo". |
| **10** | **#36 [DOC-4]** | Sprint 5 | *CI Config* | Finalização visual do repositório. |

---

## 🤖 Prompt Mestre de Execução

Para executar este plano, utilize o seguinte prompt com um Agente de IA (ou siga manualmente):

```text
Você é o Lead Developer do projeto figma-sync-engine.
Sua missão é zerar o backlog seguindo estritamente o algoritmo definido em `docs/MASTER_EXECUTION_PLAN.md`.

Estado Atual:
- Branch: main
- Issues Abertas: #27, #28, #29, #30, #31, #32, #33, #34, #35, #36.

INSTRUÇÕES DE LOOP:
1. Leia `docs/MASTER_EXECUTION_PLAN.md` para identificar a próxima issue pendente (Ordem 1 a 10).
2. Crie uma branch para a issue (ex: `feat/issue-27-al3`).
3. Implemente a solução técnica descrita na issue.
4. Crie/Execute testes para validar.
5. Faça commit e push.
6. Use `gh issue close <ID>` para fechar a issue.
7. Repita para a próxima issue da lista.

Comece pela Issue #27.
```

---

## 📝 Detalhes Técnicos por Issue

### 1. #27 [AL-3] Detecção de Direção
- **Arquivo**: `packages/autolayout-interpreter/src/index.ts`
- **Lógica**: Se `flex-direction` não for detectado, verificar `display: flex`. Se `flex-direction` for `row` ou `row-reverse` -> `HORIZONTAL`. Se `column` ou `column-reverse` -> `VERTICAL`. Fallback default: `HORIZONTAL`.

### 2. #28 [AL-7] Tipografia
- **Arquivos**: `packages/html-to-figma-core/src/index.ts`, `packages/figma-plugin-lite/src/code.ts`
- **Lógica**: Capturar `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`. No plugin, usar `figma.loadFontAsync` antes de setar caracteres.

### 3. #29 [TOK-1] Tokens de Cor
- **Arquivo**: `packages/html-to-figma-core/src/tokens.ts` (criar)
- **Lógica**: Varrer a árvore de nós. Se encontrar cor hex/rgb, adicionar a um Set/Map de cores únicas. Gerar objeto `tokens: { colors: [...] }` no JSON final.

### 4. #30 [TOK-2] Tokens de Tipografia
- **Arquivo**: `packages/html-to-figma-core/src/tokens.ts`
- **Lógica**: Similar a cores, mas agrupando combinações únicas de font-family/weight/size.

### 5. #31 [VAR-1] Convenção Args
- **Arquivo**: `README.md`, `packages/storybook-addon-export/src/export.ts`
- **Lógica**: Definir que args do Storybook viram propriedades do componente Figma. Ex: `variant="primary"` -> `Property: variant=primary`.

### 6. #32 [VAR-2] Export Múltiplo
- **Arquivo**: `packages/storybook-addon-export/src/panel.tsx`
- **Lógica**: UI para selecionar múltiplas stories (checkboxes). Loop de captura `captureStoryHTML` para cada story selecionada. Gerar JSON array ou objeto com múltiplas raízes.

### 7. #33 [VAR-3] Plugin ComponentSet
- **Arquivo**: `packages/figma-plugin-lite/src/code.ts`
- **Lógica**: Se o JSON tiver múltiplas raízes, criar um `figma.combineAsVariants(nodes, parent)`.

### 8. #35 [SEC-1] Auditoria
- **Comando**: `pnpm audit --prod`. Criar script em `package.json`.

### 9. #34 [PERF-1] Benchmark
- **Arquivo**: `scripts/benchmark.ts`
- **Lógica**: Script que roda a conversão de um HTML estático grande 100x e mede média/p95.

### 10. #36 [DOC-4] Badge CI
- **Arquivo**: `README.md`
- **Lógica**: Adicionar markdown do badge do GitHub Actions.
