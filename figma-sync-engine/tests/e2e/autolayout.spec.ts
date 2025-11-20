import { test, expect } from '@playwright/test';
import { applyAutoLayout } from '../../packages/autolayout-interpreter/src/index';

/**
 * E2E Tests for Auto Layout Engine
 * Validates complete flow from CSS parsing to Figma node generation
 */

test.describe('Auto Layout Engine E2E', () => {
  test('should generate valid Figma JSON with horizontal layout', () => {
    const node = { type: 'FRAME', name: 'Container' };
    const css = {
      display: 'flex',
      flexDirection: 'row',
      gap: '16',
      padding: '20',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const result = applyAutoLayout(node, css);

    // Verify structure
    expect(result.type).toBe('FRAME');
    expect(result.name).toBe('Container');
    
    // Verify layout properties
    expect(result.layoutMode).toBe('HORIZONTAL');
    expect(result.itemSpacing).toBe(16);
    
    // Verify padding
    expect(result.paddingTop).toBe(20);
    expect(result.paddingRight).toBe(20);
    expect(result.paddingBottom).toBe(20);
    expect(result.paddingLeft).toBe(20);
    
    // Verify alignment
    expect(result.primaryAxisAlignItems).toBe('CENTER');
    expect(result.counterAxisAlignItems).toBe('CENTER');
  });

  test('should generate valid Figma JSON with vertical layout', () => {
    const node = { type: 'FRAME', name: 'Column' };
    const css = {
      display: 'flex',
      flexDirection: 'column',
      gap: '12',
      padding: '16 24',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    };

    const result = applyAutoLayout(node, css);

    expect(result.layoutMode).toBe('VERTICAL');
    expect(result.itemSpacing).toBe(12);
    expect(result.paddingTop).toBe(16);
    expect(result.paddingRight).toBe(24);
    expect(result.paddingBottom).toBe(16);
    expect(result.paddingLeft).toBe(24);
    expect(result.primaryAxisAlignItems).toBe('SPACE_BETWEEN');
    expect(result.counterAxisAlignItems).toBe('MIN');
  });

  test('should handle complex nested structures', () => {
    const node = {
      type: 'FRAME',
      name: 'Parent',
      children: [
        { type: 'TEXT', name: 'Title', characters: 'Hello' },
        { type: 'FRAME', name: 'Child', children: [] }
      ]
    };
    const css = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8',
      padding: '12 16 20 24'
    };

    const result = applyAutoLayout(node, css);

    expect(result.children).toBeDefined();
    expect(result.children?.length).toBe(2);
    expect(result.paddingTop).toBe(12);
    expect(result.paddingRight).toBe(16);
    expect(result.paddingBottom).toBe(20);
    expect(result.paddingLeft).toBe(24);
  });

  test('should export serializable JSON', () => {
    const node = { type: 'FRAME', name: 'ExportTest' };
    const css = {
      display: 'flex',
      flexDirection: 'row',
      gap: '10',
      padding: '15',
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    };

    const result = applyAutoLayout(node, css);
    
    // Should be serializable to JSON
    const jsonString = JSON.stringify(result, null, 2);
    expect(jsonString).toBeTruthy();
    
    // Should be parseable
    const parsed = JSON.parse(jsonString);
    expect(parsed.layoutMode).toBe('HORIZONTAL');
    expect(parsed.primaryAxisAlignItems).toBe('MAX');
    expect(parsed.counterAxisAlignItems).toBe('MAX');
  });

  test('should handle missing optional properties gracefully', () => {
    const node = { type: 'FRAME' };
    const css = {
      display: 'flex'
    };

    const result = applyAutoLayout(node, css);

    // Should have default layout mode
    expect(result.layoutMode).toBe('HORIZONTAL');
    
    // Should not have spacing if not specified
    expect(result.itemSpacing).toBeUndefined();
  });

  test('should validate complete export format', () => {
    const node = {
      type: 'FRAME',
      name: 'StoryComponent',
      children: [
        {
          type: 'TEXT',
          name: 'Label',
          characters: 'Click me',
          fontSize: 14
        },
        {
          type: 'RECTANGLE',
          name: 'Background',
          width: 100,
          height: 40,
          fills: [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 } }]
        }
      ]
    };
    const css = {
      display: 'flex',
      flexDirection: 'row',
      gap: '8',
      padding: '12',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const result = applyAutoLayout(node, css);
    
    // Create export format
    const exportData = {
      root: result,
      metadata: {
        version: '0.1.0',
        generator: 'figma-sync-engine',
        timestamp: new Date().toISOString()
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const parsed = JSON.parse(jsonString);

    // Verify export structure
    expect(parsed.root).toBeDefined();
    expect(parsed.root.type).toBe('FRAME');
    expect(parsed.root.layoutMode).toBe('HORIZONTAL');
    expect(parsed.root.children).toHaveLength(2);
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.version).toBe('0.1.0');
  });

  test('should measure JSON size for logging', () => {
    const node = { 
      type: 'FRAME', 
      name: 'SizeTest',
      children: Array(10).fill(null).map((_, i) => ({
        type: 'TEXT',
        name: `Item${i}`,
        characters: `Text ${i}`
      }))
    };
    const css = {
      display: 'flex',
      flexDirection: 'column',
      gap: '4',
      padding: '8'
    };

    const result = applyAutoLayout(node, css);
    const jsonString = JSON.stringify(result);
    const sizeInBytes = jsonString.length;

    // Size should be reasonable
    expect(sizeInBytes).toBeGreaterThan(0);
    expect(sizeInBytes).toBeLessThan(10000); // Sanity check
    
    // Should be able to log size
    console.log(`JSON size: ${sizeInBytes} bytes`);
  });
});
