# Pacote de Issues para concluir o projeto figma-sync-engine

> Referência principal: `docs/backlog.md` (20/11/2025) + `docs/PROGRESS_CURRENT.md`.
> Copie e cole cada bloco abaixo ao criar issues no GitHub. Ajuste labels, responsáveis e milestones conforme necessário.

Legenda sugerida de labels:
- `type:delivery`, `type:discovery`
- `priority:must`, `priority:should`, `priority:could`
- `epic:<nome>` (ex.: `epic:mvp-export`, `epic:auto-layout`, ...)

---

## EPIC 1 — MVP Export Storybook → Figma

### Issue: `[MVP-4] Auto Layout pós-processamento`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-3
- **Descrição:**
  - Como designer quero que propriedades flex do HTML convertido sejam refletidas no JSON Figma para manter o layout coerente.
- **Critérios de Aceite:**
  - [ ] Função de pós-processamento aplica `layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`, padding e spacing com base no CSS original
  - [ ] Testes cobrem exemplos horizontal/vertical com padding multi-valores
  - [ ] Documentação do comportamento adicionada em `docs/autolayout-engine.md`
- **Métricas/Notas:** base para MVP-5; garantir compatibilidade com `html-to-figma-core`.

### Issue: `[MVP-5] Exportação Clipboard e Download`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-4
- **Descrição:**
  - Como usuário do addon quero escolher copiar para a área de transferência ou baixar um `.figma.json` para importar no Figma.
- **Critérios de Aceite:**
  - [ ] Botão Exportar integra captura → conversão → pós-processamento → exportação
  - [ ] Opção "Clipboard" usa `navigator.clipboard.writeText` com fallback e exibe feedback
  - [ ] Opção "Download" gera arquivo `component-name.figma.json`
  - [ ] Estados visualizados no painel (idle/capturing/exporting/success/error) com mensagens úteis
  - [ ] Testes de unidade e smoke test manual no exemplo `examples/react-button`
- **Métricas/Notas:** logar tamanho final para futura telemetria (link com MVP-9).

### Issue: `[MVP-6] Plugin Figma importa JSON`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-5
- **Descrição:**
  - Como designer quero colar ou carregar o JSON exportado para gerar automaticamente um frame no Figma.
- **Critérios de Aceite:**
  - [ ] UI do plugin permite upload de arquivo ou colagem de JSON
  - [ ] Backend (`code.ts`) cria frame raiz, aplica Auto Layout e estiliza nodes
  - [ ] Suporte a PLACEHOLDER de imagens
  - [ ] Logs amigáveis no console do plugin
  - [ ] Build via `pnpm build --filter figma-plugin-lite` ok
- **Métricas/Notas:** preparar para futuras variantes (VAR-1+).

### Issue: `[MVP-7] Testes E2E básicos`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-6
- **Descrição:**
  - Como equipe quero garantir o fluxo completo Storybook → JSON → Figma via testes automatizados.
- **Critérios de Aceite:**
  - [ ] Script E2E cobre história Button (captura até import no Figma plugin em modo headless/mocked)
  - [ ] Validação de estrutura (nodes, Auto Layout, estilos principais)
  - [ ] Execução documentada (`pnpm test:e2e` ou similar)
  - [ ] Resultados registrados em `docs/TEST_E2E_FLOW.ts` ou README
- **Métricas/Notas:** objetivo futuro MVP-7 = cobertura E2E para ao menos 1 componente.

### Issue: `[MVP-8] Documentar formato Figma JSON`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-3
- **Descrição:**
  - Como contribuidor quero referência clara dos campos gerados no JSON para poder extender o motor.
- **Critérios de Aceite:**
  - [ ] Atualizar `docs/figma-json-format.md` com estrutura, exemplos e campos obrigatórios/opcionais
  - [ ] Adicionar tabelas para nodes FRAME, TEXT, VECTOR, etc.
  - [ ] Explicar convenções (ids, nomes, fills, autoLayout)
- **Métricas/Notas:** manter sincronizado com alterações de MVP-4/5.

