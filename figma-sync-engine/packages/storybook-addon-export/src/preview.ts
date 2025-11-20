import { addons } from '@storybook/preview-api';
import { EVENT_EXPORT_REQUEST } from './shared';

export const withExportDecorator = (storyFn: any, _context: any) => {
    const channel = addons.getChannel();
    
    const handleExportRequest = (data: { storyId: string }) => {
        console.log('[Figma Export] Received export request for story:', data.storyId);
        
        // Get the story container element
        const storyElement = document.querySelector('#storybook-root');
        
        if (!storyElement) {
            console.error('[Figma Export] Story element not found');
            return;
        }

        // Placeholder: Aqui será integrado o pipeline de exportação
        // 1. Capturar HTML do elemento da história
        const htmlContent = storyElement.innerHTML;
        console.log('[Figma Export] Captured HTML length:', htmlContent.length);
        
        // 2. TODO: Chamar html-to-figma-core para conversão
        // 3. TODO: Pós-processar com autolayout-interpreter
        // 4. TODO: Gerar JSON e disponibilizar para download/clipboard
        
        // Por enquanto, apenas log do HTML capturado
        console.log('[Figma Export] Export pipeline placeholder - HTML captured successfully');
    };

    channel.on(EVENT_EXPORT_REQUEST, handleExportRequest);

    return storyFn();
};

export const decorators = [withExportDecorator];
