# Backlog do Projeto – figma-sync-engine

> Última atualização: 21/11/2025
> Objetivo macro: Reduzir em até 80% o tempo de documentação de componentes no Figma via fluxo Storybook → Figma.

## Estrutura do Backlog
- Epics
- User Stories (formato: Como [persona] quero [ação] para [benefício])
- Critérios de Aceite
- Prioridade (MoSCoW) + Indicador RICE (placeholder)
- Dependências
- Tipo (Delivery / Discovery)
- Métricas alvo (quando aplicável)

---
## EPIC 1: MVP Export Storybook → Figma
Status 21/11/2025 (atualizado): `pnpm install` e `pnpm test` acusaram dependência inexistente (`@storybook/addons@^8.6.14`) e execução em modo watch; MVP-1, MVP-2, MVP-4, MVP-6, MVP-8, MVP-11 e MVP-12 estão válidos, porém MVP-3 permanece parcial e o pipeline de exportação (MVP-3 → MVP-5) segue como prioridade.
Foco em fluxo mínimo funcional.

### User Stories
1. Como designer quero exportar a história atual para Figma para acelerar documentação visual.
2. Como dev quero gerar JSON consistente para reutilizar em plugin Figma.

### Features / Tasks
| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| MVP-1 | Botão “Exportar para Figma” no painel do addon | Delivery | Botão visível e acionável | Must | Storybook-addon base |
| MVP-2 | Captura segura do HTML da história ativa | Delivery | HTML bruto acessível | Must | MVP-1 |
| MVP-3 | Conversão via `html-to-figma-core` | Delivery | JSON inicial gerado | Must | MVP-2 |
| MVP-4 | Pós-processar Auto Layout (flex → layoutMode, gap, padding) | Delivery | Campos populados | Must | MVP-3, AL-1 |
| MVP-5 | Exportar `.figma.json` (clipboard e download) | Delivery | Arquivo salvo/copiar | Must | MVP-4 |
| MVP-6 | Plugin Figma importa JSON e cria frame | Delivery | Frame escrito no canvas | Must | MVP-5 |
| MVP-7 | Testes Vitest core + snapshot JSON exemplo | Delivery | Todos testes passam | Must | MVP-3 |
| MVP-8 | Documentar formato em `figma-json-format.md` | Delivery | Campos principais descritos | Must | MVP-3 |
| MVP-9 | Log simples de export (storyId, tamanho JSON) | Delivery | Log estruturado sem PII | Should | MVP-5 |
| MVP-10 | Kill-switch de addon (flag env) | Delivery | Flag desativa botão | Should | MVP-1 |
| MVP-11 | Ajustar typings/build do addon Storybook | Delivery | Build do addon sem erros de React | Must | MVP-1 |
| MVP-12 | Ajustar typings/build do plugin Figma | Delivery | Build do plugin compila e gera dist | Must | MVP-6 |