### Issue: `[MVP-9] Logger de exportação`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP-5
- **Descrição:**
  - Como time quero registrar storyId, tamanho de JSON e duração para facilitar diagnósticos.
- **Critérios de Aceite:**
  - [ ] Logger estruturado (JSON) no addon com níveis `info`/`error`
  - [ ] Eventos: início da exportação, sucesso, falha, métricas básicas
  - [ ] Configurável via env para desativar logs verbosos
- **Métricas/Notas:** integrar com `OBS-1` posteriormente.

### Issue: `[MVP-10] Kill-switch do addon`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP-1
- **Descrição:**
  - Como responsável de produto quero desativar rapidamente o botão de exportação em caso de incidente.
- **Critérios de Aceite:**
  - [ ] Variável de ambiente ou flag em runtime que esconde/desabilita o painel
  - [ ] Mensagem clara ao usuário quando desativado
  - [ ] Testes cobrindo estado desabilitado
- **Métricas/Notas:** relacionar com `SEC-2` (kill-switch remoto) futuramente.

### Issue: `[MVP-11] Build do addon sem erros`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** Storybook base
- **Descrição:**
  - Garantir que o addon compila com Storybook + Vite e tipagens React atualizadas.
- **Critérios de Aceite:**
  - [ ] `pnpm build --filter storybook-addon-export` sem warnings
  - [ ] Tipos `@storybook/addons` atualizados
- **Notas:** Marcar como done se já entregue.

### Issue: `[MVP-12] Build do plugin Figma`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** Setup Vite
- **Descrição:**
  - Ajustar bundling de `code.ts` e `ui.tsx` garantindo saída em `dist/`.
- **Critérios de Aceite:**
  - [ ] `pnpm build --filter figma-plugin-lite` gera artefatos compatíveis com Figma
- **Notas:** Marcar como done se já entregue.

---

## EPIC 2 — Auto Layout Engine Avançado

### Issue: `[AL-1] Parser padding/margin robusto`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-3
- **Descrição:**
  - Como dev quero interpretar shorthand CSS (1,2,3,4 valores) para aplicar padding/margin corretos no Figma.
- **Critérios de Aceite:**
  - [ ] Parser suporta px, rem, %, fallback
  - [ ] Testes para valores mistos e negativos (ajustar para 0)
  - [ ] Documentado em `docs/autolayout-engine.md`

### Issue: `[AL-2] Align-items e justify-content`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** AL-1
- **Descrição:**
  - Mapear propriedades de alinhamento para eixos Figma.
- **Critérios de Aceite:**
  - [ ] Cobertura para `flex-start`, `center`, `flex-end`, `space-between` etc.
  - [ ] Testes validando combinações comum (row/column)

### Issue: `[AL-3] Detecção de direção com fallback`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** AL-1
- **Descrição:**
  - Determinar `layoutMode` baseado em `flex-direction` e fornecer fallback HORIZONTAL.
- **Critérios de Aceite:**
  - [ ] `row`, `row-reverse`, `column`, `column-reverse` suportados
  - [ ] Testes com estilos ausentes

### Issue: `[AL-4] Gap composto multi-eixo`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** AL-2
- **Descrição:**
  - Investigar suporte a `row-gap` e `column-gap` separados no Figma.
- **Critérios de Aceite:**
  - [ ] POC documentada comparando HTML vs Figma
  - [ ] Recomendações e próximos passos

### Issue: `[AL-5] Flex-wrap em múltiplos frames`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** AL-2
- **Descrição:**
  - Explorar estratégia para dividir nodes em múltiplos frames quando `flex-wrap` está ativo.
- **Critérios de Aceite:**
  - [ ] POC com componente simples (chips)
  - [ ] Plano de produção/rollback

### Issue: `[AL-6] Relatório divergências CSS vs Figma`
- **Tipo:** Discovery | **Prioridade:** Should | **Dependências:** AL-2
- **Descrição:**
  - Gerar relatório dos atributos CSS não suportados ou aproximados.
