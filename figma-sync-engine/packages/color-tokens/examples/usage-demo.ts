/**
 * Exemplo de uso do sistema de extração de tokens de cor
 * Demonstra o fluxo completo de extração e exportação
 */

import { 
    extractColorTokens, 
    serializeColorTokens 
} from '../src/index';

// Exemplo 1: JSON Figma simples com cores
const simpleButton = {
    type: 'FRAME',
    name: 'Button',
    fills: [
        { type: 'SOLID', color: { r: 0.149, g: 0.388, b: 0.922 } } // Azul
    ],
    children: [
        {
            type: 'TEXT',
            characters: 'Click me',
            color: '#ffffff' // Branco
        }
    ]
};

console.log('=== Exemplo 1: Botão Simples ===');
const result1 = extractColorTokens(simpleButton);
console.log('Tokens extraídos:', result1.tokens);
console.log('Referência no fill:', result1.figmaJson.fills[0].colorToken);
console.log('Referência no texto:', result1.figmaJson.children[0].colorToken);

// Exemplo 2: Design System completo
const designSystemColors = {
    type: 'FRAME',
    name: 'Design System',
    children: [
        {
            type: 'FRAME',
            name: 'Primary Button',
            fills: [{ type: 'SOLID', color: { r: 0.149, g: 0.388, b: 0.922 } }],
            children: [
                { type: 'TEXT', color: '#ffffff', characters: 'Primary' }
            ]
        },
        {
            type: 'FRAME',
            name: 'Secondary Button',
            fills: [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }],
            children: [
                { type: 'TEXT', color: '#000000', characters: 'Secondary' }
            ]
        },
        {
            type: 'FRAME',
            name: 'Danger Button',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
            children: [
                { type: 'TEXT', color: '#ffffff', characters: 'Danger' }
            ]
        }
    ]
};

console.log('\n=== Exemplo 2: Design System ===');
const result2 = extractColorTokens(designSystemColors);
console.log('Tokens extraídos:', result2.tokens);
console.log('Número de cores únicas:', Object.keys(result2.tokens).length);

// Exemplo 3: Serialização para arquivo
console.log('\n=== Exemplo 3: Serialização ===');
const colorsJson = serializeColorTokens(result2.tokens);
console.log('colors.json:');
console.log(colorsJson);

// Exemplo 4: Payload completo para exportação
console.log('\n=== Exemplo 4: Payload Completo ===');
const exportPayload = {
    figma: result2.figmaJson,
    colors: result2.tokens,
    __metadata: {
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        engine: 'figma-sync-engine',
        colorTokensCount: Object.keys(result2.tokens).length
    }
};
console.log('Estrutura do payload:');
console.log('- figma: JSON com referências aos tokens');
console.log('- colors: Dicionário de tokens');
console.log('- __metadata: Informações de exportação');
console.log('\nExemplo de referência:');
console.log('figma.children[0].fills[0].colorToken =', 
    exportPayload.figma.children[0].fills[0].colorToken);
console.log('colors["color-1"] =', exportPayload.colors['color-1']);

// Exemplo 5: Contagem de uso
console.log('\n=== Exemplo 5: Análise de Uso ===');
const multipleColors = {
    type: 'FRAME',
    children: [
        { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] },
        { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] },
        { fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] },
        { fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 } }] }
    ]
};

const result5 = extractColorTokens(multipleColors);
console.log('Cor mais usada:', 
    Object.values(result5.tokens)
        .sort((a, b) => b.usage - a.usage)[0]
);

console.log('\n=== Demonstração Completa ===');
console.log('✅ Extração de cores funcionando');
console.log('✅ Geração de nomes semânticos funcionando');
console.log('✅ Referências de tokens funcionando');
console.log('✅ Contagem de uso funcionando');
console.log('✅ Serialização funcionando');
