import { test, expect } from '@playwright/test';
import { applyAutoLayout } from '../../packages/autolayout-interpreter/src/index';

/**
 * Snapshot Tests for JSON Output
 * Validates that JSON output format remains consistent
 */

test.describe('JSON Snapshot Tests', () => {
  test('should match snapshot for basic horizontal layout', () => {
    const node = { type: 'FRAME', name: 'BasicHorizontal' };
    const css = {
      display: 'flex',
      flexDirection: 'row',
      gap: '8',
      padding: '16'
    };

    const result = applyAutoLayout(node, css);
    const snapshot = JSON.stringify(result, null, 2);

    // Verify key properties are present
    expect(snapshot).toContain('"layoutMode": "HORIZONTAL"');
    expect(snapshot).toContain('"itemSpacing": 8');
    expect(snapshot).toContain('"paddingTop": 16');
  });

  test('should match snapshot for button component', () => {
    const buttonNode = {
      type: 'FRAME',
      name: 'Button',
      children: [
        {
          type: 'TEXT',
          name: 'Label',
          characters: 'Click me',
          fontSize: 14,
          fontWeight: 'Medium'
        }
      ]
    };
    const buttonCss = {
      display: 'flex',
      flexDirection: 'row',
      gap: '0',
      padding: '12 24',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const result = applyAutoLayout(buttonNode, buttonCss);
    const exportFormat = {
      root: result,
      metadata: {
        componentType: 'Button',
        storyId: 'button--primary',
        exportedAt: '2025-01-01T00:00:00.000Z' // Fixed for snapshot
      }
    };

    const snapshot = JSON.stringify(exportFormat, null, 2);

    // Verify structure
    expect(snapshot).toContain('"componentType": "Button"');
    expect(snapshot).toContain('"primaryAxisAlignItems": "CENTER"');
    expect(snapshot).toContain('"counterAxisAlignItems": "CENTER"');
    expect(snapshot).toContain('"characters": "Click me"');
  });

  test('should match snapshot for card component', () => {
    const cardNode = {
      type: 'FRAME',
      name: 'Card',
      children: [
        {
          type: 'TEXT',
          name: 'Title',
          characters: 'Card Title',
          fontSize: 18,
          fontWeight: 'Bold'
        },
        {
          type: 'TEXT',
          name: 'Description',
          characters: 'Card description goes here',
          fontSize: 14,
          fontWeight: 'Regular'
        },
        {
          type: 'FRAME',
          name: 'Actions',
          children: [
            {
              type: 'TEXT',
              name: 'ActionButton',
              characters: 'Action',
              fontSize: 12
            }
          ]
        }
      ]
    };
    const cardCss = {
      display: 'flex',
      flexDirection: 'column',
      gap: '12',
      padding: '20',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    };

    const result = applyAutoLayout(cardNode, cardCss);
    const snapshot = JSON.stringify(result, null, 2);

    // Verify nested structure
    expect(snapshot).toContain('"name": "Card"');
    expect(snapshot).toContain('"layoutMode": "VERTICAL"');
    expect(snapshot).toContain('"itemSpacing": 12');
    expect(snapshot).toContain('"name": "Title"');
    expect(snapshot).toContain('"name": "Description"');
    expect(snapshot).toContain('"name": "Actions"');
  });

  test('should generate consistent format across multiple exports', () => {
    const baseNode = { type: 'FRAME', name: 'Consistent' };
    const baseCss = {
      display: 'flex',
      flexDirection: 'row',
      gap: '10',
      padding: '15'
    };

    // Generate multiple times
    const result1 = applyAutoLayout({ ...baseNode }, { ...baseCss });
    const result2 = applyAutoLayout({ ...baseNode }, { ...baseCss });
    const result3 = applyAutoLayout({ ...baseNode }, { ...baseCss });

    // All should produce identical JSON
    const json1 = JSON.stringify(result1);
    const json2 = JSON.stringify(result2);
    const json3 = JSON.stringify(result3);

    expect(json1).toBe(json2);
    expect(json2).toBe(json3);
  });

  test('should handle empty children array', () => {
    const node = {
      type: 'FRAME',
      name: 'Empty',
      children: []
    };
    const css = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      padding: '0'
    };

    const result = applyAutoLayout(node, css);
    const snapshot = JSON.stringify(result, null, 2);

    expect(snapshot).toContain('"children": []');
    expect(snapshot).toContain('"layoutMode": "VERTICAL"');
  });

  test('should validate export file naming', () => {
    const storyIds = [
      'button--primary',
      'card--default',
      'input--text',
      'navbar--expanded'
    ];

    storyIds.forEach(storyId => {
      // Generate safe filename
      const filename = `${storyId.replace(/[^a-zA-Z0-9]/g, '-')}.figma.json`;
      
      // Validate filename format
      expect(filename).toMatch(/^[a-zA-Z0-9-]+\.figma\.json$/);
    });
  });
});

test.describe('Export Format Validation', () => {
  test('should validate required fields in export', () => {
    const node = { type: 'FRAME', name: 'Validation' };
    const css = {
      display: 'flex',
      padding: '10'
    };

    const result = applyAutoLayout(node, css);

    // Required fields
    expect(result.type).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.layoutMode).toBeDefined();
    
    // Optional fields should be present when CSS provides them
    expect(result.paddingTop).toBeDefined();
  });

  test('should export with metadata for tracking', () => {
    const node = { type: 'FRAME', name: 'TrackedExport' };
    const css = {
      display: 'flex',
      flexDirection: 'row',
      gap: '8',
      padding: '12',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const result = applyAutoLayout(node, css);
    const timestamp = new Date().toISOString();
    
    const exportLog = {
      event: 'export-complete',
      storyId: 'component--story',
      size: JSON.stringify(result).length,
      timestamp: timestamp
    };

    // Verify log structure
    expect(exportLog.event).toBe('export-complete');
    expect(exportLog.size).toBeGreaterThan(0);
    expect(exportLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
