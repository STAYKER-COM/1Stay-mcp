#!/usr/bin/env node

/**
 * 1Stay MCP Server — stdio-to-HTTP proxy
 *
 * Bridges local MCP clients (stdio transport) to the remote 1Stay server.
 * For clients that support remote/HTTP transport, connect directly:
 *   https://mcp.stayker.com/mcp
 *
 * Usage:
 *   npx 1stay-mcp
 *   node bin/cli.js
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const REMOTE_URL = 'https://mcp.stayker.com/mcp';
const SERVER_NAME = '1stay-hotel-booking';
const SERVER_VERSION = '1.0.0';

async function main() {
  // Connect to remote 1Stay server as an MCP client
  const remoteTransport = new StreamableHTTPClientTransport(
    new URL(REMOTE_URL)
  );
  const remoteClient = new Client(
    { name: '1stay-proxy', version: SERVER_VERSION }
  );
  await remoteClient.connect(remoteTransport);
  process.stderr.write('Connected to remote: ' + REMOTE_URL + '\n');

  // Create local stdio server that proxies to remote
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  // Proxy tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const result = await remoteClient.listTools();
    return result;
  });

  // Proxy tools/call
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await remoteClient.callTool({
      name: request.params.name,
      arguments: request.params.arguments
    });
    return result;
  });

  // Connect local stdio transport
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);

  process.stderr.write('1Stay MCP proxy running on stdio\n');
}

main().catch((error) => {
  process.stderr.write('Fatal: ' + error.message + '\n');
  process.exit(1);
});
