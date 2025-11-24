#!/usr/bin/env python3
"""
Automation script for resolving GitHub issues with dependency awareness.
Requires:
  - Python 3.10+
  - `pip install httpx python-dotenv`
Environment variables:
  GITHUB_TOKEN  -> Personal access token with repo + project access
  GITHUB_OWNER  -> Repository owner (e.g. 'fabioaap')
  GITHUB_REPO   -> Repository name (e.g. 'code-to-figma')
"""
import os
import re
import time
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import httpx

API_ROOT = "https://api.github.com"
MAX_RETRIES = 5
RETRY_BACKOFF = 2  # seconds


@dataclass
class Issue:
    number: int
    title: str
    body: str
    labels: List[str]
    state: str
    kanban_card_id: Optional[int] = None
    kanban_column_id: Optional[int] = None
    dependencies: List[int] = field(default_factory=list)
    dependents: List[int] = field(default_factory=list)


class GitHubClient:
    def __init__(self):
        token = os.environ.get("GITHUB_TOKEN")
        if not token:
            raise ValueError("GITHUB_TOKEN environment variable is required. Please set it in .env or export it.")
        
        self.owner = os.environ.get("GITHUB_OWNER")
        if not self.owner:
            raise ValueError("GITHUB_OWNER environment variable is required. Please set it in .env or export it.")
        
        self.repo = os.environ.get("GITHUB_REPO")
        if not self.repo:
            raise ValueError("GITHUB_REPO environment variable is required. Please set it in .env or export it.")
        
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        }

    def _request(self, method: str, url: str, **kwargs):
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                with httpx.Client(timeout=30) as client:
                    resp = client.request(method, url, headers=self.headers, **kwargs)
                if resp.status_code >= 500:
                    raise httpx.HTTPStatusError("Server error", request=resp.request, response=resp)
                if resp.status_code == 403 and "rate limit" in resp.text.lower():
                    time.sleep(RETRY_BACKOFF * attempt)
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as exc:
                if attempt == MAX_RETRIES:
                    raise
                time.sleep(RETRY_BACKOFF * attempt)

    def list_open_issues(self) -> List[Issue]:
        """
        List all open issues in the repository with pagination support.
        Fetches all pages until no more issues are returned.
        """
        issues = []
        page = 1
        per_page = 100
        
        while True:
            url = f"{API_ROOT}/repos/{self.owner}/{self.repo}/issues?state=open&per_page={per_page}&page={page}"
            items = self._request("GET", url)
            
            if not items:
                break  # No more issues
            
            for item in items:
                if "pull_request" in item:
                    continue  # ignore PRs in this step
                labels = [lbl["name"] for lbl in item["labels"]]
                issues.append(
                    Issue(
                        number=item["number"],
                        title=item["title"],
                        body=item.get("body") or "",
                        labels=labels,
                        state=item["state"],
                    )
                )
            
            if len(items) < per_page:
                break  # Last page
            page += 1
        
        return issues

    def find_project_items(self, project_id: int) -> Dict[int, Dict[str, int]]:
        """
        Returns map issue_number -> {"card_id": X, "column_id": Y} using project (classic) columns.
        """
        columns = self._request("GET", f"{API_ROOT}/projects/{project_id}/columns")
        mapping = {}
        for column in columns:
            cards = self._request("GET", column["cards_url"])
            for card in cards:
                if card.get("content_url") and "/issues/" in card["content_url"]:
                    # Extract issue number using URL parsing for robustness
                    try:
                        issue_number = int(card["content_url"].rstrip('/').split("/issues/")[-1].split('?')[0])
                        mapping[issue_number] = {"card_id": card["id"], "column_id": column["id"]}
                    except (ValueError, IndexError):
                        # Skip cards with malformed URLs
                        continue
        return mapping

    def move_card(self, card_id: int, column_id: int):
        self._request("POST", f"{API_ROOT}/projects/columns/cards/{card_id}/moves", json={"position": "top", "column_id": column_id})

    def close_issue(self, number: int, comment: str = ""):
        if comment:
            self._request("POST", f"{API_ROOT}/repos/{self.owner}/{self.repo}/issues/{number}/comments", json={"body": comment})
        self._request("PATCH", f"{API_ROOT}/repos/{self.owner}/{self.repo}/issues/{number}", json={"state": "closed"})

    def create_branch_and_pr(self, issue: Issue) -> int:
        """
        Placeholder stub for real implementation.
        
        This method is intentionally not implemented and will raise NotImplementedError.
        
        A real implementation would need to:
        1. Clone the repository locally
        2. Create a new branch: f"auto/issue-{issue.number}"
        3. Apply code changes (e.g., via LLM, automation tools, or manual scripts)
        4. Commit changes: git commit -m "Fix #{issue.number}: {issue.title}"
        5. Push branch to remote: git push origin auto/issue-{issue.number}
        6. Create PR via GitHub API (code below)
        
        Example GitHub API call for PR creation (only works if branch exists):
        
        payload = {
            "title": f"Automated fix for issue #{issue.number}",
            "head": f"auto/issue-{issue.number}",
            "base": "main",
            "body": f"Resolves #{issue.number}\n\nAutomated change.",
        }
        pr = self._request("POST", f"{API_ROOT}/repos/{self.owner}/{self.repo}/pulls", json=payload)
        return pr["number"]
        
        NOTE: Attempting to create a PR without the branch will result in HTTP 422 error.
        """
        raise NotImplementedError(
            "create_branch_and_pr is a stub method that must be implemented. "
            "See method docstring for implementation guidance. "
            "This method requires: git clone, branch creation, code changes, commit, push, and PR creation."
        )

    def merge_pr(self, pr_number: int):
        self._request("PUT", f"{API_ROOT}/repos/{self.owner}/{self.repo}/pulls/{pr_number}/merge", json={"merge_method": "squash"})

    def list_open_prs(self) -> List[int]:
        prs = self._request("GET", f"{API_ROOT}/repos/{self.owner}/{self.repo}/pulls?state=open")
        return [pr["number"] for pr in prs]


