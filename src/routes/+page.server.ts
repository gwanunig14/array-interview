import { fail } from "@sveltejs/kit";
import { northwind } from "$lib/server/northwind";
import type {
  AccountListResponse,
  TransferListResponse,
} from "$lib/server/northwind";
import type { PageServerLoad, Actions } from "./$types";

const EMPTY_ACCOUNTS: AccountListResponse = {
  accounts: [],
  pagination: { page: 1, per_page: 0, total: 0 },
};
const EMPTY_TRANSFERS: TransferListResponse = {
  transfers: [],
  pagination: { page: 1, per_page: 0, total: 0 },
};

export const load: PageServerLoad = async () => {
  try {
    const [accountsResponse, transfersResponse] = await Promise.all([
      northwind.accounts.list({ limit: 100 }),
      northwind.transfers.list({ per_page: 20 }),
    ]);

    return {
      accounts: accountsResponse,
      transfers: transfersResponse,
      loadError: null as string | null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load account data.";
    return {
      accounts: EMPTY_ACCOUNTS,
      transfers: EMPTY_TRANSFERS,
      loadError: message,
    };
  }
};

export const actions: Actions = {
  transfer: async ({ request }) => {
    const data = await request.formData();

    const fromAccountNumber = String(data.get("fromAccountNumber") ?? "");
    const fromRoutingNumber = String(data.get("fromRoutingNumber") ?? "");
    const fromAccountHolder = String(data.get("fromAccountHolder") ?? "");
    const toAccountNumber = String(data.get("toAccountNumber") ?? "");
    const toRoutingNumber = String(data.get("toRoutingNumber") ?? "");
    const toAccountHolder = String(data.get("toAccountHolder") ?? "");
    const amountStr = String(data.get("amount") ?? "");
    const description =
      String(data.get("description") || "").trim() || "Balance Transfer";

    if (!fromAccountNumber || !toAccountNumber) {
      return fail(400, { error: "Please select both From and To accounts." });
    }

    if (fromAccountNumber === toAccountNumber) {
      return fail(400, {
        error: "Source and destination accounts must be different.",
      });
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return fail(400, { error: "Please enter a valid transfer amount." });
    }

    const referenceNumber = `TRF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      const result = await northwind.transfers.initiate({
        amount,
        currency: "USD",
        description,
        direction: "OUTBOUND",
        transfer_type: "ACH",
        reference_number: referenceNumber,
        source_account: {
          account_number: fromAccountNumber,
          routing_number: fromRoutingNumber,
          account_holder_name: fromAccountHolder,
        },
        destination_account: {
          account_number: toAccountNumber,
          routing_number: toRoutingNumber,
          account_holder_name: toAccountHolder,
        },
      });

      return {
        success: true as const,
        transferId: result.transfer_id,
        amount,
        fromAccountNumber,
        toAccountNumber,
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Transfer failed. Please try again.";
      return fail(500, { error: message });
    }
  },
};
