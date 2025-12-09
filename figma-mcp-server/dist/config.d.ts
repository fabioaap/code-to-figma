/**
 * Configuration Management for Figma MCP Server
 *
 * Loads and validates environment variables using Zod schemas.
 * Ensures all required credentials are present before server starts.
 */
import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    FIGMA_PERSONAL_TOKEN: z.ZodString;
    FIGMA_FILE_ID: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    FIGMA_FRAME_ID: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    MCP_SERVER_PORT: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    NODE_ENV: z.ZodDefault<z.ZodOptional<z.ZodEnum<["development", "production", "test"]>>>;
}, "strip", z.ZodTypeAny, {
    FIGMA_PERSONAL_TOKEN: string;
    FIGMA_FILE_ID: string;
    FIGMA_FRAME_ID: string;
    MCP_SERVER_PORT: number;
    NODE_ENV: "development" | "production" | "test";
}, {
    FIGMA_PERSONAL_TOKEN: string;
    FIGMA_FILE_ID?: string | undefined;
    FIGMA_FRAME_ID?: string | undefined;
    MCP_SERVER_PORT?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare function loadConfig(): Config;
export declare function getConfig(): Config;
export {};
//# sourceMappingURL=config.d.ts.map