class DependencyResolver:
    DEP_REGEX = re.compile(r"(?:depends on|blocked by|depende de)\s*#(\d+)", re.IGNORECASE)

    def __init__(self, issues: List[Issue]):
        self.issues = {issue.number: issue for issue in issues}

    def detect(self):
        numbers = set(self.issues.keys())
        for issue in self.issues.values():
            deps = set()

            # 1) Explicit regex (body)
            for match in self.DEP_REGEX.findall(issue.body or ""):
                deps.add(int(match))

            # 2) Labels (e.g., blocked-123)
            for label in issue.labels:
                match = re.search(r"blocked(?:-by)?-(\d+)", label)
                if match:
                    deps.add(int(match.group(1)))

            # 3) Semantic heuristics (naive example)
            if "variant" in issue.title.lower():
                for candidate in numbers:
                    if "token" in self.issues[candidate].title.lower():
                        deps.add(candidate)

            issue.dependencies = sorted(dep for dep in deps if dep in numbers and dep != issue.number)
            for dep in issue.dependencies:
                self.issues[dep].dependents.append(issue.number)

    def topological_order(self) -> List[int]:
        indegree = {issue: len(self.issues[issue].dependencies) for issue in self.issues}
        queue = [num for num, deg in indegree.items() if deg == 0]
        order = []
        while queue:
            current = queue.pop(0)
            order.append(current)
            for dep in self.issues[current].dependents:
                indegree[dep] -= 1
                if indegree[dep] == 0:
                    queue.append(dep)
        if len(order) != len(self.issues):
            raise RuntimeError("Cyclic dependency detected.")
        return order


