import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, LogLevel, LogEvent, type LogEntry } from '../src/index';

describe('Logger', () => {
    let logger: Logger;
    let logEntries: LogEntry[];

    beforeEach(() => {
        logEntries = [];
        logger = new Logger({
            enableConsole: false,
            onLog: (entry) => logEntries.push(entry),
        });
    });

    describe('log levels', () => {
        it('logs error messages', () => {
            logger.error(LogEvent.EXPORT_ERROR, 'Export failed');
            
            expect(logEntries).toHaveLength(1);
            expect(logEntries[0].level).toBe(LogLevel.ERROR);
            expect(logEntries[0].event).toBe(LogEvent.EXPORT_ERROR);
            expect(logEntries[0].message).toBe('Export failed');
        });

        it('logs warning messages', () => {
            logger.warn(LogEvent.SANITIZATION, 'PII detected');
            
            expect(logEntries).toHaveLength(1);
            expect(logEntries[0].level).toBe(LogLevel.WARN);
        });

        it('logs info messages', () => {
            logger.info(LogEvent.EXPORT_START, 'Starting export');
            
            expect(logEntries).toHaveLength(1);
            expect(logEntries[0].level).toBe(LogLevel.INFO);
        });

        it('logs debug messages', () => {
            logger.configure({ level: LogLevel.DEBUG });
            logger.debug(LogEvent.AUTOLAYOUT_APPLIED, 'Applied auto layout');
            
            expect(logEntries).toHaveLength(1);
            expect(logEntries[0].level).toBe(LogLevel.DEBUG);
        });
    });

    describe('metadata', () => {
        it('includes metadata in log entries', () => {
            logger.info(LogEvent.EXPORT_COMPLETE, 'Export completed', {
                storyId: 'button--primary',
                size: 1024,
                duration: 150,
            });

            expect(logEntries[0].metadata).toEqual({
                storyId: 'button--primary',
                size: 1024,
                duration: 150,
            });
        });

        it('sanitizes PII from metadata', () => {
            logger.info(LogEvent.EXPORT_COMPLETE, 'Export completed', {
                storyId: 'button--primary',
                email: 'user@example.com',
                password: 'secret123',
                token: 'abc123',
            });

            expect(logEntries[0].metadata).toEqual({
                storyId: 'button--primary',
            });
            expect(logEntries[0].metadata?.email).toBeUndefined();
            expect(logEntries[0].metadata?.password).toBeUndefined();
            expect(logEntries[0].metadata?.token).toBeUndefined();
        });
    });

    describe('log level filtering', () => {
        it('respects log level configuration', () => {
            logger.configure({ level: LogLevel.WARN });
            
            logger.debug('debug.test', 'Debug message');
            logger.info('info.test', 'Info message');
            logger.warn('warn.test', 'Warning message');
            logger.error('error.test', 'Error message');

            expect(logEntries).toHaveLength(2);
            expect(logEntries[0].level).toBe(LogLevel.WARN);
            expect(logEntries[1].level).toBe(LogLevel.ERROR);
        });

        it('logs all levels when set to DEBUG', () => {
            logger.configure({ level: LogLevel.DEBUG });
            
            logger.debug('debug.test', 'Debug message');
            logger.info('info.test', 'Info message');
            logger.warn('warn.test', 'Warning message');
            logger.error('error.test', 'Error message');

            expect(logEntries).toHaveLength(4);
        });

        it('only logs errors when set to ERROR', () => {
            logger.configure({ level: LogLevel.ERROR });
            
            logger.debug('debug.test', 'Debug message');
            logger.info('info.test', 'Info message');
            logger.warn('warn.test', 'Warning message');
            logger.error('error.test', 'Error message');

            expect(logEntries).toHaveLength(1);
            expect(logEntries[0].level).toBe(LogLevel.ERROR);
        });
    });

    describe('timestamp', () => {
        it('includes ISO timestamp in log entries', () => {
            logger.info(LogEvent.EXPORT_START, 'Starting');
            
            expect(logEntries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });

    describe('console output', () => {
        it('writes to console when enabled', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const consoleLogger = new Logger({ enableConsole: true, level: LogLevel.INFO });
            
            consoleLogger.info(LogEvent.EXPORT_START, 'Starting');
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));
            consoleSpy.mockRestore();
        });

        it('uses console.error for error level', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const consoleLogger = new Logger({ enableConsole: true, level: LogLevel.ERROR });
            
            consoleLogger.error(LogEvent.EXPORT_ERROR, 'Failed');
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"error"'));
            consoleSpy.mockRestore();
        });
    });

    describe('custom events', () => {
        it('supports custom event strings', () => {
            logger.info('custom.event', 'Custom event occurred');
            
            expect(logEntries[0].event).toBe('custom.event');
        });
    });
});
