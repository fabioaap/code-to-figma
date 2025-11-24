/**
 * PERF-1: Script de Benchmark para conversão HTML → Figma JSON
 * Mede performance do sistema de conversão end-to-end
 */

import { convertHtmlToFigma } from '../packages/html-to-figma-core/src/index';

interface BenchmarkResult {
    iterations: number;
    totalMs: number;
    avgMs: number;
    minMs: number;
    maxMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    stdDev: number;
}

interface BenchmarkScenario {
    name: string;
    html: string;
    iterations?: number;
}

/**
 * Executa um benchmark com múltiplas iterações
 */
async function benchmark(
    html: string,
    iterations: number = 100
): Promise<BenchmarkResult> {
    const times: number[] = [];

    // Warmup
    try {
        await convertHtmlToFigma(html);
    } catch (e) {
        // Ignora erros de warmup
    }

    // Iterações de benchmark
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        try {
            await convertHtmlToFigma(html);
        } catch (e) {
            // Continua mesmo com erros
        }
        const end = performance.now();
        times.push(end - start);
    }

    times.sort((a, b) => a - b);

    const total = times.reduce((a, b) => a + b, 0);
    const avg = total / iterations;
    const variance =
        times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / iterations;
    const stdDev = Math.sqrt(variance);

    return {
        iterations,
        totalMs: total,
        avgMs: avg,
        minMs: times[0],
        maxMs: times[iterations - 1],
        p50Ms: times[Math.floor(iterations * 0.5)],
        p95Ms: times[Math.floor(iterations * 0.95)],
        p99Ms: times[Math.floor(iterations * 0.99)],
        stdDev
    };
}

/**
 * Formata resultado do benchmark para exibição
 */
function formatResult(scenario: string, result: BenchmarkResult): string {
    return `
=== ${scenario} ===
Iterations: ${result.iterations}
Average: ${result.avgMs.toFixed(2)}ms
Median (P50): ${result.p50Ms.toFixed(2)}ms
P95: ${result.p95Ms.toFixed(2)}ms
P99: ${result.p99Ms.toFixed(2)}ms
Min: ${result.minMs.toFixed(2)}ms
Max: ${result.maxMs.toFixed(2)}ms
StdDev: ${result.stdDev.toFixed(2)}ms
Total Time: ${result.totalMs.toFixed(0)}ms
`.trim();
}

/**
 * Cenários de teste
 */
const scenarios: BenchmarkScenario[] = [
    {
        name: 'Simple Button',
        html: '<button>Click me</button>',
        iterations: 500
    },
    {
        name: 'Simple Flex Layout',
        html: '<div style="display: flex; gap: 12px;"><button>A</button><button>B</button></div>',
        iterations: 300
    },
    {
        name: 'Card with Typography',
        html: `
      <div style="padding: 16px; border-radius: 8px; background: white;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Title</h1>
        <p style="font-size: 14px; color: #666; margin: 8px 0;">Description text here</p>
        <button style="padding: 8px 16px; background: blue; color: white;">Action</button>
      </div>
    `,
        iterations: 200
    },
    {
        name: 'Complex Form',
        html: `
      <form style="display: flex; flex-direction: column; gap: 16px; width: 300px;">
        <div>
          <label style="display: block; margin-bottom: 4px;">Name</label>
          <input type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px;">Email</label>
          <input type="email" style="width: 100%; padding: 8px; border: 1px solid #ccc;" />
        </div>
        <button type="submit" style="padding: 12px; background: blue; color: white;">Submit</button>
      </form>
    `,
        iterations: 100
    },
    {
        name: 'Grid Layout',
        html: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        ${Array(9).fill(0).map(() => '<div style="aspect-ratio: 1; background: #eee;">Item</div>').join('')}
      </div>
    `,
        iterations: 150
    }
];

/**
 * Executa todos os benchmarks
 */
async function runAllBenchmarks(): Promise<void> {
    console.log('🏃 Starting HTML → Figma Conversion Benchmarks\n');
    console.log(`Environment: Node.js ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`CPU Cores: ${require('os').cpus().length}\n`);

    const results: { scenario: string; result: BenchmarkResult }[] = [];

    for (const scenario of scenarios) {
        try {
            console.log(`Running: ${scenario.name}...`);
            const result = await benchmark(scenario.html, scenario.iterations || 100);
            results.push({ scenario: scenario.name, result });
            console.log(formatResult(scenario.name, result));
            console.log();
        } catch (error) {
            console.error(`❌ Error in ${scenario.name}:`, error);
            console.log();
        }
    }

    // Summary
    console.log('=== Summary ===');
    results.forEach(({ scenario, result }) => {
        console.log(
            `${scenario}: ${result.avgMs.toFixed(2)}ms avg (±${result.stdDev.toFixed(2)}ms)`
        );
    });

    // Performance assessment
    console.log('\n=== Performance Assessment ===');
    const allAvgs = results.map((r) => r.result.avgMs);
    const avgOfAvgs = allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length;

    if (avgOfAvgs < 10) {
        console.log('✅ Excellent: Average conversion < 10ms');
    } else if (avgOfAvgs < 50) {
        console.log('✅ Good: Average conversion < 50ms');
    } else if (avgOfAvgs < 100) {
        console.log('⚠️  Acceptable: Average conversion < 100ms');
    } else {
        console.log('❌ Poor: Average conversion > 100ms');
    }
}

// Execute
runAllBenchmarks().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
