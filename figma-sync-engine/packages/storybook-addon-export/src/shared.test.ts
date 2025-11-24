import {
    mapArgsToVariantProperties,
    isValidVariantProperty,
    DEFAULT_ARG_MAPPING,
    ArgToPropertyMapping,
    StorySelection,
    MultiStoryExportJSON,
    combineStoriesToExportJSON,
    getSelectedStories,
    hasSelectedStories
} from './shared';
import { describe, it, expect } from 'vitest';

describe('[VAR-1] Convention for mapping Storybook args to Figma variantProperties', () => {
    describe('mapArgsToVariantProperties', () => {
        it('should map simple variant argument to property', () => {
            const args = { variant: 'primary' };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({ variant: 'primary' });
        });

        it('should map disabled boolean to state property', () => {
            const args = { disabled: true };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({ state: 'true' });
        });

        it('should map loading boolean to state property', () => {
            const args = { loading: false };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({ state: 'false' });
        });

        it('should map multiple variant arguments at once', () => {
            const args = {
                variant: 'secondary',
                size: 'large',
                disabled: false
            };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({
                variant: 'secondary',
                size: 'large',
                state: 'false'
            });
        });

        it('should ignore unknown arguments not in mapping', () => {
            const args = {
                variant: 'primary',
                unknownArg: 'should-be-ignored',
                anotherUnknown: 123
            };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({ variant: 'primary' });
        });

        it('should handle empty args object', () => {
            const args = {};
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({});
        });

        it('should support custom mapping', () => {
            const customMapping: ArgToPropertyMapping[] = [
                {
                    storybookArgName: 'theme',
                    figmaPropertyName: 'theme',
                    type: 'enum',
                    description: 'Theme variant'
                }
            ];
            const args = { theme: 'dark' };
            const result = mapArgsToVariantProperties(args, customMapping);
            expect(result).toEqual({ theme: 'dark' });
        });

        it('should ignore null and undefined values', () => {
            const args = {
                variant: 'primary',
                size: null,
                disabled: undefined
            };
            const result = mapArgsToVariantProperties(args);
            expect(result).toEqual({ variant: 'primary' });
        });
    });

    describe('isValidVariantProperty', () => {
        it('should return true for valid variant property', () => {
            const result = isValidVariantProperty('variant');
            expect(result).toBe(true);
        });

        it('should return true for valid size property', () => {
            const result = isValidVariantProperty('size');
            expect(result).toBe(true);
        });

        it('should return true for valid disabled property', () => {
            const result = isValidVariantProperty('disabled');
            expect(result).toBe(true);
        });

        it('should return true for valid loading property', () => {
            const result = isValidVariantProperty('loading');
            expect(result).toBe(true);
        });

        it('should return false for invalid property', () => {
            const result = isValidVariantProperty('unknownProperty');
            expect(result).toBe(false);
        });

        it('should support custom mapping validation', () => {
            const customMapping: ArgToPropertyMapping[] = [
                {
                    storybookArgName: 'color',
                    figmaPropertyName: 'color',
                    type: 'enum',
                    description: 'Color variant'
                }
            ];
            const result = isValidVariantProperty('color', customMapping);
            expect(result).toBe(true);
        });

        it('should return false for default properties when using custom mapping', () => {
            const customMapping: ArgToPropertyMapping[] = [
                {
                    storybookArgName: 'theme',
                    figmaPropertyName: 'theme',
                    type: 'enum',
                    description: 'Theme variant'
                }
            ];
            const result = isValidVariantProperty('variant', customMapping);
            expect(result).toBe(false);
        });
    });

    describe('DEFAULT_ARG_MAPPING', () => {
        it('should contain mapping for variant argument', () => {
            const variantMapping = DEFAULT_ARG_MAPPING.find(m => m.storybookArgName === 'variant');
            expect(variantMapping).toBeDefined();
            expect(variantMapping?.figmaPropertyName).toBe('variant');
            expect(variantMapping?.type).toBe('enum');
        });

        it('should contain mapping for size argument', () => {
            const sizeMapping = DEFAULT_ARG_MAPPING.find(m => m.storybookArgName === 'size');
            expect(sizeMapping).toBeDefined();
            expect(sizeMapping?.figmaPropertyName).toBe('size');
            expect(sizeMapping?.type).toBe('enum');
        });

        it('should contain mapping for disabled argument', () => {
            const disabledMapping = DEFAULT_ARG_MAPPING.find(
                m => m.storybookArgName === 'disabled'
            );
            expect(disabledMapping).toBeDefined();
            expect(disabledMapping?.figmaPropertyName).toBe('state');
            expect(disabledMapping?.type).toBe('boolean');
        });

        it('should contain mapping for loading argument', () => {
            const loadingMapping = DEFAULT_ARG_MAPPING.find(m => m.storybookArgName === 'loading');
            expect(loadingMapping).toBeDefined();
            expect(loadingMapping?.figmaPropertyName).toBe('state');
            expect(loadingMapping?.type).toBe('boolean');
        });

        it('should have at least 4 mappings', () => {
            expect(DEFAULT_ARG_MAPPING.length).toBeGreaterThanOrEqual(4);
        });
    });
});

