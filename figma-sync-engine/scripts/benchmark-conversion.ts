/**
 * PERF-1: Script de Benchmark de Conversão HTML → Figma
 * 
 * Mede o tempo médio de conversão de HTML para JSON Figma
 * com diferentes níveis de complexidade e gera relatório detalhado.
 * 
 * Uso:
 *   pnpm tsx scripts/benchmark-conversion.ts
 *   pnpm tsx scripts/benchmark-conversion.ts --iterations=100
 *   pnpm tsx scripts/benchmark-conversion.ts --verbose
 */

interface BenchmarkResult {
    name: string;
    iterations: number;
    times: number[];
    mean: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    stdDev: number;
}

interface BenchmarkReport {
    timestamp: string;
    totalDuration: number;
    results: BenchmarkResult[];
}

/**
 * Casos de teste com diferentes níveis de complexidade
 */
const TEST_CASES = {
    simple: {
        name: 'Botão Simples',
        html: `<button style="padding: 12px 16px; background: #2563eb; color: white; border-radius: 6px; font-weight: 500;">
            Click Me
        </button>`
    },
    medium: {
        name: 'Card com Flexbox',
        html: `<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="font-size: 24px; font-weight: 700; margin: 0;">Título do Card</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #64748b; margin: 0;">
                Este é um card de exemplo com múltiplos elementos e estilos de layout flexbox.
            </p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button style="padding: 8px 16px; background: #e2e8f0; color: #1e293b; border-radius: 6px;">Cancelar</button>
                <button style="padding: 8px 16px; background: #2563eb; color: white; border-radius: 6px;">Confirmar</button>
            </div>
        </div>`
    },
    complex: {
        name: 'Layout Complexo com Aninhamento',
        html: `<div style="display: flex; flex-direction: column; gap: 24px; padding: 32px; background: #f8fafc;">
            <header style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h1 style="font-size: 32px; font-weight: 800; margin: 0;">Dashboard</h1>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span style="font-size: 14px; color: #64748b;">João Silva</span>
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563eb;"></div>
                </div>
            </header>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <span style="font-size: 14px; color: #64748b; font-weight: 500;">Total de Usuários</span>
                    <span style="font-size: 32px; font-weight: 700; color: #0f172a;">1,234</span>
                    <span style="font-size: 12px; color: #10b981;">+12% vs mês anterior</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <span style="font-size: 14px; color: #64748b; font-weight: 500;">Conversões</span>
                    <span style="font-size: 32px; font-weight: 700; color: #0f172a;">456</span>
                    <span style="font-size: 12px; color: #ef4444;">-3% vs mês anterior</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <span style="font-size: 14px; color: #64748b; font-weight: 500;">Receita</span>
                    <span style="font-size: 32px; font-weight: 700; color: #0f172a;">R$ 78,9k</span>
                    <span style="font-size: 12px; color: #10b981;">+8% vs mês anterior</span>
                </div>
            </div>
            <div style="display: flex; gap: 16px;">
                <div style="flex: 2; display: flex; flex-direction: column; gap: 16px; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Atividade Recente</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 6px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: #dbeafe;"></div>
                            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                                <span style="font-size: 14px; font-weight: 500;">Nova conversão registrada</span>
                                <span style="font-size: 12px; color: #64748b;">há 5 minutos</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 16px; padding: 24px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Ações Rápidas</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button style="padding: 12px; background: #2563eb; color: white; border-radius: 6px; font-weight: 500; width: 100%;">Novo Relatório</button>
                        <button style="padding: 12px; background: #e2e8f0; color: #1e293b; border-radius: 6px; font-weight: 500; width: 100%;">Exportar Dados</button>
                    </div>
                </div>
            </div>
        </div>`
    }
};

/**
 * Calcula estatísticas de um array de tempos
 */
function calculateStats(times: number[]): Omit<BenchmarkResult, 'name' | 'iterations' | 'times'> {
    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / sorted.length;
    
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const p99Index = Math.ceil(sorted.length * 0.99) - 1;
    
    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        mean,
        median,
        p95: sorted[p95Index],
        p99: sorted[p99Index],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        stdDev
    };
}

/**
 * Formata tempo em millisegundos de forma legível
 */
