# Guia de Contribuição

Obrigado pelo interesse em contribuir com o **figma-sync-engine**! Este guia ajudará você a começar.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Issues e Backlog](#issues-e-backlog)

## Como Contribuir

Existem várias formas de contribuir:

1. **Reportar bugs** - Abra uma issue com detalhes do problema
2. **Sugerir features** - Compartilhe suas ideias via issues
3. **Melhorar documentação** - Correções e adições são sempre bem-vindas
4. **Contribuir com código** - Implemente features ou corrija bugs

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+ e pnpm 8+
- Git
- Editor de código (recomendamos VS Code)

### Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/fabioaap/code-to-figma.git
cd code-to-figma/figma-sync-engine

# Instale as dependências
pnpm install

# Execute os testes para verificar que tudo está funcionando
pnpm test

# Inicie o ambiente de desenvolvimento
pnpm dev
```

### Estrutura de Branches

- `main` - Branch principal, sempre estável
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Melhorias de documentação

## Estrutura do Projeto

```
figma-sync-engine/
├── packages/
│   ├── storybook-addon-export/     # Addon do Storybook
│   ├── html-to-figma-core/         # Conversor HTML → JSON
│   ├── autolayout-interpreter/     # Processador de Auto Layout
│   └── figma-plugin-lite/          # Plugin do Figma
├── examples/
│   └── react-button/               # Exemplo de referência
├── docs/                           # Documentação
├── scripts/                        # Scripts de automação
└── pnpm-workspace.yaml            # Configuração do monorepo
```

### Pacotes Principais

- **storybook-addon-export**: Adiciona botão de exportação ao Storybook
- **html-to-figma-core**: Converte HTML renderizado em JSON do Figma
- **autolayout-interpreter**: Aplica heurísticas de Auto Layout CSS → Figma
- **figma-plugin-lite**: Importa JSON e cria nodes no canvas do Figma

## Processo de Desenvolvimento

### 1. Escolha uma Issue

Veja as [issues abertas](https://github.com/fabioaap/code-to-figma/issues) e escolha uma para trabalhar. Issues com labels `good first issue` são ótimas para começar.

### 2. Crie uma Branch

```bash
git checkout -b feature/MVP-1-export-button
```

Use o ID da issue no nome da branch quando aplicável.

### 3. Desenvolva

Faça suas alterações seguindo os [padrões de código](#padrões-de-código).

### 4. Teste

```bash
# Execute os testes
pnpm test

# Execute o linter
pnpm lint

# Execute o build para verificar
pnpm build
```

### 5. Commit

Siga o padrão de [Conventional Commits](#commits-e-pull-requests):

```bash
git commit -m "feat(autolayout): implement AL-2 align-items support"
```

### 6. Push e Pull Request

```bash
git push origin feature/MVP-1-export-button
```

Abra um Pull Request com:
- Título descritivo
- Referência à issue relacionada (ex: `Closes #42`)
- Descrição das mudanças
- Screenshots se aplicável (especialmente para UI)

## Padrões de Código

### TypeScript

- Use TypeScript em todos os novos códigos
- Prefira interfaces a types quando possível
- Exporte tipos quando forem úteis para consumers

### Naming Conventions

- **Arquivos**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Funções/Variáveis**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Tipos/Interfaces**: `PascalCase`

### Estilo de Código

Usamos Prettier e ESLint. Execute antes de commitar:

```bash
pnpm lint
pnpm format
```

### Arquitetura Limpa

Seguimos princípios de Clean Architecture:

- **Domain**: Entidades e lógica de negócio pura
- **Application**: Use cases e serviços
- **Infrastructure**: Implementações concretas
- **Interface**: UI e adaptadores

## Testes

### Executando Testes

```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Com coverage
pnpm test:coverage
```

### Escrevendo Testes

- Use Vitest para testes unitários
- Crie snapshots para validar saída JSON
- Teste casos edge e erros
- Mire em >80% de cobertura

Exemplo:

```typescript
import { describe, it, expect } from 'vitest';
import { convertHTMLToFigma } from './converter';

describe('convertHTMLToFigma', () => {
  it('should convert simple div to frame', () => {
    const html = '<div>Hello</div>';
    const result = convertHTMLToFigma(html);
    expect(result.type).toBe('FRAME');
  });
});
```

## Commits e Pull Requests

### Conventional Commits

Usamos o formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, falta de ponto-e-vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

**Scopes:**
- `autolayout`: Auto Layout interpreter
- `addon`: Storybook addon
- `plugin`: Figma plugin
- `core`: html-to-figma-core
- `docs`: Documentação
- `ci`: CI/CD

**Exemplos:**

```bash
feat(autolayout): implement AL-2 align-items support
fix(addon): resolve export button click handler
docs(readme): add installation instructions
test(core): add snapshot tests for button component
```

### Pull Request Guidelines

1. **Título**: Use o formato de Conventional Commits
2. **Descrição**:
   - O que foi mudado e por quê
   - Referência à issue (ex: `Closes #42` ou `Relates to #42`)
   - Screenshots/GIFs para mudanças visuais
   - Checklist de testes executados
3. **Revisão**: Aguarde pelo menos uma aprovação antes de merge
4. **CI**: Todos os checks devem passar

### Exemplo de PR Description

```markdown
## Descrição
Implementa suporte a `align-items` no Auto Layout interpreter (AL-2).

## Mudanças
- Adiciona parser para `align-items` CSS
- Mapeia para campos do Figma correspondentes
- Adiciona testes unitários e snapshots

## Issue
Closes #42

## Testes
- [x] Testes unitários passando
- [x] Linter sem erros
- [x] Build bem-sucedido
- [x] Testado manualmente com exemplo react-button

## Screenshots
![Antes](before.png)
![Depois](after.png)
```

## Issues e Backlog

### Backlog Estruturado

O projeto usa um [backlog estruturado](figma-sync-engine/docs/backlog.md) organizado em EPICs:

1. **MVP Export Storybook → Figma** - Fluxo básico funcional
2. **Auto Layout Engine Avançado** - Heurísticas CSS → Figma
3. **Variantes & Componentes** - Suporte a ComponentSets
4. **Performance & Escalabilidade** - Otimizações
5. **Observabilidade & Guardrails** - Logging e feature flags
6. **Design Tokens** - Extração e aplicação
7. **Segurança & Compliance** - Auditoria e conformidade
8. **Comunidade & Documentação** - Docs e exemplos

### Prioridades (MoSCoW)

- **Must Have**: Crítico para o MVP
- **Should Have**: Importante mas não crítico
- **Could Have**: Desejável se houver tempo
- **Won't Have**: Não será implementado nesta versão

### Trabalhando com Issues

1. Veja o [tracker de issues](figma-sync-engine/docs/backlog-issues-tracker.md)
2. Escolha uma issue alinhada com sua experiência
3. Comente na issue que está trabalhando nela
4. Referencie a issue nos commits (ex: `feat(core): implement MVP-3`)
5. Referencie no PR (ex: `Closes #42`)

## Dúvidas?

- Abra uma issue com a label `question`
- Entre em contato via discussões do GitHub
- Revise a [documentação existente](figma-sync-engine/docs/)

## Código de Conduta

Ao contribuir, você concorda em manter um ambiente respeitoso e inclusivo. Seja gentil, construtivo e colaborativo.

---

**Obrigado por contribuir com o figma-sync-engine! 🎉**