describe('[VAR-2] Export múltiplo de stories com seleção e consolidação', () => {
  describe('combineStoriesToExportJSON', () => {
    it('should combine single story into export JSON', () => {
      const stories = [
        {
          storyId: 'Button/Primary',
          name: 'Primary Button',
          figmaJson: { type: 'FRAME', name: 'Button' }
        }
      ];
      const result = combineStoriesToExportJSON(stories);
      expect(result.count).toBe(1);
      expect(result.stories).toHaveLength(1);
      expect(result.stories[0].storyId).toBe('Button/Primary');
    });

    it('should combine multiple stories into export JSON', () => {
      const stories = [
        {
          storyId: 'Button/Primary',
          name: 'Primary Button',
          figmaJson: { type: 'FRAME', name: 'Button' }
        },
        {
          storyId: 'Button/Secondary',
          name: 'Secondary Button',
          figmaJson: { type: 'FRAME', name: 'Button' }
        },
        {
          storyId: 'Button/Large',
          name: 'Large Button',
          figmaJson: { type: 'FRAME', name: 'Button' }
        }
      ];
      const result = combineStoriesToExportJSON(stories);
      expect(result.count).toBe(3);
      expect(result.stories).toHaveLength(3);
    });

    it('should include variant properties in combined JSON', () => {
      const stories = [
        {
          storyId: 'Button/Primary',
          name: 'Primary',
          figmaJson: { type: 'FRAME' },
          variantProperties: { variant: 'primary', size: 'medium' }
        }
      ];
      const result = combineStoriesToExportJSON(stories);
      expect(result.stories[0].variantProperties).toEqual({
        variant: 'primary',
        size: 'medium'
      });
    });

    it('should add exportedAt timestamp', () => {
      const stories = [
        {
          storyId: 'Button/Primary',
          name: 'Primary',
          figmaJson: { type: 'FRAME' }
        }
      ];
      const result = combineStoriesToExportJSON(stories);
      expect(result.exportedAt).toBeDefined();
      expect(new Date(result.exportedAt).getTime()).toBeGreaterThan(0);
    });

    it('should throw error if stories array is empty', () => {
      expect(() => combineStoriesToExportJSON([])).toThrow(
        'At least one story is required for export'
      );
    });

    it('should throw error if stories is null', () => {
      expect(() => combineStoriesToExportJSON(null as any)).toThrow(
        'At least one story is required for export'
      );
    });

    it('should handle stories without variant properties', () => {
      const stories = [
        {
          storyId: 'Button/Primary',
          name: 'Primary',
          figmaJson: { type: 'FRAME' }
        }
      ];
      const result = combineStoriesToExportJSON(stories);
      expect(result.stories[0].variantProperties).toEqual({});
    });
  });

  describe('getSelectedStories', () => {
    it('should filter selected stories', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: true, name: 'Primary' },
        { storyId: 'Button/Secondary', selected: false, name: 'Secondary' },
        { storyId: 'Button/Large', selected: true, name: 'Large' }
      ];
      const result = getSelectedStories(selections);
      expect(result).toHaveLength(2);
      expect(result[0].storyId).toBe('Button/Primary');
      expect(result[1].storyId).toBe('Button/Large');
    });

    it('should return empty array if no stories selected', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: false },
        { storyId: 'Button/Secondary', selected: false }
      ];
      const result = getSelectedStories(selections);
      expect(result).toHaveLength(0);
    });

    it('should return all if all stories selected', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: true },
        { storyId: 'Button/Secondary', selected: true }
      ];
      const result = getSelectedStories(selections);
      expect(result).toHaveLength(2);
    });
  });

  describe('hasSelectedStories', () => {
    it('should return true if at least one story selected', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: true },
        { storyId: 'Button/Secondary', selected: false }
      ];
      const result = hasSelectedStories(selections);
      expect(result).toBe(true);
    });

    it('should return false if no stories selected', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: false },
        { storyId: 'Button/Secondary', selected: false }
      ];
      const result = hasSelectedStories(selections);
      expect(result).toBe(false);
    });

    it('should return false for empty selection array', () => {
      const selections: StorySelection[] = [];
      const result = hasSelectedStories(selections);
      expect(result).toBe(false);
    });

    it('should return true for single selected story', () => {
      const selections: StorySelection[] = [
        { storyId: 'Button/Primary', selected: true }
      ];
      const result = hasSelectedStories(selections);
      expect(result).toBe(true);
    });
  });
});
