/**
 * Captura segura do HTML da história ativa no Storybook.
 * MVP-2: Acessa o DOM renderizado e retorna string HTML sanitizada.
 */

/**
 * Interface de resultado da captura
 */
export interface CaptureResult {
    html: string;
    nodeCount: number;
    hasInteractiveElements: boolean;
}

/**
 * Lista de tags HTML permitidas (whitelist para segurança)
 */
const ALLOWED_TAGS = new Set([
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'input', 'label', 'select', 'textarea',
    'img', 'svg', 'path', 'circle', 'rect', 'line', 'polyline',
    'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'section', 'article', 'header', 'footer', 'nav', 'main',
    'form', 'fieldset', 'legend', 'figure', 'figcaption'
]);

/**
 * Atributos HTML permitidos (whitelist para segurança)
 */
const ALLOWED_ATTRIBUTES = new Set([
    'id', 'class', 'style',
    'data-testid', 'data-state',
    'type', 'value', 'placeholder', 'disabled', 'readonly',
    'src', 'alt', 'title', 'width', 'height',
    'href', 'target', 'rel',
    'role', 'aria-label', 'aria-describedby'
]);

/**
 * Remove atributos potencialmente perigosos de um elemento
 */
function sanitizeAttributes(element: Element): void {
    const attributesToRemove: string[] = [];

    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        if (!ALLOWED_ATTRIBUTES.has(attr.name)) {
            attributesToRemove.push(attr.name);
        }
    }

    attributesToRemove.forEach(attrName => element.removeAttribute(attrName));
}

/**
 * Recursivamente sanitiza um elemento e seus filhos
 */
function sanitizeElement(element: Element): Element | null {
    const tagName = element.tagName.toLowerCase();

    // Remove elementos não permitidos
    if (!ALLOWED_TAGS.has(tagName)) {
        // Se for script, style ou other malicious, descarta completamente
        if (tagName === 'script' || tagName === 'style' || tagName === 'iframe') {
            return null;
        }
        // Para outros, mantém os filhos
        const fragment = document.createDocumentFragment();
        for (const child of Array.from(element.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const sanitized = sanitizeElement(child as Element);
                if (sanitized) fragment.appendChild(sanitized.cloneNode(true));
            } else if (child.nodeType === Node.TEXT_NODE) {
                fragment.appendChild(child.cloneNode(true));
            }
        }
        return fragment as any;
    }

    // Clona o elemento
    const cloned = element.cloneNode(false) as Element;

    // Sanitiza atributos
    sanitizeAttributes(cloned);

    // Processa filhos recursivamente
    for (const child of Array.from(element.childNodes)) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const sanitized = sanitizeElement(child as Element);
            if (sanitized) {
                cloned.appendChild(sanitized.cloneNode(true));
            }
        } else if (child.nodeType === Node.TEXT_NODE) {
            cloned.appendChild(child.cloneNode(true));
        }
    }

    return cloned;
}

/**
 * Detecta se há elementos interativos
 */
function hasInteractiveElements(element: Element): boolean {
    const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
    return interactiveTags.some(tag => element.querySelector(tag) !== null);
}

/**
 * Captura o HTML renderizado da história ativa do Storybook
 * 
 * @param containerId - ID do container do Storybook (padrão: 'storybook-root' ou 'root')
 * @returns Promessa com HTML sanitizado, contagem de nós e indicação de elementos interativos
 * 
 * @example
 * const result = await captureStoryHTML('root');
 * console.log(result.html); // HTML sanitizado
 * console.log(result.nodeCount); // 25
 */
export async function captureStoryHTML(containerId: string = 'root'): Promise<CaptureResult> {
    try {
        // Obtém o container
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with ID "${containerId}" not found`);
        }

        // Aguarda um ciclo de renderização para garantir que o componente está renderizado
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clona e sanitiza a árvore DOM
        const sanitized = sanitizeElement(container);
        if (!sanitized) {
            throw new Error('Failed to sanitize HTML');
        }

        // Gera string HTML
        const html = sanitized.outerHTML;

        // Conta nós
        const nodeCount = sanitized.querySelectorAll('*').length;

        // Detecta elementos interativos
        const hasInteractive = hasInteractiveElements(sanitized);

        return {
            html,
            nodeCount,
            hasInteractiveElements: hasInteractive
        };
    } catch (error) {
        throw new Error(`Failed to capture HTML: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Extrai apenas o corpo visível (sem decorações do Storybook)
 * Útil se o componente estiver dentro de um wrapper específico
 */
export async function captureComponentHTML(selector: string): Promise<CaptureResult> {
    try {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element with selector "${selector}" not found`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        const sanitized = sanitizeElement(element);
        if (!sanitized) {
            throw new Error('Failed to sanitize HTML');
        }

        const html = sanitized.outerHTML;
        const nodeCount = sanitized.querySelectorAll('*').length;
        const hasInteractive = hasInteractiveElements(sanitized);

        return {
            html,
            nodeCount,
            hasInteractiveElements: hasInteractive
        };
    } catch (error) {
        throw new Error(`Failed to capture component HTML: ${error instanceof Error ? error.message : String(error)}`);
    }
}
