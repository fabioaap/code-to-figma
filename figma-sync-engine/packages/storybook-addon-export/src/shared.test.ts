import {
    mapArgsToVariantProperties,
    isValidVariantProperty,
    DEFAULT_ARG_MAPPING,
    ArgToPropertyMapping
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
