# 🤖 E2E Robot - Guia de Execução

**Robô automatizado que simula um usuário real testando o fluxo completo de exportação.**

---

## ✅ Implementação Concluída

Todos os componentes foram instalados e configurados:

- ✅ Playwright instalado (`@playwright/test ^1.56.1`)
- ✅ Navegador Chromium instalado
- ✅ Script E2E criado: `scripts/e2e-robot.spec.ts`
- ✅ Configuração Playwright: `playwright.config.ts`
- ✅ Scripts adicionados ao `package.json`
- ✅ Diretório de relatórios criado: `scripts/reports/`

---

## 🚀 Como Rodar o Robô

### Opção 1: Modo Headless (Automático)
```bash
# Roda sem interface visual (ideal para CI/CD)
pnpm test:e2e
```

### Opção 2: Modo Headed (Visual)
```bash
# Abre o navegador e mostra cada ação do robô
pnpm test:e2e:headed
```

### Opção 3: Interface Playwright
```bash
# Abre UI interativa com visualização de testes
pnpm test:e2e:ui
```

### Opção 4: Modo Debug
```bash
# Abre debugger do Playwright
pnpm test:e2e:debug
```

---

## 📊 O que o Robô Testa

### **7 Fases de Teste**

| Fase | O que Faz | Status |
|------|----------|--------|
| 1️⃣ | Abre Storybook | Aguarda carregar |
| 2️⃣ | Navega até Button | Clica em "Button" |
| 3️⃣ | Abre painel Export | Procura "Export to Figma" |
| 4️⃣ | Seleciona histórias | Marca Primary, Secondary, Large |
| 5️⃣ | Clica "Export" | Dispara exportação |
| 6️⃣ | Captura JSON | Busca em localStorage/variáveis globais |
| 7️⃣ | Valida JSON | Verifica estrutura e dados |

---

## 📸 Saída do Robô

### **Estrutura de Relatório**

```
scripts/reports/
├── e2e-robot-report-2025-11-24T14-30-45.json  ← Relatório JSON
├── step-1-01-storybook-opened.png
├── step-2-02-button-selected.png
├── step-3-03-export-panel-opened.png
├── step-4-04-stories-selected.png
├── step-5-05-export-clicked.png
├── step-6-06-json-captured.png
└── html/                                        ← Relatório HTML (se gerado)
    └── index.html
```

### **Conteúdo do Relatório JSON**

```json
{
  "timestamp": "2025-11-24T14:30:45.123Z",
  "browser": "chromium",
  "status": "success",
  "totalTime": 15234,
  "steps": [
    {
      "step": 1,
      "name": "Abrir Storybook",
      "status": "pass",
      "duration": 3200
    },
    // ... mais passos
  ],
  "exportedJson": {
    "stories": [
      { "name": "Button--Primary", "html": "..." },
      { "name": "Button--Secondary", "html": "..." },
      { "name": "Button--Large", "html": "..." }
    ],
    "componentSet": { /* ... */ }
  },
  "errors": [],
  "screenshots": [
    "step-1-01-storybook-opened.png",
    // ...
  ]
}
```

---

## 📋 Interpretando Resultados

### ✅ **Status: success**
```
✅ Tudo funcionou perfeitamente!

Verificar:
- Tempo total < 20 segundos
- 7 passos com status "pass"
- JSON com 3+ stories
- ComponentSet definido
- 0 erros
```

### ⚠️ **Status: partial**
```
⚠️ Funcionou parcialmente

Verificar:
- Qual passo falhou?
- Qual foi o erro?
- JSON foi capturado mesmo assim?
- Quantos passos tiveram sucesso?
```

### ❌ **Status: failure**
```
❌ Parou em erro crítico

Verificar:
- Em qual passo parou?
- Qual foi a mensagem de erro?
- Screenshots ajudam a identificar o problema
- Possível causa: Storybook não carregou
```

---

## 🔍 Analisando Falhas

