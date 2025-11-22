# Scripts Directory

Este diretório contém scripts utilitários para o monorepo figma-sync-engine.

## Disponível

### `health-check.sh`

Script completo de validação de saúde do repositório.

**Uso:**
```bash
# Na raiz do figma-sync-engine/
pnpm health-check
# ou
pnpm validate
# ou diretamente
./scripts/health-check.sh
```

**O que faz:**
- Verifica ambiente (Node, npm, pnpm)
- Valida dependências
- Executa lint
- Executa build
- Executa testes
- Verifica segurança (audit)
- Valida estrutura do monorepo
- Gera relatório visual completo

**Documentação completa:** Ver `docs/health-check.md`

## Convenções

- Scripts devem ser executáveis (`chmod +x`)
- Usar bash como shell padrão (`#!/bin/bash`)
- Incluir descrição no cabeçalho
- Usar `set -e` para falhar em erros
- Fornecer output claro e colorido quando apropriado
- Retornar exit codes apropriados (0 = sucesso, 1+ = erro)

## Adicionando Novos Scripts

1. Crie o script em `scripts/`
2. Torne executável: `chmod +x scripts/seu-script.sh`
3. Adicione entry no `package.json` se aplicável
4. Documente neste README
5. Adicione documentação detalhada em `docs/` se necessário
