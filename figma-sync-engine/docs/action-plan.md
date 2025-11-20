# Plano de Ação – figma-sync-engine
> Atualizado em: 20/11/2025

## Objetivo
Implementar MVP funcional do fluxo Storybook → Figma em 2 semanas, com fundação sólida para evolução.

---

## FASE 1: Fundação do MVP (Semana 1 - Dias 1-5)
**Meta**: Fluxo end-to-end básico funcionando.

### Dia 1: Setup e Infraestrutura
- [ ] **Task 1.1**: Instalar dependências e validar build
  - Comando: `pnpm install && pnpm build`
  - Validar: todos pacotes compilam sem erro
  - Responsável: Dev
  - Tempo estimado: 1h

- [ ] **Task 1.2**: Configurar tsconfig para autolayout-interpreter
  - Adicionar `compilerOptions.declaration: true`
  - Validar tipos exportados
  - Tempo estimado: 30min

- [ ] **Task 1.3**: Badge CI no README (DOC-4)
  - Adicionar badge do GitHub Actions
  - Testar push para validar workflow
  - Tempo estimado: 30min

### Dia 2: Core de Conversão (MVP-2, MVP-3)
- [ ] **Task 2.1**: Implementar captura HTML (MVP-2)
  - Usar `@storybook/preview-api` para acessar rendered DOM
  - Criar função `captureStoryHTML(storyId: string): Promise<string>`
  - Testes: validar HTML retornado para Button example
  - ID Backlog: MVP-2
  - Tempo estimado: 3h

- [ ] **Task 2.2**: Integrar html-to-figma-core (MVP-3)
  - Completar função `convertHtmlToFigma` real
  - Usar `htmlToFigma()` do @builder.io
  - Retornar JSON inicial
  - Testes: snapshot do JSON gerado
  - ID Backlog: MVP-3
  - Tempo estimado: 2h

- [ ] **Task 2.3**: Teste de integração end-to-end
  - HTML Button → JSON Figma
  - Validar estrutura básica
  - Tempo estimado: 1h

### Dia 3: Auto Layout Engine (MVP-4, AL-1, AL-2)
- [ ] **Task 3.1**: Refinar parser padding (AL-1)
  - Adicionar testes para todos casos (1/2/3/4 valores)
  - Cobrir edge cases (px, rem, em)
  - ID Backlog: AL-1
  - Tempo estimado: 2h

- [ ] **Task 3.2**: Implementar align-items e justify-content (AL-2)
  - Mapear para `primaryAxisAlignItems` e `counterAxisAlignItems`
  - Considerar direção (row/column)
  - Testes para cada combinação
  - ID Backlog: AL-2
  - Tempo estimado: 3h

- [ ] **Task 3.3**: Integrar AL no pipeline MVP-4
  - Chamar `applyAutoLayout` após conversão base
  - Validar com exemplo Button
  - ID Backlog: MVP-4
  - Tempo estimado: 1h

### Dia 4: Addon Storybook (MVP-1, MVP-5)
- [ ] **Task 4.1**: Registrar painel no Storybook (MVP-1 refinamento)
  - Completar `register.ts` com painel real
  - Usar `addons.register` + `addons.add`
  - Renderizar `ExportPanel` component
  - Tempo estimado: 2h

- [ ] **Task 4.2**: Conectar botão ao pipeline (MVP-5 parte 1)
  - Event listener para captura + conversão + AL
  - Gerar JSON final
  - Log básico (storyId, tamanho JSON)
  - ID Backlog: MVP-5, MVP-9
  - Tempo estimado: 2h

- [ ] **Task 4.3**: Exportar para clipboard e download (MVP-5 parte 2)
  - Clipboard API: `navigator.clipboard.writeText()`
  - Download: criar blob + link temporário
  - Feedback visual (toast/mensagem)
  - Tempo estimado: 2h

