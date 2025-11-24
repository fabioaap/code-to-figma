# Guia Rápido de Auditoria de Segurança

## Comandos Disponíveis

### Auditoria Básica
```bash
cd figma-sync-engine
pnpm audit:security
```

### Auditoria com Correção Automática
```bash
cd figma-sync-engine
pnpm audit:security:fix
```

### Auditoria com Saída JSON
```bash
cd figma-sync-engine
pnpm audit:security:json
```

## Interpretação dos Resultados

### ✅ Sem Vulnerabilidades
```
Status: Auditoria concluída com sucesso
```
**Ação**: Nenhuma ação necessária.

### ⚠️ Dependências Desatualizadas
```
⚠ Algumas dependências estão desatualizadas
```
**Ação**: Revise a lista e atualize conforme necessário.

### ❌ Vulnerabilidades Encontradas
```
found X vulnerabilities (Y critical, Z high)
```
**Ação Imediata**:
1. Execute `pnpm audit:security:fix`
2. Teste após a correção
3. Se não resolver automaticamente, atualize manualmente

## Níveis de Severidade

| Severidade | Prazo | Ação |
|-----------|-------|------|
| 🔴 Critical | 24h | Correção imediata |
| 🟠 High | 7 dias | Correção prioritária |
| 🟡 Moderate | 30 dias | Próximo release |
| 🟢 Low | 90 dias | Quando conveniente |

## Fluxo de Trabalho Recomendado

1. **Antes de Commitar**
   ```bash
   pnpm audit:security
   ```

2. **Se Encontrar Vulnerabilidades**
   ```bash
   pnpm audit:security:fix
   pnpm test
   ```

3. **Se a Correção Automática Falhar**
   - Atualize manualmente no `package.json`
   - Execute `pnpm install`
   - Execute `pnpm test`

4. **Documente**
   - Adicione nota no commit sobre vulnerabilidades corrigidas
   - Atualize CHANGELOG.md se relevante

## Links Úteis

- 📖 [Documentação Completa](./SECURITY_AUDIT.md)
- 🔗 [GitHub Advisory Database](https://github.com/advisories)
- 🔗 [npm Security Advisories](https://www.npmjs.com/advisories)
- 🔗 [Snyk Vulnerability DB](https://snyk.io/vuln)

## Troubleshooting Rápido

### Erro de Rede
```
ERR_PNPM_AUDIT_BAD_RESPONSE
```
**Solução**: O script continuará e fornecerá outras informações úteis.

### Conflito após Correção
```
ERESOLVE unable to resolve dependency tree
```
**Solução**:
```bash
git checkout pnpm-lock.yaml
pnpm install
# Atualize dependências uma por vez
```

## Contato

Para questões de segurança críticas, abra uma issue no GitHub com a tag `security`.
