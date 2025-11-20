# Auto Layout Engine

## Supported CSS to Figma Mappings

The Auto Layout Engine now provides comprehensive support for CSS Flexbox to Figma Auto Layout conversion.

### Layout Properties

| CSS Property | Figma Property | Supported Values | Notes |
|-------------|----------------|------------------|-------|
| `display: flex` | `layoutMode` | HORIZONTAL, VERTICAL | Required for auto layout |
| `flex-direction: row` | `layoutMode: HORIZONTAL` | ✅ | Default direction |
| `flex-direction: column` | `layoutMode: VERTICAL` | ✅ | Vertical stacking |
| `gap` | `itemSpacing` | Any px value | Converts px → number |
| `padding` | `paddingTop/Right/Bottom/Left` | 1-4 values | Full CSS shorthand support |

### Alignment Properties (NEW ✨)

#### Primary Axis (justify-content)
Maps to `primaryAxisAlignItems` in Figma:

| CSS Value | Figma Value | Description |
|-----------|-------------|-------------|
| `flex-start`, `start` | `MIN` | Align to start of axis |
| `center` | `CENTER` | Center on axis |
| `flex-end`, `end` | `MAX` | Align to end of axis |
| `space-between` | `SPACE_BETWEEN` | Distribute with space between |

#### Counter Axis (align-items)
Maps to `counterAxisAlignItems` in Figma:

| CSS Value | Figma Value | Description |
|-----------|-------------|-------------|
| `flex-start`, `start` | `MIN` | Align to start of cross axis |
| `center` | `CENTER` | Center on cross axis |
| `flex-end`, `end` | `MAX` | Align to end of cross axis |

### Padding Normalization

The engine supports all CSS padding shorthand formats:

```typescript
padding: 10px           → [10, 10, 10, 10]  // all sides
padding: 10px 20px      → [10, 20, 10, 20]  // vertical | horizontal
padding: 10px 20px 30px → [10, 20, 30, 20]  // top | horizontal | bottom
padding: 10px 20px 30px 40px → [10, 20, 30, 40]  // top | right | bottom | left
```

## Process Flow

1. **Parse CSS Properties**: Extract flexbox properties from computed styles
2. **Identify Layout Mode**: Determine if horizontal or vertical based on flex-direction
3. **Map Alignments**: Convert CSS alignment to Figma-compatible values
4. **Apply Spacing**: Set item spacing (gap) and padding values
5. **Process Children**: Recursively apply to nested flex containers

## Example Usage

```typescript
import { applyAutoLayout } from '@figma-sync-engine/autolayout-interpreter';

const node = { 
  type: 'FRAME', 
  name: 'Container',
  children: []
};

const css = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16',
  padding: '20',
  justifyContent: 'center',
  alignItems: 'flex-start'
};

const result = applyAutoLayout(node, css);
// Result includes:
// - layoutMode: 'VERTICAL'
// - itemSpacing: 16
// - paddingTop/Right/Bottom/Left: 20
// - primaryAxisAlignItems: 'CENTER'
// - counterAxisAlignItems: 'MIN'
```

## Current Limitations

### Not Yet Supported
- `flex-grow` and `flex-shrink` - Fixed sizing only
- `overflow` properties - No overflow handling
- `flex-wrap` - Single-line layouts only
- Multi-axis gap (row-gap/column-gap separately)
- `align-content` - Only single-line flex supported

### Planned Support
- AL-7: Typography mapping (font-family, font-weight, line-height)
- AL-4: Gap composto (separate row/column gap)
- AL-5: Wrap flex → multiple frames
- Text styling properties (color, decoration, transform)

## Testing

The Auto Layout Engine includes comprehensive test coverage:

### Unit Tests (12 tests)
- Basic horizontal/vertical layouts
- Padding normalization (1-4 values)
- Alignment mappings (all combinations)
- Complex nested structures
- Default fallback behaviors

### E2E Tests (7 tests)
- Complete export validation
- JSON serialization
- Size measurement
- Nested structure handling

Run tests:
```bash
cd packages/autolayout-interpreter
pnpm test
```

## Performance

- Typical conversion: < 10ms
- Large components (300+ nodes): < 100ms
- Memory efficient (no recursive copies)

## Future Enhancements

Based on backlog priorities:

1. **AL-7**: Font and typography mapping
2. **AL-4**: Multi-axis gap support
3. **AL-5**: Flex wrap to multiple frames
4. **AL-6**: CSS vs Figma divergence reports

## Contributing

When adding new CSS properties:

1. Update type definitions in `types.ts`
2. Add mapping function (e.g., `mapNewProperty()`)
3. Update `applyAutoLayout()` logic
4. Add comprehensive tests
5. Update this documentation

See `tests/interpret.test.ts` for test examples.
