# 1Stay Changelog

All notable changes to the 1Stay MCP server, API, and documentation will be documented in this file.

---

## 1.2.1 — 2026-07-31

- Reconciled the published tool schema (`tools-schema.json`), `README.md`, and
  `server.json` to exactly match the live production contract at
  `https://mcp.stayker.com/mcp`:
  - `search_hotels` now correctly lists `location` as required.
  - `book_hotel` no longer declares `guest_phone` — the live server does not
    accept it (previously a client following the schema would be rejected).
  - `get_booking` documents that it accepts a booking ID (`stk_bk_xxxx`) or a
    confirmation number.
  - `server.json` corrected from "7 tools" to "8 tools".
  - Aligned parameter descriptions with the deployed server.
- Added a schema regression test that locks the declared tool set to exactly the
  eight tools the live server exposes.
- No live API behavior changed; this release only corrects declaration drift.

## 1.2.0 — 2026-05-26

- License changed from MIT to Proprietary. Versions 1.1.0 and prior remain
  available under MIT to anyone who obtained them under that license.
- No API changes.
