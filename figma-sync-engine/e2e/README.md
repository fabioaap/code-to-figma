# E2E Tests with Playwright

Este diretório contém os testes end-to-end (E2E) para o figma-sync-engine usando Playwright.

## Pré-requisitos

1. Instalar dependências do projeto:
```bash
pnpm install
```

2. Instalar os browsers do Playwright:
```bash
pnpm playwright:install
```

## Configuração do Ambiente

Os testes E2E requerem confirmação de ambiente antes de executar. As seguintes variáveis de ambiente são suportadas:

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `E2E_BASE_URL` | URL base da instância do Storybook | `http://localhost:6006` | Não |
| `E2E_HEADLESS` | Executar testes em modo headless | `true` | Não |
| `E2E_TIMEOUT` | Timeout para cada teste (ms) | `30000` | Não |
| `CI` | Indica se está rodando em ambiente CI | `false` | Não |

### Exemplos de Configuração

#### Desenvolvimento Local (padrão)
```bash
pnpm test:e2e
```

#### Desenvolvimento com browser visível
```bash
pnpm test:e2e:headed
```

#### Com URL customizada
```bash
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
```

#### Modo debug
```bash
pnpm test:e2e:debug
```

#### Interface UI do Playwright
```bash
pnpm test:e2e:ui
```

## Validação de Ambiente

Antes de executar os testes, o sistema valida automaticamente:

✅ **Validações que são executadas:**
- URL base está no formato correto (http:// ou https://)
- Timeout é um número positivo
- Se está em ambiente local, avisa para iniciar o Storybook

❌ **O que causa falha na validação:**
- URL base inválida (não começa com http:// ou https://)
- Timeout inválido (não é um número ou é negativo)

⚠️ **Avisos (não impedem execução):**
- Rodando contra localhost sem Storybook iniciado
- Rodando CI contra localhost

## Estrutura dos Testes

```
e2e/
├── utils/
│   └── env-validation.ts    # Utilitários de validação de ambiente
├── storybook.spec.ts         # Testes básicos do Storybook
└── export.spec.ts            # Testes de exportação Figma (futuros)
```

## Executando os Testes

### Todos os testes
```bash
pnpm test:e2e
```

### Testes específicos
```bash
pnpm test:e2e e2e/storybook.spec.ts
```

### Em modo watch
```bash
pnpm test:e2e --watch
```

### Com relatório
```bash
pnpm test:e2e --reporter=html
```

## Integração com CI

O arquivo `.github/workflows/ci.yml` foi atualizado para incluir os testes E2E. Em CI:

- Os testes rodam em modo headless
- Usa apenas 1 worker (execução sequencial)
- Retry automático de 2 tentativas em caso de falha
- Relatório formatado para GitHub Actions

### Configuração no CI

```yaml
- name: Install Playwright
  run: pnpm playwright:install

- name: Run E2E Tests
  run: pnpm test:e2e
  env:
    CI: true
    E2E_BASE_URL: http://localhost:6006
```

## Desenvolvimento de Novos Testes

### Template Básico

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Seu teste aqui
    await expect(page).toHaveTitle(/Storybook/);
  });
});
```

### Boas Práticas

1. **Use seletores semânticos**: Prefira `role`, `text`, `testId` ao invés de classes CSS
2. **Aguarde o estado correto**: Use `waitForLoadState`, `waitForSelector` quando necessário
3. **Isole os testes**: Cada teste deve ser independente
4. **Use fixtures**: Aproveite as fixtures do Playwright para setup compartilhado
5. **Documente**: Adicione comentários explicando testes complexos

### Testes Condicionais

Para funcionalidades ainda não implementadas, use `@skip-if-not-implemented`:

```typescript
test('should export to Figma @skip-if-not-implemented', async ({ page }) => {
  const button = page.locator('button:has-text("Export")');
  const exists = await button.count() > 0;
  
  if (!exists) {
    test.skip(true, 'Export not yet implemented');
    return;
  }
  
  // Teste continua apenas se a feature existir
});
```

## Troubleshooting

### Erro: "E2E environment validation failed"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que `E2E_BASE_URL` começa com `http://` ou `https://`

### Erro: "net::ERR_CONNECTION_REFUSED"
- Certifique-se de que o Storybook está rodando: `pnpm dev`
- Verifique se a porta está correta (padrão: 6006)

### Testes lentos
- Use `E2E_HEADLESS=false` para debug visual
- Aumente o timeout: `E2E_TIMEOUT=60000`
- Verifique a configuração de `workers` no `playwright.config.ts`

### Browser não instalado
```bash
pnpm playwright:install
```

## Recursos

- [Documentação do Playwright](https://playwright.dev)
- [Melhores Práticas](https://playwright.dev/docs/best-practices)
- [Seletores](https://playwright.dev/docs/selectors)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Contribuindo

Ao adicionar novos testes:

1. Siga a estrutura existente
2. Adicione validações de ambiente quando necessário
3. Documente variáveis de ambiente novas
4. Atualize este README
5. Garanta que os testes passam em CI
