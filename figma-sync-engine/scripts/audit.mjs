#!/usr/bin/env node
/**
 * Security audit script for figma-sync-engine
 * Checks for vulnerabilities in dependencies and generates a report
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SEVERITY_LEVELS = ['critical', 'high', 'moderate', 'low', 'info'];
const REPORT_DIR = join(process.cwd(), 'reports');

interface AuditResult {
    timestamp: string;
    vulnerabilities: {
        critical: number;
        high: number;
        moderate: number;
        low: number;
        info: number;
        total: number;
    };
    details: any;
    passed: boolean;
}

/**
 * Run npm audit and parse results
 */
function runAudit(): AuditResult {
    console.log('🔍 Running security audit...\n');
    
    let auditOutput: string;
    let exitCode = 0;
    
    try {
        auditOutput = execSync('pnpm audit --json', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
    } catch (error: any) {
        // pnpm audit returns non-zero exit code when vulnerabilities are found
        auditOutput = error.stdout || '';
        exitCode = error.status || 0;
    }

    let auditData: any = {};
    
    try {
        // Parse JSON output from pnpm audit
        const lines = auditOutput.trim().split('\n').filter(l => l.trim());
        if (lines.length > 0) {
            auditData = JSON.parse(lines[lines.length - 1]);
        }
    } catch (e) {
        console.warn('⚠️  Could not parse audit output, running fallback check');
        // Fallback: just check if there are any critical/high vulnerabilities
        try {
            execSync('pnpm audit --audit-level=moderate', { stdio: 'inherit' });
        } catch (error) {
            exitCode = 1;
        }
    }

    const metadata = auditData.metadata || {};
    const vulnerabilities = metadata.vulnerabilities || {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
        total: 0
    };

    const result: AuditResult = {
        timestamp: new Date().toISOString(),
        vulnerabilities,
        details: auditData.advisories || {},
        passed: vulnerabilities.critical === 0 && vulnerabilities.high === 0
    };

    return result;
}

/**
 * Display audit results in console
 */
function displayResults(result: AuditResult): void {
    console.log('📊 Security Audit Results');
    console.log('========================\n');
    console.log(`Timestamp: ${result.timestamp}\n`);
    
    console.log('Vulnerabilities by severity:');
    console.log(`  🔴 Critical: ${result.vulnerabilities.critical}`);
    console.log(`  🟠 High:     ${result.vulnerabilities.high}`);
    console.log(`  🟡 Moderate: ${result.vulnerabilities.moderate}`);
    console.log(`  🟢 Low:      ${result.vulnerabilities.low}`);
    console.log(`  ℹ️  Info:     ${result.vulnerabilities.info}`);
    console.log(`  📦 Total:    ${result.vulnerabilities.total}\n`);

    if (result.passed) {
        console.log('✅ No critical or high severity vulnerabilities found!');
    } else {
        console.log('❌ Critical or high severity vulnerabilities detected!');
        console.log('   Please review and update dependencies.');
    }
}

/**
 * Generate JSON report file
 */
function generateReport(result: AuditResult): void {
    try {
        // Create reports directory if it doesn't exist
        try {
            execSync(`mkdir -p ${REPORT_DIR}`, { stdio: 'ignore' });
        } catch (e) {
            // Directory might already exist
        }

        const reportPath = join(REPORT_DIR, `security-audit-${Date.now()}.json`);
        writeFileSync(reportPath, JSON.stringify(result, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
    } catch (error) {
        console.error('⚠️  Could not write report file:', error);
    }
}

/**
 * Check for outdated dependencies
 */
function checkOutdated(): void {
    console.log('\n🔄 Checking for outdated packages...\n');
    
    try {
        execSync('pnpm outdated', { stdio: 'inherit' });
    } catch (error) {
        // pnpm outdated returns non-zero if outdated packages exist
        // This is expected behavior
    }
}

/**
 * Main execution
 */
function main(): void {
    console.log('🛡️  figma-sync-engine Security Audit');
    console.log('===================================\n');

    const result = runAudit();
    displayResults(result);
    generateReport(result);
    
    // Check for outdated packages (informational)
    if (process.argv.includes('--check-outdated')) {
        checkOutdated();
    }

    // Exit with error code if critical/high vulnerabilities found
    if (!result.passed) {
        console.error('\n❌ Audit failed due to critical or high severity vulnerabilities');
        process.exit(1);
    }

    console.log('\n✅ Security audit passed!');
    process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
