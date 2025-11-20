# Scripts

Este diretório contém scripts utilitários para automação de tarefas do projeto.

## 🚀 Quick Start

Para criar todas as issues do backlog no GitHub em um único comando:

```bash
./scripts/setup-backlog-issues.sh
```

Este script master irá:
1. Verificar pré-requisitos (GitHub CLI e Node.js)
2. Criar todas as labels necessárias
3. Criar todas as 42 issues do backlog
4. Gerar arquivo tracker com links das issues

---

## Fluxo Completo de Criação de Issues

Se preferir executar passo a passo:

1. **Criar labels** (uma vez): `./scripts/create-github-labels.sh`
2. **Criar issues**: `node scripts/create-github-issues.js`
3. **Acompanhar**: Veja `figma-sync-engine/docs/backlog-issues-tracker.md`

---

## setup-backlog-issues.sh

Script master que orquestra todo o processo de criação de issues.

### Uso

```bash
./scripts/setup-backlog-issues.sh
```

### Pré-requisitos

- GitHub CLI (gh) instalado e autenticado
- Node.js instalado

### O que o script faz

1. Valida que todos os pré-requisitos estão instalados
2. Executa `create-github-labels.sh` para criar labels
3. Executa `create-github-issues.js` para criar issues
4. Fornece links e próximos passos

---

## create-github-labels.sh

Script bash para criar todas as labels necessárias no repositório GitHub.

### Uso

```bash
# A partir da raiz do projeto
./scripts/create-github-labels.sh
```

### O que o script faz

Cria todas as labels necessárias para organizar as issues do backlog:

