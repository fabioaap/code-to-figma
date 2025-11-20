/**
 * Environment Validation Utilities for E2E Tests
 * 
 * This module provides utilities to validate that the environment
 * is properly configured before running E2E tests.
 */

export interface EnvironmentConfig {
  baseURL: string;
  headless: boolean;
  timeout: number;
  isCI: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvironmentConfig;
}

/**
 * Validates the environment configuration for E2E tests
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse environment variables
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:6006';
  const headless = process.env.E2E_HEADLESS !== 'false';
  const timeout = parseInt(process.env.E2E_TIMEOUT || '30000', 10);
  const isCI = process.env.CI === 'true';

  // Validate base URL
  if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    errors.push('E2E_BASE_URL must start with http:// or https://');
  }

  // Validate timeout
  if (isNaN(timeout) || timeout <= 0) {
    errors.push('E2E_TIMEOUT must be a positive number');
  }

  // Check for localhost in non-CI environments
  if (!isCI && baseURL.includes('localhost')) {
    warnings.push(
      'Tests are configured to run against localhost. ' +
      'Ensure Storybook is running on the expected port.'
    );
  }

  // Check for production URL in CI
  if (isCI && baseURL.includes('localhost')) {
    warnings.push(
      'Running CI tests against localhost. ' +
      'Consider using a deployed test environment for more reliable results.'
    );
  }

  const config: EnvironmentConfig = {
    baseURL,
    headless,
    timeout,
    isCI,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Throws an error if the environment is not valid
 */
export function assertValidEnvironment(): EnvironmentConfig {
  const result = validateEnvironment();

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  E2E Environment Warnings:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn('');
  }

  if (!result.isValid) {
    console.error('\n❌ E2E Environment Validation Failed:');
    result.errors.forEach(error => console.error(`   - ${error}`));
    console.error('');
    throw new Error(
      'E2E environment validation failed. ' +
      'Please check the required environment variables and try again.'
    );
  }

  console.log('\n✅ E2E Environment validated successfully');
  console.log(`   Base URL: ${result.config.baseURL}`);
  console.log(`   Headless: ${result.config.headless}`);
  console.log(`   Timeout: ${result.config.timeout}ms`);
  console.log(`   CI Mode: ${result.config.isCI}\n`);

  return result.config;
}

/**
 * Checks if a required environment variable is set
 */
export function requireEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Parses a boolean environment variable
 */
export function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * Parses an integer environment variable
 */
export function getIntEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid integer`);
  }
  return parsed;
}
