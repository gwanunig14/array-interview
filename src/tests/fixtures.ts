/**
 * Shared typed test fixtures used across the suite.
 * All IDs, numbers, and dates are deterministic so snapshots remain stable.
 */

import type { AccountSummary } from "$lib/server/northwind";
import type { EnrichedAccount, MockTransaction } from "$lib/types";
import type { EnrichedTransfer } from "$lib/components/RecentTransfersCard.svelte";

// ─── Raw API accounts ─────────────────────────────────────────────────────────

export const rawChecking: AccountSummary = {
  account_id: "acct-001",
  account_number: "1234567890",
  routing_number: "021000021",
  account_type: "CHECKING",
  account_status: "ACTIVE",
  account_holder_name: "Jane Doe",
  balance: 5000.0,
  currency: "USD",
  opened_date: "2020-01-15",
};

export const rawSavings: AccountSummary = {
  account_id: "acct-002",
  account_number: "9876543210",
  routing_number: "021000021",
  account_type: "SAVINGS",
  account_status: "ACTIVE",
  account_holder_name: "Jane Doe",
  balance: 12500.5,
  currency: "USD",
  opened_date: "2020-06-01",
};

export const rawInactive: AccountSummary = {
  account_id: "acct-003",
  account_number: "1111222233",
  routing_number: "021000021",
  account_type: "CHECKING",
  account_status: "CLOSED",
  account_holder_name: "Jane Doe",
  balance: 0,
  currency: "USD",
  opened_date: "2018-03-10",
};

// ─── Enriched accounts ────────────────────────────────────────────────────────

export const enrichedChecking: EnrichedAccount = {
  ...rawChecking,
  displayName: "Checking Account",
};

export const enrichedSavings: EnrichedAccount = {
  ...rawSavings,
  displayName: "Savings Account",
};

export const enrichedInactive: EnrichedAccount = {
  ...rawInactive,
  displayName: "Checking Account 1", // would be disambiguated
};

// ─── Transfers ────────────────────────────────────────────────────────────────

export const enrichedOutbound: EnrichedTransfer = {
  transfer_id: "trx-001",
  status: "COMPLETED",
  transfer_type: "ACH",
  direction: "OUTBOUND",
  amount: 250.0,
  currency: "USD",
  fee: 0,
  description: "Rent payment",
  reference_number: "REF-001",
  initiated_date: "2026-02-15T12:00:00Z",
  processing_date: "2026-02-15T12:00:00Z",
  expected_completion_date: "2026-02-17T12:00:00Z",
  completed_date: "2026-02-17T12:00:00Z",
  source_account: {
    account_number: "1234567890",
    routing_number: "021000021",
    account_holder_name: "Jane Doe",
    institution_name: "Northwind Bank",
  },
  destination_account: {
    account_number: "9876543210",
    routing_number: "021000021",
    account_holder_name: "Jane Doe",
    institution_name: "Northwind Bank",
  },
  sourceDisplayName: "Checking Account",
  destDisplayName: "Savings Account",
};

export const enrichedInbound: EnrichedTransfer = {
  ...enrichedOutbound,
  transfer_id: "trx-002",
  direction: "INBOUND",
  amount: 500.0,
  sourceDisplayName: "External Bank",
  destDisplayName: "Checking Account",
};

// ─── Mock transactions ────────────────────────────────────────────────────────

export const mockTxCredit: MockTransaction = {
  id: "mock-0",
  description: "Direct Deposit - Payroll",
  amount: 2450.0,
  date: "2026-02-24",
  type: "credit",
  transactionType: "income",
  accountLabel: "Checking Account",
};

export const mockTxDebit: MockTransaction = {
  id: "mock-1",
  description: "Amazon.com",
  amount: 87.43,
  date: "2026-02-23",
  type: "debit",
  transactionType: "store",
  accountLabel: "Savings Account",
};
