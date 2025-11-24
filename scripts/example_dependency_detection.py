#!/usr/bin/env python3
"""
Example demonstrating the GitHub Issue Automation script with mock data.
This shows how dependency detection and topological sorting work without making real API calls.
"""
from dataclasses import dataclass, field
from typing import List
import sys
import os

# Add parent directory to path to import the main script
sys.path.insert(0, os.path.dirname(__file__))
from github_issue_automation import Issue, DependencyResolver


def create_mock_issues() -> List[Issue]:
    """Create example issues as described in the problem statement."""
    return [
        Issue(
            number=99,
            title="Atualizar base de tipografia",
            body="Nenhuma dependência.",
            labels=["sprint-4"],
            state="open"
        ),
        Issue(
            number=101,
            title="Implementar parser de tokens",
            body="Depende de #99",
            labels=["sprint-5", "blocked-99"],
            state="open"
        ),
        Issue(
            number=120,
            title="Criar variantes de botão",
            body="Precisa dos tokens (#101) e revisão de layout.",
            labels=["sprint-6"],
            state="open"
        ),
    ]


def main():
    print("=" * 80)
    print("GitHub Issue Automation - Exemplo de Detecção de Dependências")
    print("=" * 80)
    print()

    # Create mock issues
    issues = create_mock_issues()
    
    print("📋 Issues Carregadas:")
    print("-" * 80)
    for issue in issues:
        print(f"  #{issue.number}: {issue.title}")
        print(f"    Body: {issue.body[:50]}...")
        print(f"    Labels: {issue.labels}")
        print()

    # Detect dependencies
    print("🔍 Detectando Dependências...")
    print("-" * 80)
    resolver = DependencyResolver(issues)
    resolver.detect()
    
    for issue_num, issue in resolver.issues.items():
        if issue.dependencies or issue.dependents:
            print(f"  Issue #{issue_num}:")
            if issue.dependencies:
                print(f"    ⬅️  Depende de: {issue.dependencies}")
            if issue.dependents:
                print(f"    ➡️  Dependentes: {issue.dependents}")
    print()

    # Calculate execution order
    print("📊 Ordem de Execução (Topológica):")
    print("-" * 80)
    try:
        order = resolver.topological_order()
        for idx, issue_num in enumerate(order, 1):
            issue = resolver.issues[issue_num]
            deps_str = f" (deps: {issue.dependencies})" if issue.dependencies else ""
            print(f"  {idx}. Issue #{issue_num}: {issue.title}{deps_str}")
        print()
        print("✅ Ordem calculada com sucesso! Nenhuma dependência circular detectada.")
    except RuntimeError as e:
        print(f"❌ Erro: {e}")
    print()

    # Summary
    print("=" * 80)
    print("📈 Resumo:")
    print("-" * 80)
    print(f"  Total de issues: {len(issues)}")
    print(f"  Issues sem dependências: {sum(1 for i in resolver.issues.values() if not i.dependencies)}")
    print(f"  Issues com dependências: {sum(1 for i in resolver.issues.values() if i.dependencies)}")
    print()
    
    print("💡 Detecção utilizada:")
    print("  ✓ Regex explícito: 'Depende de #99' na issue #101")
    print("  ✓ Label estruturado: 'blocked-99' na issue #101")
    print("  ✓ Heurística semântica: 'variantes' depende de 'tokens' (#120 → #101)")
    print()
    
    print("🎯 Fluxo esperado:")
    print("  1. Resolver issue #99 (base de tipografia)")
    print("  2. Resolver issue #101 (parser de tokens) - após #99")
    print("  3. Resolver issue #120 (variantes de botão) - após #101")
    print()
    print("=" * 80)


if __name__ == "__main__":
    main()
