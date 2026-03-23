# 1Stay — Hotel Booking via MCP

The first MCP server that completes real hotel reservations inside AI conversations. Not search-and-redirect. Not affiliate links. A confirmed booking with a real confirmation number — where your loyalty points accrue and your elite status benefits apply.

Built by [Stayker](https://stayker.com) (WPF Holdings, LLC), a licensed travel technology company with 40 years of industry experience operating through established travel distribution networks. When you book through 1Stay, the hotel is the merchant of record — your stay is treated exactly like a direct booking.

[![1StayHotel Booking MCP server](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp/badges/card.svg)](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp)
[![1Stay-mcp MCP server](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp/badges/score.svg)](https://glama.ai/mcp/servers/STAYKER-COM/1Stay-mcp)

**MCP Endpoint:** `https://mcp.stayker.com/mcp`  
**Protocol:** Streamable HTTP | MCP SDK v1.27.1 | Latest protocol version `2025-11-25`  
**Supported versions:** `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`, `2024-10-07`

## Features

- **Real-time hotel search** across 100,000+ properties worldwide via travel distribution network
- **Live rate quotes** with negotiated, loyalty-eligible pricing
- **In-conversation booking** that returns a secure checkout URL — payment and PII never touch the AI layer
- **Post-booking management** — retrieve confirmations, resend emails, cancel reservations

## Tools

| Tool | Description | Annotations |
|------|-------------|-------------|
| `search_hotels` | Search hotels by location and dates. Returns ranked list with rates, star ratings, and hotel_ids. Use results with `get_hotel_details`. | `readOnlyHint: true` |
| `get_hotel_details` | Get room types, live rates, cancellation policies, and bookable rate_codes. Required before `book_hotel` — rate_codes expire in ~15 min. | `readOnlyHint: true` |
| `book_hotel` | Create a reservation. Returns booking_id, confirmation number, and secure checkout URL for payment. Requires valid rate_code. | `destructiveHint: true` |
| `get_booking` | Look up a reservation by booking_id or confirmation number. Returns full booking details. For internal use — use `retrieve_booking` for guest-facing lookups. | `readOnlyHint: true` |
| `cancel_booking` | Cancel a reservation. Cannot be undone. Returns cancellation confirmation number. | `destructiveHint: true` |
| `retrieve_booking` | Find a reservation and resend confirmation email. Requires identity verification. Does not expose booking details in conversation. | `readOnlyHint: true` |
| `search_tools` | List available 1Stay tools with descriptions and parameters. Filter by keyword or list all. | `readOnlyHint: true` |

## Setup

### Connect via Claude Desktop

Add the following to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "1stay": {
      "url": "https://mcp.stayker.com/mcp"
    }
  }
}
```

### Connect via Claude Code

```bash
claude mcp add 1stay --transport http https://mcp.stayker.com/mcp
```

## Authentication

1Stay uses OAuth 2.0 authorization code flow. When connecting through Claude, the OAuth handshake is handled automatically. You'll need a valid 1Stay account to authenticate.

**For developers:** See [1stay.ai/apply](https://1stay.ai/apply) for API access and pricing.

## Examples

### Example 1: Search hotels for an upcoming trip

**User prompt:** "I need a hotel in downtown Charlotte for May 7-10, two adults."

**What happens:**
- 1Stay searches available properties near downtown Charlotte for the specified dates
- Returns a list of hotels with nightly rates, star ratings, and distance from city center
- User can ask follow-up questions to narrow results by price, brand, or amenities

### Example 2: Get details and book a room

**User prompt:** "Show me room options from those results, then book the king room."

**What happens:**
- 1Stay retrieves live room types, rates, cancellation policies, and property amenities
- User selects a room and provides guest name, email, and phone number
- 1Stay creates the reservation and returns a secure checkout URL to complete payment
- Payment is handled on a secure page — credit card information never enters the AI conversation

### Example 3: Look up and manage an existing reservation

**User prompt:** "Can you pull up my reservation and resend the confirmation email?"

**What happens:**
- 1Stay locates the reservation using the confirmation number or guest information
- Displays reservation details including hotel name, dates, rate, and confirmation number
- Resends the confirmation email to the address on file
- If needed, the user can request cancellation directly in conversation

## How Booking Works

1Stay uses a **secure link handoff** model for payment:

1. **Search and select** happen inside the AI conversation
2. **Guest details** (name, email, phone) are collected in conversation to create the reservation
3. **Payment** is completed on a secure, PCI-compliant checkout page — outside the AI layer
4. **Confirmation** is delivered via email with your hotel confirmation number

Credit card and payment information never passes through the AI conversation. The checkout URL is valid for approximately 30 minutes.

## Pricing

1Stay is a commercial service. A non-refundable booking service fee applies to each completed reservation. Developer API access is available via a monthly subscription with metered usage. Full pricing details are available at [1stay.ai](https://1stay.ai).

## Coming Soon

- **Event-aware inventory** — search and book around tournaments, weddings, and conferences with venue-based search and organizer tools
- **SMS concierge** — opt-in post-booking updates and itinerary support via text
- **Multi-room coordination** — group booking tools for teams, families, and event attendees

## Privacy Policy

See our privacy policy: [stayker.com/legal/privacy](https://stayker.com/legal/privacy)

See our MCP-specific data policy: [stayker.com/legal/mcp-policy](https://stayker.com/legal/mcp-policy)

## Support

- **Chat:** [https://stayker.com/service](https://stayker.com/service)
- **Issues:** [github.com/STAYKER-COM/1stay-mcp/issues](https://github.com/STAYKER-COM/1stay-mcp/issues)
- **Documentation:** [1stay.ai](https://1stay.ai)

## About Stayker

Stayker is a travel technology company that has powered hotel reservations for events, organizations, and brands. No hotel contracts, no rooming lists. Live worldwide inventory. Our platform connects directly to travel distribution networks — no middlemen, no markups, no affiliate redirects. Hotels are the merchant of record on every booking.

**Founded:** 2019 | **Industry experience:** 40+ years | **Headquarters:** Charlotte, NC

*Build. Book. Connect.*

---

© 2026 WPF Holdings, LLC. All rights reserved.
