// Plugin code: recebe JSON colado e cria frames e nodes no canvas.
figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'import-json') {
        try {
            const data = JSON.parse(msg.payload);
            
            if (!data.root) {
                figma.notify('JSON inválido: propriedade "root" não encontrada');
                return;
            }

            // Create main frame
            const frame = figma.createFrame();
            frame.name = data.root.name || 'ImportedStory';
            
            // Apply layout mode
            if (data.root.layoutMode === 'HORIZONTAL' || data.root.layoutMode === 'VERTICAL') {
                frame.layoutMode = data.root.layoutMode;
            }
            
            // Apply spacing
            if (typeof data.root.itemSpacing === 'number') {
                frame.itemSpacing = data.root.itemSpacing;
            }
            
            // Apply padding
            frame.paddingTop = data.root.paddingTop || 0;
            frame.paddingRight = data.root.paddingRight || 0;
            frame.paddingBottom = data.root.paddingBottom || 0;
            frame.paddingLeft = data.root.paddingLeft || 0;
            
            // Apply alignment properties
            if (data.root.primaryAxisAlignItems) {
                frame.primaryAxisAlignItems = data.root.primaryAxisAlignItems;
            }
            if (data.root.counterAxisAlignItems) {
                frame.counterAxisAlignItems = data.root.counterAxisAlignItems;
            }

            // Create children nodes
            let childrenCreated = 0;
            const children = data.root.children || [];
            
            for (const child of children) {
                try {
                    if (child.type === 'TEXT') {
                        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                        const text = figma.createText();
                        text.characters = child.characters || '';
                        text.name = child.name || 'Text';
                        
                        // Apply text properties if available
                        if (child.fontSize) text.fontSize = child.fontSize;
                        if (child.fontWeight) {
                            try {
                                await figma.loadFontAsync({ 
                                    family: child.fontFamily || "Inter", 
                                    style: child.fontWeight 
                                });
                                text.fontName = { 
                                    family: child.fontFamily || "Inter", 
                                    style: child.fontWeight 
                                };
                            } catch (e) {
                                // Font not available, keep default
                            }
                        }
                        
                        frame.appendChild(text);
                        childrenCreated++;
                    } else if (child.type === 'RECTANGLE') {
                        const rect = figma.createRectangle();
                        rect.name = child.name || 'Rectangle';
                        
                        if (child.width) rect.resize(child.width, child.height || 100);
                        if (child.fills) rect.fills = child.fills;
                        if (child.cornerRadius) rect.cornerRadius = child.cornerRadius;
                        
                        frame.appendChild(rect);
                        childrenCreated++;
                    } else if (child.type === 'FRAME') {
                        const childFrame = figma.createFrame();
                        childFrame.name = child.name || 'Frame';
                        
                        if (child.layoutMode) childFrame.layoutMode = child.layoutMode;
                        if (child.itemSpacing) childFrame.itemSpacing = child.itemSpacing;
                        if (child.width && child.height) {
                            childFrame.resize(child.width, child.height);
                        }
                        
                        frame.appendChild(childFrame);
                        childrenCreated++;
                    }
                } catch (childError) {
                    console.error('Error creating child node:', childError);
                    // Continue processing other children
                }
            }

            // Add frame to canvas
            figma.currentPage.appendChild(frame);
            figma.viewport.scrollAndZoomIntoView([frame]);
            
            figma.notify(`Importado com sucesso: 1 frame, ${childrenCreated} elementos`);
            figma.ui.postMessage({ 
                type: 'import-success', 
                frameCount: 1, 
                childCount: childrenCreated 
            });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'Erro desconhecido';
            figma.notify(`Falha ao importar JSON: ${errorMsg}`);
            figma.ui.postMessage({ type: 'import-error', error: errorMsg });
            console.error('Import error:', e);
        }
    } else if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