### Dia 5: Plugin Figma e Testes (MVP-6, MVP-7)
- [ ] **Task 5.1**: Build do plugin Figma
  - Configurar bundler (esbuild ou Vite)
  - Gerar `dist/code.js` e `dist/ui.html`
  - Testar instalação local no Figma
  - ID Backlog: MVP-6
  - Tempo estimado: 2h

- [ ] **Task 5.2**: Refinar importação JSON
  - Melhorar parsing de children recursivos
  - Aplicar Auto Layout completo
  - Tempo estimado: 2h

- [ ] **Task 5.3**: Testes e snapshots (MVP-7)
  - Snapshot JSON do Button Primary
  - Snapshot JSON do Button Secondary
  - Teste unitário autolayout padding
  - ID Backlog: MVP-7
  - Tempo estimado: 2h

---

## FASE 2: Refinamento e Observabilidade (Semana 2 - Dias 6-10)

### Dia 6: Logger e Guardrails (OBS-1, MVP-10)
- [ ] **Task 6.1**: Logger estruturado (OBS-1)
  - Criar `@figma-sync-engine/logger` package
  - Campos: `level`, `event`, `storyId`, `jsonSize`, `timestamp`
  - Sem PII (OBS-2)
  - ID Backlog: OBS-1, OBS-2
  - Tempo estimado: 3h

- [ ] **Task 6.2**: Kill-switch com env var (MVP-10)
  - `FIGMA_EXPORT_ENABLED=false` desabilita botão
  - Documentar em README
  - ID Backlog: MVP-10
  - Tempo estimado: 1h

- [ ] **Task 6.3**: Integrar logger no pipeline
  - Log em cada etapa (captura, conversão, AL, export)
  - Tempo estimado: 1h

### Dia 7: Tipografia e Documentação (AL-7, MVP-8)
- [ ] **Task 7.1**: Mapeamento tipografia (AL-7)
  - fontSize, fontWeight, fontFamily, lineHeight
  - Aplicar em nodes TEXT
  - Testes com texto variado
  - ID Backlog: AL-7
  - Tempo estimado: 3h

- [ ] **Task 7.2**: Atualizar figma-json-format.md (MVP-8)
  - Documentar todos campos suportados
  - Exemplos reais do Button
  - Limitações conhecidas
  - ID Backlog: MVP-8
  - Tempo estimado: 2h

### Dia 8: Performance Baseline (PERF-1)
- [ ] **Task 8.1**: Script de benchmark (PERF-1)
  - Medir tempo de conversão para Button (pequeno)
  - Criar componente médio (Card) para teste
  - Gerar relatório markdown
  - ID Backlog: PERF-1
  - Tempo estimado: 3h

- [ ] **Task 8.2**: Documentar métricas
  - Adicionar resultados ao backlog
  - Definir meta (< 1.5s para <300 nodes)
  - Tempo estimado: 1h

### Dia 9: Exemplos Adicionais (DOC-3)
- [ ] **Task 9.1**: Criar exemplo Card
  - Componente com imagem, título, descrição, botão
  - Story com variantes (horizontal/vertical)
  - Tempo estimado: 2h

- [ ] **Task 9.2**: Criar exemplo Input
  - Estados: default, focused, error, disabled
  - Tempo estimado: 2h

- [ ] **Task 9.3**: Testar exportação de todos exemplos
  - Validar JSON gerado
  - Ajustar heurísticas se necessário
  - ID Backlog: DOC-3
  - Tempo estimado: 2h

### Dia 10: Polimento Final e Release
- [ ] **Task 10.1**: Audit de segurança (SEC-1)
  - Rodar `pnpm audit`
  - Criar script `pnpm audit:security`
  - Resolver vulnerabilidades críticas
  - ID Backlog: SEC-1
  - Tempo estimado: 1h

- [ ] **Task 10.2**: Atualizar README com exemplos
  - GIFs/screenshots do fluxo
  - Instruções passo a passo
  - Limitações conhecidas
  - Tempo estimado: 2h

