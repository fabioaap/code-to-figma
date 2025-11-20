import { addons } from '@storybook/preview-api';
import { 
    EVENT_EXPORT_REQUEST, 
    EVENT_EXPORT_RESPONSE,
    type ExportRequestPayload,
    type ExportResponsePayload 
} from './shared';
import { executeExportPipeline } from './export';

/**
 * Registra o handler de exportação no contexto do preview (iframe)
 * Este código roda no iframe onde a história é renderizada
 */
export function setupPreviewExport() {
    const channel = addons.getChannel();
    
    // Escuta requisições de exportação vindas do painel
    channel.on(EVENT_EXPORT_REQUEST, async (payload: ExportRequestPayload) => {
        console.log('[Preview] Recebida requisição de exportação:', payload);
        
        try {
            // Executa o pipeline completo de exportação
            const figmaData = await executeExportPipeline(payload.storyId);
            
            // Envia resposta de sucesso
            const response: ExportResponsePayload = {
                success: true,
                storyId: payload.storyId,
                data: figmaData
            };
            
            channel.emit(EVENT_EXPORT_RESPONSE, response);
            console.log('[Preview] Exportação concluída com sucesso');
            
        } catch (error) {
            console.error('[Preview] Erro na exportação:', error);
            
            // Envia resposta de erro
            const response: ExportResponsePayload = {
                success: false,
                storyId: payload.storyId,
                error: error instanceof Error ? error.message : 'Erro desconhecido na exportação'
            };
            
            channel.emit(EVENT_EXPORT_RESPONSE, response);
        }
    });
    
    console.log('[Preview] Handler de exportação registrado');
}

// Auto-inicializa quando o módulo é importado
setupPreviewExport();
