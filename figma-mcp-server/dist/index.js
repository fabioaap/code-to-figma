#!/usr/bin/env node
/**
 * Figma MCP Server - Entry Point
 *
 * Model Context Protocol server that exposes Figma design tokens
 * and selection snapshots through standardized MCP tools.
 *
 * Tools provided:
 * - get_design_tokens: Extract design tokens from Figma frames
 * - get_selection_snapshot: Capture selection metadata and previews
 */
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import pino from 'pino';
import { loadConfig } from './config.js';
import { invokeGetDesignTokens } from './tools/getDesignTokens.js';
import { invokeGetFrameSnapshot } from './tools/getFrameSnapshot.js';
// Configure structured logging to stderr (stdout is reserved for MCP protocol)
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino/file',
        options: { destination: 2 }, // stderr
    },
});
async function main() {
    try {
        // Load and validate configuration
        const config = loadConfig();
        logger.info({ port: config.MCP_SERVER_PORT }, 'Configuration loaded');
        // Create MCP server instance
        const server = new Server({
            name: 'figma-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Register tool list handler
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_design_tokens',
                        description: 'Extract design tokens (colors, typography, spacing) from a Figma frame',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                fileId: {
                                    type: 'string',
                                    description: 'Figma file ID',
                                },
                                frameId: {
                                    type: 'string',
                                    description: 'Frame node ID to extract tokens from',
                                },
                            },
                            required: ['fileId', 'frameId'],
                        },
                    },
                    {
                        name: 'get_frame_snapshot',
                        description: 'Get a visual snapshot (PNG image) of a Figma frame or node',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                fileId: {
                                    type: 'string',
                                    description: 'Figma file ID',
                                },
                                nodeId: {
                                    type: 'string',
                                    description: 'Node ID to snapshot',
                                },
                                format: {
                                    type: 'string',
                                    enum: ['png', 'jpg', 'svg'],
                                    description: 'Image format (default: png)',
                                },
                                scale: {
                                    type: 'number',
                                    description: 'Image scale (default: 2)',
                                },
                            },
                            required: ['fileId', 'nodeId'],
                        },
                    },
                ],
            };
        });
        // Register tool execution handler
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            logger.info({ tool: name, args }, 'Tool called');
            try {
                // T014: get_design_tokens tool implementation
                if (name === 'get_design_tokens') {
                    const result = await invokeGetDesignTokens(args);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                }
                // US2: get_frame_snapshot tool implementation
                if (name === 'get_frame_snapshot') {
                    const result = await invokeGetFrameSnapshot(args);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                }
                throw new Error(`Unknown tool: ${name}`);
            }
            catch (error) {
                const err = error;
                logger.error({ error: err.message, tool: name }, 'Tool execution failed');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: err.name || 'Error',
                                message: err.message,
                                tool: name,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
        // Setup STDIO transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logger.info('Figma MCP Server running on STDIO');
        logger.info('Press Ctrl+C to stop');
    }
    catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map