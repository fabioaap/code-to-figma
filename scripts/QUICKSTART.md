# Quick Start Guide - GitHub Issue Automation

## Overview
This script automatically resolves GitHub issues in the correct order based on their dependencies.

## Prerequisites
- Python 3.10+
- GitHub Personal Access Token with `repo` scope

## Installation (1 minute)

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env and add your GitHub token
```

## Configuration

Edit the `.env` file:

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=fabioaap
GITHUB_REPO=code-to-figma

# Optional: Leave empty if not using GitHub Projects
GITHUB_PROJECT_ID=
GITHUB_DONE_COLUMN_ID=
```

### Getting Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (and `project` if using Projects)
4. Copy the generated token to your `.env` file

## Usage

### Basic Usage (Dry Run - See What Would Happen)

Run the example to see how dependency detection works:

```bash
python3 example_dependency_detection.py
```

This will show:
- Which issues depend on which
- The execution order that would be used
- No actual changes to GitHub

### Full Automation (WARNING: Makes Real Changes!)

⚠️ **IMPORTANT**: This will create PRs, merge them, and close issues!

```bash
python3 github_issue_automation.py
```

## What the Script Does

1. **Fetches** all open issues from your repository
2. **Detects** dependencies between issues using:
   - Explicit mentions: "depends on #123", "blocked by #456"
   - Labels: "blocked-99", "blocked-by-101"
   - Semantic analysis: "variants" typically depend on "tokens"
3. **Orders** issues using topological sort (dependencies first)
4. **For each issue**:
   - Creates a branch and PR
   - Merges the PR
   - Closes the issue with a comment
   - Moves Kanban card to "Done" (if configured)
5. **Generates** a detailed report

## Example Workflow

Given these issues:
- #99: "Update typography base" (no dependencies)
- #101: "Implement token parser" (depends on #99)
- #120: "Create button variants" (depends on #101)

The script will:
1. Resolve #99 first
2. Then resolve #101 (after #99)
3. Finally resolve #120 (after #101)

## Customization

### Adding New Dependency Patterns

Edit `github_issue_automation.py`, line ~142:

```python
DEP_REGEX = re.compile(
    r"(?:depends on|blocked by|depende de|requires|needs)\s*#(\d+)", 
    re.IGNORECASE
)
```

### Adding Semantic Heuristics

Edit `github_issue_automation.py`, lines ~150-155:

```python
# Example: test issues depend on feature issues
if "test" in issue.title.lower():
    for candidate in numbers:
        if "feature" in self.issues[candidate].title.lower():
            deps.add(candidate)
```

### Implementing Real Code Generation

Replace the `create_branch_and_pr` method in `GitHubClient` class with your actual implementation (line ~110).

The current implementation is a placeholder that would need to:
1. Clone the repository
2. Create a new branch
3. Apply code changes (this is where you'd call an LLM or automation tool)
4. Commit and push changes
5. Create a PR via GitHub API

## Safety Features

- **Idempotent**: Can be run multiple times safely
- **Error Logging**: Failures are logged and don't stop other issues
- **Cycle Detection**: Aborts if circular dependencies are detected
- **Validation**: Checks for missing environment variables
- **Final Report**: Shows what happened and any failures

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"
- Make sure `.env` file exists in the scripts directory
- Check that `GITHUB_TOKEN` is set in the file
- Ensure there are no typos in variable names

### "Cyclic dependency detected"
- Review your issue dependencies
- Make sure there are no circular references (A→B→A)

### PRs are not actually created
- The `create_branch_and_pr` method is a placeholder
- You need to implement the actual code generation logic
- See "Implementing Real Code Generation" above

## Learn More

- Full documentation: `README.md`
- Example script: `example_dependency_detection.py`
- Main script: `github_issue_automation.py`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full README.md
3. Open an issue in the repository

## Security

- ✅ Never commit `.env` files (already in .gitignore)
- ✅ Keep your GitHub token secure
- ✅ Use tokens with minimal required permissions
- ✅ Review what the script will do before running it

---

**Pro Tip**: Start with `example_dependency_detection.py` to understand how dependency detection works before running the full automation!