- [ ] **Task 10.3**: FAQ (DOC-5)
  - Seção no README ou doc separado
  - Perguntas comuns sobre Auto Layout
  - ID Backlog: DOC-5
  - Tempo estimado: 1h

- [ ] **Task 10.4**: Tag v0.1.0-alpha
  - Changelog inicial
  - Release notes
  - Tempo estimado: 1h

---

## FASE 3: Variantes e Tokens (Semana 3+)

### Prioridade Must
- [ ] **VAR-1**: Convenção args → variantProperties
- [ ] **VAR-3**: Plugin cria ComponentSet
- [ ] **TOK-2**: Tipografia → tokens

### Prioridade Should
- [ ] **VAR-2**: Export múltiplas stories
- [ ] **AL-3**: Detecção direção com fallback
- [ ] **AL-6**: Relatório divergências CSS vs Figma
- [ ] **PERF-2**: Cache de conversão
- [ ] **OBS-3**: TTL de feature flags
- [ ] **TOK-1**: Extração de cores → tokens
- [ ] **TOK-3**: Export tokens sidecar

---

## Indicadores de Sucesso (Semana 2)

### Critérios de Aceitação MVP
- ✅ Botão visível no Storybook funcionando
- ✅ JSON exportado com Auto Layout básico (gap, padding, align)
- ✅ Plugin Figma cria frame no canvas
- ✅ Testes passando (cobertura >70% do core)
- ✅ 3 exemplos funcionais (Button, Card, Input)
- ✅ Documentação completa (README, arquitetura, formato JSON)
- ✅ CI verde

### Métricas Alvo
- Tempo export Button: < 500ms
- Fidelidade visual: ≥ 85% (avaliação manual)
- Zero vulnerabilidades críticas

---

## Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| API html-to-figma limitada | Média | Alto | Estudar source e criar workarounds |
| Complexidade Auto Layout | Alta | Médio | Começar com subset (flex básico) |
| Performance em componentes grandes | Baixa | Médio | Benchmark cedo, otimizar depois |
| Storybook API mudou | Baixa | Alto | Pin de versões no package.json |

---

## Dependências Externas
- `@builder.io/html-to-figma@^0.8.0`
- `@storybook/react@^7.6.0`
- Figma Plugin API stable

---

## Pontos de Decisão

### Decisão 1: Formato do JSON
- **Status**: Definido
- **Escolha**: Seguir estrutura Builder.io com extensões próprias
- **Rationale**: Compatibilidade e comunidade

### Decisão 2: Tipografia
- **Status**: A definir (Dia 7)
- **Opções**: Inline styles vs tokens desde início
- **Recomendação**: Inline para MVP, tokens em FASE 3

### Decisão 3: Cache
- **Status**: Postponed para FASE 3
- **Rationale**: Otimização prematura

---

## Checklist Diário
Ao final de cada dia:
- [ ] Commit com mensagem seguindo convenção
- [ ] Testes passando
- [ ] Atualizar Kanban no backlog.md
- [ ] Documentar decisões relevantes

---

## Comandos Úteis

### Desenvolvimento
```powershell
# Instalar tudo
pnpm install

# Build geral
pnpm build

# Watch mode (individual)
pnpm --filter @figma-sync-engine/autolayout-interpreter dev

# Rodar exemplo
pnpm --filter @figma-sync-engine/example-react-button dev

# Testes
pnpm test

# Lint
pnpm lint
```

### Release
```powershell
# Audit
pnpm audit

# Build produção
pnpm build

# Tag
git tag v0.1.0-alpha
git push origin v0.1.0-alpha
```

---

## Próxima Ação IMEDIATA
**Começar Task 1.1**: Validar instalação e build atual.

```powershell
cd figma-sync-engine
pnpm install
pnpm build
```

Se houver erros, resolver antes de prosseguir para Dia 1.
