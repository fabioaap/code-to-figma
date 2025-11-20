/**
 * Log levels for the structured logger.
 * Ordered from most to least severe.
 */
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

/**
 * Event types for categorizing log entries.
 */
export enum LogEvent {
    EXPORT_START = 'export.start',
    EXPORT_COMPLETE = 'export.complete',
    EXPORT_ERROR = 'export.error',
    CONVERSION_START = 'conversion.start',
    CONVERSION_COMPLETE = 'conversion.complete',
    CONVERSION_ERROR = 'conversion.error',
    AUTOLAYOUT_APPLIED = 'autolayout.applied',
    PLUGIN_IMPORT = 'plugin.import',
    SANITIZATION = 'sanitization.applied',
}

/**
 * Structured log entry format.
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    event: LogEvent | string;
    message: string;
    metadata?: {
        storyId?: string;
        size?: number;
        duration?: number;
        nodeCount?: number;
        [key: string]: any;
    };
}

/**
 * Logger configuration options.
 */
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    onLog?: (entry: LogEntry) => void;
}

/**
 * Structured logger for figma-sync-engine.
 * Provides consistent, JSON-formatted logging without PII.
 */
export class Logger {
    private config: LoggerConfig;
    private static instance: Logger;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            level: config.level || LogLevel.INFO,
            enableConsole: config.enableConsole !== false,
            onLog: config.onLog,
        };
    }

    /**
     * Get singleton instance of the logger.
     */
    static getInstance(config?: Partial<LoggerConfig>): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }

    /**
     * Log a message with the specified level.
     */
    log(level: LogLevel, event: LogEvent | string, message: string, metadata?: LogEntry['metadata']): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            event,
            message,
            metadata: this.sanitizeMetadata(metadata),
        };

        if (this.config.enableConsole) {
            this.writeToConsole(entry);
        }

        if (this.config.onLog) {
            this.config.onLog(entry);
        }
    }

    /**
     * Log an error message.
     */
    error(event: LogEvent | string, message: string, metadata?: LogEntry['metadata']): void {
        this.log(LogLevel.ERROR, event, message, metadata);
    }

    /**
     * Log a warning message.
     */
    warn(event: LogEvent | string, message: string, metadata?: LogEntry['metadata']): void {
        this.log(LogLevel.WARN, event, message, metadata);
    }

    /**
     * Log an info message.
     */
    info(event: LogEvent | string, message: string, metadata?: LogEntry['metadata']): void {
        this.log(LogLevel.INFO, event, message, metadata);
    }

    /**
     * Log a debug message.
     */
    debug(event: LogEvent | string, message: string, metadata?: LogEntry['metadata']): void {
        this.log(LogLevel.DEBUG, event, message, metadata);
    }

    /**
     * Update logger configuration.
     */
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Determine if a log level should be output based on current config.
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const configLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= configLevelIndex;
    }

    /**
     * Write log entry to console in JSON format.
     */
    private writeToConsole(entry: LogEntry): void {
        const jsonString = JSON.stringify(entry);
        
        switch (entry.level) {
            case LogLevel.ERROR:
                console.error(jsonString);
                break;
            case LogLevel.WARN:
                console.warn(jsonString);
                break;
            case LogLevel.DEBUG:
                console.debug(jsonString);
                break;
            default:
                console.log(jsonString);
        }
    }

    /**
     * Sanitize metadata to remove potential PII.
     * This is a basic implementation - extend as needed for specific requirements.
     */
    private sanitizeMetadata(metadata?: LogEntry['metadata']): LogEntry['metadata'] {
        if (!metadata) {
            return undefined;
        }

        const sanitized = { ...metadata };
        
        // Remove common PII fields
        const piiFields = ['email', 'name', 'username', 'password', 'token', 'apiKey'];
        piiFields.forEach(field => {
            if (field in sanitized) {
                delete sanitized[field];
            }
        });

        return sanitized;
    }
}

/**
 * Default logger instance for convenience.
 */
export const logger = Logger.getInstance();
