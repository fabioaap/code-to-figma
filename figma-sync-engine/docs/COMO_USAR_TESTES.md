# 🧪 Como Usar os Testes do figma-sync-engine

**Guia prático para entender e executar os 286 testes do projeto.**

---

## 📊 Resumo dos Testes

Você tem **286 testes** passando em 15 arquivos:

| Pacote | Testes | Arquivos |
|--------|--------|----------|
| `autolayout-interpreter` | 60 | 1 |
| `html-to-figma-core` | 40 | 1 |
| `storybook-addon-export` | 186 | 6 |
| **TOTAL** | **286** | **15** |

---

## 🎯 O que cada teste faz?

### ✅ **autolayout-interpreter** (60 testes)
**O que testa:** Conversão de CSS (flexbox, grid) → Auto Layout do Figma

```typescript
// Exemplo: CSS flexbox vira Auto Layout Figma
const css = { display: 'flex', gap: '8px' };
const result = interpretAutoLayout(css);
// Resultado: { layoutMode: 'FLEX', itemSpacing: 8 }
```

### ✅ **html-to-figma-core** (40 testes)
**O que testa:** Conversão de HTML → estrutura Figma (nós, propriedades)

```typescript
// Exemplo: HTML <button> vira nó Figma
const html = '<button>Click me</button>';
const figmaNode = htmlToFigma(html);
// Resultado: { type: 'FRAME', children: [...] }
```

### ✅ **storybook-addon-export** (186 testes em 6 arquivos)

#### **shared.test.ts** (52 testes)
- **VAR-1 (20 testes):** Mapeamento de props → propriedades Figma
  ```typescript
  expect(mapArgsToVariantProperties({ variant: 'primary' }))
    .toEqual({ variant: 'primary' });
  ```

- **VAR-2 (14 testes):** Exportar múltiplas histórias
  ```typescript
  const json = combineStoriesToExportJSON([story1, story2]);
  expect(json.stories.length).toBe(2);
  ```

- **VAR-3 (18 testes):** ComponentSet com variantes
  ```typescript
  const componentSet = createComponentSet(stories);
  expect(componentSet.variants).toHaveLength(3);
  ```

#### **benchmark.test.ts** (27 testes)
Testa performance de conversão:
```typescript
// Mede tempo de conversão
const result = benchmark(html, 100);
expect(result.avg).toBeLessThan(50); // < 50ms
```

#### **security-audit.test.ts** (33 testes)
Testa segurança e vulnerabilidades:
```typescript
// Verifica vulnerabilidades críticas
const audit = runSecurityAudit();
expect(audit.critical).toBe(0);
```

#### **export.test.ts** (36 testes)
Testa lógica de exportação geral.

#### **captureHtml.test.ts** (14 testes)
Testa captura de HTML da história.

#### **logger.test.ts** (24 testes)
Testa logging estruturado.

---

## 🚀 Como Rodar os Testes

### 1️⃣ **Rodar todos os testes**
```bash
pnpm test
```

**Resultado esperado:**
```
Test Files  15 passed (15)
Tests       286 passed (286)
Time        14.091s
```

### 2️⃣ **Rodar testes de um pacote específico**

```bash
# Apenas autolayout-interpreter (60 testes)
pnpm test --filter autolayout-interpreter

# Apenas storybook-addon-export (186 testes)
pnpm test --filter storybook-addon-export

# Apenas html-to-figma-core (40 testes)
pnpm test --filter html-to-figma-core
```

### 3️⃣ **Rodar um teste específico**

```bash
# Todos os testes de um arquivo
pnpm test --filter storybook-addon-export -- src/shared.test.ts

# Um teste específico (por padrão)
pnpm test --filter storybook-addon-export -- src/shared.test.ts -t "mapArgsToVariantProperties"
```

### 4️⃣ **Modo Watch (durante desenvolvimento)**

```bash
# Reexecuta testes ao salvar
pnpm test -- --watch

# Watch em um pacote específico
pnpm test --filter storybook-addon-export -- --watch
```

### 5️⃣ **Modo Debug**

```bash
# Abre debugger do Node
pnpm test -- --inspect-brk

# No Chrome, acesse chrome://inspect
```

---

## 📋 Estrutura de um Teste

Todos os testes usam **Vitest** (similar a Jest):

```typescript
// arquivo.test.ts
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './minhaFuncao';

describe('meu bloco de testes', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao('entrada');
    expect(resultado).toBe('saída esperada');
  });

  it('deve validar dados', () => {
    expect([1, 2, 3]).toHaveLength(3);
    expect({ a: 1 }).toEqual({ a: 1 });
  });
});
```

---

## 🎯 Exemplos Práticos

### Exemplo 1: Testar mapeamento de variantes
```typescript
// Seu teste
it('deve mapear variant=primary corretamente', () => {
  const props = { variant: 'primary', size: 'md' };
  const mapped = mapArgsToVariantProperties(props);
  
  expect(mapped).toEqual({
    variant: 'primary',
    size: 'md'
  });
});
```

**Como rodar:**
```bash
pnpm test --filter storybook-addon-export -- shared.test.ts -t "variant"
```

### Exemplo 2: Testar conversão HTML → Figma
```typescript
// Seu teste
it('deve converter button HTML para nó Figma', () => {
  const html = '<button class="btn-primary">Click</button>';
  const node = htmlToFigma(html);
  
  expect(node.type).toBe('FRAME');
  expect(node.children[0].content).toBe('Click');
});
```

**Como rodar:**
```bash
pnpm test --filter html-to-figma-core -- -t "button"
```

