# 🧪 Guia de Testes Manual - Fluxo Storybook → Figma

## ✅ Status Atual
- **Storybook**: Rodando em http://localhost:6006/
- **Addon**: Instalado e pronto para testar
- **Pipeline**: Captura → Conversão → Layout → Exportação

---

## 🎯 Teste 1: Verificar Storybook Carregou

### Passos
1. Abra http://localhost:6006/ no navegador
2. Verifique se vê "Button" na sidebar esquerda
3. Verifique se há histórico (Primary, Secondary, etc)

### Esperado ✅
- Storybook carrega sem erros
- Componentes visíveis na sidebar
- Preview do Button exibido

---

## 🎯 Teste 2: Verificar Addon Registrado

### Passos
1. No Storybook, procure por "Export" ou ícone de download na toolbar superior
2. Clique em "Addons" (painel direito)
3. Procure por abas/painéis do addon

### Esperado ✅
- Addon visível no painel direito
- Sem console errors
- Botão de export acessível

---

## 🎯 Teste 3: Testar Captura HTML

### Passos (via console do browser)
```javascript
// Importar função
const { captureStoryHTML } = window.__FIGMA_SYNC__;

// Testar captura
const result = captureStoryHTML();
console.log('Nós DOM:', result.nodeCount);
console.log('HTML:', result.html.substring(0, 100));
console.log('Interativo:', result.isInteractive);
```

### Esperado ✅
- nodeCount > 0
- HTML contains `<button>` tag
- isInteractive = true ou false
- Sem scripts no HTML

---

## 🎯 Teste 4: Testar Conversão para JSON

### Passos (via console)
```javascript
const { convertHtmlToFigma } = window.__FIGMA_SYNC__;
const { captureStoryHTML } = window.__FIGMA_SYNC__;

// Capturar
const capture = captureStoryHTML();

// Converter
const json = await convertHtmlToFigma(capture.html);
console.log('JSON Figma:', json);
console.log('Tipo:', json.type);
console.log('JSON size:', JSON.stringify(json).length);
```

### Esperado ✅
- json é um objeto válido
- json.type está definido
- JSON size > 100 bytes
- Sem erros no console

---

## 🎯 Teste 5: Testar Auto Layout

### Passos (via console)
```javascript
const { applyAutoLayout } = window.__FIGMA_SYNC__;
const { convertHtmlToFigma } = window.__FIGMA_SYNC__;
const { captureStoryHTML } = window.__FIGMA_SYNC__;

// Pipeline completo
const capture = captureStoryHTML();
let json = await convertHtmlToFigma(capture.html);

// Aplicar Auto Layout
const cssExample = {
    display: 'flex',
    gap: '12px',
    padding: '16px'
};
json = applyAutoLayout(json, cssExample);

console.log('layoutMode:', json.layoutMode);
console.log('itemSpacing:', json.itemSpacing);
console.log('paddingTop:', json.paddingTop);
```

### Esperado ✅
- layoutMode = "HORIZONTAL" ou "VERTICAL"
- itemSpacing = 12 (ou gap value)
- paddingTop = 16 (ou padding value)

---

## 🎯 Teste 6: Testar Exportação

### Passos (via console)
```javascript
const { exportToClipboard, addExportMetadata } = window.__FIGMA_SYNC__;
const { convertHtmlToFigma } = window.__FIGMA_SYNC__;
const { captureStoryHTML } = window.__FIGMA_SYNC__;

// Pipeline completo
const capture = captureStoryHTML();
let json = await convertHtmlToFigma(capture.html);

// Adicionar metadados
json = addExportMetadata(json, {
    storyId: 'Button-Primary',
    variant: 'primary'
});

// Exportar
const result = await exportToClipboard(json);
console.log('Export result:', result);
console.log('Success:', result.success);
console.log('Size:', result.size, 'bytes');

// Verificar clipboard
navigator.clipboard.readText().then(text => {
    console.log('Clipboard content length:', text.length);
    console.log('É JSON válido:', !!JSON.parse(text));
});
```

### Esperado ✅
- result.success = true
- result.size > 0
- Clipboard contém JSON válido
- Sem erros no console

---

## 🎯 Teste 7: Pipeline Completo

### Passos (via console)
```javascript
// Executar fluxo completo
const capture = window.__FIGMA_SYNC__.captureStoryHTML();
console.log('✅ Captura:', capture.nodeCount, 'nós');

let json = await window.__FIGMA_SYNC__.convertHtmlToFigma(capture.html);
console.log('✅ Conversão:', JSON.stringify(json).length, 'bytes');

json = window.__FIGMA_SYNC__.applyAutoLayout(json, {
    display: 'flex',
    gap: '12px',
    padding: '16px'
});
console.log('✅ Auto Layout:', json.layoutMode);

json = window.__FIGMA_SYNC__.addExportMetadata(json);
console.log('✅ Metadados:', json.__export.timestamp);

const result = await window.__FIGMA_SYNC__.exportToClipboard(json);
console.log('✅ Exportação:', result.success);

console.log('🎉 FLUXO COMPLETO OK!');
```

### Esperado ✅
- Todos os passos completam sem erros
- Cada etapa gera output esperado
- Mensagem final: "FLUXO COMPLETO OK!"

---

## 📊 Checklist de Validação

### Funcionalidade
- [ ] Storybook carrega
- [ ] Addon registrado
- [ ] Captura HTML funciona
- [ ] Conversão para JSON funciona
- [ ] Auto Layout aplicado
- [ ] Exportação para clipboard funciona
- [ ] Pipeline completo funciona

### Qualidade
- [ ] Sem console errors
- [ ] Sem console warnings (exceto deprecation notices)
- [ ] JSON é válido
- [ ] Tipos são corretos
- [ ] Tamanhos fazem sentido

### Performance
- [ ] Captura < 100ms
- [ ] Conversão < 500ms
- [ ] Auto Layout < 50ms
- [ ] Exportação < 100ms
- [ ] Total < 1s

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Verifique se `pnpm install` foi executado
- Tente `pnpm build` para recompilar

### Erro: "navigator.clipboard não disponível"
- Use exportToFile() em vez de exportToClipboard()
- Ou execute em localhost (não file://)

### JSON vazio ou sem estrutura
- Verifique se o HTML foi capturado
- Verifique console.log(capture)
- Confirme que tem elementos no DOM

### Auto Layout não aplica
- Verifique se CSS object tem propriedades válidas
- Confirme que json tem estrutura correta
- Teste com exemplo simples: `{ display: 'flex' }`

---

## 📝 Notas

- Os testes podem ser rodados no DevTools console do navegador
- Use `console.table()` para ver objetos de forma estruturada
- Todos os módulos estão expostos em `window.__FIGMA_SYNC__`
- Copie e cole os exemplos de código diretamente no console

---

## ✅ Sucesso!

Se todos os testes passarem, o MVP está **100% funcional** e pronto para:
1. Integração com UI do Addon
2. Testes E2E automáticos
3. Plugin Figma para importação
