import { NORTHWIND_API_BASE_URL, NORTHWIND_API_KEY } from "$env/static/private";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
}

export interface AccountDetails {
  account_holder_name: string;
  account_number: string;
  institution_name: string;
  routing_number: string;
}

export interface AccountSummary {
  account_id: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  account_status: string;
  account_holder_name: string;
  balance: number;
  currency: string;
  opened_date: string;
}

export interface AccountListResponse {
  accounts: AccountSummary[];
  pagination: PaginationInfo;
}

export interface AccountBalanceResponse {
  account_number: string;
  current_balance: number;
  available_balance: number;
  currency: string;
  last_updated: string;
}

export interface AccountValidationRequest {
  account_holder_name: string;
  account_number: string;
  routing_number: string;
}

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  validation_time: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResponse {
  validation: ValidationResult;
  data?: unknown;
}

export interface ExternalAccountDetails {
  account_number: string;
  routing_number?: string;
  account_holder_name?: string;
  institution_name?: string;
}

export interface TransferRequest {
  amount: number;
  currency: string;
  description: string;
  direction: "INBOUND" | "OUTBOUND";
  transfer_type: string;
  reference_number: string;
  source_account: ExternalAccountDetails;
  destination_account: ExternalAccountDetails;
  scheduled_date?: string;
}

export interface StatusHistoryEntry {
  status: string;
  description: string;
  timestamp: string;
}

export interface TransferStatusResponse {
  transfer_id: string;
  status: string;
  transfer_type: string;
  direction: string;
  amount: number;
  currency: string;
  fee: number;
  exchange_rate: number;
  description: string;
  reference_number: string;
  initiated_date: string;
  processing_date: string;
  expected_completion_date: string;
  completed_date: string;
  source_account: AccountDetails;
  destination_account: AccountDetails;
  status_history: StatusHistoryEntry[];
  retry_count: number;
  error_code?: string;
  error_message?: string;
}

export interface TransferSummary {
  transfer_id: string;
  status: string;
  transfer_type: string;
  direction: string;
  amount: number;
  currency: string;
  fee: number;
  description: string;
  reference_number: string;
  initiated_date: string;
  processing_date: string;
  expected_completion_date: string;
  completed_date: string;
  source_account: AccountDetails;
  destination_account: AccountDetails;
}

export interface TransferListResponse {
  transfers: TransferSummary[];
  pagination: PaginationInfo;
}

export interface BatchTransferRequest {
  transfers: TransferRequest[];
}

export interface BatchTransferItem {
  transfer_id: string;
  status: string;
  reference_number: string;
  error?: string;
}

export interface BatchTransferResponse {
  batch_id: string;
  total_transfers: number;
  accepted: number;
  rejected: number;
  transfers: BatchTransferItem[];
}

export interface TransferCancelRequest {
  reason: string;
}

export interface TransferCancelResponse {
  transfer_id: string;
  status: string;
  cancellation_reason: string;
  cancelled_at: string;
}

export interface TransferReverseRequest {
  reason: string;
  description: string;
}

export interface TransferReverseResponse {
  reversal_id: string;
  transfer_id: string;
  status: string;
  expected_completion_date: string;
}

export interface DomainValue {
  code: string;
  display_name: string;
  description: string;
}

export interface TransferTypeValue {
  code: string;
  display_name: string;
  description: string;
  fee: number;
  min_amount: number;
  max_amount: number;
  processing_days: number;
}

export interface DomainsResponse {
  account_types: DomainValue[];
  account_statuses: DomainValue[];
  directions: DomainValue[];
  transfer_types: TransferTypeValue[];
}

export interface HealthResponse {
  status: string;
  database: string;
  version: string;
  timestamp: string;
  components: Record<string, string>;
  transfer_workflow: Record<string, unknown>;
}

export interface RoutingNumberInfo {
  routing_number: string;
  status: "current" | "legacy";
  description: string;
  valid_for: string[];
  acquired_from?: string;
}

export interface BankInfoResponse {
  institution: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    email: string;
    website: string;
    established: string;
  };
  routing_numbers: RoutingNumberInfo[];
  services: {
    ach_transfers: boolean;
    wire_transfers: boolean;
    check_processing: boolean;
    mobile_banking: boolean;
  };
  business_hours: {
    customer_service: string;
    wire_cutoff: string;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    request_id: string;
    timestamp: string;
    details?: Record<string, unknown>;
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────

class NorthwindApiError extends Error {
  constructor(
    public status: number,
    public body: ErrorResponse,
  ) {
    super(body.error?.message ?? `API error ${status}`);
    this.name = "NorthwindApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${NORTHWIND_API_BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${NORTHWIND_API_KEY}`,
    ...init.headers,
  };

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body: ErrorResponse = await res.json().catch(() => ({
      error: {
        code: String(res.status),
        message: res.statusText,
        request_id: "",
        timestamp: "",
      },
    }));
    throw new NorthwindApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const northwind = {
  /** Check the health status of the API and database */
  health: () => request<HealthResponse>("/health"),

  /** Get comprehensive information about Northwind Bank */
  getBank: () => request<BankInfoResponse>("/bank"),

  /** Get all valid domain values */
  getDomains: () => request<DomainsResponse>("/domains"),

  accounts: {
    /** List all accounts accessible to the authenticated candidate */
    list: (params?: {
      limit?: number;
      offset?: number;
      type?: string;
      status?: string;
    }) => {
      const qs = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ).toString();
      return request<AccountListResponse>(
        `/external/accounts${qs ? `?${qs}` : ""}`,
      );
    },

    /** Validate account details before initiating transfers */
    validate: (body: AccountValidationRequest) =>
      request<ValidationResponse>("/external/accounts/validate", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    /** Get real-time account balance */
    getBalance: (accountNumber: string) =>
      request<AccountBalanceResponse>(
        `/external/accounts/${accountNumber}/balance`,
      ),
  },

  transfers: {
    /** List all transfers with optional filters */
    list: (params?: {
      page?: number;
      per_page?: number;
      status?: string;
      direction?: string;
      date_from?: string;
      date_to?: string;
      transfer_type?: string;
    }) => {
      const qs = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ).toString();
      return request<TransferListResponse>(
        `/external/transfers${qs ? `?${qs}` : ""}`,
      );
    },

    /** Get detailed status of a specific transfer */
    get: (transferId: string) =>
      request<TransferStatusResponse>(`/external/transfers/${transferId}`),

    /** Validate a proposed transfer without creating it */
    validate: (body: TransferRequest) =>
      request<ValidationResponse>("/external/transfers/validate", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    /** Initiate a new external transfer */
    initiate: (body: TransferRequest) =>
      request<TransferStatusResponse>("/external/transfers/initiate", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    /** Submit multiple transfers in a single request (max 100) */
    batch: (transfers: TransferRequest[]) =>
      request<BatchTransferResponse>("/external/transfers/batch", {
        method: "POST",
        body: JSON.stringify({ transfers } satisfies BatchTransferRequest),
      }),

    /** Cancel a pending transfer */
    cancel: (transferId: string, body: TransferCancelRequest) =>
      request<TransferCancelResponse>(
        `/external/transfers/${transferId}/cancel`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),

    /** Request reversal of a completed ACH transfer */
    reverse: (transferId: string, body: TransferReverseRequest) =>
      request<TransferReverseResponse>(
        `/external/transfers/${transferId}/reverse`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
  },

  /** Reset Northwind to initial state */
  reset: () =>
    request<Record<string, unknown>>("/external/reset", { method: "POST" }),
};
