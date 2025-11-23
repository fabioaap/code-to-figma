# 🚀 Cloud Agent Briefing — Fase 2

**Data**: 23 de novembro de 2025  
**Status**: 📋 Planejamento Completo  
**Esforço Estimado**: 6-10 horas  
**Impacto**: Melhora fidelidade visual, recursividade plugin, observabilidade e segurança

---

## 📌 Contexto

A Fase 1 (MVP-1 a MVP-5) está **✅ COMPLETA**. O pipeline básico Storybook → JSON Figma está funcional com 105 testes passando.

A **Fase 2** adiciona 4 melhorias críticas para qualidade e robustez do sistema:

---

## 🎯 Escopo da Fase 2

### 1. **AL-2: Melhorar Interpretador de Auto Layout**
**Issue**: #16  
**Objetivo**: Mapear `align-items` e `justify-content` para os eixos corretos do Figma

**Status Atual**:
- ✅ Estrutura já existe em `autolayout-interpreter/src/index.ts`
- ✅ Funções `mapAlignItems()` e `mapJustifyContent()` implementadas
- ❌ Falta aplicação correta aos eixos (primaryAxis vs counterAxis)

**O que fazer**:
- Corrigir lógica em `applyAutoLayout()` para mapear corretamente:
  - `justify-content` → `primaryAxisAlignItems` (eixo principal)
  - `align-items` → `counterAxisAlignItems` (eixo cruzado)
- Adicionar testes para cobrir casos de `row` e `column`

**Testes esperados**:
```typescript
// justify-content: flex-start → primaryAxisAlignItems: 'MIN'
// align-items: center → counterAxisAlignItems: 'CENTER'
// Para flexDirection: 'row' e 'column'
```

---

### 2. **MVP-6: Implementar Recursividade no Plugin Figma**
**Objetivo**: Plugin deve criar nós recursivamente, não apenas filhos diretos

**Status Atual**:
- ✅ Plugin básico criado em `figma-plugin-lite/src/code.ts`
- ❌ Apenas processa 1 nível de filhos
- ❌ Não suporta tipos de nó além de TEXT

**O que fazer**:
- Criar função recursiva `createNodeFromJson(nodeData)`
- Suportar tipos: FRAME, TEXT, RECTANGLE (mínimo)
- Aplicar propriedades de Auto Layout recursivamente
- Adicionar tratamento de erros robusto

**Estrutura esperada**:
```typescript
function createNodeFromJson(data: any, parent?: BaseNode): SceneNode | null {
    switch(data.type) {
        case 'FRAME':
            const frame = figma.createFrame();
            // aplicar propriedades
            if (data.children) {
                data.children.forEach(child => createNodeFromJson(child, frame));
            }
            return frame;
        // ... outros tipos
    }
}
```

---

### 3. **MVP-9: Adicionar Logger Estruturado no Addon**
**Issue**: #17  
**Objetivo**: Observabilidade de exports com logs estruturados (sem PII)

**O que fazer**:
- Criar arquivo `packages/storybook-addon-export/src/logger.ts`
- Implementar logger com níveis: `info`, `warn`, `error`, `debug`
- Formato estruturado JSON: `{ level, timestamp, event, metadata }`
- Integrar no `panel.tsx` e `export.ts`
- Log de eventos:
  - `export.started`
  - `export.completed` (duração, tamanho)
  - `export.failed` (erro)

**Exemplo**:
```typescript
logger.info('export.completed', {
    method: 'clipboard',
    size: 1234,
    duration: 150
});
```

---

### 4. **MVP-10: Implementar Kill-Switch de Segurança**
**Issue**: #19  
**Objetivo**: Desativar addon via flag de ambiente (mitigação rápida)

**O que fazer**:
- Adicionar variável `FIGMA_EXPORT_ENABLED` (default: `true`)
- Verificar em `panel.tsx` ao renderizar botões
- Se desabilitado, mostrar mensagem: "Export desabilitado (manutenção)"
- Adicionar documentação em README

**Implementação**:
```typescript
// panel.tsx
const isEnabled = import.meta.env.VITE_FIGMA_EXPORT_ENABLED !== 'false';

if (!isEnabled) {
    return <p>⚠️ Export temporariamente desabilitado</p>;
}
```

