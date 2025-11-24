# Auditoria de Segurança de Dependências

## Visão Geral

Este documento descreve o processo de auditoria de segurança das dependências do projeto figma-sync-engine e as ferramentas disponíveis para identificar e corrigir vulnerabilidades.

## Scripts Disponíveis

### 1. Auditoria Básica com pnpm

```bash
pnpm audit
```

Executa a auditoria padrão do pnpm, verificando vulnerabilidades conhecidas em todas as dependências instaladas.

### 2. Correção Automática

```bash
pnpm audit:fix
# ou
pnpm audit --fix
```

Tenta corrigir automaticamente as vulnerabilidades aplicando atualizações compatíveis das dependências afetadas.

### 3. Script de Auditoria Completa

```bash
pnpm audit:security
# ou
bash scripts/security-audit.sh
```

Executa um script completo de auditoria que inclui:
- Verificação de vulnerabilidades (pnpm audit)
- Listagem de dependências desatualizadas (pnpm outdated)
- Listagem de todas as dependências instaladas
- Verificação de licenças (se disponível)
- Resumo e recomendações

### 4. Auditoria com Correção Automática

```bash
pnpm audit:security:fix
# ou
bash scripts/security-audit.sh --fix
```

Executa a auditoria completa e tenta aplicar correções automáticas para as vulnerabilidades encontradas.

### 5. Auditoria com Saída JSON

```bash
pnpm audit:security:json
# ou
bash scripts/security-audit.sh --json
```

Gera um relatório em formato JSON que pode ser usado para processamento automatizado ou integração com outras ferramentas.

## Processo de Auditoria

### Periodicidade Recomendada

- **Diariamente**: Em ambientes de desenvolvimento ativo
- **Semanalmente**: Para projetos em manutenção
- **Antes de cada release**: Obrigatório
- **Após adicionar novas dependências**: Sempre

### Fluxo de Trabalho

1. **Identificação**
   ```bash
   pnpm audit:security
   ```
   Identifica todas as vulnerabilidades e dependências desatualizadas.

2. **Análise**
   - Revise o relatório gerado
   - Classifique as vulnerabilidades por severidade (crítica, alta, moderada, baixa)
   - Identifique dependências diretas vs. transitivas

3. **Correção**
   - Para vulnerabilidades críticas e altas:
     ```bash
     pnpm audit:security:fix
     ```
   - Para casos que não podem ser corrigidos automaticamente:
     - Atualize manualmente a dependência no package.json
     - Considere substituir a dependência se não houver correção disponível
     - Documente a decisão se optar por aceitar o risco temporariamente

4. **Validação**
   ```bash
   pnpm install
   pnpm build
   pnpm test
   ```
   Garanta que as correções não quebraram funcionalidades existentes.

5. **Documentação**
   - Registre vulnerabilidades críticas encontradas
   - Documente as correções aplicadas
   - Atualize o changelog se necessário

## Níveis de Severidade

### Crítica (Critical)
- **Ação**: Correção imediata obrigatória
- **Prazo**: 24 horas
- **Exemplos**: RCE (Remote Code Execution), SQL Injection, XSS

### Alta (High)
- **Ação**: Correção prioritária
- **Prazo**: 7 dias
- **Exemplos**: Bypass de autenticação, exposição de dados sensíveis

### Moderada (Moderate)
- **Ação**: Correção no próximo ciclo de release
- **Prazo**: 30 dias
- **Exemplos**: DoS, information disclosure

### Baixa (Low)
- **Ação**: Correção quando conveniente
- **Prazo**: 90 dias
- **Exemplos**: Vulnerabilidades que requerem condições específicas

## Integração com CI/CD

### GitHub Actions

Adicione ao seu workflow de CI/CD:

```yaml
name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Executa diariamente às 9h UTC
    - cron: '0 9 * * *'

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: cd figma-sync-engine && pnpm install
      
      - name: Run security audit
        run: cd figma-sync-engine && pnpm audit:security
        continue-on-error: true
      
      - name: Check for critical vulnerabilities
        run: |
          cd figma-sync-engine
          # Falha se houver vulnerabilidades críticas ou altas
          pnpm audit --audit-level=high || exit 1
```

## Recursos Adicionais

### Bases de Dados de Vulnerabilidades

- [GitHub Advisory Database](https://github.com/advisories)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [Snyk Vulnerability DB](https://snyk.io/vuln)
- [CVE Database](https://cve.mitre.org)

### Ferramentas Complementares

1. **Snyk**
   ```bash
   npm install -g snyk
   snyk test
   ```

2. **npm-audit-resolver**
   ```bash
   npm install -g npm-audit-resolver
   ```

3. **Dependabot** (GitHub)
   - Ativa automaticamente para repositórios públicos
   - Gera PRs automáticos para atualizações de segurança

## Tratamento de Exceções

### Quando Não é Possível Corrigir Imediatamente

1. **Documente a Vulnerabilidade**
   - Crie uma issue no GitHub
   - Documente o risco e o impacto
   - Estabeleça um plano de mitigação

2. **Medidas Temporárias**
   - Implemente controles compensatórios
   - Limite a exposição da funcionalidade afetada
   - Monitore logs para tentativas de exploração

3. **Revisão Periódica**
   - Verifique semanalmente se há correções disponíveis
   - Reavalie o risco periodicamente

## Boas Práticas

1. **Minimize Dependências**
   - Evite adicionar dependências desnecessárias
   - Prefira bibliotecas bem mantidas e populares

2. **Atualizações Regulares**
   - Mantenha as dependências atualizadas
   - Use ranges semânticos apropriados no package.json

3. **Revisão de Código**
   - Revise mudanças em package.json e pnpm-lock.yaml
   - Entenda o impacto de novas dependências

4. **Monitoramento Contínuo**
   - Configure alertas automáticos
   - Use GitHub Dependabot ou ferramentas similares

5. **Princípio do Menor Privilégio**
   - Limite permissões de dependências
   - Use ferramentas como npm audit signatures quando disponível

## Troubleshooting

### Erro: "Audit endpoint responded with 400"

Este erro pode ocorrer devido a:
- Restrições de rede/firewall
- Problemas temporários no registro npm
- Configuração de proxy incorreta

**Solução**:
```bash
# Use o script de auditoria que trata esse cenário
pnpm audit:security

# Ou configure um proxy se necessário
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080
```

### Vulnerabilidades em Dependências Transitivas

Quando uma vulnerabilidade está em uma dependência transitiva (dependência de uma dependência):

1. Verifique se há uma versão atualizada da dependência direta
2. Use `pnpm why <pacote>` para entender a cadeia de dependências
3. Considere usar `overrides` no package.json para forçar uma versão específica:

```json
{
  "pnpm": {
    "overrides": {
      "vulnerable-package": "^2.0.0"
    }
  }
}
```

### Conflitos Após Atualizações

Se após executar `pnpm audit:fix` ocorrerem erros:

1. Reverta as mudanças: `git checkout pnpm-lock.yaml`
2. Atualize dependências uma por vez
3. Teste após cada atualização
4. Documente incompatibilidades encontradas

## Contato e Suporte

Para questões relacionadas à segurança:
- Abra uma issue no GitHub (para vulnerabilidades não críticas)
- Para vulnerabilidades críticas, siga o processo de divulgação responsável

## Histórico de Auditorias

Mantenha um registro das auditorias realizadas:

| Data | Vulnerabilidades Encontradas | Ação Tomada | Responsável |
|------|------------------------------|-------------|-------------|
| 2025-11-24 | - | Script de auditoria implementado | Equipe |

## Referências

- [pnpm audit documentation](https://pnpm.io/cli/audit)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [npm Security Best Practices](https://docs.npmjs.com/security)