**Épicos (verde - #0E8A16):**
- epic:mvp
- epic:autolayout
- epic:variants
- epic:performance
- epic:observability
- epic:tokens
- epic:security
- epic:documentation

**Prioridades:**
- priority:must (vermelho - #B60205)
- priority:should (amarelo - #FBCA04)
- priority:could (azul - #0075CA)
- priority:wont (cinza claro - #E4E669)

**Tipos:**
- type:delivery (roxo - #5319E7)
- type:discovery (azul claro - #C5DEF5)

**Áreas (lavanda - #D4C5F9):**
- area:autolayout
- area:figma-plugin
- area:testing
- area:documentation
- area:observability
- area:feature-flags
- area:security
- area:examples

O script verifica se cada label já existe antes de criar, então é seguro executá-lo múltiplas vezes.

---

## create-github-issues.js

Script Node.js para criar issues no GitHub a partir do backlog estruturado.

### Pré-requisitos

1. **GitHub CLI (gh)** instalado e autenticado
   ```bash
   # Instalar GitHub CLI (veja https://cli.github.com/)
   # No macOS:
   brew install gh
   
   # No Linux:
   # Veja instruções em https://github.com/cli/cli/blob/trunk/docs/install_linux.md
   
   # Autenticar
   gh auth login
   ```

2. **Node.js** (já disponível no projeto)

### Uso

```bash
# A partir da raiz do projeto
node scripts/create-github-issues.js
```

### O que o script faz

1. Lê o arquivo `figma-sync-engine/docs/backlog-issues.json` contendo todos os épicos e issues estruturados
2. Para cada issue:
   - Cria uma issue no GitHub com título formatado `[ID] Título`
   - Adiciona descrição, critérios de aceite, prioridade, dependências e tipo
   - Aplica labels apropriadas (epic, prioridade, tipo, área)
3. Gera um arquivo tracker `figma-sync-engine/docs/backlog-issues-tracker.md` com:
   - Links para todas as issues criadas
   - Status de criação
   - Resumo por épico

### Estrutura dos dados

O arquivo `backlog-issues.json` contém:

```json
{
  "epics": [
    {
      "id": "EPIC-1",
      "title": "Nome do Épico",
      "description": "Descrição",
      "issues": [
        {
          "id": "XXX-1",
          "title": "Título da issue",
          "description": "Descrição detalhada",
          "acceptance_criteria": ["Critério 1", "Critério 2"],
          "priority": "Must|Should|Could|Won't",
          "type": "Delivery|Discovery",
          "dependencies": ["Dependência 1"],
          "labels": ["label1", "label2"]
        }
      ]
    }
  ]
}
```

### Labels recomendadas

Criar as seguintes labels no repositório GitHub antes de executar o script:

**Épicos:**
- `epic:mvp`
- `epic:autolayout`
- `epic:variants`
- `epic:performance`
- `epic:observability`
- `epic:tokens`
- `epic:security`
- `epic:documentation`

**Prioridades:**
- `priority:must`
- `priority:should`
- `priority:could`
- `priority:wont`

**Tipos:**
- `type:delivery`
- `type:discovery`

**Áreas:**
- `area:autolayout`
- `area:figma-plugin`
- `area:testing`
- `area:documentation`
- `area:observability`
- `area:feature-flags`
- `area:security`
- `area:examples`

### Exemplo de comando para criar labels

```bash
# Criar labels de épicos
gh label create "epic:mvp" --color "0E8A16" --description "EPIC 1: MVP Export Storybook → Figma"
gh label create "epic:autolayout" --color "0E8A16" --description "EPIC 2: Auto Layout Engine Avançado"
gh label create "epic:variants" --color "0E8A16" --description "EPIC 3: Variantes & Componentes"
gh label create "epic:performance" --color "0E8A16" --description "EPIC 4: Performance & Escalabilidade"
gh label create "epic:observability" --color "0E8A16" --description "EPIC 5: Observabilidade & Guardrails"
gh label create "epic:tokens" --color "0E8A16" --description "EPIC 6: Design Tokens"
gh label create "epic:security" --color "0E8A16" --description "EPIC 7: Segurança & Compliance"
gh label create "epic:documentation" --color "0E8A16" --description "EPIC 8: Comunidade & Documentação"

# Criar labels de prioridade
gh label create "priority:must" --color "B60205" --description "Must Have - Prioridade crítica"
gh label create "priority:should" --color "FBCA04" --description "Should Have - Prioridade alta"
gh label create "priority:could" --color "0075CA" --description "Could Have - Prioridade média"
gh label create "priority:wont" --color "D4C5F9" --description "Won't Have - Não será implementado"

# Criar labels de tipo
gh label create "type:delivery" --color "5319E7" --description "Entrega de funcionalidade"
gh label create "type:discovery" --color "C5DEF5" --description "Pesquisa e descoberta"

# Criar labels de área
gh label create "area:autolayout" --color "D4C5F9" --description "Auto Layout"
gh label create "area:figma-plugin" --color "D4C5F9" --description "Plugin Figma"
gh label create "area:testing" --color "D4C5F9" --description "Testes"
gh label create "area:documentation" --color "D4C5F9" --description "Documentação"
gh label create "area:observability" --color "D4C5F9" --description "Observabilidade"
gh label create "area:feature-flags" --color "D4C5F9" --description "Feature Flags"
gh label create "area:security" --color "D4C5F9" --description "Segurança"
gh label create "area:examples" --color "D4C5F9" --description "Exemplos"
```

### Troubleshooting

**Erro: "GitHub CLI (gh) is not installed"**
- Instale o GitHub CLI seguindo as instruções em https://cli.github.com/

**Erro: "Not authenticated with GitHub CLI"**
- Execute `gh auth login` e siga as instruções

**Erro ao criar issue: "Label does not exist"**
- Crie as labels necessárias no repositório antes de executar o script
- Use os comandos de exemplo acima

**Rate limiting**
- O script adiciona um delay de 500ms entre cada criação de issue
- Se ainda assim houver problemas, aumente o delay no código

### Output esperado

```
🚀 Creating GitHub issues from backlog...

=== MVP Export Storybook → Figma ===
✅ Created: [MVP-1] Botão 'Exportar para Figma' no painel do addon
✅ Created: [MVP-2] Captura segura do HTML da história ativa
...

✅ Process completed!
Total issues created: 42
Tracker file saved to: figma-sync-engine/docs/backlog-issues-tracker.md

Next steps:
1. Review the created issues on GitHub: https://github.com/fabioaap/code-to-figma/issues
2. Update the backlog document with issue links
3. Create project board if needed
```

## Manutenção

- Atualize `backlog-issues.json` quando o backlog mudar
- Execute o script novamente para criar novas issues (issues existentes não serão duplicadas se você usar IDs únicos)
- Mantenha o `backlog-issues-tracker.md` sincronizado com o estado atual das issues
