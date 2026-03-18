const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CONFIG_PATH = path.join(__dirname, '..', 'claude_desktop_config.example.json');

describe('claude_desktop_config.example.json', () => {
  let config;

  it('is valid JSON', () => {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    config = JSON.parse(raw);
    assert.ok(config, 'Config should parse as valid JSON');
  });

  it('has mcpServers key', () => {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    assert.ok(config.mcpServers, 'Config must have an mcpServers key');
    assert.equal(typeof config.mcpServers, 'object', 'mcpServers must be an object');
  });

  it('has a 1stay server entry', () => {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    assert.ok(config.mcpServers['1stay'], 'Config must have a "1stay" server entry');
  });

  it('1stay entry has a valid HTTPS url', () => {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    const url = config.mcpServers['1stay'].url;
    assert.ok(url, '1stay entry must have a url');
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'https:', 'URL must use HTTPS');
  });

  it('url ends with /mcp path', () => {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    const url = new URL(config.mcpServers['1stay'].url);
    assert.equal(url.pathname, '/mcp', 'URL path must be /mcp');
  });
});
