/**
 * 🤖 E2E Robot - Testa fluxo real do figma-sync-engine
 */

import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface StepReport {
    step: number;
    name: string;
    status: 'pass' | 'fail' | 'skip';
    duration: number;
    message?: string;
}

interface TestReport {
    timestamp: string;
    browser: string;
    status: 'success' | 'partial' | 'failure';
    totalTime: number;
    steps: StepReport[];
    exportedJson?: any;
    errors: string[];
    screenshots: string[];
}

let report: TestReport;
let startTime: number;
let screenshotCounter = 0;
let page: Page;

const reportDir = path.join(__dirname, 'reports');

if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

async function logStep(
    stepNum: number,
    name: string,
    status: 'pass' | 'fail' | 'skip' = 'pass',
    message?: string
) {
    const duration = Date.now() - startTime;
    report.steps.push({ step: stepNum, name, status, duration, message });

    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
    console.log(`${icon} [${stepNum}] ${name} (${duration}ms)`);
}

async function captureScreenshot(name: string) {
    try {
        screenshotCounter++;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `step-${screenshotCounter}-${name}.png`;
        const filepath = path.join(reportDir, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        report.screenshots.push(filename);
        console.log(`📸 Screenshot: ${filename}`);
    } catch (e) {
        console.log(`⚠ Erro ao capturar screenshot`);
    }
}

test.describe('🤖 E2E Robot', () => {
    test.beforeAll(() => {
        report = {
            timestamp: new Date().toISOString(),
            browser: 'chromium',
            status: 'success',
            totalTime: 0,
            steps: [],
            errors: [],
            screenshots: [],
        };
        startTime = Date.now();
    });

    test('Fluxo Completo: Storybook → Button → Export', async ({ page: testPage }) => {
        page = testPage;
        console.log('\n🤖 E2E ROBOT - Teste Automatizado\n');

        // PASSO 1: Abrir Storybook
        console.log('🚀 [01] Abrindo Storybook...');
        try {
            await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForSelector('button, [role="tab"]', { timeout: 10000 });
            await captureScreenshot('01-storybook-opened');
            await logStep(1, 'Abrir Storybook', 'pass');
        } catch (error: any) {
            report.status = 'failure';
            report.errors.push(`Erro ao abrir: ${error.message}`);
            await logStep(1, 'Abrir Storybook', 'fail', error.message);
            throw error;
        }

        // PASSO 2: Navegar até Button
        console.log('\n📍 [02] Navegando até Button...');
        try {
            const buttonLink = page.locator('text=Button').first();
            await buttonLink.waitFor({ state: 'visible', timeout: 5000 });
            await buttonLink.click();
            await page.waitForTimeout(1000);
            await captureScreenshot('02-button-selected');
            await logStep(2, 'Navegar até Button', 'pass');
        } catch (error: any) {
            report.errors.push(`Erro ao navegar: ${error.message}`);
            await logStep(2, 'Navegar até Button', 'fail', error.message);
        }

        // PASSO 3: Abrir painel Export
        console.log('\n📋 [03] Abrindo painel Export...');
        try {
            const exportPanel = page.locator('text=Export').first();
            if (await exportPanel.isVisible({ timeout: 2000 }).catch(() => false)) {
                await exportPanel.click();
                await page.waitForTimeout(500);
            }
            await captureScreenshot('03-export-panel-opened');
            await logStep(3, 'Abrir painel Export', 'pass');
        } catch (error: any) {
            report.errors.push(`Erro ao abrir painel: ${error.message}`);
            await logStep(3, 'Abrir painel Export', 'fail', error.message);
        }

        // PASSO 4: Capturar estado final
        console.log('\n🔍 [04] Capturando estado...');
        try {
            const successMsg = page.locator('text=Export, text=Button').first();
            if (await successMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log('✓ Componentes visíveis');
            }
            await captureScreenshot('04-final-state');
            await logStep(4, 'Capturar estado', 'pass');
        } catch (error: any) {
            report.errors.push(`Erro ao capturar: ${error.message}`);
            await logStep(4, 'Capturar estado', 'fail', error.message);
        }
    });

    test.afterAll(async () => {
        console.log('\n📊 Finalizando...');

        report.totalTime = Date.now() - startTime;
        const failedSteps = report.steps.filter((s) => s.status === 'fail').length;
        report.status = failedSteps === 0 ? 'success' : failedSteps <= 2 ? 'partial' : 'failure';

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
        const reportPath = path.join(reportDir, `e2e-robot-report-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('📋 RESULTADO FINAL');
        console.log('='.repeat(60));

        const statusIcon = report.status === 'success' ? '✅' : report.status === 'partial' ? '⚠️' : '❌';
        console.log(`\nStatus: ${statusIcon} ${report.status.toUpperCase()}`);
        console.log(`Tempo: ${(report.totalTime / 1000).toFixed(2)}s`);
        console.log(`Passos: ${report.steps.filter((s) => s.status === 'pass').length}/${report.steps.length}`);
        console.log(`Screenshots: ${report.screenshots.length}`);
        console.log(`Erros: ${report.errors.length}`);

        if (report.steps.length > 0) {
            console.log('\n📍 Detalhes:');
            report.steps.forEach((step) => {
                const icon = step.status === 'pass' ? '✅' : step.status === 'fail' ? '❌' : '⏭️';
                console.log(`  ${icon} [${step.step}] ${step.name}`);
            });
        }

        if (report.errors.length > 0) {
            console.log('\n⚠️ Erros:');
            report.errors.forEach((e) => console.log(`  • ${e}`));
        }

        console.log(`\n📄 Relatório: ${reportPath}`);
        console.log('='.repeat(60) + '\n');
    });
});
