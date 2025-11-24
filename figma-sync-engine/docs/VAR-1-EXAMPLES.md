# VAR-1: Exemplos de Mapeamento de Variantes

Este documento demonstra exemplos práticos de como args do Storybook são convertidos em `variantProperties` do Figma.

## Exemplo 1: Botão com Variant e Size

### Story no Storybook
```typescript
// Button.stories.tsx
export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'large',
    label: 'Click me'
  }
};
```

### JSON Figma Exportado
```json
{
  "type": "COMPONENT",
  "name": "Button/Click me/Large/Primary",
  "variantProperties": {
    "variant": "primary",
    "size": "large",
    "label": "Click me"
  },
  "children": [],
  "__html": "<button>...</button>",
  "__export": {
    "timestamp": "2025-11-24T04:00:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "example-button--primary-large",
    "nodeCount": 1,
    "hasInteractiveElements": true,
    "args": {
      "variant": "primary",
      "size": "large",
      "label": "Click me"
    }
  }
}
```

### Análise
- ✅ `type` muda de `FRAME` para `COMPONENT` (presença de variants)
- ✅ `name` gerado automaticamente: "Button/Click me/Large/Primary" (ordenado alfabeticamente por chave)
- ✅ `variantProperties` contém apenas valores primitivos convertidos para string
- ✅ `__export.args` preserva args originais para referência

## Exemplo 2: Input com Estado Error

### Story no Storybook
```typescript
// Input.stories.tsx
export const WithError: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter email',
    error: true,
    helperText: 'Invalid email format'
  }
};
```

### JSON Figma Exportado
```json
{
  "type": "COMPONENT",
  "name": "Input/Invalid email format/Enter email/Text/Error",
  "variantProperties": {
    "type": "text",
    "placeholder": "Enter email",
    "state": "error",
    "helperText": "Invalid email format"
  },
  "children": [],
  "__html": "<input>...</input>",
  "__export": {
    "timestamp": "2025-11-24T04:00:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "example-input--with-error",
    "nodeCount": 3,
    "hasInteractiveElements": true,
    "args": {
      "type": "text",
      "placeholder": "Enter email",
      "error": true,
      "helperText": "Invalid email format"
    }
  }
}
```

### Análise
- ✅ Boolean `error: true` → `state: "error"`
- ✅ Ordem alfabética: helperText, placeholder, state, type
- ✅ Args originais preservados em `__export.args`

## Exemplo 3: Card Simples sem Variantes

### Story no Storybook
```typescript
// Card.stories.tsx
export const Default: Story = {
  args: {
    content: { title: 'Title', body: 'Body' },
    onClick: () => console.log('clicked')
  }
};
```

### JSON Figma Exportado
```json
{
  "type": "FRAME",
  "name": "example-card--default",
  "children": [],
  "__html": "<div>...</div>",
  "__export": {
    "timestamp": "2025-11-24T04:00:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "example-card--default",
    "nodeCount": 5,
    "hasInteractiveElements": false,
    "args": {
      "content": { "title": "Title", "body": "Body" },
      "onClick": "[Function]"
    }
  }
}
```

### Análise
- ✅ Sem `variantProperties` (objetos e funções são ignorados)
- ✅ `type` permanece `FRAME` (sem variants)
- ✅ `name` usa storyId original

## Exemplo 4: Botão Desabilitado

### Story no Storybook
```typescript
// Button.stories.tsx
export const Disabled: Story = {
  args: {
    variant: 'secondary',
    disabled: true,
    label: 'Can\'t click'
  }
};
```

### JSON Figma Exportado
```json
{
  "type": "COMPONENT",
  "name": "Button/Can't click/Disabled/Secondary",
  "variantProperties": {
    "variant": "secondary",
    "state": "disabled",
    "label": "Can't click"
  },
  "children": [],
  "__html": "<button disabled>...</button>",
  "__export": {
    "timestamp": "2025-11-24T04:00:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "example-button--disabled",
    "nodeCount": 1,
    "hasInteractiveElements": false,
    "args": {
      "variant": "secondary",
      "disabled": true,
      "label": "Can't click"
    }
  }
}
```

