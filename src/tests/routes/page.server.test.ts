/**
 * Tests for the SvelteKit page server (`+page.server.ts`).
 *
 * Strategy:
 *  - Mock `$lib/server/northwind` to control API responses.
 *  - Mock `@sveltejs/kit`'s `fail` to capture validation/error return values.
 *  - Call `load` and `actions.transfer` directly as plain async functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks (must be hoisted before imports) ───────────────────────────────────
// vi.hoisted() ensures these refs are created before vi.mock() factory runs,
// even though vi.mock() itself is hoisted to the top of the file.

const { mockAccountsList, mockTransfersList, mockTransferInitiate } =
  vi.hoisted(() => ({
    mockAccountsList: vi.fn(),
    mockTransfersList: vi.fn(),
    mockTransferInitiate: vi.fn(),
  }));

vi.mock("$env/static/private", () => ({
  NORTHWIND_API_BASE_URL: "https://api.test",
  NORTHWIND_API_KEY: "test-key",
}));

vi.mock("$lib/server/northwind", () => ({
  northwind: {
    accounts: { list: mockAccountsList },
    transfers: { list: mockTransfersList, initiate: mockTransferInitiate },
  },
}));

vi.mock("@sveltejs/kit", () => ({
  fail: vi.fn((status: number, data: Record<string, unknown>) => ({
    __status: status,
    ...data,
  })),
}));

import { load, actions } from "../../routes/+page.server";
import { fail } from "@sveltejs/kit";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const fakeAccountsResponse = {
  accounts: [
    {
      account_id: "acct-001",
      account_number: "1234567890",
      routing_number: "021000021",
      account_type: "CHECKING",
      account_status: "ACTIVE",
      account_holder_name: "Jane Doe",
      balance: 5000,
      currency: "USD",
      opened_date: "2020-01-15",
    },
  ],
  pagination: { page: 1, per_page: 100, total: 1 },
};

const fakeTransfersResponse = {
  transfers: [],
  pagination: { page: 1, per_page: 20, total: 0 },
};

function makeRequest(fields: Record<string, string>): Request {
  return {
    formData: async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, v);
      return fd;
    },
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── load() ───────────────────────────────────────────────────────────────────

describe("load()", () => {
  it("returns accounts, transfers, and a null loadError on success", async () => {
    mockAccountsList.mockResolvedValue(fakeAccountsResponse);
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    const result = await load({} as Parameters<typeof load>[0]);

    expect(result.accounts).toEqual(fakeAccountsResponse);
    expect(result.transfers).toEqual(fakeTransfersResponse);
    expect(result.loadError).toBeNull();
  });

  it("calls accounts.list with limit: 100", async () => {
    mockAccountsList.mockResolvedValue(fakeAccountsResponse);
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    await load({} as Parameters<typeof load>[0]);
    expect(mockAccountsList).toHaveBeenCalledWith({ limit: 100 });
  });

  it("calls transfers.list with per_page: 20", async () => {
    mockAccountsList.mockResolvedValue(fakeAccountsResponse);
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    await load({} as Parameters<typeof load>[0]);
    expect(mockTransfersList).toHaveBeenCalledWith({ per_page: 20 });
  });

  it("returns empty data and a loadError string when the API throws an Error", async () => {
    mockAccountsList.mockRejectedValue(new Error("API unavailable"));
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    const result = await load({} as Parameters<typeof load>[0]);

    expect(result.loadError).toBe("API unavailable");
    expect(result.accounts.accounts).toEqual([]);
    expect(result.transfers.transfers).toEqual([]);
  });

  it("returns a fallback loadError string when it throws a non-Error value", async () => {
    mockAccountsList.mockRejectedValue("string error");
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    const result = await load({} as Parameters<typeof load>[0]);

    expect(result.loadError).toBe("Failed to load account data.");
  });

  it("returns correct empty pagination structure on failure", async () => {
    mockAccountsList.mockRejectedValue(new Error("down"));
    mockTransfersList.mockResolvedValue(fakeTransfersResponse);

    const result = await load({} as Parameters<typeof load>[0]);

    expect(result.accounts.pagination).toEqual({
      page: 1,
      per_page: 0,
      total: 0,
    });
    expect(result.transfers.pagination).toEqual({
      page: 1,
      per_page: 0,
      total: 0,
    });
  });
});

// ─── actions.transfer – validation ────────────────────────────────────────────

describe("actions.transfer – input validation", () => {
  it("returns fail(400) when fromAccountNumber is empty", async () => {
    const result = await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "",
        toAccountNumber: "9876543210",
        amount: "100",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
    expect((result as Record<string, unknown>).__status).toBe(400);
  });

  it("returns fail(400) when toAccountNumber is empty", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "",
        amount: "100",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns fail(400) when fromAccountNumber === toAccountNumber", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "1234567890",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns fail(400) when amount is not a number", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "abc",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns fail(400) when amount is zero", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "0",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns fail(400) when amount is negative", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "-50",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      400,
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("does not call northwind.transfers.initiate when validation fails", async () => {
    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "",
        toAccountNumber: "",
        amount: "100",
      }),
    });

    expect(mockTransferInitiate).not.toHaveBeenCalled();
  });
});

// ─── actions.transfer – success ───────────────────────────────────────────────

describe("actions.transfer – success path", () => {
  it("returns success: true with a transferId", async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-xyz",
      status: "PENDING",
    });

    const result = await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021000021",
        toRoutingNumber: "021000021",
        fromAccountHolder: "Jane Doe",
        toAccountHolder: "Jane Doe",
        amount: "250",
        description: "Rent",
      }),
    });

    expect(result).toMatchObject({ success: true, transferId: "trx-xyz" });
  });

  it("passes the correct amount to northwind.transfers.initiate", async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-1",
      status: "PENDING",
    });

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "500.25",
      }),
    });

    expect(mockTransferInitiate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500.25, currency: "USD" }),
    );
  });

  it('defaults description to "Balance Transfer" when omitted', async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-2",
      status: "PENDING",
    });

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
        description: "",
      }),
    });

    expect(mockTransferInitiate).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Balance Transfer" }),
    );
  });

  it("uses the provided description when given", async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-3",
      status: "PENDING",
    });

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
        description: "Monthly savings",
      }),
    });

    expect(mockTransferInitiate).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Monthly savings" }),
    );
  });

  it("sends direction: OUTBOUND and transfer_type: ACH", async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-4",
      status: "PENDING",
    });

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
      }),
    });

    expect(mockTransferInitiate).toHaveBeenCalledWith(
      expect.objectContaining({ direction: "OUTBOUND", transfer_type: "ACH" }),
    );
  });

  it("returns the fromAccountNumber and toAccountNumber in the success response", async () => {
    mockTransferInitiate.mockResolvedValue({
      transfer_id: "trx-5",
      status: "PENDING",
    });

    const result = (await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
      }),
    })) as Record<string, unknown>;

    expect(result.fromAccountNumber).toBe("1234567890");
    expect(result.toAccountNumber).toBe("9876543210");
  });
});

// ─── actions.transfer – API errors ────────────────────────────────────────────

describe("actions.transfer – API error paths", () => {
  it("returns fail(500) when northwind.transfers.initiate throws an Error", async () => {
    mockTransferInitiate.mockRejectedValue(new Error("Insufficient funds"));

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      500,
      expect.objectContaining({ error: "Insufficient funds" }),
    );
  });

  it("returns fail(500) with a generic message when northwind throws a non-Error", async () => {
    mockTransferInitiate.mockRejectedValue("unknown error string");

    await actions.transfer({
      request: makeRequest({
        fromAccountNumber: "1234567890",
        toAccountNumber: "9876543210",
        fromRoutingNumber: "021",
        toRoutingNumber: "021",
        fromAccountHolder: "Jane",
        toAccountHolder: "Jane",
        amount: "100",
      }),
    });

    expect(fail).toHaveBeenCalledWith(
      500,
      expect.objectContaining({ error: "Transfer failed. Please try again." }),
    );
  });
});
