# NorthWind Banking App

SvelteKit + TypeScript banking UI that integrates with the NorthWind API.
The app has two user-facing workflows:

- **Accounts**: account list + balances + recent activity display.
- **Transfer**: account-to-account transfer form + transfer summary + recent transfers.

This README is intended as a handoff guide for future maintainers.

---

## Runtime and Prerequisites

- Node.js: **^24.12.0**
- Package manager: **npm**
- Required API credentials in `.env`:

```env
NORTHWIND_API_BASE_URL=https://<your-northwind-api-host>
NORTHWIND_API_KEY=<your-api-key>
```

---

## Quick Start

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env` in the project root (see above).

3. Start the app:

   ```sh
   npm run dev
   ```

4. Optional: open browser automatically:

   ```sh
   npm run dev -- --open
   ```

---

## npm Commands

### Development

- `npm run dev`
  - Starts Vite dev server.
- `npm run build`
  - Creates production build.
- `npm run preview`
  - Serves the production build locally.

### Type and quality checks

- `npm run prepare`
  - Runs SvelteKit sync step (normally called automatically by npm lifecycle).
- `npm run check`
  - Runs `svelte-kit sync` + `svelte-check` against `tsconfig.json`.
- `npm run check:watch`
  - Same as above in watch mode.
- `npm run lint`
  - Runs Prettier check and ESLint.
- `npm run format`
  - Applies Prettier formatting across the repo.

### Testing

- `npm test`
  - Runs all Vitest tests once.
- `npm run test:watch`
  - Runs Vitest in watch mode.
- `npm run test:coverage`
  - Runs tests with coverage output.

### Recommended local verification flow before merging

```sh
npm run check && npm run lint && npm test
```

---

## Project Organization

```txt
src/
  app.css                      # global app styles
  lib/
    assets/                    # static assets (logo, etc.)
    components/
      ComponentWrapper.svelte
      AccountsView/            # accounts screen and subcomponents
      TransferView/            # transfer screen and subcomponents
    server/
      northwind.ts             # API client + API contract types
    styles/
      reset.css
      tokens.css               # design tokens (CSS variables)
    mockData.ts                # locally generated fallback/mock display data
    types.ts                   # app-level shared TS types
    utils.ts                   # formatting utilities
  routes/
    +page.server.ts            # server load + transfer action
    +page.svelte               # top-level page shell + view switch
  tests/                       # unit/component/server tests
```

### Folder responsibilities

- `src/routes/+page.server.ts`
  - Handles server-side data loading and form action execution.
  - Is the central place for transfer input validation + action result shaping.
- `src/lib/server/northwind.ts`
  - Encapsulates external API calls and response/error typing.
  - Prevents components from calling `fetch` directly.
- `src/lib/components/**`
  - Pure presentation + interaction logic.
  - Emits events upward instead of coupling to API internals.
- `src/tests/**`
  - Mirrors implementation layout (components, routes, lib, server).

---

## Coding Approaches and Conventions

### 1) Server-first data flow

- Use SvelteKit server load/actions for any API/network interaction.
- Keep credentials and outbound API calls in server-only code.
- Return typed, minimal payloads to the client UI.

### 2) Component communication

- Child components communicate upward using `createEventDispatcher`.
- Parent containers (`TransferView`, root `+page.svelte`) orchestrate success/error UI state.
- Keep reusable components focused on a single responsibility.

### 3) Validation layering

- Client-side pre-validation in transfer form (`validateForm`) for immediate UX feedback.
- Server-side validation in `actions.transfer` as source of truth.
- Never rely solely on client checks for correctness.

### 4) Type usage

- API contracts live in `src/lib/server/northwind.ts`.
- App-level aliases/enriched types live in `src/lib/types.ts`.
- Prefer explicit interfaces and discriminated action payload shapes over `any`.

### 5) Styling system

- Use tokens from `src/lib/styles/tokens.css` and shared reset styles.
- Existing code uses CSS variables consistently; follow that pattern.
- Avoid ad-hoc theme values when a token already exists.

---

## Error Handling Strategy

### API client-level (`northwind.ts`)

- `request<T>()` wraps `fetch`.
- Non-2xx responses throw `NorthwindApiError` with:
  - HTTP status
  - parsed API error body (fallback if JSON parse fails)

### Page load-level (`+page.server.ts`)

- Load fetches accounts + transfers in parallel with `Promise.all`.
- On failure:
  - returns empty typed fallback datasets
  - sets `loadError` message
  - prevents hard page failure

### Action-level (`actions.transfer`)

- Input validation failures return `fail(400, { error })`.
- Upstream/API failures return `fail(500, { error })`.
- Success returns a compact payload consumed by enhanced form handlers.

### UI-level (`TransferFormCard` and page shell)

- Form-level validation errors shown inline.
- Action failures trigger failure event and error card UI.
- Successful transfers trigger success card, then data refresh with `invalidateAll()`.

---

## Testing Guide

### Test stack

- Runner: **Vitest**
- Component testing: **@testing-library/svelte**
- DOM environment: **jsdom**
- Global setup: `src/tests/setup.ts`

### Test organization

- `src/tests/components/**`: UI component behavior and rendering.
- `src/tests/routes/page.server.test.ts`: server load/action logic.
- `src/tests/lib/**`: utility and mock data behavior.
- `src/tests/server/**`: API client behavior and request shaping.

### Notable test techniques in this repo

- API and framework functions are mocked in server tests (`$lib/server/northwind`, `fail`).
- `window.matchMedia` is stubbed globally for jsdom compatibility.
- SVG imports are stubbed in Vitest via custom Vite plugin in `vite.config.ts`.

### Running targeted tests

Use Vitest path filters, for example:

```sh
npx vitest run src/tests/routes/page.server.test.ts
```

---

## Mock Data Policy

The API does **not** provide all fields needed for UX display.
`src/lib/mockData.ts` intentionally fills those gaps:

- Human-friendly account display names from account type values.
- Generated recent transaction feed for account cards.

When extending mock behavior, keep it centralized in `mockData.ts` and clearly documented.

---

## Common Maintenance Tasks

### Add a new API-backed feature

1. Add/extend API type(s) and endpoint method(s) in `src/lib/server/northwind.ts`.
2. Read/write through `+page.server.ts` load/actions.
3. Keep components presentation-focused; pass down typed props.
4. Add or update tests in the mirrored `src/tests/**` area.

### Add a new component

1. Place it under the closest feature folder in `src/lib/components`.
2. Keep the public prop/event interface explicit and typed.
3. Add a colocated test under matching path in `src/tests/components/**`.

### Debug transfer failures quickly

1. Check browser/UI message for client validation errors.
2. Inspect server action response from `actions.transfer`.
3. Confirm `.env` values are present and valid.
4. Verify API health/credentials with a simple endpoint call if needed.

---

## Known Technical Constraints

- App is built on **Svelte 4** conventions.
- Transfer reference IDs are generated per submission in server action.
- Recent account transactions are mock/generated, not API-backed.

Svelte 4 legacy docs: <https://svelte.dev/docs/svelte/legacy-overview>
