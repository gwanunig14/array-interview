# NorthWind Banking App

A SvelteKit + TypeScript application integrating with the NorthWind Bank API.
It provides two views — **Accounts** and **Balance Transfer** — accessible via
the top navigation.

---

## Getting Started

Ensure you're using **Node.js ^24.12.0**.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root with your NorthWind credentials:

   ```env
   NORTHWIND_API_BASE_URL=https://<your-northwind-api-host>
   NORTHWIND_API_KEY=<your-api-key>
   ```

3. Start the development server:

   ```sh
   npm run dev
   # or open in a new tab
   npm run dev -- --open
   ```

---

## Building for Production

```sh
npm run build
npm run preview   # preview the production build locally
```

---

## Architecture

```
src/
├── lib/
│   ├── mockData.ts          # Mock data utilities (see below)
│   ├── types.ts             # App-level TypeScript types
│   ├── server/
│   │   └── northwind.ts     # NorthWind API client + all server-side types
│   ├── components/
│   │   ├── AccountCard.svelte     # Single account card with recent activity
│   │   ├── AccountsView.svelte    # Accounts overview (summary + card grid)
│   │   └── TransferView.svelte    # Balance transfer form + recent transfers
│   └── styles/
│       ├── reset.css
│       └── tokens.css       # Design tokens (CSS variables)
└── routes/
    ├── +page.server.ts      # Server load function + transfer form action
    └── +page.svelte         # Root page — view state, nav, data wiring
```

Key design decisions:

- **Server-side load** (`+page.server.ts`) fetches all accounts and recent
  transfers in parallel on each page load. A top-level try/catch surfaces API
  errors gracefully without crashing the page.
- **Form action** (`?/transfer`) handles the transfer submission server-side
  and returns typed success or failure data consumed by `TransferView` via
  `use:enhance`.
- **`invalidateAll()`** is called after a successful transfer so SvelteKit
  re-runs the load function and refreshes live account balances.
- The two views share the same route; active view is local component state in
  `+page.svelte`.

---

## Mock Data

The NorthWind API does not expose the following data, so it is generated
locally in **`src/lib/mockData.ts`**:

| Mocked element            | Reason                                                                  | Implementation                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account display names** | The API returns `account_type` (e.g. `CHECKING`) but no friendly label. | `enrichAccounts()` maps type codes to human-readable names (e.g. "Checking Account"). When multiple accounts share a type, a numeric suffix is appended. |
| **Recent transactions**   | The API has no per-account transaction history endpoint.                | `getMockTransactions()` returns the full shared transaction pool with sequential dates, displayed once at the accounts view level (not per account).     |

All other data — balances, account numbers, account status, transfer history —
is sourced directly from the NorthWind API.

---

## Notes on this project

This project uses **Svelte v4**. Legacy docs:
<https://svelte.dev/docs/svelte/legacy-overview>
