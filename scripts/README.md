# GitHub Issue Automation Script

## Visão Geral

Script de automação Python para resolver issues do GitHub com suporte a detecção e resolução inteligente de dependências. O script detecta dependências entre issues através de:
- Menções explícitas no corpo da issue (regex)
- Labels especiais (blocked-XXX)
- Análise semântica (heurísticas baseadas em palavras-chave)

## Características Principais

### 1. **Cliente GitHub com Resiliência**
- Retries automáticos com backoff exponencial
- Tratamento de rate limiting
- Timeout configurável (30s)
- Suporte a HTTP 5xx e erros transitórios

### 2. **Detecção de Dependências**
- **Regex explícito**: Detecta "depends on #123", "blocked by #456", "depende de #789"
- **Labels**: Processa labels como "blocked-123" ou "blocked-by-456"
- **Heurística semântica**: Detecta dependências implícitas (ex: "variant" depende de "token")

### 3. **Ordenação Topológica**
- Garante que dependências sejam resolvidas antes dos dependentes
- Detecta ciclos e aborta com erro claro
- Mantém ordem de execução consistente

### 4. **Integração com GitHub Projects**
- Move cards automaticamente para coluna "Done"
- Suporta GitHub Projects Classic
- Opcional: funciona sem Projects configurado

### 5. **Relatório Detalhado**
- Timeline de execução completa
- Lista de dependências para cada issue
- Registro de falhas com mensagens de erro
- Checagens finais (issues e PRs abertos)

## Requisitos

- Python 3.10+
- Dependências: `httpx`, `python-dotenv`

## Instalação

```bash
cd scripts
pip install -r requirements.txt
```

## Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```bash
GITHUB_TOKEN=ghp_seu_token_aqui
GITHUB_OWNER=fabioaap
GITHUB_REPO=code-to-figma

# Opcional: GitHub Projects
GITHUB_PROJECT_ID=12345678
GITHUB_DONE_COLUMN_ID=87654321
```

### Obtendo o Token do GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione os seguintes escopos:
   - `repo` (Full control of private repositories)
   - `project` (Full control of projects) - se usar GitHub Projects
4. Copie o token gerado

### Obtendo IDs do GitHub Project (Opcional)

Se você usa GitHub Projects Classic:

```bash
# Listar projetos do repositório
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/fabioaap/code-to-figma/projects

# Listar colunas de um projeto
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/projects/PROJECT_ID/columns
```

## Uso

### Modo Básico (sem GitHub Projects)

```bash
cd scripts
python3 github_issue_automation.py
```

### Modo Completo (com GitHub Projects)

```bash
cd scripts
export GITHUB_TOKEN="seu_token"
export GITHUB_OWNER="fabioaap"
export GITHUB_REPO="code-to-figma"
export GITHUB_PROJECT_ID="12345"
export GITHUB_DONE_COLUMN_ID="67890"

python3 github_issue_automation.py
```

### Usando python-dotenv

O script automaticamente carrega variáveis do arquivo `.env`:

```bash
cd scripts
python3 github_issue_automation.py
```

## Exemplo de Entrada

Issues com dependências (JSON simplificado):

```json
[
  {
    "number": 99,
    "title": "Atualizar base de tipografia",
    "body": "Nenhuma dependência.",
    "labels": ["sprint-4"]
  },
  {
    "number": 101,
    "title": "Implementar parser de tokens",
    "body": "Depende de #99",
    "labels": ["sprint-5", "blocked-99"]
  },
  {
    "number": 120,
    "title": "Criar variantes de botão",
    "body": "Precisa dos tokens (#101) e revisão de layout.",
    "labels": ["sprint-6"]
  }
]
```

**Dependências detectadas:**
- Issue #101 depende de #99 (via regex + label)
- Issue #120 depende de #101 (via heurística semântica)

**Ordem de execução:** #99 → #101 → #120

## Exemplo de Relatório Final

```markdown
# Execução Automatizada - Relatório Final

## Linha do Tempo
- Issue #99 (Atualizar base de tipografia) → PR #210 → done (deps: [])
- Issue #101 (Implementar parser de tokens) → PR #211 → done (deps: [99])
- Issue #120 (Criar variantes de botão) → PR #212 → done (deps: [101])
- Checagens finais: {
  "open_issues": 0,
  "open_prs": []
}