function formatTime(ms: number): string {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Executa benchmark de conversão
 */
async function runBenchmark(
    name: string,
    html: string,
    iterations: number,
    verbose: boolean
): Promise<BenchmarkResult> {
    // Importação dinâmica - usar biblioteca diretamente
    const { htmlToFigma } = await import('@builder.io/html-to-figma');
    const { applyAutoLayoutRecursive } = await import('../packages/autolayout-interpreter/src/index.js');
    
    const times: number[] = [];
    
    if (verbose) {
        console.log(`\n🔄 Executando benchmark: ${name} (${iterations} iterações)...`);
    }
    
    // Criar elemento DOM uma vez para reuso
    const container = document.createElement('div');
    container.innerHTML = html;
    const element = container.firstElementChild as HTMLElement;
    
    if (!element) {
        throw new Error('Failed to create HTML element from string');
    }
    
    // Aquecimento: rodar 5 vezes antes de medir para estabilizar JIT
    for (let i = 0; i < 5; i++) {
        document.body.appendChild(element);
        await htmlToFigma(element);
        document.body.removeChild(element);
    }
    
    // Medições reais
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        // Adicionar ao DOM para medições precisas
        document.body.appendChild(element);
        
        // Pipeline completo: HTML → JSON base → Auto Layout
        const figmaJson = await htmlToFigma(element);
        const finalJson = applyAutoLayoutRecursive(figmaJson, () => ({}));
        
        // Remover do DOM
        document.body.removeChild(element);
        
        const end = performance.now();
        const duration = end - start;
        times.push(duration);
        
        if (verbose && (i + 1) % 10 === 0) {
            process.stdout.write(`  Progresso: ${i + 1}/${iterations}\r`);
        }
    }
    
    if (verbose) {
        console.log(`  ✅ Completo: ${iterations}/${iterations}`);
    }
    
    const stats = calculateStats(times);
    
    return {
        name,
        iterations,
        times,
        ...stats
    };
}

/**
 * Gera relatório em formato markdown
 */
function generateReport(report: BenchmarkReport): string {
    const lines: string[] = [];
    
    lines.push('# Relatório de Benchmark de Conversão HTML → Figma\n');
    lines.push(`**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`);
    lines.push(`**Duração Total:** ${formatTime(report.totalDuration)}\n`);
    lines.push('---\n');
    
    for (const result of report.results) {
        lines.push(`## ${result.name}\n`);
        lines.push(`**Iterações:** ${result.iterations}\n`);
        lines.push('### Métricas de Tempo\n');
        lines.push('| Métrica | Valor |');
        lines.push('|---------|-------|');
        lines.push(`| Média | ${formatTime(result.mean)} |`);
        lines.push(`| Mediana | ${formatTime(result.median)} |`);
        lines.push(`| P95 | ${formatTime(result.p95)} |`);
        lines.push(`| P99 | ${formatTime(result.p99)} |`);
        lines.push(`| Mínimo | ${formatTime(result.min)} |`);
        lines.push(`| Máximo | ${formatTime(result.max)} |`);
        lines.push(`| Desvio Padrão | ${formatTime(result.stdDev)} |`);
        lines.push('');
    }
    
    lines.push('\n---\n');
    lines.push('## Resumo Comparativo\n');
    lines.push('| Caso de Teste | Média | Mediana | P95 |');
    lines.push('|---------------|-------|---------|-----|');
    for (const result of report.results) {
        lines.push(`| ${result.name} | ${formatTime(result.mean)} | ${formatTime(result.median)} | ${formatTime(result.p95)} |`);
    }
    
    return lines.join('\n');
}

/**
 * Gera relatório em formato JSON
 */
function generateJsonReport(report: BenchmarkReport): string {
    return JSON.stringify(report, null, 2);
}

/**
 * Main: executa benchmark completo
 */
async function main() {
    // Configurar ambiente DOM usando jsdom
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    global.NodeFilter = dom.window.NodeFilter;
    global.getComputedStyle = dom.window.getComputedStyle;
    
    const args = process.argv.slice(2);
    const iterationsArg = args.find(arg => arg.startsWith('--iterations='));
    const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1]) : 50;
    const verbose = args.includes('--verbose') || args.includes('-v');
    const jsonOutput = args.includes('--json');
    
    console.log('🚀 Benchmark de Conversão HTML → Figma');
    console.log(`📊 Iterações por teste: ${iterations}`);
    console.log('');
    
    const startTime = performance.now();
    const results: BenchmarkResult[] = [];
    
    // Executar benchmarks para cada caso de teste
    for (const [key, testCase] of Object.entries(TEST_CASES)) {
        const result = await runBenchmark(testCase.name, testCase.html, iterations, verbose);
        results.push(result);
    }
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    const report: BenchmarkReport = {
        timestamp: new Date().toISOString(),
        totalDuration,
        results
    };
    
    console.log('\n' + '='.repeat(80));
    
    if (jsonOutput) {
        // Saída JSON
        console.log(generateJsonReport(report));
    } else {
        // Saída Markdown (padrão)
        console.log(generateReport(report));
    }
    
    // Salvar relatórios em arquivos
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const outputDir = path.join(process.cwd(), 'scripts', 'benchmark-results');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const mdPath = path.join(outputDir, `benchmark-${timestamp}.md`);
    const jsonPath = path.join(outputDir, `benchmark-${timestamp}.json`);
    
    await fs.writeFile(mdPath, generateReport(report));
    await fs.writeFile(jsonPath, generateJsonReport(report));
    
    console.log('\n📁 Relatórios salvos:');
    console.log(`   - ${mdPath}`);
    console.log(`   - ${jsonPath}`);
    console.log('\n✅ Benchmark concluído com sucesso!');
}

// Executar
main().catch(error => {
    console.error('❌ Erro ao executar benchmark:', error);
    process.exit(1);
});
