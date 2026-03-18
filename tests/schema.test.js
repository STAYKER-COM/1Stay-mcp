const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_PATH = path.join(__dirname, '..', 'tools-schema.json');

describe('tools-schema.json', () => {
  let schema;

  it('is valid JSON', () => {
    const raw = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    schema = JSON.parse(raw);
    assert.ok(schema, 'Schema should parse as valid JSON');
  });

  describe('server metadata', () => {
    it('has required server fields', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      assert.ok(schema.server, 'Schema must have a server object');
      assert.ok(schema.server.name, 'Server must have a name');
      assert.ok(schema.server.version, 'Server must have a version');
      assert.ok(schema.server.endpoint, 'Server must have an endpoint');
      assert.ok(schema.server.transport, 'Server must have a transport');
      assert.ok(schema.server.protocol_version, 'Server must have a protocol_version');
    });

    it('endpoint is a valid HTTPS URL', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      const url = new URL(schema.server.endpoint);
      assert.equal(url.protocol, 'https:', 'Endpoint must use HTTPS');
    });

    it('supported_versions is a non-empty array', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      assert.ok(Array.isArray(schema.server.supported_versions), 'supported_versions must be an array');
      assert.ok(schema.server.supported_versions.length > 0, 'supported_versions must not be empty');
    });

    it('protocol_version is included in supported_versions', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      assert.ok(
        schema.server.supported_versions.includes(schema.server.protocol_version),
        'protocol_version must be listed in supported_versions'
      );
    });
  });

  describe('tools array', () => {
    it('exists and is a non-empty array', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      assert.ok(Array.isArray(schema.tools), 'tools must be an array');
      assert.ok(schema.tools.length > 0, 'tools must not be empty');
    });

    it('has no duplicate tool names', () => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      const names = schema.tools.map(t => t.name);
      const unique = new Set(names);
      assert.equal(names.length, unique.size, `Duplicate tool names found: ${names.filter((n, i) => names.indexOf(n) !== i)}`);
    });
  });

  describe('each tool', () => {
    let tools;

    before(() => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      tools = schema.tools;
    });

    it('has name, description, inputSchema, and annotations', () => {
      for (const tool of tools) {
        assert.ok(tool.name, `Tool is missing a name`);
        assert.ok(typeof tool.description === 'string' && tool.description.length > 0, `Tool "${tool.name}" must have a non-empty description`);
        assert.ok(tool.inputSchema, `Tool "${tool.name}" must have an inputSchema`);
        assert.ok(tool.annotations, `Tool "${tool.name}" must have annotations`);
      }
    });

    it('annotations include readOnlyHint and destructiveHint', () => {
      for (const tool of tools) {
        assert.ok(typeof tool.annotations.readOnlyHint === 'boolean', `Tool "${tool.name}" must have a boolean readOnlyHint`);
        assert.ok(typeof tool.annotations.destructiveHint === 'boolean', `Tool "${tool.name}" must have a boolean destructiveHint`);
      }
    });

    it('readOnlyHint and destructiveHint are never both true', () => {
      for (const tool of tools) {
        if (tool.annotations.readOnlyHint && tool.annotations.destructiveHint) {
          assert.fail(`Tool "${tool.name}" cannot be both readOnly and destructive`);
        }
      }
    });

    it('inputSchema has type "object" and properties', () => {
      for (const tool of tools) {
        assert.equal(tool.inputSchema.type, 'object', `Tool "${tool.name}" inputSchema.type must be "object"`);
        assert.ok(tool.inputSchema.properties, `Tool "${tool.name}" must have inputSchema.properties`);
      }
    });

    it('all required fields exist in properties', () => {
      for (const tool of tools) {
        const required = tool.inputSchema.required || [];
        const properties = Object.keys(tool.inputSchema.properties);
        for (const field of required) {
          assert.ok(
            properties.includes(field),
            `Tool "${tool.name}" requires "${field}" but it is not defined in properties`
          );
        }
      }
    });

    it('every property has a type and description', () => {
      for (const tool of tools) {
        for (const [propName, propDef] of Object.entries(tool.inputSchema.properties)) {
          assert.ok(propDef.type, `Tool "${tool.name}" property "${propName}" must have a type`);
          assert.ok(typeof propDef.description === 'string' && propDef.description.length > 0, `Tool "${tool.name}" property "${propName}" must have a non-empty description`);
        }
      }
    });

    it('property types are valid JSON Schema types', () => {
      const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'];
      for (const tool of tools) {
        for (const [propName, propDef] of Object.entries(tool.inputSchema.properties)) {
          assert.ok(
            validTypes.includes(propDef.type),
            `Tool "${tool.name}" property "${propName}" has invalid type "${propDef.type}"`
          );
        }
      }
    });
  });

  describe('specific tool contracts', () => {
    let toolsByName;

    before(() => {
      schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
      toolsByName = Object.fromEntries(schema.tools.map(t => [t.name, t]));
    });

    it('book_hotel and cancel_booking are destructive', () => {
      assert.equal(toolsByName['book_hotel']?.annotations.destructiveHint, true, 'book_hotel must be destructive');
      assert.equal(toolsByName['cancel_booking']?.annotations.destructiveHint, true, 'cancel_booking must be destructive');
    });

    it('search_hotels, get_hotel_details, get_booking, retrieve_booking are read-only', () => {
      for (const name of ['search_hotels', 'get_hotel_details', 'get_booking', 'retrieve_booking']) {
        assert.equal(toolsByName[name]?.annotations.readOnlyHint, true, `${name} must be readOnly`);
      }
    });

    it('search_hotels does not require location (supports lat/lng search)', () => {
      const required = toolsByName['search_hotels']?.inputSchema.required || [];
      assert.ok(!required.includes('location'), 'search_hotels should not require location (lat/lng is an alternative)');
    });

    it('book_hotel requires guest contact information', () => {
      const required = toolsByName['book_hotel']?.inputSchema.required || [];
      assert.ok(required.includes('guest_name'), 'book_hotel must require guest_name');
      assert.ok(required.includes('guest_email'), 'book_hotel must require guest_email');
      assert.ok(required.includes('guest_phone'), 'book_hotel must require guest_phone');
    });
  });
});
