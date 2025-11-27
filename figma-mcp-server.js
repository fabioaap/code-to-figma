#!/usr/bin/env node

/**
 * Servidor MCP Local Figma
 * Simula a API do Figma MCP para capturar frames selecionados
 */

const http = require('http');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Rota: GET /api/figma/selection
    if (pathname === '/api/figma/selection' && req.method === 'GET') {
        const fileKey = query.fileKey || 'unknown';
        const nodeId = query.nodeId || '8565-17355';

        // Simular resposta do Figma com frame selecionado
        const selectionData = {
            status: 'success',
            data: {
                nodeId,
                fileKey,
                name: 'Banco de Questões - Frame Principal',
                type: 'FRAME',
                width: 1200,
                height: 800,
                fills: [
                    {
                        type: 'SOLID',
                        color: { r: 1, g: 1, b: 1, a: 1 }, // Branco
                    },
                ],
                children: [
                    {
                        nodeId: '8565-17356',
                        name: 'Header',
                        type: 'FRAME',
                        width: 1200,
                        height: 80,
                        fills: [
                            {
                                type: 'SOLID',
                                color: { r: 0.15, g: 0.23, b: 0.82, a: 1 }, // Azul Canoas
                            },
                        ],
                    },
                    {
                        nodeId: '8565-17357',
                        name: 'Content',
                        type: 'FRAME',
                        width: 1200,
                        height: 720,
                        children: [
                            {
                                nodeId: '8565-17358',
                                name: 'Badge USO - Canoas',
                                type: 'COMPONENT',
                                width: 120,
                                height: 32,
                                fills: [
                                    {
                                        type: 'SOLID',
                                        color: { r: 0.23, g: 0.51, b: 0.98, a: 1 }, // Badge Canoas
                                    },
                                ],
                            },
                            {
                                nodeId: '8565-17359',
                                name: 'Badge USO - Porto Alegre',
                                type: 'COMPONENT',
                                width: 120,
                                height: 32,
                                fills: [
                                    {
                                        type: 'SOLID',
                                        color: { r: 0.94, g: 0.27, b: 0.27, a: 1 }, // Badge Porto Alegre
                                    },
                                ],
                            },
                            {
                                nodeId: '8565-17360',
                                name: 'Badge USO - Gravataí',
                                type: 'COMPONENT',
                                width: 120,
                                height: 32,
                                fills: [
                                    {
                                        type: 'SOLID',
                                        color: { r: 0.06, g: 0.73, b: 0.51, a: 1 }, // Badge Gravataí
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            timestamp: new Date().toISOString(),
        };

        res.writeHead(200);
        res.end(JSON.stringify(selectionData, null, 2));
        return;
    }

    // Rota: GET /api/figma/tokens
    if (pathname === '/api/figma/tokens' && req.method === 'GET') {
        const tokensData = {
            status: 'success',
            data: {
                colors: {
                    'color.rede.canoas': '#3B82F6',
                    'color.rede.porto-alegre': '#EF4444',
                    'color.rede.gravataí': '#10B981',
                    'color.status.aprovada': '#10B981',
                    'color.status.em-revisao': '#F59E0B',
                    'color.status.rejeitada': '#EF4444',
                    'color.neutral.100': '#F3F4F6',
                    'color.neutral.900': '#111827',
                },
                typography: {
                    'typography.heading1': {
                        fontFamily: 'Inter',
                        fontSize: 32,
                        fontWeight: 600,
                        lineHeight: 1.2,
                    },
                    'typography.heading2': {
                        fontFamily: 'Inter',
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: 1.3,
                    },
                    'typography.body.lg': {
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: 400,
                        lineHeight: 1.5,
                    },
                },
                spacing: {
                    'spacing.xs': '4px',
                    'spacing.sm': '8px',
                    'spacing.md': '16px',
                    'spacing.lg': '24px',
                    'spacing.xl': '32px',
                },
                shadows: {
                    'shadow.sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    'shadow.md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    'shadow.lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
            },
            timestamp: new Date().toISOString(),
        };

        res.writeHead(200);
        res.end(JSON.stringify(tokensData, null, 2));
        return;
    }

    // Rota: Health check
    if (pathname === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', service: 'figma-mcp-local' }));
        return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🎯 Servidor MCP Figma Local rodando em http://localhost:${PORT}`);
    console.log(`📍 Endpoints disponíveis:`);
    console.log(`   - GET /api/figma/selection?fileKey=...&nodeId=...`);
    console.log(`   - GET /api/figma/tokens`);
    console.log(`   - GET /health`);
    console.log(`\n✅ Pronto para capturar frames do Figma!`);
});
