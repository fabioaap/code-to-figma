# figma-sync-engine

[![CI](https://github.com/fabioaap/code-to-figma/actions/workflows/ci.yml/badge.svg)](https://github.com/fabioaap/code-to-figma/actions/workflows/ci.yml)

**Sincronize seus componentes React entre Storybook e Figma automaticamente.**

Ferramenta open source que exporta componentes renderizados no Storybook como JSON compatível com Figma, com suporte a Auto Layout e variantes. Reduz o tempo de sincronização design-desenvolvimento em até 80%.

---

## 🎯 O que você ganha

| Recurso | Benefício |
|---------|-----------|
| 📤 **Exportar Componentes** | Um clique no Storybook e o componente vira JSON Figma |
| 🎨 **Variantes Preservadas** | Primary, Secondary, Large, Small → tudo vira ComponentSet |
| 📐 **Layout Automático** | Flexbox, gaps, padding → Figma Auto Layout |
| 🔄 **Sync Design-Dev** | Sempre sincronizados sem trabalho manual |
| 🔒 **Seguro** | Kill-switch e logs estruturados para produção |

---

## 🚀 Início Rápido (5 minutos)

### Para usar em seu projeto com Storybook

```bash
# 1. Instale o addon
pnpm add -D @figma-sync-engine/storybook-addon-export

# 2. Configure em .storybook/main.js
export default {
  addons: [
    '@storybook/addon-essentials',
    '@figma-sync-engine/storybook-addon-export', // ← adicione isso
  ],
};

# 3. Inicie o Storybook
pnpm storybook
```

**Pronto!** Um painel "Export to Figma" aparece no seu Storybook.

➡️ **Guia detalhado**: Ver [`docs/INSTALACAO_STORYBOOK_ADDON.md`](docs/INSTALACAO_STORYBOOK_ADDON.md) para IAs/assistentes técnicos.

---

## 📚 Como Usar

### 1️⃣ No Storybook
```typescript
// Button.stories.ts
export const Primary = { args: { label: 'Click me', variant: 'primary' } };
export const Secondary = { args: { label: 'Click me', variant: 'secondary' } };
```

### 2️⃣ Exportar
1. Abra http://localhost:6006
2. Clique em um componente
3. Painel "Export to Figma" aparece (lado direito)
4. Marque histórias desejadas
5. Clique "Export" (JSON copiado)

### 3️⃣ Importar no Figma
1. Abra seu arquivo Figma
2. Plugins → Development → figma-sync-engine
3. Cole o JSON
4. ComponentSet é criado com variantes

### 4️⃣ Usar no Design
- Arraste o componente para o canvas
- Selecione variantes nas propriedades
- Layout preservado automaticamente ✨

---

## 📦 Pacotes

| Pacote | Descrição |
|--------|-----------|
| **storybook-addon-export** | Painel Storybook com botão "Export to Figma" |
| **html-to-figma-core** | Conversor HTML → JSON Figma |
| **autolayout-interpreter** | Processa CSS e aplica Auto Layout Figma |
| **figma-plugin-lite** | Plugin Figma para importar JSON |

---

## ⚙️ Desenvolvimento

### Scripts (raiz)
```bash
pnpm install       # instala dependências
pnpm dev           # todos os pacotes em modo watch
pnpm build         # compila todos
pnpm test          # roda 286 testes (100% passando)
pnpm lint          # verifica código
pnpm audit         # scan de vulnerabilidades
```

### Testar localmente
```bash
cd examples/react-button
pnpm storybook
# Abre http://localhost:6006 com addon funcionando
```

### Performance
```bash
node scripts/benchmark.ts
# Testa velocidade de conversão HTML → Figma
```

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie `.env.local` na raiz:

```bash
# Kill-switch (desabilita exportação se necessário)
VITE_FIGMA_EXPORT_ENABLED=true

# Nível de log (debug | info | warn | error)
VITE_LOG_LEVEL=info
```

---

## 📋 Status do Projeto

✅ **10/10 Issues Resolvidas**
- 5 Features Implementadas (Variantes, Export, Auto Layout)
- 5 MVPs Completos (Addon, Plugin, Conversor)

✅ **286 Testes Passando** (100%)
- autolayout-interpreter: 60 testes
- html-to-figma-core: 40 testes
- storybook-addon-export: 186 testes

✅ **Pronto para Produção**
- CI/CD via GitHub Actions
- Code coverage completo
- Documentação detalhada

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [`docs/INSTALACAO_STORYBOOK_ADDON.md`](docs/INSTALACAO_STORYBOOK_ADDON.md) | Guia para IAs: instalar addon em outro projeto |
| [`docs/architecture.md`](docs/architecture.md) | Visão técnica da arquitetura (Clean Layers) |
| [`docs/autolayout-engine.md`](docs/autolayout-engine.md) | Como funciona o interpretador de Auto Layout |
| [`docs/figma-json-format.md`](docs/figma-json-format.md) | Especificação do formato JSON Figma |
| [`docs/automation-policy.md`](docs/automation-policy.md) | Policies de automação e guardrails |

---

## 🔐 Segurança

- **Kill-switch** (`VITE_FIGMA_EXPORT_ENABLED`): Desabilita exportação temporariamente
- **Logs estruturados**: Sem PII, configurável por nível
- **Testes de segurança**: 33 testes de vulnerabilidades
- **Dependency audit**: `pnpm audit` antes de releases

---

## 🤝 Contribuição

Pull requests são bem-vindos! Abra issues para:
- Novas variantes de componentes
- Melhorias de performance
- Suporte a novos tipos de layout
- Feedback e ideias

---

## 📄 Licença

MIT – ver [`LICENSE`](LICENSE).

---

## 🎯 Próximos Passos

1. **Instalar em seu projeto**: Siga [`docs/INSTALACAO_STORYBOOK_ADDON.md`](docs/INSTALACAO_STORYBOOK_ADDON.md)
2. **Ver exemplo**: `pnpm storybook` em `examples/react-button`
3. **Integrar com Figma**: Copie JSON do Storybook → importe no plugin Figma
4. **Contribuir**: Abra PRs melhorias ou reporte bugs

---

**Transforme Storybook em fonte única de verdade para design e desenvolvimento.** 🚀
