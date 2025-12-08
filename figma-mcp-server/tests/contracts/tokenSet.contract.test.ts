/**
 * T010 [P] [US1] Contract test for tokenSetSchema validation
 * 
 * Validates that the Zod schema correctly accepts/rejects fixture payloads
 * matching the TokenSet contract defined in specs/001-figma-mcp-server/contracts/figma-mcp-tools.yaml
 */

import { describe, it, expect } from 'vitest';
import { tokenSetSchema } from '../../src/schemas/tokenSet.js';

describe('TokenSet Contract Validation', () => {
  it('should accept valid TokenSet with all required fields', () => {
    const validTokenSet = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: '2025-01-15T10:30:00Z',
        version: '1.0.0',
      },
      colors: {
        'color.rede.primary': '#0066CC',
        'color.status.success': '#00AA00',
      },
      typography: {
        'typography.heading.h1': {
          fontFamily: 'Inter',
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.2,
        },
      },
      spacing: {
        'spacing.small': '8px',
        'spacing.medium': '16px',
      },
      shadows: {
        'shadow.default': '0 2px 4px rgba(0,0,0,0.1)',
      },
    };

    const result = tokenSetSchema.safeParse(validTokenSet);
    expect(result.success).toBe(true);
  });

  it('should reject TokenSet missing required metadata fields', () => {
    const invalidTokenSet = {
      metadata: {
        sourceFrameId: '8565:17355',
        // missing sourceFileId, exportedAt, version
      },
      colors: {},
    };

    const result = tokenSetSchema.safeParse(invalidTokenSet);
    expect(result.success).toBe(false);
  });

  it('should reject colors with invalid hex format', () => {
    const invalidColors = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: '2025-01-15T10:30:00Z',
        version: '1.0.0',
      },
      colors: {
        'color.invalid': 'blue', // not hex
        'color.incomplete': '#FFF', // too short
        'color.withAlpha': '#00AA00FF', // alpha not allowed per contract
      },
    };

    const result = tokenSetSchema.safeParse(invalidColors);
    expect(result.success).toBe(false);
  });

  it('should accept typography with numeric or percentage lineHeight', () => {
    const validTypography = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: '2025-01-15T10:30:00Z',
        version: '1.0.0',
      },
      colors: {},
      typography: {
        'typography.numeric': {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.5,
        },
        'typography.percentage': {
          fontFamily: 'Roboto',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '120%',
        },
      },
    };

    const result = tokenSetSchema.safeParse(validTypography);
    expect(result.success).toBe(true);
  });

  it('should reject spacing without px unit', () => {
    const invalidSpacing = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: '2025-01-15T10:30:00Z',
        version: '1.0.0',
      },
      colors: {},
      spacing: {
        'spacing.invalid': '16', // missing px
        'spacing.withRem': '1rem', // not px
      },
    };

    const result = tokenSetSchema.safeParse(invalidSpacing);
    expect(result.success).toBe(false);
  });

  it('should accept minimal TokenSet with only required fields', () => {
    const minimalTokenSet = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: '2025-01-15T10:30:00Z',
        version: '1.0.0',
      },
      colors: {},
    };

    const result = tokenSetSchema.safeParse(minimalTokenSet);
    expect(result.success).toBe(true);
  });

  it('should validate against contract fixture from mockFigma', () => {
    // This will be expanded once mockFigma exports a TokenSet fixture
    const contractFixture = {
      metadata: {
        sourceFrameId: '8565:17355',
        sourceFileId: 'Sz4z0rpDmocXZ8LylxEgqF',
        exportedAt: new Date().toISOString(),
        version: '0.1.0',
      },
      colors: {
        'color.rede.azulEscuro': '#003366',
        'color.rede.azulClaro': '#0099FF',
        'color.status.erro': '#CC0000',
        'color.status.sucesso': '#00AA00',
      },
      typography: {
        'typography.heading.h1': {
          fontFamily: 'Inter',
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.2,
        },
        'typography.body.regular': {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: '150%',
        },
      },
      spacing: {
        'spacing.xs': '4px',
        'spacing.sm': '8px',
        'spacing.md': '16px',
        'spacing.lg': '24px',
        'spacing.xl': '32px',
      },
    };

    const result = tokenSetSchema.safeParse(contractFixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata.sourceFrameId).toBe('8565:17355');
      expect(Object.keys(result.data.colors).length).toBeGreaterThan(0);
    }
  });
});
