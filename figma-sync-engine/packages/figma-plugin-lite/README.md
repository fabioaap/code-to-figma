# figma-plugin-lite

Plugin Figma para importar JSON exportado do Storybook e criar nós no canvas.

## Recursos

### Importação de Nó Único
O plugin suporta importação de JSON com nó único (frame, text, rectangle):

```json
{
  "type": "FRAME",
  "name": "Button",
  "layoutMode": "HORIZONTAL",
  "itemSpacing": 8,
  "paddingTop": 12,
  "paddingRight": 12,
  "paddingBottom": 12,
  "paddingLeft": 12,
  "children": [...]
}
```

### ComponentSet com Variantes (VAR-3)
O plugin detecta automaticamente quando múltiplas variantes são fornecidas e cria um ComponentSet:

```json
{
  "name": "Button",
  "variants": [
    {
      "type": "FRAME",
      "name": "variant=primary",
      "variantProperties": {
        "variant": "primary"
      },
      "children": [...]
    },
    {
      "type": "FRAME",
      "name": "variant=secondary",
      "variantProperties": {
        "variant": "secondary"
      },
      "children": [...]
    }
  ]
}
```

**Critérios:**
- Array `variants` deve conter pelo menos 2 elementos
- Cada variante deve ser um FRAME válido
- O plugin converte automaticamente frames em components
- Components são agrupados em ComponentSet usando `figma.combineAsVariants()`
- Auto Layout é preservado nas variantes

## Tipos de Nó Suportados

- **FRAME**: Container com suporte a Auto Layout
- **TEXT**: Nó de texto com fontes e estilos
- **RECTANGLE**: Formas retangulares com preenchimento e bordas

## Auto Layout

O plugin preserva propriedades de Auto Layout ao importar:
- `layoutMode`: HORIZONTAL ou VERTICAL
- `itemSpacing`: espaçamento entre itens
- `primaryAxisAlignItems`: alinhamento no eixo principal
- `counterAxisAlignItems`: alinhamento no eixo secundário
- `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`: padding interno

## Uso

1. Abra o plugin no Figma (Plugins → Development → figma-plugin-lite)
2. Cole o JSON exportado do Storybook
3. Clique em "Importar"
4. O plugin detecta automaticamente se deve criar um nó único ou ComponentSet

## Exemplos de Teste

O diretório `examples/` contém arquivos JSON de teste:

- **single-button.json**: Exemplo de importação de nó único (compatibilidade legado)
- **button-variants.json**: ComponentSet simples com 2 variantes de botão (primary/secondary)
- **card-variants-multiple-props.json**: ComponentSet com múltiplas propriedades (size × state)

Para testar:
1. Copie o conteúdo de um dos arquivos JSON
2. Abra o plugin no Figma
3. Cole o JSON na interface
4. Clique em "Importar"

## Desenvolvimento

```bash
# Build
pnpm build

# O plugin será construído em dist/ e pode ser carregado no Figma
```

## Formato Legado

O plugin também suporta formato legado com propriedade `root`:

```json
{
  "root": {
    "type": "FRAME",
    ...
  }
}
```
