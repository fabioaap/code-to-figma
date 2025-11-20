# Guia de Contribuição

Obrigado por considerar contribuir para o figma-sync-engine! Este documento fornece diretrizes e melhores práticas para contribuir com o projeto.

## Código de Conduta

Este projeto adota um Código de Conduta que esperamos que todos os participantes sigam. Por favor, seja respeitoso e construtivo em todas as interações.

## Como Contribuir

### Reportando Bugs

Antes de criar um novo issue:
- Verifique se o bug já foi reportado nas [issues existentes](https://github.com/fabioaap/code-to-figma/issues)
- Se encontrar um issue similar, adicione um comentário com informações adicionais

Ao criar um novo issue de bug, inclua:
- **Descrição clara**: O que aconteceu e o que você esperava que acontecesse
- **Passos para reproduzir**: Lista detalhada de passos para reproduzir o problema
- **Ambiente**: Versão do Storybook, versão do Node.js, sistema operacional
- **Screenshots ou logs**: Se aplicável, adicione capturas de tela ou logs de erro
- **Código de exemplo**: Se possível, forneça um exemplo mínimo reproduzível

### Sugerindo Melhorias

Para sugerir uma nova feature ou melhoria:
- Abra um issue com a tag `enhancement`
- Descreva o problema que a feature resolveria
- Explique a solução proposta e alternativas consideradas
- Adicione exemplos de uso se aplicável

### Pull Requests

1. **Fork o repositório** e crie sua branch a partir de `main`:
   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Configure o ambiente de desenvolvimento**:
   ```bash
   pnpm install
   ```

3. **Faça suas alterações** seguindo as diretrizes de código (ver abaixo)

4. **Execute os testes**:
   ```bash
   pnpm test
   ```

5. **Execute o lint**:
   ```bash
   pnpm lint
   ```

6. **Execute o build**:
   ```bash
   pnpm build
   ```

7. **Commit suas mudanças** seguindo o padrão de commits (ver abaixo)

8. **Push para seu fork** e abra um Pull Request

### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit:

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

**Tipos permitidos:**
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Mudanças de formatação (não afetam o código)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, configurações, etc.
- `perf`: Melhorias de performance

**Exemplos:**
```bash
feat(autolayout): adicionar suporte a align-items
fix(logger): corrigir sanitização de PII
docs(readme): atualizar instruções de instalação
test(autolayout): adicionar testes para justify-content
```

**IDs de tarefas do backlog:**
Quando implementando uma tarefa do backlog, inclua o ID na mensagem:
```bash
feat(autolayout): implement AL-2 - add align-items support
```

## Diretrizes de Código

### Estrutura do Monorepo

```
figma-sync-engine/
├── packages/
│   ├── html-to-figma-core/      # Conversão HTML → JSON
│   ├── autolayout-interpreter/  # Heurísticas de Auto Layout
│   ├── storybook-addon-export/  # Addon do Storybook
│   ├── figma-plugin-lite/       # Plugin do Figma
│   └── logger/                  # Logger estruturado
├── examples/
│   └── react-button/            # Exemplo de componente React
└── docs/                        # Documentação adicional
```

### Estilo de Código

- **TypeScript**: Todo o código deve ser escrito em TypeScript
- **Formatação**: Use Prettier (configuração em `.prettierrc`)
- **Linting**: Use ESLint (configuração em `.eslintrc.json`)
- **Nomenclatura**:
  - Use `camelCase` para variáveis e funções
  - Use `PascalCase` para classes e tipos
  - Use `UPPER_CASE` para constantes
  - Use nomes descritivos e em inglês no código

### Arquitetura

O projeto segue princípios de Clean Architecture:

- **Domain**: Regras de negócio e tipos centrais
- **Application**: Orquestração de casos de uso
- **Infrastructure**: Integrações externas
- **Interface**: UI e adaptadores

### Testes

- Escreva testes para toda nova funcionalidade
- Mantenha a cobertura de testes alta
- Use Vitest para testes unitários
- Nomeie testes de forma descritiva
- Organize testes em `describe` blocks lógicos

**Exemplo:**
```typescript
describe('applyAutoLayout', () => {
    describe('justify-content mapping', () => {
        it('mapeia flex-start para MIN', () => {
            // test implementation
        });
    });
});
```

### Documentação

- Documente funções públicas com JSDoc
- Mantenha o README.md atualizado
- Atualize a documentação em `docs/` quando aplicável
- Use português na documentação e comentários de código em inglês

## Processo de Review

Todos os Pull Requests passam por code review:

1. **CI deve passar**: Testes, lint e build devem ser bem-sucedidos
2. **Review de código**: Um maintainer revisará as mudanças
3. **Mudanças solicitadas**: Implemente feedbacks recebidos
4. **Aprovação**: Após aprovação, o PR será merged

### Checklist de PR

Antes de submeter um PR, verifique:

- [ ] Código compila sem erros
- [ ] Todos os testes passam
- [ ] Novos testes foram adicionados
- [ ] Lint passa sem warnings
- [ ] Documentação foi atualizada
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com `main`

## Desenvolvimento Local

### Requisitos

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone o repositório
git clone https://github.com/fabioaap/code-to-figma.git
cd code-to-figma/figma-sync-engine

# Instale as dependências
pnpm install

# Execute os testes
pnpm test

# Build todos os pacotes
pnpm build

# Execute em modo desenvolvimento
pnpm dev
```

### Estrutura de Pacotes

Cada pacote em `packages/` é independente:

```bash
# Trabalhar em um pacote específico
cd packages/autolayout-interpreter

# Executar testes apenas deste pacote
pnpm test

# Build apenas deste pacote
pnpm build
```

### Debugging

Para debugging:

1. Use `console.log` temporariamente durante desenvolvimento
2. Use o logger estruturado para logs permanentes
3. Execute testes com `--reporter=verbose` para mais detalhes

## Segurança

- **Não comite secrets**: API keys, tokens, senhas
- **Sanitize PII**: Use o logger que automaticamente remove PII
- **Dependências**: Mantenha dependências atualizadas
- **Vulnerabilidades**: Reporte vulnerabilidades de segurança privadamente

## Heurísticas de Auto Layout

Ao contribuir com heurísticas de Auto Layout:

1. Documente o mapeamento CSS → Figma em `docs/autolayout-engine.md`
2. Adicione testes para o novo mapeamento
3. Considere casos extremos (edge cases)
4. Verifique compatibilidade com Figma API
5. Adicione exemplos de uso

## Referências

- [Backlog do Projeto](./docs/backlog.md)
- [Arquitetura](./docs/architecture.md)
- [Auto Layout Engine](./docs/autolayout-engine.md)
- [Formato JSON Figma](./docs/figma-json-format.md)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Storybook Addons](https://storybook.js.org/docs/react/addons/introduction)

## Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra um issue com a tag `question`
- Verifique issues existentes com a tag `help wanted`
- Consulte a documentação em `docs/`

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT do projeto.

---

**Obrigado por contribuir para o figma-sync-engine!** 🎉
