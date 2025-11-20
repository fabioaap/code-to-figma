# Backlog Issues Tracker

Este arquivo rastreia as issues do GitHub criadas a partir do backlog.

> **Status:** Aguardando criação das issues via script  
> **Última atualização:** 2025-11-20  
> **Repositório:** [fabioaap/code-to-figma](https://github.com/fabioaap/code-to-figma)

---

## Como usar este documento

1. Execute o script de criação de issues: `node scripts/create-github-issues.js`
2. Este arquivo será automaticamente atualizado com os links das issues criadas
3. Use este arquivo como referência rápida para o estado do backlog

---

## Status Kanban

| Backlog | Em Progresso | Em Review | Concluído |
|---------|--------------|-----------|-----------|
| Todas as issues abaixo | – | – | – |

---

## EPIC 1: MVP Export Storybook → Figma

*Foco em fluxo mínimo funcional*

**Issues:**
- [ ] MVP-1: Botão 'Exportar para Figma' no painel do addon
- [ ] MVP-2: Captura segura do HTML da história ativa
- [ ] MVP-3: Conversão via html-to-figma-core
- [ ] MVP-4: Pós-processar Auto Layout (flex → layoutMode, gap, padding)
- [ ] MVP-5: Exportar .figma.json (clipboard e download)
- [ ] MVP-6: Plugin Figma importa JSON e cria frame
- [ ] MVP-7: Testes Vitest core + snapshot JSON exemplo
- [ ] MVP-8: Documentar formato em figma-json-format.md
- [ ] MVP-9: Log simples de export (storyId, tamanho JSON)
- [ ] MVP-10: Kill-switch de addon (flag env)

---

## EPIC 2: Auto Layout Engine Avançado

*Expandir heurísticas CSS → Figma*

**Métrica alvo:** ≥90% de fidelidade visual para componentes flex simples

**Issues:**
- [ ] AL-1: Parser padding/margin robusto
- [ ] AL-2: Suporte a align-items e justify-content
- [ ] AL-3: Detecção de direção com fallback
- [ ] AL-4: Gap composto (row/column futuro) - Discovery
- [ ] AL-5: Wrap flex → múltiplos frames - Discovery
- [ ] AL-6: Relatório divergências CSS vs Figma - Discovery
- [ ] AL-7: Mapeamento de font, weight, line-height

---

## EPIC 3: Variantes & Componentes

*Suporte a geração de Component + VariantSets*

**Métrica alvo:** Reduzir tempo de criação de variantes Figma em ≥70%

**Issues:**
- [ ] VAR-1: Definir convenção de args → variantProperties
- [ ] VAR-2: Export múltiplas stories selecionadas
- [ ] VAR-3: Plugin cria ComponentSet
- [ ] VAR-4: Detectar estados via data-state - Discovery
- [ ] VAR-5: Diferencial de diffs visual (snapshot) - Discovery

---

## EPIC 4: Performance & Escalabilidade

*Otimização de performance e escalabilidade*

**Objetivo:** Export de componente médio (<300 nodes) < 1.5s

**Issues:**
- [ ] PERF-1: Benchmark conversão (tempo médio)
- [ ] PERF-2: Cache de conversão por hash HTML
- [ ] PERF-3: Profiling nodes > 500 - Discovery
- [ ] PERF-4: Streaming parcial (HTML grande) - Discovery

---

## EPIC 5: Observabilidade & Guardrails

*Logging, monitoramento e mecanismos de segurança*

**Issues:**
- [ ] OBS-1: Logger estruturado (level, event, size)
- [ ] OBS-2: Sanitização de PII (remoção atributos sensíveis)
- [ ] OBS-3: TTL de feature flags
- [ ] OBS-4: Dashboard simples (script CLI) - Discovery

---

## EPIC 6: Design Tokens

*Extração e aplicação de design tokens*

**Issues:**
- [ ] TOK-1: Extração de cores inline → tokens - Discovery
- [ ] TOK-2: Tipografia → tokens (font families)
- [ ] TOK-3: Export tokens sidecar file
- [ ] TOK-4: Plugin aplica tokens se existirem

---

## EPIC 7: Segurança & Compliance

*Segurança, auditoria e conformidade*

**Issues:**
- [ ] SEC-1: Revisão de dependências (audit script)
- [ ] SEC-2: Kill-switch remoto (env var)
- [ ] SEC-3: Política de versionamento sem breaking

---

## EPIC 8: Comunidade & Documentação

*Documentação, exemplos e suporte à comunidade*

**Issues:**
- [ ] DOC-1: Guia Contribuição (CONTRIBUTING.md)
- [ ] DOC-2: Changelog automático
- [ ] DOC-3: Exemplos adicionais (Input, Card, Navbar)
- [ ] DOC-4: Badge de status CI
- [ ] DOC-5: FAQ (limitações e roadmap)

---

## Resumo

**Total de issues:** 42

Por épico:
- EPIC 1 (MVP): 10 issues
- EPIC 2 (Auto Layout): 7 issues
- EPIC 3 (Variantes): 5 issues
- EPIC 4 (Performance): 4 issues
- EPIC 5 (Observabilidade): 4 issues
- EPIC 6 (Design Tokens): 4 issues
- EPIC 7 (Segurança): 3 issues
- EPIC 8 (Documentação): 5 issues

---

## Próximos Passos

1. ✅ Estruturar backlog em JSON
2. ✅ Criar script de automação
3. ⏳ Executar script para criar issues no GitHub
4. ⏳ Atualizar documento de backlog com links das issues
5. ⏳ Configurar project board no GitHub (opcional)
6. ⏳ Começar desenvolvimento seguindo prioridades MoSCoW

---

## Referências

- [Backlog Original](./backlog.md) - Documento de backlog completo
- [Backlog Issues JSON](./backlog-issues.json) - Estrutura de dados das issues
- [Script de Criação](../../scripts/create-github-issues.js) - Automação de criação de issues
- [GitHub Issues](https://github.com/fabioaap/code-to-figma/issues) - Issues no repositório