## Falhas
- Nenhuma falha registrada ✅
```

## Arquitetura

### Classes Principais

#### `Issue`
Dataclass que representa uma issue do GitHub com:
- Metadados básicos (número, título, descrição, labels)
- Informações do Kanban (column_id)
- Dependências e dependentes

#### `GitHubClient`
Cliente HTTP resiliente para a API do GitHub:
- `list_open_issues()`: Lista todas as issues abertas
- `find_project_items()`: Mapeia issues para colunas do Project
- `create_branch_and_pr()`: Cria branch e PR (stub para implementação real)
- `merge_pr()`: Faz merge do PR
- `close_issue()`: Fecha issue com comentário
- `move_card()`: Move card no quadro Kanban

#### `DependencyResolver`
Detector e ordenador de dependências:
- `detect()`: Identifica dependências através de múltiplas estratégias
- `topological_order()`: Calcula ordem de execução usando algoritmo de Kahn

#### `IssueAutomation`
Orquestrador principal:
- `run()`: Executa o fluxo completo
- `generate_report()`: Gera relatório markdown

## Decisões Técnicas

### 1. HTTP Client + Retries
Usa `httpx` com retries exponenciais (até 5 tentativas) para:
- Rate limiting (HTTP 403)
- Erros de servidor (HTTP 5xx)
- Falhas transitórias de rede

### 2. Modelagem com Dataclasses
`Issue` como dataclass para:
- Type safety
- Inicialização limpa
- Redução de boilerplate

### 3. Detecção Multi-Camada de Dependências
Combina três estratégias:
1. **Regex explícito**: Busca padrões textuais conhecidos
2. **Labels estruturados**: Parse de labels como "blocked-XXX"
3. **Heurística semântica**: Análise de palavras-chave no título

### 4. Ordenação Topológica (Algoritmo de Kahn)
- Garante ordem correta de execução
- Detecta ciclos em O(V + E)
- Falha rapidamente em caso de dependências circulares

### 5. Placeholder para Implementação Real
`create_branch_and_pr()` é um stub que pode ser substituído por:
- Integração com agentes LLM para geração de código
- Scripts de transformação de código
- Ferramentas de migração automatizada

### 6. Idempotência
O script pode ser reexecutado com segurança:
- Lista apenas issues abertas
- Não duplica PRs
- Checagens finais validam estado

## Extensibilidade

### Adicionar Novos Padrões de Dependência

Edite o regex em `DependencyResolver`:

```python
DEP_REGEX = re.compile(
    r"(?:depends on|blocked by|depende de|requires)\s*#(\d+)", 
    re.IGNORECASE
)
```

### Adicionar Heurísticas Semânticas

Adicione lógica em `DependencyResolver.detect()`:

```python
# Exemplo: issues de teste dependem de features
if "test" in issue.title.lower():
    for candidate in numbers:
        if "feature" in self.issues[candidate].title.lower():
            deps.add(candidate)
```

### Implementar Geração Real de Código

Substitua `GitHubClient.create_branch_and_pr()`:

```python
def create_branch_and_pr(self, issue: Issue) -> int:
    # 1. Clone do repositório
    repo_path = git.clone(f"git@github.com:{self.owner}/{self.repo}.git")
    
    # 2. Criar branch
    branch_name = f"auto/issue-{issue.number}"
    git.checkout("-b", branch_name)
    
    # 3. Aplicar mudanças (LLM, scripts, etc)
    apply_automated_fix(issue, repo_path)
    
    # 4. Commit e push
    git.add(".")
    git.commit("-m", f"Fix #{issue.number}: {issue.title}")
    git.push("origin", branch_name)
    
    # 5. Criar PR via API
    payload = {
        "title": f"Automated fix for issue #{issue.number}",
        "head": branch_name,
        "base": "main",
        "body": f"Resolves #{issue.number}\n\nAutomated change.",
    }
    pr = self._request("POST", f"{API_ROOT}/repos/{self.owner}/{self.repo}/pulls", json=payload)
    return pr["number"]
```

## Limitações Conhecidas

1. **Stub de Criação de PR**: A função `create_branch_and_pr()` é um placeholder
2. **Limite de 100 issues**: A API retorna max 100 issues por página (pode ser paginado)
3. **Apenas GitHub Projects Classic**: Não suporta Projects V2
4. **Heurística simples**: A detecção semântica é básica e pode ser melhorada

## Troubleshooting

### Erro: "GITHUB_TOKEN not found"
Certifique-se de que o arquivo `.env` existe e contém o token válido.

### Erro: "403 Forbidden"
- Verifique se o token tem os escopos corretos
- Aguarde se atingiu o rate limit (o script tenta automaticamente)

### Erro: "Cyclic dependency detected"
Revise as dependências entre issues. Exemplo de ciclo:
- Issue #1 depende de #2
- Issue #2 depende de #1

### PRs não são criados
O método `create_branch_and_pr()` é um stub. Implemente a lógica real conforme necessário.

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-heuristica`
3. Commit suas mudanças: `git commit -m 'Adiciona heurística X'`
4. Push para a branch: `git push origin feature/nova-heuristica`
5. Abra um Pull Request

## Licença

Este script faz parte do projeto `code-to-figma` e segue a mesma licença do repositório.

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
