# Health Check & Repository Validation

## Visão Geral

O sistema de validação de saúde do repositório (`health-check`) é uma ferramenta essencial para garantir que o monorepo `figma-sync-engine` está em estado saudável e pronto para desenvolvimento, build e deploy.

## Uso

### Execução Básica

```bash
# Na raiz do monorepo (figma-sync-engine/)
pnpm health-check

# Ou usar o alias
pnpm validate
```

### Quando Executar

É recomendado executar o health check nas seguintes situações:

1. **Antes de começar a trabalhar** - Após clonar o repositório ou pull de mudanças
2. **Antes de fazer commit** - Para garantir que não está commitando código quebrado
3. **Antes de criar Pull Request** - Para validar que todas as verificações passarão no CI
4. **Após atualizar dependências** - Para confirmar que tudo continua funcionando
5. **Troubleshooting** - Para diagnosticar problemas no ambiente de desenvolvimento

## O Que é Verificado

### 1. Verificação de Ambiente

- **Node.js**: Versão instalada e disponível
- **npm**: Gerenciador de pacotes base
- **pnpm**: Gerenciador usado no monorepo (instala automaticamente se necessário via npx)

**Por que é importante**: Garante que o ambiente possui todas as ferramentas necessárias para trabalhar no projeto.

### 2. Verificação de Dependências

- Existência do diretório `node_modules`
- Integridade das dependências instaladas
- Auto-instalação se necessário (com `--frozen-lockfile`)

**Por que é importante**: Dependências faltantes ou corrompidas causam erros difíceis de debugar.

### 3. Lint Check

- Executa `turbo run lint` em todos os workspaces
- Valida estilo de código e possíveis problemas

**Por que é importante**: Código limpo e consistente facilita manutenção e colaboração.

### 4. Build Check

- Compila todos os pacotes do monorepo
- Verifica existência dos artefatos gerados (diretórios `dist/`)
- Valida dependências entre pacotes

**Por que é importante**: Build quebrado impede deploy e pode indicar problemas de código.

### 5. Test Check

- Executa todos os testes (Vitest)
- Valida comportamento esperado do código

**Por que é importante**: Testes garantem que mudanças não quebraram funcionalidades existentes.

### 6. Security Audit

- Executa `pnpm audit` para detectar vulnerabilidades conhecidas
- Reporta vulnerabilidades críticas e de alta severidade
- Fornece contagem de issues por nível

**Por que é importante**: Vulnerabilidades de segurança podem comprometer o projeto e seus usuários.

### 7. Git Status

- Verifica se há mudanças não commitadas
- Mostra branch atual
- Lista arquivos modificados (primeiros 5)

**Por que é importante**: Ajuda a manter controle sobre mudanças e evitar perda de trabalho.

### 8. Verificação de Estrutura

- Valida existência dos 4 pacotes principais
- Verifica arquivos de configuração essenciais
- Confirma integridade da estrutura do monorepo

**Por que é importante**: Estrutura do monorepo correta é fundamental para o funcionamento do Turbo e pnpm.

## Interpretando Resultados

### Símbolos de Status

- ✓ (Verde) - Check passou com sucesso
- ✗ (Vermelho) - Check falhou, requer ação
- ⚠ (Amarelo) - Aviso, pode precisar atenção
- ℹ (Azul) - Informação adicional

### Códigos de Saída

- **0** - Todos os checks passaram (pode haver warnings)
- **1** - Um ou mais checks falharam

### Exemplo de Saída Saudável

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           FIGMA SYNC ENGINE - HEALTH CHECK                   ║
║           Validação Geral do Repositório                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. VERIFICAÇÃO DE AMBIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Verificando Node.js...
✓ Node.js instalado: v20.10.0
▶ Verificando npm...
✓ npm instalado: v10.2.3
▶ Verificando pnpm...
✓ pnpm instalado: v8.15.0

