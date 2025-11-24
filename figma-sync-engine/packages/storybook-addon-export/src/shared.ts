export const ADDON_ID = 'figma-sync-engine/export-addon';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const EVENT_EXPORT_REQUEST = `${ADDON_ID}/export-request`;

/**
 * Interface para mapear argumentos do Storybook para propriedades de variante do Figma
 */
export interface ArgToPropertyMapping {
    storybookArgName: string;
    figmaPropertyName: string;
    type: 'string' | 'boolean' | 'number' | 'enum';
    description: string;
}

/**
 * Mapeamento padrão de argumentos Storybook para propriedades Figma
 * Define as convenções de como args se transformam em variant properties
 */
export const DEFAULT_ARG_MAPPING: ArgToPropertyMapping[] = [
    {
        storybookArgName: 'variant',
        figmaPropertyName: 'variant',
        type: 'enum',
        description: 'Visual variant of the component'
    },
    {
        storybookArgName: 'size',
        figmaPropertyName: 'size',
        type: 'enum',
        description: 'Component size variant'
    },
    {
        storybookArgName: 'disabled',
        figmaPropertyName: 'state',
        type: 'boolean',
        description: 'Disabled state property'
    },
    {
        storybookArgName: 'loading',
        figmaPropertyName: 'state',
        type: 'boolean',
        description: 'Loading state property'
    }
];

/**
 * Mapeia argumentos do Storybook para propriedades de variante do Figma
 * @param args Argumentos do Storybook
 * @param customMapping Mapeamento customizado (opcional)
 * @returns Objeto com propriedades de variante do Figma
 */
export function mapArgsToVariantProperties(
    args: Record<string, any>,
    customMapping: ArgToPropertyMapping[] = DEFAULT_ARG_MAPPING
): Record<string, string> {
    const props: Record<string, string> = {};

    customMapping.forEach((mapping) => {
        if (mapping.storybookArgName in args) {
            const value = args[mapping.storybookArgName];
            if (value !== undefined && value !== null) {
                props[mapping.figmaPropertyName] = String(value);
            }
        }
    });

    return props;
}

/**
 * Valida se um argumento pode ser mapeado para uma propriedade de variante
 * @param argName Nome do argumento
 * @param mapping Mapeamento a usar
 * @returns true se o argumento pode ser mapeado
 */
export function isValidVariantProperty(
    argName: string,
    mapping: ArgToPropertyMapping[] = DEFAULT_ARG_MAPPING
): boolean {
    return mapping.some((m) => m.storybookArgName === argName);
}

/**
 * Interface para representar uma story selecionada para exportação
 */
export interface StorySelection {
    storyId: string;
    selected: boolean;
    name?: string;
}

/**
 * Interface para JSON de múltiplas stories
 */
export interface MultiStoryExportJSON {
    stories: Array<{
        storyId: string;
        name: string;
        figmaJson: any;
        variantProperties?: Record<string, string>;
    }>;
    exportedAt: string;
    count: number;
}

/**
 * Converte múltiplas stories para um JSON consolidado para exportação
 * @param stories Array de stories com seus JSONs Figma
 * @returns JSON combinado pronto para exportação
 */
export function combineStoriesToExportJSON(
    stories: Array<{
        storyId: string;
        name: string;
        figmaJson: any;
        variantProperties?: Record<string, string>;
    }>
): MultiStoryExportJSON {
    if (!stories || stories.length === 0) {
        throw new Error('At least one story is required for export');
    }

    return {
        stories: stories.map((story) => ({
            storyId: story.storyId,
            name: story.name,
            figmaJson: story.figmaJson,
            variantProperties: story.variantProperties || {}
        })),
        exportedAt: new Date().toISOString(),
        count: stories.length
    };
}

/**
 * Filtra stories que estão selecionadas
 * @param selections Array de seleções
 * @returns Apenas as stories selecionadas
 */
export function getSelectedStories(selections: StorySelection[]): StorySelection[] {
    return selections.filter((s) => s.selected);
}

/**
 * Valida se há pelo menos uma story selecionada
 * @param selections Array de seleções
 * @returns true se há pelo menos uma seleção
 */
export function hasSelectedStories(selections: StorySelection[]): boolean {
    return selections.some((s) => s.selected);
}
