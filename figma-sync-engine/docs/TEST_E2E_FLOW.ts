/**
 * Teste de Integração E2E: Fluxo Completo
 * Storybook → Capture → Convert → AutoLayout → Export
 */

import { captureStoryHTML } from '@figma-sync-engine/storybook-addon-export';
import { convertHtmlToFigma, getConversionMetadata } from '@figma-sync-engine/html-to-figma-core';
import { applyAutoLayout } from '@figma-sync-engine/autolayout-interpreter';
import { exportToClipboard, addExportMetadata } from '@figma-sync-engine/storybook-addon-export';

/**
 * Fluxo Completo: Simula exportação de um componente
 */
async function testFullFlowE2E() {
    console.log('🚀 Iniciando teste E2E do fluxo completo...\n');

    try {
        // PASSO 1: Capturar HTML
        console.log('📝 Passo 1: Capturando HTML do Storybook...');
        const captureResult = captureStoryHTML();
        console.log(`✅ HTML capturado: ${captureResult.nodeCount} nós, ${captureResult.html.length} caracteres`);
        console.log(`   - Interativo: ${captureResult.isInteractive ? 'sim' : 'não'}`);
        console.log(`   - Scripts removidos: ${captureResult.sanitizationStats.scriptsRemoved}`);
        console.log(`   - Atributos removidos: ${captureResult.sanitizationStats.attributesRemoved}\n`);

        // PASSO 2: Converter para JSON Figma
        console.log('🔄 Passo 2: Convertendo HTML para JSON Figma...');
        let figmaJson = await convertHtmlToFigma(captureResult.html);
        console.log(`✅ JSON Figma gerado: ${JSON.stringify(figmaJson).length} caracteres`);

        const metadata = getConversionMetadata(figmaJson);
        console.log(`   - Nós na árvore: ${metadata.nodeCount}`);
        console.log(`   - Tem filhos: ${metadata.hasChildren ? 'sim' : 'não'}\n`);

        // PASSO 3: Aplicar Auto Layout
        console.log('🎨 Passo 3: Aplicando Auto Layout (CSS → Figma)...');
        const cssExample = {
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            padding: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
        };
        figmaJson = applyAutoLayout(figmaJson, cssExample);
        console.log(`✅ Auto Layout aplicado:`);
        console.log(`   - layoutMode: ${figmaJson.layoutMode}`);
        console.log(`   - itemSpacing: ${figmaJson.itemSpacing}`);
        console.log(`   - padding: ${figmaJson.paddingTop}px`);
        console.log(`   - Alinhamento primário: ${figmaJson.primaryAxisAlignItems}`);
        console.log(`   - Alinhamento secundário: ${figmaJson.counterAxisAlignItems}\n`);

        // PASSO 4: Adicionar Metadados
        console.log('📦 Passo 4: Adicionando metadados de exportação...');
        figmaJson = addExportMetadata(figmaJson, {
            storyId: 'Button--primary',
            variant: 'primary',
            component: 'Button'
        });
        console.log(`✅ Metadados adicionados:`);
        console.log(`   - Timestamp: ${figmaJson.__export.timestamp}`);
        console.log(`   - Versão: ${figmaJson.__export.version}`);
        console.log(`   - Engine: ${figmaJson.__export.engine}\n`);

        // PASSO 5: Exportar
        console.log('💾 Passo 5: Exportando para Clipboard...');
        const exportResult = await exportToClipboard(figmaJson);
        console.log(`✅ Exportado com sucesso!`);
        console.log(`   - Método: ${exportResult.method}`);
        console.log(`   - Tamanho: ${exportResult.size} bytes`);
        console.log(`   - Timestamp: ${exportResult.timestamp}`);
        console.log(`   - Mensagem: ${exportResult.message}\n`);

        // Sumário
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ TESTE E2E CONCLUÍDO COM SUCESSO!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Fluxo Completo:`);
        console.log(`   1. Captura: ${captureResult.html.length} caracteres`);
        console.log(`   2. Conversão: ${JSON.stringify(figmaJson).length} caracteres JSON`);
        console.log(`   3. Auto Layout: ${figmaJson.layoutMode} mode com ${figmaJson.itemSpacing}px gap`);
        console.log(`   4. Metadados: ${Object.keys(figmaJson.__export).length} campos`);
        console.log(`   5. Exportação: ${exportResult.size} bytes para clipboard`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            success: true,
            steps: {
                capture: captureResult,
                conversion: metadata,
                autoLayout: figmaJson,
                export: exportResult
            }
        };
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        throw error;
    }
}

// Executar teste se em ambiente de teste
if (typeof window !== 'undefined' && (window as any).__TEST_MODE__) {
    testFullFlowE2E();
}

export { testFullFlowE2E };