### Análise
- ✅ `disabled: true` → `state: "disabled"`
- ✅ `hasInteractiveElements: false` (botão desabilitado não é interativo)
- ✅ Nome ordenado: label, state, variant

## Exemplo 5: Badge com Nível Numérico

### Story no Storybook
```typescript
// Badge.stories.tsx
export const Level3: Story = {
  args: {
    level: 3,
    color: 'red',
    text: 'Critical'
  }
};
```

### JSON Figma Exportado
```json
{
  "type": "COMPONENT",
  "name": "Badge/Red/3/Critical",
  "variantProperties": {
    "level": "3",
    "color": "red",
    "text": "Critical"
  },
  "children": [],
  "__html": "<span>...</span>",
  "__export": {
    "timestamp": "2025-11-24T04:00:00.000Z",
    "version": "0.1.0",
    "engine": "figma-sync-engine",
    "storyId": "example-badge--level-3",
    "nodeCount": 2,
    "hasInteractiveElements": false,
    "args": {
      "level": 3,
      "color": "red",
      "text": "Critical"
    }
  }
}
```

### Análise
- ✅ Number `level: 3` → string `"3"`
- ✅ Ordem: color, level, text

## Tabela de Conversão Rápida

| Tipo no Storybook | Exemplo | variantProperties | Notas |
|-------------------|---------|-------------------|-------|
| String | `variant: "primary"` | `{ variant: "primary" }` | Direto |
| Number | `level: 1` | `{ level: "1" }` | Convertido para string |
| Boolean true | `disabled: true` | `{ state: "disabled" }` | Apenas props conhecidas |
| Boolean false | `disabled: false` | *ignorado* | Estado padrão |
| Object | `style: { color: "red" }` | *ignorado* | Não é variante |
| Array | `items: [1, 2, 3]` | *ignorado* | Não é variante |
| Function | `onClick: () => {}` | *ignorado* | Não é variante |

## Props Booleanas Reconhecidas como Estados

Quando um boolean é `true`, ele é mapeado para `state`:

- `disabled` → `{ state: "disabled" }`
- `loading` → `{ state: "loading" }`
- `active` → `{ state: "active" }`
- `selected` → `{ state: "selected" }`
- `checked` → `{ state: "checked" }`
- `error` → `{ state: "error" }`
- `success` → `{ state: "success" }`
- `warning` → `{ state: "warning" }`
- `readonly` → `{ state: "readonly" }`
- `required` → `{ state: "required" }`
- `hover` → `{ state: "hover" }`
- `focus` → `{ state: "focus" }`
- `pressed` → `{ state: "pressed" }`

## Boas Práticas

### ✅ Fazer
```typescript
// Bom: args primitivos e descritivos
export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'large'
  }
};
```

### ❌ Evitar
```typescript
// Ruim: muitos args complexos que não se traduzem em variants
export const Complex: Story = {
  args: {
    variant: 'primary',
    style: { margin: 10, padding: 20 }, // Ignorado
    config: { api: 'http://...', timeout: 5000 }, // Ignorado
    handlers: { onClick, onHover, onBlur } // Ignorado
  }
};
```

## Casos de Uso no Figma

Após importar o JSON no Figma:

1. **Criar Variants Manualmente**: Use os valores de `variantProperties` como referência
2. **Component Sets**: Combine múltiplas exports (VAR-2, VAR-3) em um ComponentSet
3. **Documentação**: O nome gerado facilita identificação visual no Figma
4. **Debugging**: Campo `__export.args` ajuda a rastrear origem da variante

## Próximos Passos

- **VAR-2**: Exportar múltiplas stories de uma vez
- **VAR-3**: Plugin Figma criar ComponentSet automaticamente
- **VAR-4**: Detecção de estados via `data-state` attributes
