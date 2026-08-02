import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, '..', 'tools-schema.json');
const README_PATH = path.join(__dirname, '..', 'README.md');

describe('Documentation consistency', () => {
  let schema;
  let readme;

  before(() => {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    readme = fs.readFileSync(README_PATH, 'utf-8');
  });

  describe('README <-> Schema tool parity', () => {
    it('every schema tool is mentioned in the README', () => {
      for (const tool of schema.tools) {
        assert.ok(
          readme.includes(tool.name),
          `Tool "${tool.name}" from schema is not mentioned in README`
        );
      }
    });

    it('README tools table lists exactly the schema tools', () => {
      // Extract tool names from the README tools table (lines with backtick-wrapped names after a pipe)
      const tableToolNames = [];
      const tableRegex = /\|\s*`(\w+)`\s*\|/g;
      let match;
      while ((match = tableRegex.exec(readme)) !== null) {
        tableToolNames.push(match[1]);
      }
      const schemaToolNames = schema.tools.map(t => t.name).sort();
      assert.deepEqual(
        tableToolNames.sort(),
        schemaToolNames,
        'README tools table must list exactly the same tools as the schema'
      );
    });
  });

  describe('Endpoint consistency', () => {
    it('README endpoint matches schema endpoint', () => {
      assert.ok(
        readme.includes(schema.server.endpoint),
        `README must reference the schema endpoint: ${schema.server.endpoint}`
      );
    });

    it('example config endpoint matches schema endpoint', () => {
      const configPath = path.join(__dirname, '..', 'claude_desktop_config.example.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const configUrl = config.mcpServers?.['1stay']?.url;
      assert.equal(
        configUrl,
        schema.server.endpoint,
        'Example config endpoint must match schema endpoint'
      );
    });

    it('README inline config example uses the correct endpoint', () => {
      // The README has a JSON code block with the config — verify the URL is present
      assert.ok(
        readme.includes(`"url": "${schema.server.endpoint}"`),
        'README inline config must use the correct endpoint URL'
      );
    });
  });

  describe('README annotation accuracy', () => {
    it('destructive tools are labeled correctly in the README table', () => {
      const destructiveTools = schema.tools
        .filter(t => t.annotations.destructiveHint)
        .map(t => t.name);

      for (const name of destructiveTools) {
        // The README table should show destructiveHint: true for these tools
        const rowRegex = new RegExp(`\\|\\s*\`${name}\`\\s*\\|[^|]+\\|[^|]*destructiveHint:\\s*true`);
        assert.ok(
          rowRegex.test(readme),
          `Tool "${name}" should show destructiveHint: true in the README table`
        );
      }
    });

    it('read-only tools are labeled correctly in the README table', () => {
      const readOnlyTools = schema.tools
        .filter(t => t.annotations.readOnlyHint)
        .map(t => t.name);

      for (const name of readOnlyTools) {
        const rowRegex = new RegExp(`\\|\\s*\`${name}\`\\s*\\|[^|]+\\|[^|]*readOnlyHint:\\s*true`);
        assert.ok(
          rowRegex.test(readme),
          `Tool "${name}" should show readOnlyHint: true in the README table`
        );
      }
    });
  });

  describe('Protocol version consistency', () => {
    it('README mentions the current protocol version', () => {
      assert.ok(
        readme.includes(schema.server.protocol_version),
        `README must mention protocol version ${schema.server.protocol_version}`
      );
    });
  });

  // server.json is the public MCP registry manifest. Nothing verified it before,
  // which is how it came to declare a "remoteEndpoints" key the registry schema
  // does not define, and an "authentication": "oauth2.1" claim the server does
  // not implement (OAuth discovery is deliberately disabled — it breaks authless
  // mcp-remote connections). A published claim the server can't honour fails on
  // contact, so it gets the same parity treatment as the README.
  describe('server.json registry manifest', () => {
    let manifest;
    let pkg;

    before(() => {
      manifest = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'server.json'), 'utf-8')
      );
      pkg = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
    });

    it('uses the schema-defined "remotes" key, not "remoteEndpoints"', () => {
      assert.ok(
        Array.isArray(manifest.remotes),
        'server.json must declare remotes[] (the registry schema has no "remoteEndpoints")'
      );
      assert.equal(
        manifest.remoteEndpoints,
        undefined,
        '"remoteEndpoints" is not a field in the registry schema — use "remotes"'
      );
    });

    it('declares no authentication field (the server is authless)', () => {
      for (const remote of manifest.remotes) {
        assert.equal(
          remote.authentication,
          undefined,
          'The registry schema has no authentication field, and the server is ' +
            'authless — OAuth discovery is disabled in stayker-mcp. Do not ' +
            'advertise auth the endpoint will not perform.'
        );
      }
    });

    it('remote transport uses "type", with a schema-valid value', () => {
      for (const remote of manifest.remotes) {
        assert.ok(
          ['streamable-http', 'sse'].includes(remote.type),
          `remote.type must be "streamable-http" or "sse", got ${JSON.stringify(remote.type)}`
        );
        assert.equal(
          remote.transport,
          undefined,
          'Remote transport is declared via "type", not "transport"'
        );
      }
    });

    it('remote endpoint matches the schema endpoint', () => {
      const urls = manifest.remotes.map(r => r.url);
      assert.ok(
        urls.includes(schema.server.endpoint),
        `server.json remotes must include the schema endpoint ${schema.server.endpoint}`
      );
    });

    it('manifest version matches package.json', () => {
      assert.equal(manifest.version, pkg.version, 'server.json version must track package.json');
      for (const p of manifest.packages) {
        assert.equal(
          p.version,
          pkg.version,
          `packages[${p.identifier}].version must track package.json`
        );
      }
    });

    it('npm package identifier matches package.json name', () => {
      const npmPkg = manifest.packages.find(p => p.registryType === 'npm');
      assert.ok(npmPkg, 'server.json must declare the npm package');
      assert.equal(npmPkg.identifier, pkg.name);
    });

    it('states the correct tool count in its description', () => {
      const stated = manifest.description.match(/(\d+)\s+tools/);
      assert.ok(stated, 'server.json description should state a tool count');
      assert.equal(
        Number(stated[1]),
        schema.tools.length,
        `server.json description says ${stated[1]} tools; schema has ${schema.tools.length}`
      );
    });

    it('declares an icon (the directory tile falls back to a generic globe without one)', () => {
      assert.ok(manifest.icons?.length > 0, 'server.json must declare at least one icon');
      for (const icon of manifest.icons) {
        assert.match(icon.src, /^https:\/\//, 'icon src must be an HTTPS URL');
        assert.ok(
          ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
            .includes(icon.mimeType),
          `icon mimeType ${icon.mimeType} is not allowed by the registry schema`
        );
      }
    });
  });
});
