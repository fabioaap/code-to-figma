/**
 * Testes para variantMapper - VAR-1
 * Valida conversão de args do Storybook para variantProperties do Figma
 */

import { describe, it, expect } from 'vitest';
import {
    argsToVariantProperties,
    isValidVariantProperties,
    generateComponentName,
    type VariantProperties
} from './variantMapper';

describe('variantMapper - VAR-1', () => {
    describe('argsToVariantProperties', () => {
        describe('conversão básica', () => {
            it('should convert string args to variantProperties', () => {
                const args = { variant: 'primary', size: 'large' };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary',
                    size: 'large'
                });
            });

            it('should convert number args to string', () => {
                const args = { level: 1, count: 42 };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    level: '1',
                    count: '42'
                });
            });

            it('should handle empty args', () => {
                const result = argsToVariantProperties({});
                expect(result).toEqual({});
            });
        });

        describe('conversão de booleanos', () => {
            it('should map boolean true to state', () => {
                const args = { disabled: true };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    state: 'disabled'
                });
            });

            it('should ignore boolean false', () => {
                const args = { disabled: false };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({});
            });

            it('should map loading boolean to state', () => {
                const args = { loading: true };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    state: 'loading'
                });
            });

            it('should handle multiple boolean states (only first true is used)', () => {
                const args = { disabled: true, loading: true };
                const result = argsToVariantProperties(args);

                // Apenas um estado é mapeado (primeiro encontrado na iteração)
                expect(result.state).toBeDefined();
                expect(['disabled', 'loading']).toContain(result.state);
            });

            it('should map checked boolean to state', () => {
                const args = { checked: true };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    state: 'checked'
                });
            });

            it('should map error boolean to state', () => {
                const args = { error: true };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    state: 'error'
                });
            });
        });

        describe('valores ignorados', () => {
            it('should ignore null values', () => {
                const args = { variant: 'primary', empty: null };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary'
                });
            });

            it('should ignore undefined values', () => {
                const args = { variant: 'primary', empty: undefined };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary'
                });
            });

            it('should ignore object values', () => {
                const args = {
                    variant: 'primary',
                    style: { color: 'red', fontSize: 14 }
                };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary'
                });
            });

            it('should ignore array values', () => {
                const args = {
                    variant: 'primary',
                    items: ['one', 'two', 'three']
                };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary'
                });
            });

            it('should ignore function values', () => {
                const args = {
                    variant: 'primary',
                    onClick: () => { }
                };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    variant: 'primary'
                });
            });
        });

        describe('casos reais do Storybook', () => {
            it('should handle Button story args', () => {
                const args = {
                    label: 'Click me',
                    variant: 'primary',
                    size: 'medium',
                    onClick: () => { }
                };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    label: 'Click me',
                    variant: 'primary',
                    size: 'medium'
                });
            });

            it('should handle Input story args', () => {
                const args = {
                    placeholder: 'Enter text',
                    type: 'text',
                    disabled: false,
                    error: true
                };
                const result = argsToVariantProperties(args);

                expect(result).toEqual({
                    placeholder: 'Enter text',
                    type: 'text',
                    state: 'error'
                });
            });

            it('should handle Card story args with mixed types', () => {
                const args = {
                    title: 'Card Title',
                    elevation: 2,
                    interactive: true,
                    content: { text: 'Some content' }
                };
                const result = argsToVariantProperties(args);

                // interactive não é um boolean state prop conhecido
                expect(result).toEqual({
                    title: 'Card Title',
                    elevation: '2'
                });
            });
        });
    });

    describe('isValidVariantProperties', () => {
        it('should validate valid variantProperties', () => {
            const props: VariantProperties = {
                variant: 'primary',
                size: 'large'
            };

            expect(isValidVariantProperties(props)).toBe(true);
        });

        it('should reject null', () => {
            expect(isValidVariantProperties(null)).toBe(false);
        });

        it('should reject undefined', () => {
            expect(isValidVariantProperties(undefined)).toBe(false);
        });

        it('should reject arrays', () => {
            expect(isValidVariantProperties(['primary', 'large'])).toBe(false);
        });

        it('should reject objects with non-string values', () => {
            const props = {
                variant: 'primary',
                size: 42
            };

            expect(isValidVariantProperties(props)).toBe(false);
        });

        it('should accept empty object', () => {
            expect(isValidVariantProperties({})).toBe(true);
        });
    });

    describe('generateComponentName', () => {
        it('should generate name with single variant', () => {
            const props = { variant: 'primary' };
            const name = generateComponentName('Button', props);

            expect(name).toBe('Button/Primary');
        });

        it('should generate name with multiple variants', () => {
            const props = {
                variant: 'primary',
                size: 'large'
            };
            const name = generateComponentName('Button', props);

            // Deve estar ordenado alfabeticamente por chave
            expect(name).toBe('Button/Large/Primary');
        });

        it('should capitalize variant values', () => {
            const props = {
                variant: 'secondary',
                size: 'small'
            };
            const name = generateComponentName('Button', props);

            // Keys are sorted alphabetically: size, variant
            expect(name).toBe('Button/Small/Secondary');
        });

        it('should handle kebab-case values', () => {
            const props = {
                variant: 'primary-outline'
            };
            const name = generateComponentName('Button', props);

            expect(name).toBe('Button/Primary-Outline');
        });

        it('should return base name for empty props', () => {
            const name = generateComponentName('Button', {});
            expect(name).toBe('Button');
        });

        it('should handle state variants', () => {
            const props = {
                variant: 'primary',
                state: 'disabled'
            };
            const name = generateComponentName('Button', props);

            expect(name).toBe('Button/Disabled/Primary');
        });

        it('should sort variant keys alphabetically', () => {
            const props = {
                zIndex: 'high',
                variant: 'primary',
                size: 'medium',
                appearance: 'solid'
            };
            const name = generateComponentName('Card', props);

            // appearance, size, variant, zIndex
            expect(name).toBe('Card/Solid/Medium/Primary/High');
        });
    });

    describe('integração completa', () => {
        it('should convert args and generate component name', () => {
            const args = {
                variant: 'primary',
                size: 'large',
                label: 'Click me',
                onClick: () => { }
            };

            const variantProps = argsToVariantProperties(args);
            const componentName = generateComponentName('Button', variantProps);

            expect(variantProps).toEqual({
                variant: 'primary',
                size: 'large',
                label: 'Click me'
            });
            expect(componentName).toBe('Button/Click me/Large/Primary');
        });

        it('should handle disabled state in full flow', () => {
            const args = {
                variant: 'secondary',
                disabled: true
            };

            const variantProps = argsToVariantProperties(args);
            const componentName = generateComponentName('Button', variantProps);

            expect(variantProps).toEqual({
                variant: 'secondary',
                state: 'disabled'
            });
            expect(componentName).toBe('Button/Disabled/Secondary');
        });
    });
});
