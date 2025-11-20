// Plugin code: recebe JSON colado e cria um frame básico.
figma.on('run', () => {
    figma.showUI(__html__, { width: 320, height: 240 });
});

figma.ui.onmessage = (msg) => {
    if (msg.type === 'import-json') {
        try {
            const data = JSON.parse(msg.payload);
            const frame = figma.createFrame();
            frame.name = data.root?.name || 'ImportedStory';
            frame.layoutMode = data.root?.layoutMode || 'HORIZONTAL';
            if (data.root?.itemSpacing) frame.itemSpacing = data.root.itemSpacing;
            frame.paddingTop = data.root?.paddingTop || 0;
            frame.paddingRight = data.root?.paddingRight || 0;
            frame.paddingBottom = data.root?.paddingBottom || 0;
            frame.paddingLeft = data.root?.paddingLeft || 0;

            (data.root?.children || []).forEach((child: any) => {
                if (child.type === 'TEXT') {
                    const text = figma.createText();
                    text.characters = child.characters || '';
                    frame.appendChild(text);
                }
            });
            figma.currentPage.appendChild(frame);
            figma.notify('Importado para canvas.');
        } catch (e) {
            figma.notify('Falha ao importar JSON');
        }
    }
};
