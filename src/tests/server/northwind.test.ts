/**
 * Tests for the Northwind API client (`$lib/server/northwind`).
 *
 * Strategy:
 *  - Mock `$env/static/private` so the module loads in the test environment.
 *  - Stub `globalThis.fetch` with `vi.stubGlobal` per test to control responses.
 *  - Assert request construction (URL, headers, body) and response parsing.
 *  - Assert error paths: non-ok status, malformed JSON, network failure.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("$env/static/private", () => ({
  NORTHWIND_API_BASE_URL: "https://api.test",
  NORTHWIND_API_KEY: "test-key-abc",
}));

// Import after mocking env
import { northwind } from "$lib/server/northwind";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(options: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
  rejectWith?: Error;
}) {
  const {
    ok = true,
    status = 200,
    statusText = "OK",
    body = {},
    rejectWith,
  } = options;

  const stub = rejectWith
    ? vi.fn().mockRejectedValue(rejectWith)
    : vi.fn().mockResolvedValue({
        ok,
        status,
        statusText,
        json: vi.fn().mockResolvedValue(body),
      });

  vi.stubGlobal("fetch", stub);
  return stub;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("northwind – happy path", () => {
  it("returns parsed JSON on a 200 response", async () => {
    const payload = {
      accounts: [],
      pagination: { page: 1, per_page: 0, total: 0 },
    };
    mockFetch({ body: payload });

    const result = await northwind.accounts.list();
    expect(result).toEqual(payload);
  });

  it("sends the Authorization header with the API key", async () => {
    const fetchStub = mockFetch({ body: {} });
    await northwind.health();

    const [, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer test-key-abc",
    );
  });

  it("sends Content-Type: application/json", async () => {
    const fetchStub = mockFetch({ body: {} });
    await northwind.health();

    const [, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("builds the correct URL from the base URL + path", async () => {
    const fetchStub = mockFetch({
      body: {
        status: "ok",
        database: "ok",
        version: "1",
        timestamp: "",
        components: {},
        transfer_workflow: {},
      },
    });
    await northwind.health();

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/health");
  });

  it("appends query string parameters for accounts.list", async () => {
    const fetchStub = mockFetch({
      body: { accounts: [], pagination: { page: 1, per_page: 0, total: 0 } },
    });
    await northwind.accounts.list({ limit: 10, type: "CHECKING" });

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("limit=10");
    expect(url).toContain("type=CHECKING");
  });

  it("omits undefined/null parameters from the query string", async () => {
    const fetchStub = mockFetch({
      body: { accounts: [], pagination: { page: 1, per_page: 0, total: 0 } },
    });
    await northwind.accounts.list({ limit: undefined, type: undefined });

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/external/accounts");
  });

  it("calls accounts.list with no params → clean URL (no trailing ?)", async () => {
    const fetchStub = mockFetch({
      body: { accounts: [], pagination: { page: 1, per_page: 0, total: 0 } },
    });
    await northwind.accounts.list();

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("?");
  });

  it("sends a POST request for transfers.initiate", async () => {
    const fetchStub = mockFetch({
      body: { transfer_id: "trx-1", status: "PENDING" },
    });

    await northwind.transfers.initiate({
      amount: 100,
      currency: "USD",
      description: "test",
      direction: "OUTBOUND",
      transfer_type: "ACH",
      reference_number: "REF-001",
      source_account: { account_number: "123", routing_number: "021" },
      destination_account: { account_number: "456", routing_number: "021" },
    });

    const [, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.amount).toBe(100);
    expect(sentBody.currency).toBe("USD");
  });

  it("sends a POST request for transfers.batch with wrapped body", async () => {
    const fetchStub = mockFetch({
      body: {
        batch_id: "b1",
        total_transfers: 0,
        accepted: 0,
        rejected: 0,
        transfers: [],
      },
    });

    const transfer = {
      amount: 50,
      currency: "USD",
      description: "batch",
      direction: "OUTBOUND" as const,
      transfer_type: "ACH",
      reference_number: "REF-002",
      source_account: { account_number: "123", routing_number: "021" },
      destination_account: { account_number: "456", routing_number: "021" },
    };
    await northwind.transfers.batch([transfer]);

    const [, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    const sentBody = JSON.parse(init.body as string);
    expect(sentBody).toHaveProperty("transfers");
    expect(sentBody.transfers).toHaveLength(1);
  });
});

// ─── Error paths ──────────────────────────────────────────────────────────────

describe("northwind – error responses", () => {
  it("throws NorthwindApiError when response is not ok", async () => {
    mockFetch({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      body: {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid API key",
          request_id: "req-1",
          timestamp: "2026-01-01T00:00:00Z",
        },
      },
    });

    await expect(northwind.accounts.list()).rejects.toThrow("Invalid API key");
  });

  it("includes the HTTP status on the thrown error", async () => {
    mockFetch({
      ok: false,
      status: 404,
      body: {
        error: {
          code: "NOT_FOUND",
          message: "Account not found",
          request_id: "req-2",
          timestamp: "",
        },
      },
    });

    const err = await northwind.accounts.list().catch((e) => e);
    expect(err.status).toBe(404);
    expect(err.name).toBe("NorthwindApiError");
  });

  it("falls back to a generic error when the error body JSON is malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      }),
    );

    const err = await northwind.health().catch((e) => e);
    expect(err.status).toBe(500);
    // message falls back to statusText
    expect(err.message).toBe("Internal Server Error");
  });

  it("propagates a network-level error (fetch throws)", async () => {
    mockFetch({ rejectWith: new TypeError("Failed to fetch") });

    await expect(northwind.accounts.list()).rejects.toThrow("Failed to fetch");
  });

  it("throws when error body is missing the error.message field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        // body.error exists but has no message
        json: vi.fn().mockResolvedValue({ error: { code: "DOWN" } }),
      }),
    );

    const err = await northwind.health().catch((e) => e);
    expect(err.status).toBe(503);
    // falls back to "API error 503"
    expect(err.message).toMatch(/503/);
  });

  it("throws on 403 Forbidden with the API error message", async () => {
    mockFetch({
      ok: false,
      status: 403,
      body: {
        error: {
          code: "FORBIDDEN",
          message: "Access denied",
          request_id: "req-3",
          timestamp: "",
        },
      },
    });

    await expect(northwind.transfers.list()).rejects.toThrow("Access denied");
  });
});

// ─── Specific endpoint construction ───────────────────────────────────────────

describe("northwind – endpoint shapes", () => {
  it("transfers.list builds correct URL with filters", async () => {
    const fetchStub = mockFetch({
      body: { transfers: [], pagination: { page: 1, per_page: 0, total: 0 } },
    });

    await northwind.transfers.list({
      status: "COMPLETED",
      direction: "OUTBOUND",
      per_page: 5,
    });

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/external/transfers");
    expect(url).toContain("status=COMPLETED");
    expect(url).toContain("direction=OUTBOUND");
    expect(url).toContain("per_page=5");
  });

  it("transfers.get builds correct URL with transfer ID", async () => {
    const fetchStub = mockFetch({ body: { transfer_id: "trx-abc" } });
    await northwind.transfers.get("trx-abc");

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/external/transfers/trx-abc");
  });

  it("accounts.getBalance builds the correct URL", async () => {
    const fetchStub = mockFetch({
      body: {
        account_number: "1234",
        current_balance: 100,
        available_balance: 100,
        currency: "USD",
        last_updated: "",
      },
    });
    await northwind.accounts.getBalance("1234567890");

    const [url] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/external/accounts/1234567890/balance");
  });

  it("accounts.validate sends POST with the validation body", async () => {
    const fetchStub = mockFetch({
      body: { validation: { valid: true, issues: [], validation_time: "" } },
    });
    await northwind.accounts.validate({
      account_holder_name: "Jane Doe",
      account_number: "123",
      routing_number: "021",
    });

    const [url, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/external/accounts/validate");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.account_holder_name).toBe("Jane Doe");
  });

  it("transfers.cancel sends POST to the correct URL", async () => {
    const fetchStub = mockFetch({
      body: {
        transfer_id: "trx-1",
        status: "CANCELLED",
        cancellation_reason: "test",
        cancelled_at: "",
      },
    });
    await northwind.transfers.cancel("trx-1", { reason: "duplicate" });

    const [url, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/external/transfers/trx-1/cancel");
    expect(init.method).toBe("POST");
  });

  it("reset sends a POST request to /external/reset", async () => {
    const fetchStub = mockFetch({ body: { message: "reset" } });
    await northwind.reset();

    const [url, init] = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/external/reset");
    expect(init.method).toBe("POST");
  });
});