### Exemplo 3: Testar performance
```typescript
// Seu teste
it('deve converter em menos de 50ms', () => {
  const html = complexHtml;
  const start = performance.now();
  
  htmlToFigma(html);
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(50);
});
```

**Como rodar:**
```bash
pnpm test --filter storybook-addon-export -- benchmark.test.ts
```

### Exemplo 4: Testar segurança
```typescript
// Seu teste
it('deve detectar vulnerabilidades críticas', () => {
  const audit = runSecurityAudit();
  
  expect(audit.critical).toBe(0); // Zero críticas
  expect(audit.high).toBeLessThanOrEqual(2); // Max 2 altas
});
```

**Como rodar:**
```bash
pnpm test --filter storybook-addon-export -- security-audit.test.ts
```

---

## 📍 Onde os Testes Ficam

```
packages/
├── autolayout-interpreter/
│   └── tests/
│       └── interpret.test.ts (60 testes)
│
├── html-to-figma-core/
│   └── tests/
│       └── index.test.ts (40 testes)
│
└── storybook-addon-export/
    └── src/
        ├── shared.test.ts (52 testes)
        ├── benchmark.test.ts (27 testes)
        ├── security-audit.test.ts (33 testes)
        ├── export.test.ts (36 testes)
        ├── captureHtml.test.ts (14 testes)
        └── logger.test.ts (24 testes)
```

---

## 🧪 Adicionar Novo Teste

Se você quer adicionar um teste para nova funcionalidade:

### Passo 1: Criar arquivo de teste
```typescript
// src/meuModulo.test.ts
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './meuModulo';

describe('meu módulo', () => {
  it('deve fazer algo', () => {
    expect(minhaFuncao()).toBeTruthy();
  });
});
```

### Passo 2: Rodar teste
```bash
pnpm test --filter storybook-addon-export -- meuModulo.test.ts
```

### Passo 3: Implementar função
```typescript
// src/meuModulo.ts
export function minhaFuncao() {
  return true;
}
```

### Passo 4: Teste passa ✅

---

## 📊 Coverage (Cobertura de Código)

Ver quantas linhas estão testadas:

```bash
pnpm test -- --coverage
```

**Resultado esperado:**
```
Statements   : 98.5%
Branches     : 96.2%
Functions    : 99.1%
Lines        : 98.7%
```

---

## 🔄 Integração com CI/CD

Os testes rodam automaticamente em cada PR:

```bash
# GitHub Actions executa
pnpm install
pnpm build
pnpm test
```

Se algum teste falhar, o PR fica bloqueado. ✅ = merge liberado.

---

## 🎓 Aprender com Testes Existentes

Os testes já implementados são excelentes exemplos:

1. **shared.test.ts**: Ver como testar mapeamento de propriedades
2. **benchmark.test.ts**: Ver como testar performance
3. **security-audit.test.ts**: Ver como testar segurança
4. **export.test.ts**: Ver como testar lógica de exportação

```bash
# Abra e estude
cat packages/storybook-addon-export/src/shared.test.ts
```

---

## 💡 Dicas Úteis

### Dica 1: Executar apenas testes que falharam
```bash
pnpm test -- --changed
```

### Dica 2: Executar teste em tempo real
```bash
pnpm test -- --watch -- --reporter=verbose
```

### Dica 3: Executar com mais detalhes
```bash
pnpm test -- --reporter=verbose --no-colors
```

### Dica 4: Listar todos os testes sem rodar
```bash
pnpm test -- --listTests
```

### Dica 5: Rodar teste específico por regex
```bash
pnpm test -- -t "variant|ComponentSet" # Testes com 'variant' OU 'ComponentSet'
```

---

## ⚙️ Configuração do Vitest

Arquivo de config: `vitest.config.ts` (na raiz de cada pacote)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Para testes DOM
    globals: true,        // describe, it, expect sem import
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

---

## 🆘 Troubleshooting de Testes

### Problema: "Cannot find module"
```bash
# Solução: Reinstale e rebuilde
pnpm install
pnpm build
pnpm test
```

### Problema: Teste fica lento
```bash
# Solução: Rode apenas um pacote
pnpm test --filter storybook-addon-export
```

### Problema: Teste falha aleatoriamente
```bash
# Solução: Pode ser timing, adicione delay
await new Promise(resolve => setTimeout(resolve, 100));
```

### Problema: Teste não encontrado
```bash
# Solução: Verifique o nome do arquivo (.test.ts)
pnpm test -- --listTests | grep meuTeste
```

---

## ✅ Checklist: Usando Testes no Seu Projeto

- [ ] `pnpm test` (rodar todos os 286 testes)
- [ ] `pnpm test --filter storybook-addon-export` (rodar 186 testes)
- [ ] `pnpm test -- --watch` (modo desenvolvimento)
- [ ] Abrir `shared.test.ts` e estudar a estrutura
- [ ] Criar seu próprio teste para nova funcionalidade
- [ ] Rodar seu teste isoladamente
- [ ] Verificar coverage com `pnpm test -- --coverage`
- [ ] Commitar código com testes verdes ✅

---

## 🚀 Próximos Passos

1. **Rodar todos os testes**: `pnpm test`
2. **Estudar testes existentes**: Abra `shared.test.ts`
3. **Criar novo teste**: Para sua funcionalidade
4. **Rodar em watch mode**: `pnpm test -- --watch`
5. **Verificar CI**: GitHub Actions vai rodar automaticamente

---

**Agora você tem 286 testes para verificar qualidade do código!** 🎉
