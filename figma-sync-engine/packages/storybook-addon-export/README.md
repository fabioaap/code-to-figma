# @figma-sync-engine/storybook-addon-export

Storybook addon that exports component stories to Figma-compatible JSON format.

## Features

- 📤 **One-Click Export**: Export any Storybook story to Figma JSON
- 📋 **Clipboard Support**: Copy JSON directly to clipboard with automatic fallback
- 💾 **Download Option**: Save JSON as `.figma.json` file
- 🎨 **Auto Layout**: Automatically applies Figma Auto Layout properties based on CSS flexbox
- 📊 **Metrics Logging**: Logs detailed metrics for debugging and observability
- ✅ **Type Safe**: Full TypeScript support

## Installation

```bash
pnpm add @figma-sync-engine/storybook-addon-export
```

## Setup

Add the addon to your `.storybook/main.js`:

```javascript
module.exports = {
  addons: [
    '@figma-sync-engine/storybook-addon-export'
  ]
};
```

## Usage

### Using the Panel

1. Open Storybook and navigate to any story
2. Look for the "Export to Figma" panel (usually in the addons panel at the bottom)
3. Choose your export method:
   - **📋 Clipboard**: Click to copy JSON to clipboard
   - **💾 Download**: Click to download as `.figma.json` file
4. Click "📥 Exportar" button
5. Check browser console for detailed metrics

### Export Pipeline

The addon performs a complete export pipeline:

```
Story → Capture HTML → Convert to Figma → Apply Auto Layout → Export
```

#### Step 1: Capture HTML
- Safely captures rendered HTML from the story
- Sanitizes scripts and dangerous attributes
- Counts nodes and detects interactive elements

#### Step 2: Convert to Figma
- Transforms HTML structure to Figma JSON format
- Preserves semantic hierarchy
- Maps HTML elements to Figma node types

#### Step 3: Apply Auto Layout
- Analyzes CSS flexbox properties
- Maps to Figma Auto Layout (`layoutMode`, `itemSpacing`, padding)
- Handles horizontal and vertical layouts

#### Step 4: Export
- Adds metadata (timestamp, version, metrics)
- Exports via clipboard or file download
- Logs complete metrics to console

### Console Metrics

Each export logs detailed metrics:

```javascript
[MVP-5] Iniciando exportação { 
  storyId: "button--primary", 
  timestamp: "2025-11-22T23:45:00.000Z" 
}

[MVP-5] HTML capturado { 
  nodeCount: 12, 
  hasInteractiveElements: true, 
  htmlSize: 2156 
}

[MVP-5] HTML convertido para Figma JSON { 
  type: "FRAME", 
  hasChildren: true, 
  childCount: 3 
}

[MVP-5] Auto Layout aplicado

[MVP-5] Exportação concluída com sucesso! { 
  storyId: "button--primary", 
  exportMethod: "clipboard", 
  jsonSize: 3542, 
  duration: "245ms", 
  timestamp: "2025-11-22T23:45:00.245Z" 
}
```

## API

### `captureStoryHTML()`
Captures the HTML from the active story.

```typescript
const capture = await captureStoryHTML();
// { html: string, nodeCount: number, hasInteractiveElements: boolean }
```

### `convertHtmlToFigma(html)`
Converts HTML to Figma JSON format.

```typescript
const figmaJson = await convertHtmlToFigma(capture.html);
// { type: 'FRAME', children: [...], ... }
```

### `applyAutoLayout(node, css)`
Applies Auto Layout properties based on CSS.

```typescript
const withLayout = applyAutoLayout(figmaJson, {
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',
  padding: '16px'
});
```

### `exportToClipboard(json)`
Exports JSON to clipboard.

```typescript
const result = await exportToClipboard(figmaJson);
// { success: true, method: 'clipboard', size: 1234, ... }
```

### `exportToFile(json, filename)`
Downloads JSON as file.

```typescript
const result = exportToFile(figmaJson, 'button.figma.json');
// { success: true, method: 'download', size: 1234, ... }
```

### `addExportMetadata(json, metadata?)`
Adds export metadata to JSON.

```typescript
const withMetadata = addExportMetadata(figmaJson, {
  storyId: 'button--primary',
  nodeCount: 12,
  customField: 'value'
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## Testing

The addon includes comprehensive tests:

- **Unit Tests** (50 tests): Export functions, capture, validation
- **Integration Tests** (9 tests): Full pipeline, error handling, performance

Run tests:
```bash
pnpm test --filter @figma-sync-engine/storybook-addon-export
```

## Roadmap

- [ ] Support for multiple story selection (VAR-2)
- [ ] Enhanced CSS property mapping (AL-2+)
- [ ] Remote observability integration (OBS-1)
- [ ] Component variants support (VAR-1)
- [ ] Kill-switch for production (MVP-10)

## Related Packages

- `@figma-sync-engine/html-to-figma-core`: HTML to Figma conversion
- `@figma-sync-engine/autolayout-interpreter`: Auto Layout engine
- `@figma-sync-engine/figma-plugin-lite`: Figma plugin for importing JSON

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.