### Passo 1: Verificar Screenshots
```bash
# Abrir pasta de relatórios
explorer scripts/reports

# Ver cada screenshot para entender onde parou
# Ex: step-3-03-export-panel-opened.png
```

### Passo 2: Ler o Relatório JSON
```bash
# Ver com cat (PowerShell)
cat scripts/reports/e2e-robot-report-*.json | ConvertFrom-Json | Format-List

# Ou abrir diretamente
code scripts/reports/e2e-robot-report-*.json
```

### Passo 3: Rodar em Modo Debug
```bash
# Abre debugger para ver o que aconteceu
pnpm test:e2e:debug

# Use 'step over' para ir linha por linha
```

---

## 💡 Dicas de Troubleshooting

### Problema: "Storybook não carregou"
```bash
# Solução: Verificar se Storybook está rodando
pnpm storybook

# Se ainda não funcionar, aumentar timeout em playwright.config.ts
# timeout: 30 * 1000 (aumentado para 30s)
```

### Problema: "Não encontrou Button component"
```bash
# Solução: O seletor pode estar errado
# Editar scripts/e2e-robot.spec.ts e ajustar:
const buttonLink = page.locator('a:has-text("Button")');

# Verificar em modo headed para ver a estrutura real
pnpm test:e2e:headed
```

### Problema: "JSON não foi capturado"
```bash
# Solução: O JSON pode estar em outro lugar
# Editar a função de captura em e2e-robot.spec.ts
# Adicionar console.log para debugar:
const exportedData = await page.evaluate(() => {
  console.log('Variáveis globais:', window);
  return null;
});
```

### Problema: "Teste travou no browser"
```bash
# Solução: Aumentar timeout
# Em playwright.config.ts:
timeout: 60 * 1000 // aumentado para 60 segundos
```

---

## 🔄 Integração com CI/CD

### GitHub Actions Automático

Criar `.github/workflows/e2e-robot.yml`:

```yaml
name: E2E Robot Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 8 * * *'  # Rodar diariamente às 8h

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - name: Run E2E Robot Tests
        run: pnpm test:e2e
        timeout-minutes: 10
      
      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-robot-reports
          path: scripts/reports/
          retention-days: 30
      
      - name: Comment PR
        if: always() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('./scripts/reports/e2e-robot-report-*.json', 'utf8'));
            const comment = `## 🤖 E2E Robot Report
            - Status: ${report.status}
            - Time: ${(report.totalTime/1000).toFixed(2)}s
            - Steps: ${report.steps.filter(s => s.status === 'pass').length}/${report.steps.length}
            - Screenshots: ${report.screenshots.length}
            [📊 See full report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## ✅ Checklist: Rodar o Robô

- [ ] Ter Storybook funcionando localmente
- [ ] Rodar: `pnpm test:e2e`
- [ ] Verificar se passou (status: success)
- [ ] Abrir screenshots em `scripts/reports/`
- [ ] Ler relatório JSON
- [ ] Analisar tempo total (deve ser < 20s)
- [ ] Verificar se JSON foi capturado

---

## 📊 Métricas Esperadas

### ⚡ Performance
- Tempo total: **10-20 segundos**
- Cada passo: **1-3 segundos**
- Captura de JSON: **< 500ms**

### 📸 Screenshots
- Total: **6 screenshots**
- Tamanho: **~50-200KB cada**

### 📦 JSON Exportado
- Stories: **3+**
- ComponentSet: **Definido**
- Tempo de criação: **< 500ms**

---

## 🚀 Próximos Passos

1. **Rodar robô**: `pnpm test:e2e:headed`
2. **Ver o que acontece**: Observe o navegador abrindo
3. **Verificar relatório**: `cat scripts/reports/e2e-robot-report-*.json`
4. **Analisar screenshots**: Abrir cada `step-*.png`
5. **Debugar se necessário**: `pnpm test:e2e:debug`
6. **Integrar com CI/CD**: Adicionar workflow ao GitHub

---

**Seu robô está pronto para testar como um usuário de verdade! 🤖✨**

Dúvidas? Abra um issue ou consulte a documentação em `docs/`.
