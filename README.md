# 1Stay — Hotel Booking via MCP

The first MCP server that completes real hotel reservations inside AI conversations. Not search-and-redirect. Not affiliate links. A confirmed booking with a real confirmation number — where your loyalty points accrue and your elite status benefits apply.

**Builders monetize every booking via Stripe Connect** — set your own fee, get paid directly. Turn any AI agent into a revenue-generating travel assistant.

Built by [Stayker](https://stayker.com) (WPF Holdings, LLC), a licensed travel technology company built on proven travel distribution architecture. When you book through 1Stay, the hotel is the merchant of record — your stay is treated exactly like a direct booking.

[![npm version](https://img.shields.io/npm/v/1stay-mcp)](https://www.npmjs.com/package/1stay-mcp)
[![1Stay Hotel Booking MCP server](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp/badges/card.svg)](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp)
[![1Stay-mcp MCP server](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp/badges/score.svg)](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp)

## Quick Start

### npx (fastest)

```bash
npx 1stay-mcp
```

### Claude Desktop / ChatGPT / Cursor / Windsurf

Add to your MCP configuration:
```json
{
  "mcpServers": {
    "1stay": {
      "url": "https://mcp.stayker.com/mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add 1stay --transport http https://mcp.stayker.com/mcp
```

### Try It Now

**Playground:** [1stay.ai/playground](https://1stay.ai/playground) — test all 7 tools in your browser, no setup required.

**MCP Endpoint:** `https://mcp.stayker.com/mcp`
**Protocol:** Streamable HTTP | MCP SDK v1.27.1 | Latest protocol version `2025-11-25`
**Supported versions:** `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`, `2024-10-07`

## Features

- **300,000+ properties** across 140+ countries — major chains, independents, boutiques
- **Real confirmation numbers** — not affiliate links, not redirects
- **Loyalty program eligible** — Hilton, Marriott, IHG points accrue, elite status applies
- **Stripe Connect monetization** — builders set their own booking fee and get paid directly
- **Secure checkout** — payment handled on PCI-compliant page, never in the AI conversation
- **Live rates** — real-time pricing from travel distribution networks, not cached or scraped

## Tools

| Tool | Description | Annotations |
|------|-------------|-------------|
| `search_hotels` | Search hotels by location, dates, guests, and optional filters | `readOnlyHint: true` |
| `get_hotel_details` | Get room types, amenities, images, and live rates for a specific property | `readOnlyHint: true` |
| `book_hotel` | Create a reservation and receive a secure checkout URL | `destructiveHint: true` |
| `get_booking` | Look up a reservation by confirmation number | `readOnlyHint: true` |
| `cancel_booking` | Cancel an existing reservation | `destructiveHint: true` |
| `retrieve_booking` | Find a reservation and resend the confirmation email | `readOnlyHint: true` |
| `search_tools` | List available 1Stay tools, optionally filtered by keyword | `readOnlyHint: true` |

## For Builders — Monetize with Stripe Connect

1Stay lets developers and AI builders earn on every hotel booking their agent completes. Connect your Stripe account, set your booking service fee, and get paid directly when guests check out.

**Get started:** [1stay.ai/apply](https://1stay.ai/apply)

## Authentication

1Stay uses OAuth 2.0 authorization code flow. When connecting through Claude, the OAuth handshake is handled automatically. You'll need a valid 1Stay account to authenticate.

## How Booking Works

1Stay uses a **secure link handoff** model for payment:

1. **Search and select** happen inside the AI conversation
2. **Guest details** (name, email, phone) are collected in conversation to create the reservation
3. **Payment** is completed on a secure, PCI-compliant checkout page — outside the AI layer
4. **Confirmation** is delivered via email with your hotel confirmation number

Credit card and payment information never passes through the AI conversation. The checkout URL is valid for approximately 30 minutes.

## Examples

### Search hotels for an upcoming trip

**User prompt:** "I need a hotel in downtown Charlotte for May 7-10, two adults."

1Stay searches available properties, returns hotels with nightly rates, star ratings, and distance from city center. Ask follow-ups to narrow by price, brand, or amenities.

### Get details and book a room

**User prompt:** "Show me room options, then book the king room."

1Stay retrieves live room types, rates, and cancellation policies. Provide guest name, email, and phone — 1Stay creates the reservation and returns a secure checkout URL.

### Look up and manage a reservation

**User prompt:** "Pull up my reservation and resend the confirmation email."

1Stay locates the reservation, displays details, and resends the confirmation email. Cancel directly in conversation if needed.

## Coming Soon

- **Event-aware inventory** — search and book around tournaments, weddings, and conferences with venue-based search and organizer tools
- **SMS concierge** — opt-in post-booking updates and itinerary support via text
- **Multi-room coordination** — group booking tools for teams, families, and event attendees

## Privacy & Legal

- Privacy policy: [stayker.com/legal/privacy](https://stayker.com/legal/privacy)
- MCP data policy: [stayker.com/legal/mcp-policy](https://stayker.com/legal/mcp-policy)

## Support

- **Chat:** [stayker.com/service](https://stayker.com/service)
- **Issues:** [github.com/STAYKER-COM/1Stay-mcp/issues](https://github.com/STAYKER-COM/1Stay-mcp/issues)
- **Docs:** [1stay.ai](https://1stay.ai)

## About Stayker

Stayker is a travel technology company that powers hotel reservations for events, organizations, and brands. Built on proven travel distribution architecture — live worldwide inventory, no middlemen, no markups, no affiliate redirects. Hotels are the merchant of record on every booking.

**Headquarters:** Charlotte, NC

*Build. Book. Connect.*

---

© 2026 WPF Holdings, LLC. All rights reserved.