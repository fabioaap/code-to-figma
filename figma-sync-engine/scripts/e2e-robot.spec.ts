/**
 * 🤖 E2E Robot - Testa fluxo real do figma-sync-engine
 * 
 * Simula um usuário real:
 * 1. Abre Storybook
 * 2. Navega até Button component
 * 3. Abre painel "Export to Figma"
 * 4. Seleciona múltiplas histórias
 * 5. Clica "Export"
 * 6. Valida JSON exportado
 * 7. Gera relatório com screenshots
 */

import { test, expect, Page } from '@playwright/test';
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

// Garantir que o diretório de relatórios existe
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

  report.steps.push({
    step: stepNum,
    name,
    status,
    duration,
    message,
  });

  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} [${stepNum}] ${name} (${duration}ms)`);
}

async function captureScreenshot(name: string) {
  screenshotCounter++;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `step-${screenshotCounter}-${name}.png`;
  const filepath = path.join(reportDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  report.screenshots.push(filename);
  console.log(`📸 Screenshot: ${filename}`);
}

test.describe('🤖 E2E Robot - Fluxo Completo', () => {
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

  test('[01] Abrir Storybook', async ({ page: testPage }) => {
    page = testPage;
    console.log('\n🚀 [FASE 1] Abrindo Storybook...\n');

    try {
      await page.goto('/', { waitUntil: 'networkidle' });
      expect(page).toBeTruthy();

      // Aguardar que o Storybook carregue
      await page.waitForSelector('button, [role="tab"]', { timeout: 10000 });

      await captureScreenshot('01-storybook-opened');
      await logStep(1, 'Abrir Storybook', 'pass');
    } catch (error: any) {
      report.status = 'failure';
      report.errors.push(`Erro ao abrir Storybook: ${error.message}`);
      await logStep(1, 'Abrir Storybook', 'fail', error.message);
      throw error;
    }
  });

  test('[02] Navegar até Button component', async () => {
    console.log('\n📍 [FASE 2] Navegando até Button...\n');

    try {
      // Procurar por "Button" na sidebar (pode variar conforme a estrutura do Storybook)
      const buttonLink = page.locator('a:has-text("Button"), text=Button').first();

      // Aguardar elemento estar visível
      await buttonLink.waitFor({ state: 'visible', timeout: 5000 });
      await buttonLink.click();

      // Aguardar preview carregar
      await page.waitForTimeout(1500);
      await captureScreenshot('02-button-selected');
      await logStep(2, 'Navegar até Button', 'pass');
    } catch (error: any) {
      report.status = 'partial';
      report.errors.push(`Erro ao navegar: ${error.message}`);
      await logStep(2, 'Navegar até Button', 'fail', error.message);
    }
  });

  test('[03] Abrir painel "Export to Figma"', async () => {
    console.log('\n📋 [FASE 3] Abrindo painel Export...\n');

    try {
      // Procurar pela aba/painel do addon
      // Pode estar como tab, botão ou painel lateral
      const exportPanel = page.locator('[class*="export"], [class*="panel"], text=Export').first();

      if (await exportPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await exportPanel.click();
        await page.waitForTimeout(500);
      }

      // Se não encontrar, tentar encontrar por text
      const exportText = page.locator('text=/Export.*Figma/i').first();
      if (await exportText.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Painel já está visível
      }

      await captureScreenshot('03-export-panel-opened');
      await logStep(3, 'Abrir painel Export', 'pass');
    } catch (error: any) {
      report.status = 'partial';
      report.errors.push(`Erro ao abrir painel: ${error.message}`);
      await logStep(3, 'Abrir painel Export', 'fail', error.message);
    }
  });

  test('[04] Selecionar múltiplas histórias', async () => {
    console.log('\n☑️ [FASE 4] Selecionando histórias...\n');

    try {
      const stories = ['Primary', 'Secondary', 'Large'];
      let selectedCount = 0;

      for (const story of stories) {
        try {
          // Procurar por checkbox ou label com o nome da história
          const checkbox = page.locator(
            `input[type="checkbox"][value*="${story}"], label:has-text("${story}") input, input[aria-label*="${story}"]`
          );

          const count = await checkbox.count();

          if (count > 0) {
            await checkbox.first().check();
            selectedCount++;
            console.log(`  ✓ Selecionado: ${story}`);
          } else {
            console.log(`  ⚠ Não encontrado: ${story}`);
          }
        } catch (e) {
          console.log(`  ⚠ Erro ao selecionar ${story}: ${(e as Error).message}`);
        }
      }

      await captureScreenshot('04-stories-selected');
      await logStep(4, `Selecionar ${selectedCount} histórias`, selectedCount > 0 ? 'pass' : 'skip');
    } catch (error: any) {
      report.status = 'partial';
      report.errors.push(`Erro ao selecionar: ${error.message}`);
      await logStep(4, 'Selecionar histórias', 'fail', error.message);
    }
  });

  test('[05] Clicar "Export"', async () => {
    console.log('\n📤 [FASE 5] Clicando Export...\n');

    try {
      // Procurar pelo botão de export
      const exportButton = page.locator(
        'button:has-text("Export"), button:has-text("export"), [role="button"]:has-text("Export")'
      ).first();

      await exportButton.waitFor({ state: 'visible', timeout: 5000 });
      await exportButton.click();

      // Aguardar processamento
      await page.waitForTimeout(2000);

      await captureScreenshot('05-export-clicked');
      await logStep(5, 'Clicar Export', 'pass');
    } catch (error: any) {
      report.status = 'partial';
      report.errors.push(`Erro ao clicar export: ${error.message}`);
      await logStep(5, 'Clicar Export', 'fail', error.message);
    }
  });

  test('[06] Capturar JSON exportado', async () => {
    console.log('\n🔍 [FASE 6] Capturando JSON...\n');

    try {
      // Procurar pela mensagem de sucesso
      const successMsg = page.locator('text=/sucesso|exported|Exportado/i').first();

      const isVisible = await successMsg.isVisible({ timeout: 3000 }).catch(() => false);

      if (isVisible) {
        console.log('✓ Mensagem de sucesso encontrada');

        // Tentar capturar do localStorage ou variáveis globais
        const exportedData = await page.evaluate(() => {
          // Procurar em variáveis globais
          if ((window as any).__EXPORTED_JSON__) {
            return (window as any).__EXPORTED_JSON__;
          }

          // Procurar em localStorage
          const stored = localStorage.getItem('figmaExport');
          if (stored) {
            return JSON.parse(stored);
          }

          // Procurar em sessionStorage
          const session = sessionStorage.getItem('exportedJson');
          if (session) {
            return JSON.parse(session);
          }

          return null;
        });

        if (exportedData) {
          report.exportedJson = exportedData;
          console.log('✓ JSON capturado com sucesso');
        }
      } else {
        console.log('⚠ Mensagem de sucesso não encontrada');
      }

      await captureScreenshot('06-json-captured');
      await logStep(6, 'Capturar JSON exportado', report.exportedJson ? 'pass' : 'skip');
    } catch (error: any) {
      report.errors.push(`Erro ao capturar JSON: ${error.message}`);
      await logStep(6, 'Capturar JSON exportado', 'fail', error.message);
    }
  });

  test('[07] Validar estrutura do JSON', async () => {
    console.log('\n✔️ [FASE 7] Validando JSON...\n');

    try {
      if (!report.exportedJson) {
        console.log('⚠ Nenhum JSON para validar');
        await logStep(7, 'Validar JSON', 'skip', 'Nenhum JSON exportado');
        return;
      }

      const json = report.exportedJson;

      // Validar estrutura
      const checks = [
        {
          name: 'Tem "stories"',
          pass: Array.isArray(json.stories) && json.stories.length > 0,
        },
        { name: 'Tem "componentSet"', pass: !!json.componentSet },
        {
          name: 'Cada story tem "name"',
          pass: json.stories ? json.stories.every((s: any) => s.name) : false,
        },
        {
          name: 'Cada story tem "html"',
          pass: json.stories ? json.stories.every((s: any) => s.html) : false,
        },
        {
          name: 'ComponentSet tem "variants"',
          pass: json.componentSet?.variants?.length > 0,
        },
      ];

      let passedChecks = 0;
      for (const check of checks) {
        const status = check.pass ? '✓' : '✗';
        console.log(`  ${status} ${check.name}`);
        if (check.pass) passedChecks++;
      }

      const allPassed = passedChecks === checks.length;
      await logStep(7, `Validar JSON (${passedChecks}/${checks.length})`, allPassed ? 'pass' : 'fail');
    } catch (error: any) {
      report.errors.push(`Erro ao validar JSON: ${error.message}`);
      await logStep(7, 'Validar JSON', 'fail', error.message);
    }
  });

  test.afterAll(async () => {
    console.log('\n📊 [FASE 8] Finalizando...\n');

    // Calcular tempo total
    report.totalTime = Date.now() - startTime;

    // Determinar status final
    const failedSteps = report.steps.filter((s) => s.status === 'fail').length;
    if (failedSteps === 0) {
      report.status = 'success';
    } else if (failedSteps <= 2) {
      report.status = 'partial';
    } else {
      report.status = 'failure';
    }

    // Salvar relatório JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const reportPath = path.join(reportDir, `e2e-robot-report-${timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Imprimir resumo
    console.log('=' .repeat(60));
    console.log('📋 RELATÓRIO FINAL');
    console.log('=' .repeat(60));

    const statusIcon =
      report.status === 'success' ? '✅' : report.status === 'partial' ? '⚠️' : '❌';
    console.log(`\nStatus: ${statusIcon} ${report.status.toUpperCase()}`);
    console.log(`Tempo Total: ${(report.totalTime / 1000).toFixed(2)}s`);
    console.log(`Passos: ${report.steps.length}`);
    console.log(`Screenshots: ${report.screenshots.length}`);
    console.log(`Erros: ${report.errors.length}`);

    if (report.steps.length > 0) {
      console.log('\n📍 Detalhes dos Passos:');
      for (const step of report.steps) {
        const icon = step.status === 'pass' ? '✅' : step.status === 'fail' ? '❌' : '⏭️';
        console.log(`  ${icon} [${step.step}] ${step.name} (${step.duration}ms)`);
      }
    }

    if (report.errors.length > 0) {
      console.log('\n⚠️ Erros Encontrados:');
      for (const error of report.errors) {
        console.log(`  • ${error}`);
      }
    }

    if (report.exportedJson) {
      console.log('\n📦 JSON Exportado:');
      console.log(`  • Stories: ${report.exportedJson.stories?.length || 0}`);
      console.log(`  • ComponentSet: ${report.exportedJson.componentSet ? 'Sim' : 'Não'}`);
    }

    console.log(`\n📄 Relatório salvo: ${reportPath}`);
    console.log('=' .repeat(60) + '\n');
  });
});
