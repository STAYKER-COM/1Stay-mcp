const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

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
});
