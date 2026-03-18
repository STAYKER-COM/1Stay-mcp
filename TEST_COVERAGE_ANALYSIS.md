# Test Coverage Analysis — 1Stay MCP

## Current State

**Test coverage: 0%** — The repository contains no tests, no test framework, and no CI/CD pipeline.

The repository is a documentation and API schema repo (not application source code), but several categories of tests are still valuable and recommended.

## Recommended Test Areas

### 1. Schema Validation (Priority: High)

`tools-schema.json` is the contract that clients depend on. Tests should verify:

- **Valid JSON** — the file parses without error
- **Structural integrity** — every tool has `name`, `description`, `inputSchema`, and `annotations`
- **JSON Schema compliance** — each tool's `inputSchema` is a valid JSON Schema (all `required` fields exist in `properties`, types are valid, etc.)
- **No duplicate tool names** — tool names are unique
- **Annotation completeness** — every tool declares `readOnlyHint` and `destructiveHint`
- **Destructive tools are flagged** — tools that mutate state (`book_hotel`, `cancel_booking`) have `destructiveHint: true`

### 2. Documentation Consistency (Priority: High)

The README and schema can drift apart. Tests should verify:

- **Tool parity** — every tool in `tools-schema.json` is documented in the README tools table, and vice versa
- **Annotation accuracy** — the annotations shown in the README match those in the schema
- **Endpoint consistency** — the MCP endpoint URL in the README, schema, and example config all match

### 3. Configuration Validation (Priority: Medium)

- **Example config is valid JSON** — `claude_desktop_config.example.json` parses correctly
- **Config structure** — has expected `mcpServers` key with a valid `url`
- **URL consistency** — the endpoint in the config matches the schema and README

### 4. Contract / Smoke Tests Against Live API (Priority: Medium)

These tests call the actual MCP endpoint and verify the server contract hasn't changed:

- **MCP handshake** — the endpoint responds to an MCP initialize request
- **Tool list matches schema** — the server advertises the same tools as `tools-schema.json`
- **Protocol versions** — the server supports the protocol versions listed in the schema
- **Error handling** — invalid requests return proper MCP error responses

> These should be tagged as integration tests and excluded from fast CI runs (they require network access and a live server).

### 5. Input Validation Edge Cases (Priority: Medium)

Validate schema constraints catch bad input:

- **Date format enforcement** — `check_in`/`check_out` described as YYYY-MM-DD
- **Required field coverage** — each tool's required fields are correct (e.g., `search_hotels` requires `check_in`, `check_out`, `guests` but not `location`)
- **Type correctness** — `guests` is `integer` not `number`, `sms_opt_in` is `boolean`, etc.

### 6. Schema Regression Tests (Priority: Low)

Snapshot-based tests to catch unintended schema changes:

- **Snapshot of tool names and required fields** — alerts when the public API surface changes
- **Breaking change detection** — adding a new required field is a breaking change; tests should flag it

## Proposed File Structure

```
tests/
  schema.test.js          # Schema validation and structural tests
  docs-consistency.test.js # README <-> schema parity tests
  config.test.js           # Configuration file validation
  integration/
    mcp-endpoint.test.js   # Live API contract/smoke tests
package.json               # Test runner (vitest or jest) + dependencies
```

## Summary Table

| Area | Files Tested | Priority | Type |
|------|-------------|----------|------|
| Schema validation | `tools-schema.json` | High | Unit |
| Docs consistency | `README.md` + `tools-schema.json` | High | Unit |
| Config validation | `claude_desktop_config.example.json` | Medium | Unit |
| Live API contract | MCP endpoint | Medium | Integration |
| Input edge cases | `tools-schema.json` | Medium | Unit |
| Schema regression | `tools-schema.json` | Low | Snapshot |
