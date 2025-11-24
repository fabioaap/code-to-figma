# Guia de Teste Manual - Plugin Figma ComponentSet (VAR-3)

Este guia descreve como testar manualmente a funcionalidade de ComponentSet implementada no plugin Figma.

## Pré-requisitos

1. Figma Desktop ou navegador com acesso ao Figma
2. Plugin compilado (executar `pnpm build` na pasta `packages/figma-plugin-lite`)
3. Plugin carregado no Figma (Plugins → Development → Import plugin from manifest)

## Cenários de Teste

### Cenário 1: Importação de Nó Único (Compatibilidade Legado)

**Objetivo**: Verificar que a importação de nó único continua funcionando

**Passos**:
1. Abra o plugin no Figma
2. Copie o conteúdo de `examples/single-button.json`
3. Cole no campo de texto do plugin
4. Clique em "Importar"

**Resultado Esperado**:
- ✅ Um frame único é criado no canvas
- ✅ O frame tem nome "Single Button"
- ✅ Auto Layout está aplicado (HORIZONTAL)
- ✅ Padding está correto (12px top/bottom, 16px left/right)
- ✅ Corner radius de 6px está aplicado
- ✅ Cor de fundo azul (#2563EB) está aplicada
- ✅ Texto "Click Me" está centralizado
- ✅ Notificação: "✅ Importado: 2 nó(s) criado(s)"

---

### Cenário 2: ComponentSet Simples (2 Variantes)

**Objetivo**: Verificar criação de ComponentSet com 2 variantes

**Passos**:
1. Abra o plugin no Figma
2. Copie o conteúdo de `examples/button-variants.json`
3. Cole no campo de texto do plugin
4. Clique em "Importar"

**Resultado Esperado**:
- ✅ Um ComponentSet é criado no canvas
- ✅ ComponentSet tem nome "Button Component"
- ✅ Dois components dentro do set:
  - Component "variant=primary" com fundo azul (#2563EB)
  - Component "variant=secondary" com fundo cinza (#E2E8F0)
- ✅ Cada component mantém Auto Layout (HORIZONTAL)
- ✅ Padding preservado (12px top/bottom, 16px left/right)
- ✅ Corner radius de 6px em ambos
- ✅ Textos "Primary" e "Secondary" corretos
- ✅ Propriedade de variante "variant" visível no painel de propriedades
- ✅ Notificação: "✅ ComponentSet criado com 2 variantes"

---

### Cenário 3: ComponentSet com Múltiplas Propriedades

**Objetivo**: Verificar ComponentSet com combinação de propriedades (size × state)

**Passos**:
1. Abra o plugin no Figma
2. Copie o conteúdo de `examples/card-variants-multiple-props.json`
3. Cole no campo de texto do plugin
4. Clique em "Importar"

**Resultado Esperado**:
- ✅ Um ComponentSet é criado no canvas
- ✅ ComponentSet tem nome "Card Component"
- ✅ Três components dentro do set:
  - "size=small, state=default" (200×120px, branco)
  - "size=large, state=default" (320×200px, branco)
  - "size=small, state=hover" (200×120px, azul claro)
- ✅ Cada component mantém Auto Layout (VERTICAL)
- ✅ Item spacing e padding diferenciados por tamanho
- ✅ Corner radius correto (8px para small, 12px para large)
- ✅ Duas propriedades de variante visíveis: "size" e "state"
- ✅ Notificação: "✅ ComponentSet criado com 3 variantes"

---

### Cenário 4: Erro - JSON Inválido

**Objetivo**: Verificar tratamento de erro

**Passos**:
1. Abra o plugin no Figma
2. Cole JSON inválido (ex: `{ invalid json`)
3. Clique em "Importar"

**Resultado Esperado**:
- ✅ Notificação de erro: "❌ Erro ao importar: [descrição do erro]"
- ✅ Nenhum nó é criado no canvas

---

### Cenário 5: Erro - Apenas 1 Variante

**Objetivo**: Verificar validação de mínimo de variantes

**Passos**:
1. Abra o plugin no Figma
2. Cole JSON com array variants contendo apenas 1 elemento:
```json
{
  "name": "Test",
  "variants": [
    { "type": "FRAME", "name": "only-one" }
  ]
}
```
3. Clique em "Importar"

**Resultado Esperado**:
- ✅ Notificação: "❌ Falha ao criar ComponentSet: mínimo de 2 variantes necessário"
- ✅ Nenhum ComponentSet é criado

---

## Validações Técnicas

### Auto Layout Preservado
- [ ] layoutMode (HORIZONTAL/VERTICAL)
- [ ] itemSpacing
- [ ] paddingTop, paddingRight, paddingBottom, paddingLeft
- [ ] primaryAxisAlignItems
- [ ] counterAxisAlignItems

### Propriedades Visuais
- [ ] fills (cores de preenchimento)
- [ ] strokes (bordas)
- [ ] cornerRadius
- [ ] effects (sombras, blur)
- [ ] opacity

### Propriedades de Variante
- [ ] variantProperties definidas no JSON são aplicadas
- [ ] Nomes dos components refletem as propriedades (ex: "variant=primary")
- [ ] Painel de propriedades do Figma mostra as variantes corretamente

---

## Checklist de Regressão

Após testar os cenários acima, verificar que:
- [ ] Formato legado (root) ainda funciona
- [ ] Formato novo (direto) ainda funciona
- [ ] Tipos de nó suportados (FRAME, TEXT, RECTANGLE) funcionam
- [ ] Fontes são carregadas corretamente
- [ ] Cores hexadecimais são convertidas corretamente
- [ ] Hierarquia de filhos é preservada
- [ ] Notificações são claras e em português

---

## Problemas Conhecidos

- Fontes que não estão instaladas no Figma farão fallback para "Roboto Regular"
- Properties de variante precisam seguir o formato correto no JSON
- ComponentSet só é criado com 2+ variantes válidas

---

## Reportar Bugs

Se encontrar problemas:
1. Descreva o cenário de teste
2. Anexe o JSON usado
3. Inclua screenshot do resultado no Figma
4. Copie a mensagem de erro do console (se houver)
