#!/usr/bin/env node

/**
 * Script to create GitHub issues from backlog
 * 
 * Usage:
 *   export GITHUB_TOKEN=your_token_here
 *   node scripts/create-github-issues.js
 * 
 * Or with GitHub CLI:
 *   gh auth login
 *   node scripts/create-github-issues.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = 'fabioaap/code-to-figma';
const BACKLOG_ISSUES_FILE = path.join(__dirname, '../figma-sync-engine/docs/backlog-issues.json');
const TRACKER_FILE = path.join(__dirname, '../figma-sync-engine/docs/backlog-issues-tracker.md');

// Check if gh CLI is available
function hasGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if gh is authenticated
function isGHAuthenticated() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Create a single issue using gh CLI
function createIssue(title, body, labels) {
  try {
    const labelArgs = labels.map(l => `--label "${l}"`).join(' ');
    const command = `gh issue create --repo "${REPO}" --title "${title}" --body "${body}" ${labelArgs}`;
    
    const result = execSync(command, { encoding: 'utf-8' });
    const match = result.match(/https:\/\/github\.com\/[^\s]+/);
    
    if (match) {
      console.log(`✅ Created: ${title}`);
      return match[0];
    }
    
    throw new Error('Could not extract issue URL from response');
  } catch (error) {
    console.error(`❌ Failed to create issue: ${title}`);
    console.error(error.message);
    return null;
  }
}

// Format issue body in Markdown
function formatIssueBody(issue) {
  let body = `## Descrição\n${issue.description}\n\n`;
  
  body += `## Critérios de Aceite\n`;
  issue.acceptance_criteria.forEach(criterion => {
    body += `- [ ] ${criterion}\n`;
  });
  body += '\n';
  
  body += `## Prioridade\n**${issue.priority} Have**\n\n`;
  
  if (issue.dependencies && issue.dependencies.length > 0) {
    body += `## Dependências\n`;
    issue.dependencies.forEach(dep => {
      body += `- ${dep}\n`;
    });
    body += '\n';
  }
  
  body += `## Tipo\n${issue.type}\n\n`;
  body += `## Referência\nBacklog ID: ${issue.id}`;
  
  return body;
}

// Main function
async function main() {
  console.log('🚀 Creating GitHub issues from backlog...\n');
  
  // Check prerequisites
  if (!hasGitHubCLI()) {
    console.error('❌ GitHub CLI (gh) is not installed');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  if (!isGHAuthenticated()) {
    console.error('❌ Not authenticated with GitHub CLI');
    console.error('Run: gh auth login');
    process.exit(1);
  }
  
  // Load backlog issues
  const backlogData = JSON.parse(fs.readFileSync(BACKLOG_ISSUES_FILE, 'utf-8'));
  
  // Initialize tracker file
  let tracker = `# Backlog Issues Tracker\n\n`;
  tracker += `This file tracks GitHub issues created from the backlog.\n\n`;
  tracker += `Last updated: ${new Date().toISOString()}\n\n`;
  tracker += `Repository: [${REPO}](https://github.com/${REPO})\n\n`;
  tracker += `---\n\n`;
  
  let totalIssues = 0;
  const epicSummary = [];
  
  // Process each epic
  for (const epic of backlogData.epics) {
    console.log(`\n=== ${epic.title} ===`);
    tracker += `## ${epic.title}\n\n`;
    
    if (epic.description) {
      tracker += `*${epic.description}*\n\n`;
    }
    
    if (epic.metrics) {
      tracker += `**Métricas:** ${epic.metrics}\n\n`;
    }
    
    let epicIssueCount = 0;
    
    // Create issues for this epic
    for (const issue of epic.issues) {
      const title = `[${issue.id}] ${issue.title}`;
      const body = formatIssueBody(issue);
      const labels = issue.labels || [];
      
      const issueUrl = createIssue(title, body, labels);
      
      if (issueUrl) {
        tracker += `- [${issue.id}] [${issue.title}](${issueUrl})\n`;
        epicIssueCount++;
        totalIssues++;
      } else {
        tracker += `- [${issue.id}] ${issue.title} - ❌ Failed to create\n`;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    tracker += `\n`;
    epicSummary.push({ epic: epic.title, count: epicIssueCount });
  }
  
  // Add summary
  tracker += `---\n\n## Resumo\n\n`;
  tracker += `Total de issues criadas: ${totalIssues}\n\n`;
  epicSummary.forEach(({ epic, count }) => {
    tracker += `- ${epic}: ${count} issues\n`;
  });
  
  // Write tracker file
  fs.writeFileSync(TRACKER_FILE, tracker);
  
  console.log(`\n✅ Process completed!`);
  console.log(`Total issues created: ${totalIssues}`);
  console.log(`Tracker file saved to: ${TRACKER_FILE}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the created issues on GitHub: https://github.com/${REPO}/issues`);
  console.log(`2. Update the backlog document with issue links`);
  console.log(`3. Create project board if needed`);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