class IssueAutomation:
    def __init__(self, project_id: Optional[int] = None, done_column_id: Optional[int] = None):
        self.client = GitHubClient()
        self.project_id = project_id
        self.done_column_id = done_column_id
        self.timeline = []
        self.failures = []

    def run(self):
        issues = self.client.list_open_issues()
        if not issues:
            print("No open issues.")
            return

        if self.project_id and self.done_column_id:
            column_map = self.client.find_project_items(self.project_id)
            for issue in issues:
                if issue.number in column_map:
                    issue.kanban_card_id = column_map[issue.number]["card_id"]
                    issue.kanban_column_id = column_map[issue.number]["column_id"]

        resolver = DependencyResolver(issues)
        resolver.detect()
        order = resolver.topological_order()

        for issue_number in order:
            issue = resolver.issues[issue_number]
            try:
                print(f"Processing issue #{issue.number} - {issue.title}")
                
                # NOTE: create_branch_and_pr is a stub that raises NotImplementedError
                # In a real implementation, this would create a branch, apply changes, and create PR
                pr_number = self.client.create_branch_and_pr(issue)
                
                # NOTE: In production, you should validate PR creation and check CI status
                # before merging. This immediate merge assumes:
                # - PR was created successfully
                # - No merge conflicts exist
                # - All CI checks pass (or are not required)
                # Consider adding: wait for CI, check mergeable state, etc.
                self.client.merge_pr(pr_number)
                
                self.client.close_issue(issue.number, comment=f"Resolved automatically via PR #{pr_number} ✅")

                if self.project_id and self.done_column_id and issue.kanban_card_id:
                    self.client.move_card(issue.kanban_card_id, self.done_column_id)

                self.timeline.append(
                    {
                        "issue": issue.number,
                        "title": issue.title,
                        "pr": pr_number,
                        "status": "done",
                        "dependencies": issue.dependencies,
                    }
                )
            except Exception as exc:
                error_info = {
                    "issue": issue.number,
                    "title": issue.title,
                    "error": str(exc),
                }
                print(f"[ERROR] {error_info}")
                self.failures.append(error_info)

        self._final_checks()

    def _final_checks(self):
        open_issues = self.client.list_open_issues()
        open_prs = self.client.list_open_prs()
        checks = {
            "open_issues": len(open_issues),
            "open_prs": open_prs,
        }
        self.timeline.append({"final_checks": checks})

    def generate_report(self) -> str:
        report = ["# Execução Automatizada - Relatório Final", ""]
        report.append("## Linha do Tempo")
        for entry in self.timeline:
            if "issue" in entry:
                report.append(
                    f"- Issue #{entry['issue']} ({entry['title']}) → PR #{entry['pr']} → {entry['status']} (deps: {entry['dependencies']})"
                )
            else:
                report.append(f"- Checagens finais: {json.dumps(entry['final_checks'], indent=2)}")
        report.append("")

        if self.failures:
            report.append("## Falhas")
            for failure in self.failures:
                report.append(f"- Issue #{failure['issue']} ({failure['title']}): {failure['error']}")
        else:
            report.append("## Falhas")
            report.append("- Nenhuma falha registrada ✅")

        return "\n".join(report)


if __name__ == "__main__":
    # Load environment variables from .env if available
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass  # python-dotenv not installed, use environment variables directly
    
    # Parse optional project IDs
    project_id = None
    done_column_id = None
    
    project_id_str = os.environ.get("GITHUB_PROJECT_ID", "").strip()
    if project_id_str and project_id_str != "0":
        try:
            project_id = int(project_id_str)
        except ValueError:
            print(f"Warning: GITHUB_PROJECT_ID '{project_id_str}' is not a valid integer. Skipping GitHub Projects integration.")
    
    done_column_id_str = os.environ.get("GITHUB_DONE_COLUMN_ID", "").strip()
    if done_column_id_str and done_column_id_str != "0":
        try:
            done_column_id = int(done_column_id_str)
        except ValueError:
            print(f"Warning: GITHUB_DONE_COLUMN_ID '{done_column_id_str}' is not a valid integer. Skipping GitHub Projects integration.")
    
    automation = IssueAutomation(
        project_id=project_id,
        done_column_id=done_column_id,
    )
    automation.run()
    print(automation.generate_report())