- **Critérios de Aceite:**
  - [ ] Script lista propriedades não mapeadas por componente
  - [ ] Documento com recomendações

### Issue: `[AL-7] Mapeamento tipografia`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-3
- **Descrição:**
  - Garantir nodes TEXT refletem font-family, weight, line-height do HTML.
- **Critérios de Aceite:**
  - [ ] Conversão para propriedades Figma (`fontName`, `fontSize`, `lineHeight`)
  - [ ] Testes cobrindo fallback fonts

---

## EPIC 3 — Variantes & Componentes

### Issue: `[VAR-1] Convenção args → variantProperties`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP completo
- **Descrição:**
  - Definir padrão para mapear args/controls do Storybook em `variantProperties` no Figma.
- **Critérios de Aceite:**
  - [ ] Documento com naming convention e exemplos
  - [ ] Adaptação do pipeline para expor metadata de variants

### Issue: `[VAR-2] Exportar múltiplas stories`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** VAR-1
- **Descrição:**
  - Permitir seleção de várias stories e gerar pacote JSON único.
- **Critérios de Aceite:**
  - [ ] UI com multiselect ou checklist
  - [ ] Arquivo final contém `components[]`

### Issue: `[VAR-3] Plugin cria ComponentSet`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** VAR-2, MVP-6
- **Descrição:**
  - Transformar JSON com múltiplas variants em ComponentSet no Figma.
- **Critérios de Aceite:**
  - [ ] Cada variant vira component, agregados em set com propriedades
  - [ ] Auto Layout preservado

### Issue: `[VAR-4] Detectar estados via data-state`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** VAR-1
- **Descrição:**
  - Investigar uso de `data-state`/`aria-*` para inferir estados (hover/focus).
- **Critérios de Aceite:**
  - [ ] POC documentada com ao menos 2 estados

### Issue: `[VAR-5] Snapshot diff visual`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** VAR-2
- **Descrição:**
  - Explorar geração de snapshots para comparar variants.
- **Critérios de Aceite:**
  - [ ] Protótipo e análise de viabilidade

---

## EPIC 4 — Performance & Escalabilidade

### Issue: `[PERF-1] Benchmark de conversão`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-3
- **Descrição:**
  - Medir tempo médio de captura/conversão para diferentes tamanhos de componente.
- **Critérios de Aceite:**
  - [ ] Script benchmark com dataset sintético
  - [ ] Relatório base publicado

### Issue: `[PERF-2] Cache por hash HTML`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** PERF-1
- **Descrição:**
  - Reutilizar conversão quando o HTML não mudou.
- **Critérios de Aceite:**
  - [ ] Hash estável (ex.: SHA-1 do HTML sanitizado)
  - [ ] Config flag para ativar/desativar

### Issue: `[PERF-3] Profiling >500 nodes`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** PERF-1
- **Descrição:**
  - Identificar gargalos em componentes grandes.
- **Critérios de Aceite:**
  - [ ] Relatório com flamegraphs ou métricas

### Issue: `[PERF-4] Streaming parcial`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** PERF-3
- **Descrição:**
  - Investigar conversão em blocos para HTML extensos.
- **Critérios de Aceite:**
  - [ ] POC + plano de rollout/rollback

---

## EPIC 5 — Observabilidade & Guardrails

### Issue: `[OBS-1] Logger estruturado`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** MVP-5
- **Descrição:**
  - Introduzir logger consistente com nível/ evento/ payload.
- **Critérios de Aceite:**
  - [ ] Wrapper de log único reutilizado em addon e plugin
  - [ ] Suporte a masking de dados sensíveis

### Issue: `[OBS-2] Sanitização de PII`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** OBS-1
- **Descrição:**
  - Garantir que exportação não inclua atributos sensíveis.
- **Critérios de Aceite:**
  - [ ] Lista auditável de atributos removidos
  - [ ] Testes cobrindo sanitização

### Issue: `[OBS-3] TTL de feature flags`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP-10
- **Descrição:**
  - Adicionar expiracão automática para flags (incluindo kill-switch).
