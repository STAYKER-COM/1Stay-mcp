import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

/**
 * Declared-vs-live parity.
 *
 * This repo publishes claims about a server that lives in a different repo
 * (stayker-mcp) and is deployed separately. Nothing here can detect that the
 * two have drifted apart by reading local files — only by asking the live
 * server what it actually serves.
 *
 * That gap is not hypothetical: the Anthropic MCP Directory review rejected the
 * listing partly because the declared tool list did not match the live server
 * (a tool was declared that wasn't live, and two live tools weren't declared).
 * These tests are the check that would have caught it.
 */
describe('Declared schema matches the live server', () => {
  let schema;
  let endpoint;

  before(() => {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    endpoint = schema.server.endpoint;
  });

  /** Initialize, then call tools/list. Handles both JSON and SSE framing. */
  async function liveTools() {
    const call = (body) =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream'
        },
        body: JSON.stringify(body)
      });

    await call({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: schema.server.protocol_version,
        capabilities: {},
        clientInfo: { name: '1stay-mcp-drift-check', version: '1.0.0' }
      }
    });

    const res = await call({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    assert.ok(res.ok, `tools/list failed: HTTP ${res.status}`);

    const raw = await res.text();
    // Streamable HTTP may frame the reply as SSE ("data: {...}") or plain JSON.
    const payload = raw.includes('data:')
      ? raw.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('')
      : raw;

    const parsed = JSON.parse(payload);
    assert.ok(parsed.result?.tools, `No tools in response: ${raw.slice(0, 200)}`);
    return parsed.result.tools;
  }

  it('live tool names exactly match tools-schema.json', async () => {
    const live = (await liveTools()).map(t => t.name).sort();
    const declared = schema.tools.map(t => t.name).sort();

    assert.deepEqual(
      live,
      declared,
      `Declared and live tool lists differ.\n` +
        `  declared only: ${declared.filter(n => !live.includes(n)).join(', ') || '(none)'}\n` +
        `  live only:     ${live.filter(n => !declared.includes(n)).join(', ') || '(none)'}`
    );
  });

  it('live tool input parameters match the declared schema', async () => {
    const live = await liveTools();

    for (const declared of schema.tools) {
      const actual = live.find(t => t.name === declared.name);
      if (!actual) continue; // covered by the parity test above

      const declaredParams = Object.keys(declared.inputSchema?.properties ?? {}).sort();
      const liveParams = Object.keys(actual.inputSchema?.properties ?? {}).sort();

      assert.deepEqual(
        liveParams,
        declaredParams,
        `${declared.name} parameters differ.\n` +
          `  declared only: ${declaredParams.filter(p => !liveParams.includes(p)).join(', ') || '(none)'}\n` +
          `  live only:     ${liveParams.filter(p => !declaredParams.includes(p)).join(', ') || '(none)'}`
      );
    }
  });

  it('the directory icon is actually served', async () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', 'server.json'), 'utf-8')
    );

    for (const icon of manifest.icons ?? []) {
      const res = await fetch(icon.src);
      assert.equal(res.status, 200, `${icon.src} returned ${res.status}`);
      assert.match(
        res.headers.get('content-type') ?? '',
        /^image\//,
        `${icon.src} is not served as an image`
      );
    }
  });
});
