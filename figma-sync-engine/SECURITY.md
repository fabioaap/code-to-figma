# Política de Segurança

## Versões Suportadas

Este projeto está atualmente em desenvolvimento ativo. Recomendamos sempre usar a versão mais recente da branch `main`.

| Versão | Suporte          |
| ------ | ---------------- |
| main   | ✅ Suportada     |
| 0.1.x  | ✅ Suportada     |
| < 0.1  | ❌ Não suportada |

## Reportar uma Vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança neste projeto, por favor nos ajude reportando de forma responsável:

### 🔒 Como Reportar

1. **NÃO crie uma issue pública** sobre a vulnerabilidade
2. Envie um email para os mantenedores do projeto através do GitHub
3. Inclua os seguintes detalhes:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Versão afetada
   - Impacto potencial
   - Sugestões de correção (se houver)

### 📅 Processo de Resposta

- **24-48 horas**: Confirmação de recebimento
- **5-7 dias**: Avaliação inicial e classificação da severidade
- **30 dias**: Publicação da correção (quando possível)

### 🛡️ Auditoria de Segurança

Este projeto implementa auditoria automatizada de segurança:

#### Execução Local

```bash
# Auditoria completa
pnpm audit

# Tentar corrigir vulnerabilidades automaticamente
pnpm audit:fix

# Correção forçada (use com cautela)
pnpm audit:force-fix
```

#### Relatórios

Os relatórios de auditoria são salvos em `audit-reports/`:
- `latest.json` - Relatório completo em JSON
- `latest.txt` - Relatório legível em texto
- Relatórios timestamped são mantidos para histórico

#### CI/CD

A auditoria de segurança roda automaticamente:
- ✅ Semanalmente (segundas-feiras às 8h UTC)
- ✅ Em pull requests que modificam dependências
- ✅ Manualmente via workflow_dispatch

### 🔍 Vulnerabilidades Conhecidas

Mantemos um registro das vulnerabilidades conhecidas e seu status:

- Nenhuma vulnerabilidade crítica conhecida no momento

### ⚡ Correções Rápidas

Em caso de vulnerabilidade crítica descoberta:

1. A auditoria automatizada detectará na próxima execução
2. O workflow falhará e criará um artifact com o relatório
3. Notificações serão enviadas aos mantenedores
4. Correções serão priorizadas e lançadas o mais rápido possível

### 🛠️ Boas Práticas de Segurança

Este projeto segue as seguintes práticas:

- ✅ Auditoria automática de dependências
- ✅ Revisão de código obrigatória via pull requests
- ✅ Testes automatizados em CI/CD
- ✅ Uso de lockfiles (pnpm-lock.yaml)
- ✅ Princípio do menor privilégio
- ✅ Logs estruturados sem PII
- ✅ Kill-switch para funcionalidades em produção

### 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [GitHub Security Advisories](https://github.com/advisories)

### 🤝 Contribuindo com Segurança

Ao contribuir com código:

1. Execute `pnpm audit` antes de submeter PRs
2. Não adicione dependências com vulnerabilidades conhecidas
3. Revise o arquivo `CONTRIBUTING.md` para mais detalhes
4. Siga os princípios de arquitetura limpa
5. Não commite secrets ou credenciais

### 📝 Histórico de Segurança

Mantemos um changelog de segurança transparente:

#### 2024-11-23
- ✅ Implementado sistema de auditoria automatizada
- ✅ Criado workflow GitHub Actions para auditoria semanal
- ✅ Documentação de segurança estabelecida

---

**Última atualização**: 2024-11-23

Agradecemos sua colaboração em manter este projeto seguro! 🙏
