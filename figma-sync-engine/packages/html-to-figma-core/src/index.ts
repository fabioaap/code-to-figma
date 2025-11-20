// Re-export principal da lib original com espaço para extensões.
export * from '@builder.io/html-to-figma';

// Placeholder para hook futuro de pós-processamento.
export function convertHtmlToFigma(html: string) {
    // No futuro: chamar parser, aplicar extensões.
    return { rawHtml: html, note: 'Extensão pendente' };
}