[... mais checks ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DA VALIDAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estatísticas:
  Total de verificações: 15
  ✓ Passou: 15
  ✗ Falhou: 0
  ⚠ Avisos: 0
  Tempo de execução: 45s

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    ✓ SAÚDE DO REPOSITÓRIO: OK                ║
║                                                               ║
║           Todos os checks passaram com sucesso!              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

## Troubleshooting

### Problema: "pnpm não encontrado"

**Solução**: O script automaticamente usa `npx pnpm` se pnpm não estiver instalado globalmente. Para instalar globalmente:

```bash
npm install -g pnpm
```

### Problema: "Build falhou"

**Solução**:
1. Verifique logs em `/tmp/build-output.log`
2. Limpe e reinstale dependências: `rm -rf node_modules && pnpm install`
3. Execute build manualmente para ver erros detalhados: `pnpm build`

### Problema: "Lint falhou"

**Solução**:
1. Verifique logs em `/tmp/lint-output.log`
2. Execute lint com auto-fix (se disponível): `pnpm lint --fix`
3. Corrija erros manualmente conforme indicado

### Problema: "Testes falharam"

**Solução**:
1. Verifique logs em `/tmp/test-output.log`
2. Execute testes específicos: `pnpm test <nome-do-pacote>`
3. Execute com UI para debug: `pnpm test --ui` (se suportado)

### Problema: "Vulnerabilidades encontradas"

**Solução**:
1. Execute `pnpm audit` para ver detalhes
2. Execute `pnpm audit --fix` para corrigir automaticamente (quando possível)
3. Avalie se vulnerabilidades afetam o projeto e crie issues para acompanhamento

## Integração com CI/CD

O health check foi projetado para ser compatível com pipelines de CI/CD:

### Opção 1: Usar o Script Diretamente

```yaml
# Exemplo GitHub Actions
name: Health Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup PNPM
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Run Health Check
        run: |
          cd figma-sync-engine
          pnpm health-check
```

### Opção 2: Integrar com CI Existente

Se você já tem um workflow de CI (como `ci.yml`), pode adicionar o health check como um job adicional ou substituir os steps individuais:

```yaml
# Substituir steps individuais de lint, build, test por:
- name: Install Dependencies
  run: pnpm install --frozen-lockfile

- name: Run Complete Health Check
  run: pnpm health-check
```

### Benefícios no CI

- **Validação Completa**: Um único comando valida todo o projeto
- **Feedback Claro**: Output formatado facilita identificação de problemas
- **Exit Codes**: Código de saída apropriado para falhar builds quando necessário
- **Logs Preservados**: Logs salvos em `/tmp/` para análise posterior

## Customização

### Modificando o Script

O script está localizado em: `figma-sync-engine/scripts/health-check.sh`

Áreas comuns de customização:

1. **Adicionar novos checks**: Adicione seções no formato existente
2. **Ajustar severidade**: Mude `log_error` para `log_warning` para checks não-críticos
3. **Timeout de comandos**: Adicione timeouts para comandos longos
4. **Notificações**: Integre com sistemas de notificação (Slack, etc)

### Exemplo: Adicionar Check Customizado

```bash
# ============================================================================
# 9. Custom Check Example
# ============================================================================
log_header "9. VERIFICAÇÃO CUSTOMIZADA"

log_step "Executando verificação específica..."
((TOTAL_CHECKS++))

if [ condição ]; then
    log_success "Check passou"
else
    log_error "Check falhou"
    exit 1
fi
```

## Boas Práticas

1. **Execute Regularmente**: Torne o health check parte da sua rotina diária
2. **Antes de Commits**: Sempre execute antes de commits importantes
3. **Após Updates**: Execute após atualizar dependências ou ferramentas
4. **Em Onboarding**: Use para validar setup de novos desenvolvedores
5. **Documente Issues**: Se checks falharem consistentemente, documente e resolva

## Scripts Relacionados

- `pnpm build` - Apenas build
- `pnpm test` - Apenas testes
- `pnpm lint` - Apenas lint
- `pnpm health-check` - Validação completa (recomendado)

## Próximos Passos

Melhorias planejadas para o sistema de health check:

- [ ] Modo watch para desenvolvimento contínuo
- [ ] Report em formato JSON para integração
- [ ] Métricas de performance (tempo de build, cobertura de testes)
- [ ] Integração com ferramentas de observabilidade
- [ ] Validação de documentação
- [ ] Check de breaking changes entre versões

## Suporte

Para problemas ou sugestões relacionadas ao health check:

1. Verifique esta documentação
2. Consulte os logs em `/tmp/*-output.log`
3. Abra uma issue no repositório
4. Consulte a documentação de troubleshooting de cada ferramenta (Turbo, pnpm, etc)