---

## 📋 Checklist de Execução

### AL-2: Auto Layout (2-3h)
- [ ] Revisar testes atuais em `autolayout-interpreter/src/index.test.ts`
- [ ] Adicionar testes para justify-content e align-items em ambos eixos
- [ ] Confirmar que `applyAutoLayout` já aplica corretamente os mapas
- [ ] Validar com casos de teste row e column
- [ ] Rodar `pnpm test --filter @figma-sync-engine/autolayout-interpreter`

### MVP-6: Plugin Recursivo (3-4h)
- [ ] Criar função `createNodeFromJson` recursiva
- [ ] Suportar FRAME, TEXT, RECTANGLE
- [ ] Aplicar layoutMode, padding, spacing
- [ ] Tratar erros (JSON inválido, tipos desconhecidos)
- [ ] Testar manualmente com JSON de exemplo
- [ ] Rodar `pnpm build --filter @figma-sync-engine/figma-plugin-lite`

### MVP-9: Logger (2-3h)
- [ ] Criar `logger.ts` com interface estruturada
- [ ] Implementar níveis de log
- [ ] Adicionar flag `LOG_LEVEL` no ambiente
- [ ] Integrar no `panel.tsx` (events de export)
- [ ] Adicionar testes para logger
- [ ] Validar logs no console do navegador

### MVP-10: Kill-Switch (1-2h)
- [ ] Adicionar `VITE_FIGMA_EXPORT_ENABLED` no `.env.example`
- [ ] Implementar verificação em `panel.tsx`
- [ ] Adicionar UI para estado desabilitado
- [ ] Documentar em README
- [ ] Testar com flag true/false

---

## 🧪 Testes e Validação

### Build e Testes
```bash
# Rodar todos os testes
pnpm test

# Build completo
pnpm build

# Lint
pnpm lint
```

### Testes Manuais
1. **AL-2**: Inspecionar JSON gerado com diferentes align-items/justify-content
2. **MVP-6**: Importar JSON complexo no plugin e validar árvore
3. **MVP-9**: Verificar logs estruturados no console
4. **MVP-10**: Testar com flag desabilitada

---

## 📊 Critérios de Aceite

### AL-2
- ✅ justify-content mapeia para primaryAxisAlignItems
- ✅ align-items mapeia para counterAxisAlignItems
- ✅ Funciona para row e column
- ✅ Testes adicionados e passando

### MVP-6
- ✅ Plugin cria árvore recursiva (≥3 níveis)
- ✅ Suporta FRAME, TEXT, RECTANGLE
- ✅ Auto Layout aplicado corretamente
- ✅ Erros tratados graciosamente

### MVP-9
- ✅ Logger estruturado implementado
- ✅ Logs de export.started/completed/failed
- ✅ Sem PII nos logs
- ✅ Configurável via LOG_LEVEL

### MVP-10
- ✅ Flag FIGMA_EXPORT_ENABLED funcional
- ✅ UI mostra estado desabilitado
- ✅ Documentado em README
- ✅ Testado com true/false

---

## 🚀 Ordem de Execução Recomendada

1. **AL-2** (mais fácil, já tem estrutura)
2. **MVP-9** (independente, útil para debugging)
3. **MVP-10** (rápido, segurança)
4. **MVP-6** (mais complexo, beneficia de AL-2 e MVP-9)

---

## 📚 Referências

- Backlog: `docs/backlog.md`
- Testes atuais: `packages/*/src/*.test.ts`
- Plugin atual: `packages/figma-plugin-lite/src/code.ts`
- Auto Layout: `packages/autolayout-interpreter/src/index.ts`

---

## ✅ Definição de Pronto

- [ ] Todos os 4 items implementados
- [ ] Testes adicionados e passando (cobertura ≥80%)
- [ ] Build sem erros
- [ ] Lint sem warnings críticos
- [ ] Documentação atualizada
- [ ] Smoke test manual realizado
- [ ] Commit e PR criado

---

**Boa sorte! A Fase 2 eleva o projeto para produção. 🎉**
