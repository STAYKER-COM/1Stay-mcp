/**
 * 1Stay MCP Server — Hotel Booking Infrastructure for AI
 *
 * Remote MCP server endpoint: https://mcp.stayker.com/mcp
 * Protocol: Streamable HTTP | OAuth 2.1
 *
 * This package provides:
 * 1. A stdio-to-HTTP proxy (bin/cli.js) for MCP clients that don't support remote servers
 * 2. Server metadata and tools schema for programmatic access
 *
 * For most MCP clients (Claude Desktop, ChatGPT, Cursor), connect directly:
 *   URL: https://mcp.stayker.com/mcp
 *
 * For clients that only support stdio transport, run:
 *   npx 1stay-mcp
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SERVER_URL = 'https://mcp.stayker.com/mcp';
export const SERVER_NAME = '1Stay Hotel Booking';
export const SERVER_VERSION = '1.0.0';
