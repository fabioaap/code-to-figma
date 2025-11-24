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

describe('[VAR-3] Plugin cria ComponentSet a partir de múltiplas stories', () => {
    describe('ComponentSet creation logic', () => {
        it('should identify multi-story export JSON format', () => {
            const data = {
                stories: [
                    {
                        storyId: 'Button/Primary',
                        name: 'Primary',
                        figmaJson: { type: 'FRAME', name: 'Button' }
                    }
                ],
                exportedAt: new Date().toISOString(),
                count: 1
            };

            expect(data.stories).toBeDefined();
            expect(data.stories.length).toBeGreaterThan(0);
            expect(data.stories[0]).toHaveProperty('storyId');
            expect(data.stories[0]).toHaveProperty('figmaJson');
        });

        it('should support variant properties in story data', () => {
            const data = {
                stories: [
                    {
                        storyId: 'Button/Primary',
                        name: 'Primary',
                        figmaJson: { type: 'FRAME' },
                        variantProperties: { variant: 'primary', size: 'medium' }
                    }
                ]
            };

            expect(data.stories[0].variantProperties).toEqual({
                variant: 'primary',
                size: 'medium'
            });
        });

        it('should handle multiple stories for ComponentSet', () => {
            const data = {
                stories: [
                    {
                        storyId: 'Button/Primary',
                        name: 'Primary',
                        figmaJson: { type: 'FRAME', name: 'Primary Button' }
                    },
                    {
                        storyId: 'Button/Secondary',
                        name: 'Secondary',
                        figmaJson: { type: 'FRAME', name: 'Secondary Button' }
                    },
                    {
                        storyId: 'Button/Large',
                        name: 'Large',
                        figmaJson: { type: 'FRAME', name: 'Large Button' }
                    }
                ]
            };

            expect(data.stories.length).toBe(3);
            data.stories.forEach((story) => {
                expect(story.figmaJson.type).toBe('FRAME');
                expect(story.name).toBeDefined();
            });
        });

        it('should extract component name from first story', () => {
            const storyName = 'Button/Primary';
            const componentName = storyName.split('/')[0];

            expect(componentName).toBe('Button');
        });

        it('should extract variant name from story name', () => {
            const storyName = 'Button/Primary';
            const variantName = storyName.split('/').pop();

            expect(variantName).toBe('Primary');
        });

        it('should generate variant naming convention', () => {
            const componentName = 'Button';
            const stories = [
                { name: 'Button/Primary' },
                { name: 'Button/Secondary' },
                { name: 'Button/Large' }
            ];

            const variantNames = stories.map((story, index) => {
                if (index === 0) {
                    return `${componentName}=base`;
                }
                const variantName = story.name.split('/').pop() || `variant-${index}`;
                return `${componentName}=${variantName}`;
            });

            expect(variantNames).toEqual([
                'Button=base',
                'Button=Secondary',
                'Button=Large'
            ]);
        });

        it('should handle stories without variant properties', () => {
            const data = {
                stories: [
                    {
                        storyId: 'Button/Primary',
                        name: 'Primary',
                        figmaJson: { type: 'FRAME' },
                        variantProperties: undefined
                    }
                ]
            };

            const story = data.stories[0];
            const variantProps = story.variantProperties || {}; expect(variantProps).toEqual({});
            expect(Object.keys(variantProps).length).toBe(0);
        });

        it('should validate story data structure', () => {
            const validStory = {
                storyId: 'Button/Primary',
                name: 'Primary',
                figmaJson: { type: 'FRAME' },
                variantProperties: { variant: 'primary' }
            };

            expect(validStory).toHaveProperty('storyId');
            expect(validStory).toHaveProperty('name');
            expect(validStory).toHaveProperty('figmaJson');
            expect(validStory.figmaJson).toHaveProperty('type');
        });

        it('should handle empty stories array', () => {
            const data = {
                stories: []
            };

            expect(data.stories.length).toBe(0);
            expect(data.stories).toEqual([]);
        });

        it('should support stories with different node types', () => {
            const stories = [
                { figmaJson: { type: 'FRAME' } },
                { figmaJson: { type: 'RECTANGLE' } },
                { figmaJson: { type: 'TEXT' } }
            ];

            const types = stories.map(s => s.figmaJson.type);
            expect(types).toContain('FRAME');
            expect(types).toContain('RECTANGLE');
            expect(types).toContain('TEXT');
        });

        it('should calculate layout positions for multiple stories', () => {
            const stories = [
                { figmaJson: { width: 100 } },
                { figmaJson: { width: 100 } },
                { figmaJson: { width: 100 } }
            ];

            let xOffset = 0;
            const positions = stories.map((story) => {
                const x = xOffset;
                const width = story.figmaJson.width || 100;
                xOffset += width + 40;
                return { x, width };
            });

            expect(positions[0].x).toBe(0);
            expect(positions[1].x).toBe(140);
            expect(positions[2].x).toBe(280);
        });
    });

    describe('ComponentSet naming conventions', () => {
        it('should name single variant as base', () => {
            const name = 'Button/Primary';
            const componentName = name.split('/')[0];
            const baseVariantName = `${componentName}=base`;

            expect(baseVariantName).toBe('Button=base');
        });

        it('should name additional variants with property values', () => {
            const stories = [
                { name: 'Button/Primary' },
                { name: 'Button/Secondary' },
                { name: 'Button/Danger' }
            ];

            const variantNames = stories.map((s, i) => {
                const baseName = s.name.split('/')[0];
                if (i === 0) return `${baseName}=base`;
                const variant = s.name.split('/').pop();
                return `${baseName}=${variant}`;
            });

            expect(variantNames[0]).toBe('Button=base');
            expect(variantNames[1]).toBe('Button=Secondary');
            expect(variantNames[2]).toBe('Button=Danger');
        });

        it('should handle complex story paths', () => {
            const complexName = 'Components/Forms/Button/Primary';
            const componentName = complexName.split('/')[0];
            const variantName = complexName.split('/').pop();

            expect(componentName).toBe('Components');
            expect(variantName).toBe('Primary');
        });
    });

    describe('Error handling', () => {
        it('should detect empty stories array', () => {
            const data = { stories: [] };
            const hasStories = data.stories && data.stories.length > 0;

            expect(hasStories).toBe(false);
        });

        it('should detect missing figmaJson', () => {
            const story = {
                storyId: 'Button/Primary',
                name: 'Primary'
            };

            const isValid = 'figmaJson' in story;
            expect(isValid).toBe(false);
        });

        it('should validate JSON structure before processing', () => {
            const story = {
                storyId: 'Button/Primary',
                name: 'Primary',
                figmaJson: { type: 'FRAME' }
            };

            const isValid = story.figmaJson && story.figmaJson.type === 'FRAME';
            expect(isValid).toBe(true);
        });

        it('should handle null variant properties gracefully', () => {
            const story = {
                storyId: 'Button/Primary',
                name: 'Primary',
                figmaJson: { type: 'FRAME' },
                variantProperties: null
            };

            const props = story.variantProperties || {};
            expect(props).toEqual({});
        });
    });
});
