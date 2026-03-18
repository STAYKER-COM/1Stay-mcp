const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'tools-schema.json');

// These tests hit the live MCP endpoint.
// Run separately with: npm run test:integration
// Skip in CI unless explicitly enabled.

describe('MCP endpoint contract tests', () => {
  let schema;
  let endpoint;

  before(() => {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    endpoint = schema.server.endpoint;
  });

  it('endpoint responds to HTTP POST', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: schema.server.protocol_version,
          capabilities: {},
          clientInfo: {
            name: '1stay-mcp-test',
            version: '1.0.0'
          }
        }
      })
    });

    // The server may require auth (401/403) or return a valid MCP response.
    // Either way, it should not return 404 or 5xx.
    assert.ok(
      response.status < 500,
      `Endpoint returned server error: ${response.status}`
    );
  });

  it('endpoint does not return 404', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: schema.server.protocol_version,
          capabilities: {},
          clientInfo: {
            name: '1stay-mcp-test',
            version: '1.0.0'
          }
        }
      })
    });

    assert.notEqual(response.status, 404, 'Endpoint must not return 404');
  });

  it('endpoint accepts application/json content type', async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'ping'
      })
    });

    // Should not get 415 Unsupported Media Type
    assert.notEqual(response.status, 415, 'Endpoint must accept application/json');
  });
});
