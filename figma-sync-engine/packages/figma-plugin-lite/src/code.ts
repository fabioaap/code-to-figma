// MVP-6: Plugin code com suporte recursivo para criação de nós
// Recebe JSON colado e cria árvore de nós recursivamente

/**
 * Cria um nó Figma a partir de dados JSON recursivamente
 * Suporta: FRAME, TEXT, RECTANGLE
 */
function createNodeFromJson(data: any): SceneNode | null {
    if (!data || !data.type) {
        return null;
    }

    let node: SceneNode | null = null;

    try {
        switch (data.type) {
            case 'FRAME': {
                const frame = figma.createFrame();
                frame.name = data.name || 'Frame';

                // Aplicar propriedades de Auto Layout se disponíveis
                if (data.layoutMode) {
                    frame.layoutMode = data.layoutMode;
                }
                if (data.itemSpacing !== undefined) {
                    frame.itemSpacing = data.itemSpacing;
                }
                if (data.primaryAxisAlignItems) {
                    frame.primaryAxisAlignItems = data.primaryAxisAlignItems;
                }
                if (data.counterAxisAlignItems) {
                    frame.counterAxisAlignItems = data.counterAxisAlignItems;
                }

                // Aplicar padding
                frame.paddingTop = data.paddingTop || 0;
                frame.paddingRight = data.paddingRight || 0;
                frame.paddingBottom = data.paddingBottom || 0;
                frame.paddingLeft = data.paddingLeft || 0;

                // Aplicar dimensões se não for auto layout
                if (data.width !== undefined && !data.layoutMode) {
                    frame.resize(data.width, data.height || 100);
                }

                // Aplicar cor de fundo se disponível
                if (data.fills && Array.isArray(data.fills) && data.fills.length > 0) {
                    frame.fills = data.fills;
                } else if (data.backgroundColor) {
                    // Fallback: converter backgroundColor para fills
                    const rgb = hexToRgb(data.backgroundColor);
                    if (rgb) {
                        frame.fills = [{
                            type: 'SOLID',
                            color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
                        }];
                    }
                }

                // Processar filhos recursivamente
                if (data.children && Array.isArray(data.children)) {
                    data.children.forEach((childData: any) => {
                        const childNode = createNodeFromJson(childData);
                        if (childNode) {
                            frame.appendChild(childNode);
                        }
                    });
                }

                node = frame;
                break;
            }

            case 'TEXT': {
                const text = figma.createText();
                text.name = data.name || 'Text';

                // Carregar fonte antes de definir caracteres
                // Usa fonte padrão se não especificado
                const fontName = data.fontName || { family: 'Inter', style: 'Regular' };
                
                // Marcar como promise para não retornar imediatamente
                const setupText = async () => {
                    try {
                        await figma.loadFontAsync(fontName);
                        
                        text.characters = data.characters || '';
                        
                        // Aplicar propriedades de texto
                        if (data.fontSize) text.fontSize = data.fontSize;
                        if (data.fontName) text.fontName = data.fontName;
                        if (data.textAlignHorizontal) text.textAlignHorizontal = data.textAlignHorizontal;
                        if (data.textAlignVertical) text.textAlignVertical = data.textAlignVertical;
                        if (data.lineHeight) text.lineHeight = data.lineHeight;
                        if (data.letterSpacing) text.letterSpacing = data.letterSpacing;
                        
                        // Aplicar cor do texto
                        if (data.fills && Array.isArray(data.fills)) {
                            text.fills = data.fills;
                        } else if (data.color) {
                            const rgb = hexToRgb(data.color);
                            if (rgb) {
                                text.fills = [{
                                    type: 'SOLID',
                                    color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
                                }];
                            }
                        }
                    } catch (err) {
                        console.warn('Failed to load font, using default:', err);
                        // Fallback: definir caracteres com fonte padrão
                        try {
                            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
                            text.characters = data.characters || '';
                        } catch (fallbackErr) {
                            console.error('Failed to load fallback font:', fallbackErr);
                            text.characters = data.characters || '';
                        }
                    }
                };
                
                // Iniciar setup mas não bloquear retorno
                setupText();

                node = text;
                break;
            }

            case 'RECTANGLE': {
                const rect = figma.createRectangle();
                rect.name = data.name || 'Rectangle';

                // Aplicar dimensões
                if (data.width !== undefined && data.height !== undefined) {
                    rect.resize(data.width, data.height);
                }

                // Aplicar cor de preenchimento
                if (data.fills && Array.isArray(data.fills)) {
                    rect.fills = data.fills;
                } else if (data.backgroundColor) {
                    const rgb = hexToRgb(data.backgroundColor);
                    if (rgb) {
                        rect.fills = [{
                            type: 'SOLID',
                            color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
                        }];
                    }
                }

                // Aplicar corner radius
                if (data.cornerRadius !== undefined) {
                    rect.cornerRadius = data.cornerRadius;
                }

                node = rect;
                break;
            }

            default:
                console.warn(`Tipo de nó não suportado: ${data.type}`);
                return null;
        }

        return node;
    } catch (error) {
        console.error(`Erro ao criar nó ${data.type}:`, error);
        return null;
    }
}

/**
 * Converte cor hexadecimal para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove o # se presente
    hex = hex.replace(/^#/, '');
    
    // Suporta formatos #RGB e #RRGGBB
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    if (hex.length !== 6) {
        return null;
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return null;
    }
    
    return { r, g, b };
}

figma.on('run', () => {
    figma.showUI(__html__, { width: 320, height: 240 });
});

figma.ui.onmessage = (msg) => {
    if (msg.type === 'import-json') {
        try {
            const data = JSON.parse(msg.payload);
            
            // Suporte para formato legado (data.root) e novo formato direto
            const rootData = data.root || data;
            
            // Criar nó raiz recursivamente
            const rootNode = createNodeFromJson(rootData);
            
            if (rootNode) {
                figma.currentPage.appendChild(rootNode);
                figma.viewport.scrollAndZoomIntoView([rootNode]);
                
                const nodeCount = countNodes(rootNode);
                figma.notify(`✅ Importado: ${nodeCount} nó(s) criado(s)`);
            } else {
                figma.notify('❌ Falha ao criar estrutura do JSON');
            }
        } catch (e) {
            console.error('Erro ao importar JSON:', e);
            figma.notify(`❌ Erro ao importar: ${e instanceof Error ? e.message : 'desconhecido'}`);
        }
    }
};

/**
 * Conta número de nós recursivamente
 */
function countNodes(node: SceneNode): number {
    let count = 1;
    if ('children' in node) {
        node.children.forEach((child: SceneNode) => {
            count += countNodes(child);
        });
    }
    return count;
}

