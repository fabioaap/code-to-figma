/**
 * Mock Figma API Responses
 * 
 * Provides realistic test fixtures for Figma REST API endpoints
 */

export interface MockFigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: {
    id: string;
    name: string;
    type: string;
    children: MockFigmaNode[];
  };
}

export interface MockFigmaNode {
  id: string;
  name: string;
  type: string;
  children?: MockFigmaNode[];
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;
  strokes?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
}

export function createMockFile(overrides?: Partial<MockFigmaFile>): MockFigmaFile {
  return {
    name: 'Test Design File',
    lastModified: '2025-01-15T10:30:00Z',
    thumbnailUrl: 'https://example.com/thumb.png',
    version: '1.0.0',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '1:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '2:2',
              name: 'Frame 1',
              type: 'FRAME',
              children: [],
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

export function createMockTokenFrame(): MockFigmaNode {
  return {
    id: '8565:17355',
    name: 'Jornada #4800 - Tokens',
    type: 'FRAME',
    children: [
      {
        id: '8565:17356',
        name: 'Colors/Primary',
        type: 'RECTANGLE',
        fills: [
          {
            type: 'SOLID',
            color: { r: 0.2, g: 0.4, b: 0.8, a: 1 },
          },
        ],
      },
      {
        id: '8565:17357',
        name: 'Typography/Heading',
        type: 'TEXT',
        style: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 700,
          lineHeightPx: 32,
          letterSpacing: -0.5,
        },
      },
    ],
  };
}

export function createMockImageResponse(nodeId: string): { images: Record<string, string> } {
  return {
    images: {
      [nodeId]: 'https://example.com/image.png',
    },
  };
}

export function createMockErrorResponse(status: number, message: string) {
  return {
    status,
    err: message,
  };
}

// Mock Figma Frame Response for getFrameNodes
export const mockFigmaFrameResponse = {
  name: 'EDUCACROSS Design System',
  lastModified: '2025-01-15T10:30:00Z',
  version: '1.0.0',
  nodes: {
    '8565:17355': {
      document: {
        id: '8565:17355',
        name: 'Jornada #4800 - Tokens',
        type: 'FRAME',
        children: [
          {
            id: '8565:17356',
            name: 'color.rede.primary',
            type: 'RECTANGLE',
            fills: [
              {
                type: 'SOLID',
                color: { r: 0, g: 0.4, b: 0.8, a: 1 },
              },
            ],
          },
          {
            id: '8565:17357',
            name: 'color.status.success',
            type: 'RECTANGLE',
            fills: [
              {
                type: 'SOLID',
                color: { r: 0, g: 0.667, b: 0, a: 1 },
              },
            ],
          },
          {
            id: '8565:17358',
            name: 'typography.heading.h1',
            type: 'TEXT',
            style: {
              fontFamily: 'Inter',
              fontSize: 32,
              fontWeight: 700,
              lineHeightPx: 38.4,
            },
          },
          {
            id: '8565:17359',
            name: 'spacing.medium',
            type: 'FRAME',
            absoluteBoundingBox: { x: 0, y: 0, width: 16, height: 16 },
          },
        ],
      },
      components: {},
      schemaVersion: 0,
      styles: {},
    },
  },
};

// Mock layers organized by token type
export const mockFigmaLayersForTokens = {
  colors: [
    {
      id: '8565:17356',
      name: 'color.rede.primary',
      type: 'RECTANGLE',
      fills: [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 0.8, a: 1 } }],
    },
    {
      id: '8565:17357',
      name: 'color.status.success',
      type: 'RECTANGLE',
      fills: [{ type: 'SOLID', color: { r: 0, g: 0.667, b: 0, a: 1 } }],
    },
    {
      id: '8565:17360',
      name: 'color.status.error',
      type: 'RECTANGLE',
      fills: [{ type: 'SOLID', color: { r: 0.8, g: 0, b: 0, a: 1 } }],
    },
  ],
  typography: [
    {
      id: '8565:17358',
      name: 'typography.heading.h1',
      type: 'TEXT',
      style: {
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 700,
        lineHeightPx: 38.4,
      },
    },
    {
      id: '8565:17361',
      name: 'typography.body.regular',
      type: 'TEXT',
      style: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeightPx: 24,
      },
    },
  ],
  spacing: [
    {
      id: '8565:17359',
      name: 'spacing.small',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 8, height: 8 },
    },
    {
      id: '8565:17362',
      name: 'spacing.medium',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 16, height: 16 },
    },
    {
      id: '8565:17363',
      name: 'spacing.large',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
    },
  ],
};