#### Snapshot de status (21/11/2025)
- ✅ **MVP-1** – Painel registrado em `storybook-addon-export/src/register.ts` com botão funcional.
- ✅ **MVP-2** – `captureStoryHTML` entregue com sanitização e testes.
- 🟡 **MVP-3** – `convertHtmlToFigma` usa `htmlToFigma`, porém falta metadata/schema final e o pacote está bloqueado pela dependência `@storybook/addons@8.6.x` inexistente (**issue #13**).
- ✅ **MVP-4** – `applyAutoLayout` cobre gap/padding básicos (aguarda AL-2 para alinhamentos completos).
- ⛔ **MVP-5** – Exportação para clipboard/download ainda não implementada no painel (**issue #15**).
- ✅ **MVP-6** – Plugin Lite compila (`pnpm build --filter @figma-sync-engine/figma-plugin-lite`) e cria frames/textos básicos.
- 🟡 **MVP-7** – Testes Vitest ativos para módulos core, porém ausência de snapshots/E2E mantém item em progresso (**issue #14**).
- ✅ **MVP-8** – `docs/figma-json-format.md` contém estrutura mínima (precisa ampliar quando variantes chegarem).
- ⛔ **MVP-9** – Logger de export não iniciado (**issue #17**).
- ⛔ **MVP-10** – Flag/kill-switch não iniciada.
- ✅ **MVP-11** – Build do addon passa (`pnpm build --filter @figma-sync-engine/storybook-addon-export`).
- ✅ **MVP-12** – Build do plugin passa (`pnpm build --filter @figma-sync-engine/figma-plugin-lite`).

---
## EPIC 2: Auto Layout Engine Avançado
Expandir heurísticas CSS → Figma.

### User Stories
1. Como designer quero que espaçamentos e alinhamentos reflitam flexbox real.
2. Como dev quero heurísticas transparentes para manutenção.

### Features / Tasks
| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| AL-1 | Parser padding/margin robusto | Delivery | Cobertura casos 1/2/3/4 valores | Must | MVP-3 |
| AL-2 | Suporte a `align-items` e `justify-content` | Delivery | Mapeados para eixo correto | Must | AL-1 |
| AL-3 | Detecção de direção com fallback | Delivery | Default HORIZONTAL | Should | AL-1 |
| AL-4 | Gap composto (row/column futuro) | Discovery | POC gap multi-eixo | Could | AL-2 |
| AL-5 | Wrap flex → múltiplos frames | Discovery | Prova de conceito | Could | AL-2 |
| AL-6 | Relatório divergências CSS vs Figma | Discovery | Lista de campos não mapeados | Should | AL-2 |
| AL-7 | Mapeamento de font, weight, line-height | Delivery | Nodes TEXT refletindo estilo | Must | MVP-3 |

#### Snapshot de status (21/11/2025)
- ✅ **AL-1** – Parser entregue com testes cobrindo 1/2/3/4 valores em `autolayout-interpreter`.
- ⛔ **AL-2** – Não iniciado; dependência para alinhamentos ainda aberta (**issue #16**).
- ⛔ **AL-3** – Fallback de direção pendente.
- ⛔ **AL-4** – Gap multi-eixo aguardando discovery.
- ⛔ **AL-5** – POC flex-wrap não iniciada.
- ⛔ **AL-6** – Relatório de divergências sem owner.
- ⛔ **AL-7** – Mapeamento de tipografia não iniciado.

Métrica alvo (Epic): ≥90% de fidelidade visual para componentes flex simples.

---
## EPIC 3: Variantes & Componentes
Suporte a geração de Component + VariantSets.

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| VAR-1 | Definir convenção de args → variantProperties | Delivery | Documentado em README | Must | MVP completo |
| VAR-2 | Export múltiplas stories selecionadas | Delivery | Seleção + pacote JSON | Should | VAR-1 |
| VAR-3 | Plugin cria ComponentSet | Delivery | Variants agrupadas | Must | VAR-2 |
| VAR-4 | Detectar estados via `data-state` | Discovery | Demonstra 2+ estados | Could | VAR-1 |
| VAR-5 | Diferencial de diffs visual (snapshot) | Discovery | Snapshot comparativo | Could | VAR-2 |

#### Snapshot de status (21/11/2025)
- ⛔ **VAR-1** – Convenção args → variants não definida.
- ⛔ **VAR-2** – Seleção múltipla não implementada.
- ⛔ **VAR-3** – Plugin ainda não cria ComponentSet.
- ⛔ **VAR-4** – Descoberta de estados pendente.
- ⛔ **VAR-5** – Sem POC de snapshot diff.

Métrica alvo: Reduzir tempo de criação de variantes Figma em ≥70%.

---
## EPIC 4: Performance & Escalabilidade

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| PERF-1 | Benchmark conversão (tempo médio) | Delivery | Script & relatório base | Must | MVP-3 |
| PERF-2 | Cache de conversão por hash HTML | Delivery | Cache hit registrado | Should | PERF-1 |
| PERF-3 | Profiling nodes > 500 | Discovery | Relatório gargalos | Could | PERF-1 |
| PERF-4 | Streaming parcial (HTML grande) | Discovery | POC streaming | Could | PERF-3 |

#### Snapshot de status (21/11/2025)
- ⛔ **PERF-1** – Benchmark não iniciado (aguarda pipeline estável).
- ⛔ **PERF-2** – Cache por hash bloqueado por PERF-1.
- ⛔ **PERF-3** – Profiling sem baseline.
- ⛔ **PERF-4** – Streaming ainda em ideação.

Objetivo: Export de componente médio (<300 nodes) < 1.5s.

---
## EPIC 5: Observabilidade & Guardrails

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| OBS-1 | Logger estruturado (level, event, size) | Delivery | JSON logs console | Must | MVP-5 |
| OBS-2 | Sanitização de PII (remoção atributos sensíveis) | Delivery | Lista auditável | Must | OBS-1 |
| OBS-3 | TTL de feature flags | Delivery | Expiração automática | Should | MVP-10 |
| OBS-4 | Dashboard simples (script CLI) | Discovery | Sumário métricas | Could | OBS-1 |

#### Snapshot de status (21/11/2025)
- ⛔ **OBS-1** – Logger estruturado aguardando MVP-5.
- ⛔ **OBS-2** – Sanitização adicional ainda não planejada.
- ⛔ **OBS-3** – TTL de flags sem implementação.
- ⛔ **OBS-4** – Dashboard CLI não iniciado.

---
## EPIC 6: Design Tokens

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| TOK-1 | Extração de cores inline → tokens | Discovery | Mapeia 80% cores únicas | Should | MVP-3 |
| TOK-2 | Tipografia → tokens (font families) | Delivery | Campos normalizados | Must | TOK-1 |
| TOK-3 | Export tokens sidecar file | Delivery | `tokens.json` gerado | Should | TOK-1 |
| TOK-4 | Plugin aplica tokens se existirem | Delivery | Matching por nome | Could | TOK-3 |

#### Snapshot de status (21/11/2025)
- ⛔ **TOK-1** – Extração de cores ainda em discovery.
- ⛔ **TOK-2** – Tokens tipográficos dependem de TOK-1.
- ⛔ **TOK-3** – Arquivo `tokens.json` não iniciado.
- ⛔ **TOK-4** – Plugin ainda não interpreta tokens.

---
## EPIC 7: Segurança & Compliance

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| SEC-1 | Revisão de dependências (audit script) | Delivery | Relatório sem vulnerabilidades críticas | Must | MVP-3 |
| SEC-2 | Kill-switch remoto (env var) | Delivery | Desativa export | Should | MVP-10 |
| SEC-3 | Política de versionamento sem breaking | Delivery | Documentada | Should | SEC-1 |

#### Snapshot de status (21/11/2025)
- ⛔ **SEC-1** – Auditoria pendente; `pnpm audit` não executou devido ao erro anterior na pipeline.
- ⛔ **SEC-2** – Kill-switch remoto não planejado.
- ⛔ **SEC-3** – Política de versionamento sem owner.

---
## EPIC 8: Comunidade & Documentação
Status 21/11/2025: DOC-1 entregue (CONTRIBUTING.md publicado); DOC-4 (badge CI) e DOC-5 (FAQ) continuam em aberto aguardando definição do pipeline.

| ID | Item | Tipo | Aceite | Prioridade | Dependências |
|----|------|------|--------|------------|--------------|
| DOC-1 | Guia Contribuição | Delivery | CONTRIBUTING.md | Must | MVP |
| DOC-2 | Changelog automático | Delivery | Script release | Should | DOC-1 |
| DOC-3 | Exemplos adicionais (Input, Card, Navbar) | Delivery | 3 novos exemplos | Should | MVP |
| DOC-4 | Badge de status CI | Delivery | README atualizado | Must | CI |
| DOC-5 | FAQ (limitações e roadmap) | Delivery | Sessão README | Should | MVP |

#### Snapshot de status (21/11/2025)
- ✅ **DOC-1** – CONTRIBUTING.md publicado.
- ⛔ **DOC-2** – Fluxo de changelog não configurado.
- ⛔ **DOC-3** – Exemplos adicionais não criados.
- ⛔ **DOC-4** – Badge CI aguardando workflow.
- ⛔ **DOC-5** – FAQ não iniciado.

---
## Roteiro Temporal (Proposta)
- Semana 1-2: EPIC 1 (MVP completo)
- Semana 3: AL-2, AL-7, PERF-1
- Semana 4: VAR-1, VAR-2, OBS-1
- Semana 5+: Descobertas (TOK-1, VAR-4, PERF-3) e refinamentos

---
## Métricas Globais
| Métrica | Definição | Base | Meta |
|---------|-----------|------|------|
| Tempo documentação Figma | Média minutos para registrar componente | 30 min (estim.) | ≤ 6 min |
| Fidelidade layout | % correspondência visual heurística | N/A | ≥ 90% |
| Tempo export médio | ms (componentes <300 nodes) | N/A | < 1500 ms |
| Adoção variantes | % componentes com variants mapeadas | N/A | ≥ 60% |

---
## Riscos & Mitigações
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Heurísticas incorretas de layout | Baixa confiança designer | Logs + diff visual |
| Performance em componentes grandes | Lentidão de fluxo | Benchmark + cache |
| Complexidade de variantes | Curva de aprendizado | Documentação e convenções |
| Tokens inconsistentes | Erros de design system | Validação por snapshot |
| Dependência `@storybook/addons@^8.6.14` inexistente | Instalação falha bloqueando novos devs | Fixar dependência em `^7.6.17` ou aguardar release oficial 8.6, atualizar lockfile e rerodar `pnpm install` |
| `pnpm test` em modo watch (Vitest DEV) | Pipeline local não conclui/retorna código ≠0 | Alterar script para `vitest run --passWithNoTests` (ou usar `CI=1`) garantindo saída determinística |

---
## Critérios de Saída do Discovery (Definição de Pronto)
- Hipótese registrada (docs / PR)
- Métrica definida + baseline
- Teste canário sem regressão
- Flag removida ou promovida
- Decisão documentada em CHANGELOG / ADR

---
## Próximas Ações Imediatas
1. **Corrigir dependência `@storybook/addons`** – alinhar `package.json` para `^7.6.17`, atualizar lockfile e reexecutar `pnpm install` para liberar onboarding (**issue #13**).
2. **Ajustar scripts de teste** – usar `vitest run`/`pnpm test --runInBand` para evitar modo watch e permitir CI local (**issue #14**).
3. **Fechar MVP-3 → MVP-5** – consolidar pipeline captura → conversão → Auto Layout → export (clipboard/download) e adicionar testes de integração (**issue #15**).
4. **Implementar AL-2** – mapear `align-items`/`justify-content` e atualizar documentação (**issue #16**).
5. **Planejar OBS-1 + MVP-9** – definir logger estruturado já alinhado ao kill-switch futuro (**issue #17**).

---
## Notação & Convenções
- IDs estáveis para referência em issues e PRs.
- MoSCoW: Must / Should / Could / Won't (atual).
- RICE será preenchido após coleta de Reach & Effort.

---
## Kanban Atualizado (21/11/2025 - 11:45)
| Backlog | Em Progresso | Em Review | Concluído |
|---------|--------------|-----------|-----------|
| MVP-5 (#15), MVP-9 (#17), MVP-10, AL-2 (#16), AL-3, AL-4, AL-5, AL-6, AL-7, VAR-1, VAR-2, VAR-3, VAR-4, VAR-5, PERF-1, PERF-2, PERF-3, PERF-4, OBS-1 (#17), OBS-2, OBS-3, OBS-4, TOK-1, TOK-2, TOK-3, TOK-4, SEC-1, SEC-2, SEC-3, DOC-2, DOC-3, DOC-4, DOC-5 | MVP-3 (#13), MVP-7 (#14) | – | DOC-1, MVP-1, MVP-2, MVP-4, MVP-6, MVP-8, MVP-11, MVP-12, AL-1 |

---
## Anotações Finais
Este documento é vivo. Atualize em cada planejamento semanal. Use IDs nas mensagens de commit (ex: `feat(autolayout): implement AL-2`).
