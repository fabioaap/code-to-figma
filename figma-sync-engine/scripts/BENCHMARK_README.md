# Benchmark de Conversão HTML → Figma

Script de benchmark para medir o desempenho de conversão de HTML para JSON Figma, incluindo a aplicação de Auto Layout.

## 📊 Objetivo

Este benchmark mede o tempo de conversão completo do pipeline:
1. HTML → JSON Figma base (usando `html-to-figma-core`)
2. Aplicação de heurísticas de Auto Layout (usando `autolayout-interpreter`)

## 🚀 Como Usar

### Instalação de Dependências

```bash
# Na raiz do monorepo
cd figma-sync-engine
pnpm install
```

### Executar Benchmark

```bash
# Modo padrão (50 iterações por teste)
pnpm tsx scripts/benchmark-conversion.ts

# Com número customizado de iterações
pnpm tsx scripts/benchmark-conversion.ts --iterations=100

# Modo verbose (mostra progresso detalhado)
pnpm tsx scripts/benchmark-conversion.ts --verbose

# Saída em formato JSON
pnpm tsx scripts/benchmark-conversion.ts --json

# Combinando opções
pnpm tsx scripts/benchmark-conversion.ts --iterations=200 --verbose
```

## 📈 Casos de Teste

O benchmark executa três cenários com diferentes níveis de complexidade:

### 1. Botão Simples
- Elemento único com estilos inline
- Mede conversão básica sem aninhamento

### 2. Card com Flexbox
- Estrutura com múltiplos elementos
- Layout flexbox com gap e alinhamento
- Testa conversão de Auto Layout básico

### 3. Layout Complexo com Aninhamento
- Dashboard completo com header, grid e cards
- Múltiplos níveis de aninhamento
- Testa performance com estruturas complexas

## 📊 Métricas Coletadas

Para cada caso de teste, o benchmark calcula:

- **Média**: Tempo médio de conversão
- **Mediana**: Valor central (menos afetado por outliers)
- **P95**: 95% das conversões completam neste tempo ou menos
- **P99**: 99% das conversões completam neste tempo ou menos
- **Mínimo**: Tempo mais rápido registrado
- **Máximo**: Tempo mais lento registrado
- **Desvio Padrão**: Variabilidade dos tempos

## 📁 Saídas Geradas

O benchmark gera automaticamente:

1. **Relatório Markdown** (`scripts/benchmark-results/benchmark-YYYY-MM-DDTHH-MM-SS.md`)
   - Formato legível para humanos
   - Tabelas comparativas
   - Resumo executivo

2. **Relatório JSON** (`scripts/benchmark-results/benchmark-YYYY-MM-DDTHH-MM-SS.json`)
   - Dados brutos completos
   - Todos os tempos individuais
   - Formato para processamento automatizado

## 🔍 Exemplo de Saída

```
🚀 Benchmark de Conversão HTML → Figma
📊 Iterações por teste: 50

🔄 Executando benchmark: Botão Simples (50 iterações)...
  ✅ Completo: 50/50

🔄 Executando benchmark: Card com Flexbox (50 iterações)...
  ✅ Completo: 50/50

🔄 Executando benchmark: Layout Complexo com Aninhamento (50 iterações)...
  ✅ Completo: 50/50

================================================================================
# Relatório de Benchmark de Conversão HTML → Figma

**Data:** 24/11/2025, 01:00:00

**Duração Total:** 2.34s

---

## Botão Simples

**Iterações:** 50

### Métricas de Tempo

| Métrica | Valor |
|---------|-------|
| Média | 12.45ms |
| Mediana | 11.89ms |
| P95 | 15.23ms |
| P99 | 18.45ms |
| Mínimo | 9.12ms |
| Máximo | 21.34ms |
| Desvio Padrão | 2.67ms |

...

📁 Relatórios salvos:
   - /path/to/scripts/benchmark-results/benchmark-2025-11-24T01-00-00.md
   - /path/to/scripts/benchmark-results/benchmark-2025-11-24T01-00-00.json

✅ Benchmark concluído com sucesso!
```

## 🛠️ Detalhes Técnicos

### Aquecimento (Warm-up)

O benchmark executa 5 iterações de aquecimento antes das medições reais para:
- Estabilizar otimizações JIT do JavaScript
- Carregar módulos e dependências
- Garantir medições mais precisas

### Precisão

- Usa `performance.now()` para medições de alta precisão (resolução de microsegundos)
- Calcula média, mediana e percentis para análise robusta
- Mede o pipeline completo end-to-end

### Performance API

O script utiliza a Performance API nativa do Node.js, sem dependências externas para medição.

## 📝 Notas

- Os tempos podem variar dependendo do hardware e carga do sistema
- Execute múltiplas vezes e compare tendências, não valores absolutos
- P95 e P99 são métricas importantes para SLAs de produção
- O diretório `benchmark-results/` está no `.gitignore` para evitar commit de resultados

## 🔄 Integração com CI/CD

Para integrar com pipelines de CI/CD:

```bash
# Executar e falhar se média > threshold
pnpm tsx scripts/benchmark-conversion.ts --json > results.json
node -e "const r = require('./results.json'); if (r.results[0].mean > 50) process.exit(1);"
```

## 📚 Referências

- [PERF-1] Issue de benchmark de conversão
- `packages/html-to-figma-core`: Conversor base HTML → Figma
- `packages/autolayout-interpreter`: Engine de Auto Layout
