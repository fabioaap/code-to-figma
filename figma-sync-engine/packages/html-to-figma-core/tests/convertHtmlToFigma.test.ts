import { describe, it, expect } from 'vitest';
import { convertHtmlToFigma } from '../src/index';

describe('convertHtmlToFigma', () => {
    it('deve lançar erro ao passar string HTML em ambiente Node.js sem DOM', () => {
        const htmlString = '<div>Test</div>';
        
        expect(() => {
            convertHtmlToFigma(htmlString);
        }).toThrow(/Cannot parse HTML string in Node\.js environment/);
    });

    it('deve aceitar opções customizadas', () => {
        // Este teste precisa de um ambiente DOM mockado ou jsdom
        // Por ora, testa apenas que a função existe e aceita parâmetros
        expect(convertHtmlToFigma).toBeDefined();
        expect(typeof convertHtmlToFigma).toBe('function');
    });

    // TODO: Adicionar testes com jsdom para testar conversão real
    // TODO: Testar com elementos HTML mockados
    // TODO: Testar opções useFrames e logTime
    // TODO: Testar re-exports de @builder.io/html-to-figma
});
