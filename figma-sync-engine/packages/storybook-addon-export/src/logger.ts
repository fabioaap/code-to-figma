/**
 * MVP-9: Logger estruturado para observabilidade
 * Fornece logs estruturados JSON sem PII
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    timestamp: string;
    event: string;
    metadata?: Record<string, any>;
}

/**
 * Configuração do logger
 */
export interface LoggerConfig {
    level: LogLevel;
    enabled: boolean;
}

/**
 * Níveis de log ordenados por severidade
 */
const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

/**
 * Logger estruturado com suporte a níveis e formato JSON
 */
export class Logger {
    private config: LoggerConfig;

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            level: (config?.level as LogLevel) || this.getDefaultLevel(),
            enabled: config?.enabled !== undefined ? config.enabled : true
        };
    }

    /**
     * Obtém o nível de log padrão a partir de variáveis de ambiente
     */
    private getDefaultLevel(): LogLevel {
        // Tenta obter de import.meta.env (Vite) ou process.env (Node)
        let envLevel = 'info';
        try {
            if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
                envLevel = (import.meta as any).env.VITE_LOG_LEVEL || 'info';
            }
        } catch {
            // Fallback para 'info' se import.meta não estiver disponível
            envLevel = 'info';
        }
        
        return ['debug', 'info', 'warn', 'error'].includes(envLevel) 
            ? (envLevel as LogLevel) 
            : 'info';
    }

    /**
     * Verifica se uma mensagem deve ser logada baseado no nível
     */
    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;
        return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
    }

    /**
     * Cria uma entrada de log estruturada
     */
    private createLogEntry(level: LogLevel, event: string, metadata?: Record<string, any>): LogEntry {
        return {
            level,
            timestamp: new Date().toISOString(),
            event,
            metadata
        };
    }

    /**
     * Emite um log para o console
     */
    private emit(entry: LogEntry): void {
        const { level, event, timestamp, metadata } = entry;
        const message = `[${timestamp}] ${level.toUpperCase()}: ${event}`;
        
        switch (level) {
            case 'error':
                console.error(message, metadata || '');
                break;
            case 'warn':
                console.warn(message, metadata || '');
                break;
            case 'info':
                console.info(message, metadata || '');
                break;
            case 'debug':
                console.debug(message, metadata || '');
                break;
        }
    }

    /**
     * Log de nível debug
     */
    debug(event: string, metadata?: Record<string, any>): void {
        if (this.shouldLog('debug')) {
            this.emit(this.createLogEntry('debug', event, metadata));
        }
    }

    /**
     * Log de nível info
     */
    info(event: string, metadata?: Record<string, any>): void {
        if (this.shouldLog('info')) {
            this.emit(this.createLogEntry('info', event, metadata));
        }
    }

    /**
     * Log de nível warn
     */
    warn(event: string, metadata?: Record<string, any>): void {
        if (this.shouldLog('warn')) {
            this.emit(this.createLogEntry('warn', event, metadata));
        }
    }

    /**
     * Log de nível error
     */
    error(event: string, metadata?: Record<string, any>): void {
        if (this.shouldLog('error')) {
            this.emit(this.createLogEntry('error', event, metadata));
        }
    }

    /**
     * Atualiza a configuração do logger
     */
    setConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtém a configuração atual
     */
    getConfig(): LoggerConfig {
        return { ...this.config };
    }
}

/**
 * Instância singleton do logger
 */
export const logger = new Logger();
