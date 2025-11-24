/**
 * VAR-1: Mapeamento de args do Storybook para variantProperties do Figma
 * 
 * Convenção:
 * - String/Number: convertidos diretamente
 * - Boolean true: mapeado para nome da propriedade (ex: disabled=true → state="disabled")
 * - Boolean false: ignorado (representa estado padrão)
 * - Objects/Arrays: ignorados (não são variantes)
 */

/**
 * Tipo para propriedades de variante do Figma
 */
export type VariantProperties = Record<string, string>;

/**
 * Lista de propriedades booleanas que devem ser mapeadas para estados
 */
const BOOLEAN_STATE_PROPS = new Set([
    'disabled',
    'loading',
    'active',
    'selected',
    'checked',
    'error',
    'success',
    'warning',
    'readonly',
    'required',
    'optional',
    'hover',
    'focus',
    'pressed'
]);

/**
 * Converte args do Storybook em variantProperties do Figma
 * 
 * @param args - Args da story do Storybook
 * @returns Objeto com variantProperties no formato Figma
 * 
 * @example
 * // Args simples
 * argsToVariantProperties({ variant: 'primary', size: 'large' })
 * // => { variant: 'primary', size: 'large' }
 * 
 * @example
 * // Boolean como estado
 * argsToVariantProperties({ disabled: true, loading: false })
 * // => { state: 'disabled' }
 * 
 * @example
 * // Números são convertidos para string
 * argsToVariantProperties({ level: 1 })
 * // => { level: '1' }
 */
export function argsToVariantProperties(args: Record<string, any>): VariantProperties {
    const variantProps: VariantProperties = {};

    for (const [key, value] of Object.entries(args)) {
        // Ignora valores null, undefined, objects e arrays
        if (value === null || value === undefined) {
            continue;
        }

        if (typeof value === 'object' || Array.isArray(value)) {
            continue;
        }

        // Converte strings e números diretamente
        if (typeof value === 'string' || typeof value === 'number') {
            variantProps[key] = String(value);
            continue;
        }

        // Mapeia booleanos para estados
        if (typeof value === 'boolean') {
            // Apenas processa true (false é estado padrão)
            if (value === true && BOOLEAN_STATE_PROPS.has(key)) {
                variantProps.state = key;
            }
            continue;
        }
    }

    return variantProps;
}

/**
 * Valida se um objeto contém variantProperties válidas
 * 
 * @param props - Objeto a validar
 * @returns true se é um objeto válido de variantProperties
 */
export function isValidVariantProperties(props: any): props is VariantProperties {
    if (!props || typeof props !== 'object' || Array.isArray(props)) {
        return false;
    }

    // Todas as propriedades devem ser strings
    return Object.values(props).every(value => typeof value === 'string');
}

/**
 * Gera nome de componente baseado em variantProperties
 * Útil para criar nomes descritivos no Figma
 * 
 * @param baseName - Nome base do componente
 * @param variantProps - Propriedades de variante
 * @returns Nome formatado (ex: "Button/Primary/Large")
 * 
 * @example
 * generateComponentName('Button', { variant: 'primary', size: 'large' })
 * // => 'Button/Primary/Large'
 */
export function generateComponentName(
    baseName: string,
    variantProps: VariantProperties
): string {
    if (Object.keys(variantProps).length === 0) {
        return baseName;
    }

    const variantParts = Object.entries(variantProps)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Ordena alfabeticamente
        .map(([, value]) => {
            // Capitaliza primeira letra de cada palavra
            return value
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-');
        });

    return [baseName, ...variantParts].join('/');
}
