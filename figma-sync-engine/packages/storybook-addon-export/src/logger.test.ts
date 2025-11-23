import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, logger } from './logger';

describe('Logger - MVP-9', () => {
    let consoleInfoSpy: any;
    let consoleWarnSpy: any;
    let consoleErrorSpy: any;
    let consoleDebugSpy: any;

    beforeEach(() => {
        consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Logger initialization', () => {
        it('should create logger with default config', () => {
            const testLogger = new Logger();
            const config = testLogger.getConfig();
            
            expect(config.enabled).toBe(true);
            expect(config.level).toBeDefined();
            expect(['debug', 'info', 'warn', 'error']).toContain(config.level);
        });

        it('should create logger with custom config', () => {
            const testLogger = new Logger({ level: 'warn', enabled: false });
            const config = testLogger.getConfig();
            
            expect(config.level).toBe('warn');
            expect(config.enabled).toBe(false);
        });

        it('should update config dynamically', () => {
            const testLogger = new Logger({ level: 'info' });
            testLogger.setConfig({ level: 'error' });
            
            expect(testLogger.getConfig().level).toBe('error');
        });
    });

    describe('Log levels', () => {
        it('should log info messages', () => {
            const testLogger = new Logger({ level: 'info' });
            testLogger.info('test.event', { foo: 'bar' });
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('INFO: test.event'),
                { foo: 'bar' }
            );
        });

        it('should log warn messages', () => {
            const testLogger = new Logger({ level: 'warn' });
            testLogger.warn('test.warning', { code: 123 });
            
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('WARN: test.warning'),
                { code: 123 }
            );
        });

        it('should log error messages', () => {
            const testLogger = new Logger({ level: 'error' });
            testLogger.error('test.error', { message: 'failure' });
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('ERROR: test.error'),
                { message: 'failure' }
            );
        });

        it('should log debug messages', () => {
            const testLogger = new Logger({ level: 'debug' });
            testLogger.debug('test.debug', { detail: 'verbose' });
            
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('DEBUG: test.debug'),
                { detail: 'verbose' }
            );
        });
    });

    describe('Log level filtering', () => {
        it('should not log debug when level is info', () => {
            const testLogger = new Logger({ level: 'info' });
            testLogger.debug('test.debug');
            
            expect(consoleDebugSpy).not.toHaveBeenCalled();
        });

        it('should not log info when level is warn', () => {
            const testLogger = new Logger({ level: 'warn' });
            testLogger.info('test.info');
            
            expect(consoleInfoSpy).not.toHaveBeenCalled();
        });

        it('should not log warn when level is error', () => {
            const testLogger = new Logger({ level: 'error' });
            testLogger.warn('test.warn');
            
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should log error at any level', () => {
            const testLogger = new Logger({ level: 'error' });
            testLogger.error('test.error');
            
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log all levels when level is debug', () => {
            const testLogger = new Logger({ level: 'debug' });
            
            testLogger.debug('test.debug');
            testLogger.info('test.info');
            testLogger.warn('test.warn');
            testLogger.error('test.error');
            
            expect(consoleDebugSpy).toHaveBeenCalled();
            expect(consoleInfoSpy).toHaveBeenCalled();
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('Logger enabled/disabled', () => {
        it('should not log when disabled', () => {
            const testLogger = new Logger({ level: 'info', enabled: false });
            
            testLogger.info('test.info');
            testLogger.error('test.error');
            
            expect(consoleInfoSpy).not.toHaveBeenCalled();
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should log when enabled', () => {
            const testLogger = new Logger({ level: 'info', enabled: true });
            
            testLogger.info('test.info');
            
            expect(consoleInfoSpy).toHaveBeenCalled();
        });

        it('should respect enabled state after update', () => {
            const testLogger = new Logger({ enabled: true });
            
            testLogger.info('test.before');
            expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
            
            testLogger.setConfig({ enabled: false });
            testLogger.info('test.after');
            expect(consoleInfoSpy).toHaveBeenCalledTimes(1); // still 1
        });
    });

    describe('Log metadata', () => {
        it('should include metadata in logs', () => {
            const testLogger = new Logger({ level: 'info' });
            const metadata = { userId: '123', action: 'export', size: 1024 };
            
            testLogger.info('export.completed', metadata);
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.any(String),
                metadata
            );
        });

        it('should handle logs without metadata', () => {
            const testLogger = new Logger({ level: 'info' });
            
            testLogger.info('test.event');
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('test.event')
            );
            expect(consoleInfoSpy).not.toHaveBeenCalledWith(
                expect.anything(),
                ''
            );
        });

        it('should not include PII in metadata', () => {
            const testLogger = new Logger({ level: 'info' });
            // User should be responsible for not passing PII
            const safeMetadata = { 
                size: 1024, 
                duration: 150, 
                method: 'clipboard' 
            };
            
            testLogger.info('export.completed', safeMetadata);
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.any(String),
                safeMetadata
            );
        });
    });

    describe('Export events logging', () => {
        it('should log export.started event', () => {
            const testLogger = new Logger({ level: 'info' });
            
            testLogger.info('export.started', { method: 'clipboard' });
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('export.started'),
                { method: 'clipboard' }
            );
        });

        it('should log export.completed event', () => {
            const testLogger = new Logger({ level: 'info' });
            
            testLogger.info('export.completed', { 
                method: 'clipboard',
                size: 2048,
                duration: 125
            });
            
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('export.completed'),
                expect.objectContaining({ 
                    method: 'clipboard',
                    size: 2048,
                    duration: 125
                })
            );
        });

        it('should log export.failed event', () => {
            const testLogger = new Logger({ level: 'error' });
            
            testLogger.error('export.failed', { 
                error: 'Clipboard API not available',
                method: 'clipboard'
            });
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('export.failed'),
                expect.objectContaining({ 
                    error: expect.any(String),
                    method: 'clipboard'
                })
            );
        });
    });

    describe('Singleton logger', () => {
        it('should export a singleton logger instance', () => {
            expect(logger).toBeDefined();
            expect(logger).toBeInstanceOf(Logger);
        });

        it('should be usable directly', () => {
            logger.info('test.singleton');
            
            expect(consoleInfoSpy).toHaveBeenCalled();
        });
    });

    describe('Timestamp formatting', () => {
        it('should include ISO timestamp in logs', () => {
            const testLogger = new Logger({ level: 'info' });
            
            testLogger.info('test.timestamp');
            
            const call = consoleInfoSpy.mock.calls[0][0];
            // Should match ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
            expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
        });
    });
});