- **Critérios de Aceite:**
  - [ ] TTL configurável e logado no expirar

### Issue: `[OBS-4] Dashboard CLI`
- **Tipo:** Discovery | **Prioridade:** Could | **Dependências:** OBS-1
- **Descrição:**
  - Script CLI que resume métricas (export count, tempos, erros).
- **Critérios de Aceite:**
  - [ ] Protótipo + documentação

---

## EPIC 6 — Design Tokens

### Issue: `[TOK-1] Extração de cores para tokens`
- **Tipo:** Discovery | **Prioridade:** Should | **Dependências:** MVP-3
- **Descrição:**
  - Identificar cores inline e mapear para tokens reutilizáveis.
- **Critérios de Aceite:**
  - [ ] POC com ≥80% de cobertura em componentes analisados

### Issue: `[TOK-2] Tipografia como tokens`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** TOK-1
- **Descrição:**
  - Normalizar font families/weights para tokens.
- **Critérios de Aceite:**
  - [ ] Arquivo de tokens exportado com tipografia

### Issue: `[TOK-3] Arquivo `tokens.json``
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** TOK-1
- **Descrição:**
  - Gerar arquivo paralelo contendo tokens usados no componente.
- **Critérios de Aceite:**
  - [ ] Exporta automaticamente junto ao `.figma.json`

### Issue: `[TOK-4] Plugin aplica tokens`
- **Tipo:** Delivery | **Prioridade:** Could | **Dependências:** TOK-3, MVP-6
- **Descrição:**
  - Se tokens existirem, plugin aplica estilos correspondentes no Figma.
- **Critérios de Aceite:**
  - [ ] Matching por nome; fallback seguro

---

## EPIC 7 — Segurança & Compliance

### Issue: `[SEC-1] Auditoria de dependências`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** none
- **Descrição:**
  - Rodar `pnpm audit`/`npm audit` (ou `pnpm audit --prod`) e registrar relatório.
- **Critérios de Aceite:**
  - [ ] Sem vulnerabilidades críticas ou plano de mitigação documentado

### Issue: `[SEC-2] Kill-switch remoto`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP-10
- **Descrição:**
  - Permitir desligar export via remote config ou server flag.
- **Critérios de Aceite:**
  - [ ] Fetch seguro com timeout e cache local

### Issue: `[SEC-3] Política de versionamento`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** SEC-1
- **Descrição:**
  - Documentar política de release sem breaking (semver, changelog, etc.).
- **Critérios de Aceite:**
  - [ ] Documento público em `docs/`

---

## EPIC 8 — Comunidade & Documentação

### Issue: `[DOC-1] Guia de contribuição`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** none
- **Descrição:**
  - Manter `CONTRIBUTING.md` atualizado (caso já esteja pronto, apenas validar).

### Issue: `[DOC-2] Changelog automático`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** DOC-1
- **Descrição:**
  - Adicionar script de release (ex.: Changesets) e badge no README.
- **Critérios de Aceite:**
  - [ ] `pnpm changeset` (ou similar) configurado
  - [ ] README explica fluxo

### Issue: `[DOC-3] Exemplos adicionais`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP-5
- **Descrição:**
  - Incluir Input, Card e Navbar no diretório `examples/` com stories/documentação.
- **Critérios de Aceite:**
  - [ ] Storybook roda com os 3 novos componentes

### Issue: `[DOC-4] Badge de status CI`
- **Tipo:** Delivery | **Prioridade:** Must | **Dependências:** Pipeline CI
- **Descrição:**
  - Mostrar status do workflow (GitHub Actions) no README.

### Issue: `[DOC-5] FAQ (limitações e roadmap)`
- **Tipo:** Delivery | **Prioridade:** Should | **Dependências:** MVP baseline
- **Descrição:**
  - Criar seção FAQ cobrindo limitações conhecidas, roadmap e troubleshooting.

---

> Após criar todas as issues, atualize `docs/backlog.md` e `docs/PROGRESS_CURRENT.md` com os links correspondentes e mantenha o Kanban sincronizado.
