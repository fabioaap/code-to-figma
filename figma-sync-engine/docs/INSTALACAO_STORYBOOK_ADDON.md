# 🤖 Guia: Instalar figma-sync-engine Addon no Storybook

**Este documento é para IAs/Assistentes Técnicos que precisam instalar o addon em um projeto com Storybook já configurado.**

---

## 📋 Pré-requisitos

- [ ] Projeto com **Storybook 8.0+** já instalado e funcionando
- [ ] **pnpm** instalado (ou npm/yarn)
- [ ] Acesso ao repositório `https://github.com/fabioaap/code-to-figma`

---

## 🎯 Objetivo

Adicionar um painel "Export to Figma" no Storybook que permite exportar componentes como JSON compatível com Figma.

---

## ✅ Passo 1: Instalar a Dependência

### Opção A: Via npm (quando publicado)
```bash
npm install figma-sync-engine
# ou
pnpm add figma-sync-engine
```

### Opção B: Via repositório local (recomendado para agora)
```bash
# Clone o repositório em um local acessível
git clone https://github.com/fabioaap/code-to-figma.git /caminho/para/code-to-figma

# No seu projeto, instale o addon local
pnpm add --save-dev /caminho/para/code-to-figma/figma-sync-engine/packages/storybook-addon-export
```

### Opção C: Via workspace (melhor para monorepo)
Se seu projeto é um monorepo com pnpm, adicione ao `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/**'
  - '../code-to-figma/figma-sync-engine/packages/**'
```

Depois:
```bash
pnpm install
```

---

## ✅ Passo 2: Configurar o Addon no Storybook

Edite ou crie o arquivo **`.storybook/main.js`** (ou `main.ts`):

```javascript
// .storybook/main.js
export default {
  stories: ['../src/**/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@figma-sync-engine/storybook-addon-export', // ← ADICIONAR ESTA LINHA
  ],
  framework: '@storybook/react',
  docs: {
    autodocs: 'tag',
  },
};
```

---

## ✅ Passo 3: Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Kill-switch de segurança (desabilita exportação se necessário)
VITE_FIGMA_EXPORT_ENABLED=true

# Nível de log (debug | info | warn | error)
VITE_LOG_LEVEL=info
```

---

## ✅ Passo 4: Testar a Instalação

```bash
# Inicie o Storybook
pnpm storybook
# ou
npm run storybook
```

Abra http://localhost:6006 e:

1. Clique em qualquer história na barra lateral
2. No painel direito, deve aparecer uma aba **"Export to Figma"** (ou similar)
3. Selecione histórias para exportar
4. Clique em **"Export"**
5. Um JSON é copiado para a área de transferência

✅ **Se viu a aba e conseguiu copiar o JSON, está funcionando!**

---

## 🔧 Troubleshooting

### Problema: Addon não aparece no Storybook

**Solução:**
```bash
# Limpe cache e reinstale
rm -rf node_modules .storybook/.cache
pnpm install
pnpm storybook
```

### Problema: Erro de compilação TypeScript

**Solução:**
```bash
# Atualize tipos
pnpm add -D @types/node @types/react
```

### Problema: JSON não é copiado

**Solução:**
1. Verifique se pelo menos uma história foi selecionada
2. Verifique no console do navegador (F12) se há erros
3. Tente em outro navegador

### Problema: "Cannot find module '@figma-sync-engine/storybook-addon-export'"

**Solução:**
```bash
# Verifique se foi instalado corretamente
pnpm list | grep figma-sync-engine

# Se não encontrar, reinstale
pnpm add --save-dev /caminho/para/code-to-figma/figma-sync-engine/packages/storybook-addon-export
```

---

## 📦 O que foi instalado?

Após a instalação, seu projeto tem acesso a:

| Pacote | O que faz |
|--------|----------|
| `@figma-sync-engine/storybook-addon-export` | Addon do Storybook com painel de exportação |
| `@figma-sync-engine/html-to-figma-core` | Conversor HTML → JSON Figma |
| `@figma-sync-engine/autolayout-interpreter` | Processa CSS e aplica Auto Layout |

---

## 🚀 Próximos Passos

Após instalar o addon:

1. **Exportar componentes:**
   - Abra o Storybook
   - Clique no painel "Export to Figma"
   - Selecione histórias
   - Clique "Export" (JSON copiado)

2. **Importar no Figma:**
   - Abra seu arquivo Figma
   - Plugins → Development → figma-sync-engine
   - Cole o JSON
   - Clique "Import"
   - ComponentSet é criado automaticamente

3. **Usar no design:**
   - Arraste o componente para o canvas
   - Selecione variantes nas propriedades
   - Layout é preservado automaticamente

---

## 📝 Exemplo de Configuração Completa

**.storybook/main.js**
```javascript
export default {
  stories: ['../src/**/*.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@figma-sync-engine/storybook-addon-export',
  ],
  framework: '@storybook/react',
  docs: { autodocs: 'tag' },
};
```

**.env.local**
```
VITE_FIGMA_EXPORT_ENABLED=true
VITE_LOG_LEVEL=info
```

**package.json**
```json
{
  "devDependencies": {
    "@figma-sync-engine/storybook-addon-export": "^0.1.0",
    "@storybook/react": "^8.0.0",
    "@storybook/addon-essentials": "^8.0.0"
  }
}
```

---

## ✅ Checklist de Instalação

- [ ] Dependência instalada
- [ ] Addon adicionado em `.storybook/main.js`
- [ ] Variáveis de ambiente configuradas (opcional)
- [ ] Storybook iniciado (`pnpm storybook`)
- [ ] Painel "Export to Figma" aparece
- [ ] Consegue copiar JSON
- [ ] Teste: Abrir um arquivo Figma e importar o JSON

---

## 📞 Suporte

Se tiver problemas:

1. Verifique a documentação em `docs/` do repositório
2. Abra uma issue em https://github.com/fabioaap/code-to-figma/issues
3. Consulte a seção "Como Usar" do README.md

---

**Pronto! O addon está instalado e funcionando. Agora basta usar! 🎉**
