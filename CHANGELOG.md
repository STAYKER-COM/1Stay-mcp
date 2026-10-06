# 1Stay Changelog

All notable changes to the 1Stay MCP server, API, and documentation will be documented in this file.

---

## Unreleased

Docs and schema aligned with the live server; no behavior change. The proxy
(`bin/cli.js`), package metadata and registry listing (`server.json`) are
unchanged.

- `tools-schema.json` now mirrors the live server's input schemas, descriptions
  and annotations (default client contract) for all eight tools:
  - `cancel_booking` does not cancel. It verifies the guest (first name, last
    name, confirmation number) and returns a short-lived secure cancellation
    link; the guest reviews the terms and completes the cancellation on that
    page. The `cancellation_token` parameter and the two-step flow described in
    1.2.1 are removed, and `destructiveHint` is now `false` (`idempotentHint`
    remains `true`).
  - `get_booking` takes a hotel `confirmation_number` only. Internal booking
    IDs (`stk_bk_xxxx`) are not accepted, correcting the 1.2.1 entry.
  - `book_hotel` takes no guest identity or payment fields. `guest_name` and
    `guest_email` are removed; those details are entered on the secure
    checkout page.
  - `search_hotels`: `max_results` is capped at 6 (default 6), the `chain_code`
    filter is removed (the server has no such input), `location` is optional
    when `latitude` and `longitude` are both given, and the search is for one
    room.
  - `get_hotel_details` declares the `accessible` parameter.
  - `lookup_booking` requires the guest's full name plus either the hotel
    confirmation number, or the booking email together with the card's last
    four digits. An email address alone is not enough.
  - `resend_confirmation` also accepts the guest's full name and email for
    recovery when the confirmation number is unknown.
- README: the checkout link is valid for ~15 minutes (was "approximately 30
  minutes"); the endpoint is authless (no OAuth or 1Stay account needed);
  guest details are entered on the checkout page, not in conversation; tool
  table and examples updated to match the above.
- Property count stated as 250,000+ in the README (was 300K+).

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
