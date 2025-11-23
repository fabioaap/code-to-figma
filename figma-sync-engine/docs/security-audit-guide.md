# Auditoria de Segurança - Guia de Uso

## ⚠️ Problema Conhecido

O endpoint de auditoria do npm (`https://registry.npmjs.org/-/npm/v1/security/audits`) está atualmente bloqueado por Cloudflare (erro 400), afetando tanto `pnpm audit` quanto `npm audit` em alguns ambientes.

## 🔧 Soluções Alternativas

### Opção 1: Usar registry alternativo (Recomendado para CI/CD)

Configure um registry alternativo que não esteja bloqueado:

```bash
# Temporariamente usar outro registry
npm config set registry https://registry.npmmirror.com/
pnpm audit

# Ou usar  variável de ambiente
export npm_config_registry=https://registry.npmmirror.com/
pnpm audit
```

### Opção 2: Usar Snyk (Mais robusto)

Snyk é uma alternativa profissional para auditoria de segurança:

```bash
# Instalar Snyk CLI
npm install -g snyk

# Autenticar (requer conta gratuita)
snyk auth

# Auditar projeto
snyk test

# Monitorar continuamente
snyk monitor
```

### Opção 3: Usar GitHub Dependabot

GitHub Dependabot faz auditoria automática e cria PRs para atualizações:

1. Vá em Settings → Security → Dependabot
2. Ative "Dependabot alerts" e "Dependabot security updates"
3. As vulnerabilidades serão detectadas automaticamente

### Opção 4: Auditoria manual local

Quando o registry estiver acessível:

```bash
# Com npm
npm audit

# Com npm e correção automática
npm audit fix

# Correção forçada (cuidado)
npm audit fix --force
```

## 📦 Scripts Disponíveis

```bash
# Script principal de auditoria (tenta múltiplas abordagens)
pnpm audit

# Tentar correção automática  
pnpm audit:fix

# Correção forçada (use com cuidado)
pnpm audit:force-fix
```

## 🔍 Verificação Manual de Dependências

Você pode verificar manualmente as dependências conhecidas por vulnerabilidades:

```bash
# Listar dependências
pnpm list

# Verificar versões desatualizadas
pnpm outdated

# Atualizar dependências interativamente
pnpm update -i
```

## 📊 Relatórios

Quando a auditoria funcionar, os relatórios serão salvos em:

```
audit-reports/
├── latest.json          # Último relatório em JSON
├── latest.txt           # Último relatório legível
└── audit-YYYY-MM-DD_HH-MM-SS.json  # Histórico
```

## 🤖 Integração CI/CD

O workflow `.github/workflows/security-audit.yml` está configurado para:

- ✅ Executar semanalmente (segundas às 8h UTC)
- ✅ Executar em PRs que modificam dependências
- ✅ Gerar artifacts com relatórios
- ✅ Comentar no PR com resumo

### Configurar Registry Alternativo no CI

Adicione ao workflow antes da auditoria:

```yaml
- name: Configurar registry alternativo
  run: npm config set registry https://registry.npmmirror.com/
```

## 🛡️ Boas Práticas

1. **Revise regularmente**: Mesmo sem auditoria automática, revise dependências mensalmente
2. **Use Dependabot**: Configure no GitHub para alertas automáticos
3. **Mantenha atualizado**: Execute `pnpm update` regularmente
4. **Teste após atualizações**: Sempre rode testes após atualizar dependências
5. **Documente exceções**: Se precisar ignorar vulnerabilidades, documente o motivo

## 📝 Vulnerabilidades Conhecidas

Mantenha aqui um registro de vulnerabilidades conhecidas e seu status:

### Em Análise
- Nenhuma no momento

### Aceitas (com justificativa)
- Nenhuma no momento

### Corrigidas
- Nenhuma no momento

## 🔗 Recursos Úteis

- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [pnpm audit](https://pnpm.io/cli/audit)
- [Snyk](https://snyk.io/)
- [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)

## 📧 Reportar Vulnerabilidades

Veja [SECURITY.md](./SECURITY.md) para instruções sobre como reportar vulnerabilidades de segurança de forma responsável.
