/**
 * Mock data utilities.
 *
 * The NorthWind API does not provide:
 *   1. Friendly account display names — generated from account_type.
 *   2. Per-account transaction history — generated deterministically from a
 *      seeded pool so the UI remains consistent across page loads.
 *
 * Any component that renders mock data should import from this module so all
 * usage is centralised and clearly labelled.
 */

import type {
  AccountSummary,
  EnrichedAccount,
  MockTransaction,
} from "$lib/types";

// ─── Account Display Names ────────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: "Checking Account",
  SAVINGS: "Savings Account",
  MONEY_MARKET: "Money Market Account",
  CD: "Certificate of Deposit",
  IRA: "IRA Account",
  BUSINESS_CHECKING: "Business Checking",
  BUSINESS_SAVINGS: "Business Savings",
};

function labelForType(type: string): string {
  return ACCOUNT_TYPE_LABELS[type.toUpperCase()] ?? `${type} Account`;
}

/**
 * Enriches a list of accounts with human-friendly display names.
 * When multiple accounts share the same type, a numeric suffix is appended
 * (e.g., "Checking Account 1", "Checking Account 2").
 */
export function enrichAccounts(accounts: AccountSummary[]): EnrichedAccount[] {
  const typeCounts: Record<string, number> = {};

  // Count occurrences of each type
  for (const account of accounts) {
    const key = account.account_type.toUpperCase();
    typeCounts[key] = (typeCounts[key] ?? 0) + 1;
  }

  const typeIndex: Record<string, number> = {};

  return accounts.map((account): EnrichedAccount => {
    const key = account.account_type.toUpperCase();
    const label = labelForType(account.account_type);

    if (typeCounts[key] > 1) {
      typeIndex[key] = (typeIndex[key] ?? 0) + 1;
      return { ...account, displayName: `${label} ${typeIndex[key]}` };
    }

    return { ...account, displayName: label };
  });
}

// ─── Mock Transactions ────────────────────────────────────────────────────────

const TRANSACTION_POOL: Omit<MockTransaction, "id" | "date">[] = [
  { description: "Direct Deposit - Payroll", amount: 2450.0, type: "credit" },
  { description: "Amazon.com", amount: 87.43, type: "debit" },
  { description: "Netflix Subscription", amount: 15.99, type: "debit" },
  { description: "Grocery Store", amount: 134.22, type: "debit" },
  { description: "Gas Station", amount: 58.75, type: "debit" },
  { description: "Restaurant - Dinner", amount: 46.3, type: "debit" },
  { description: "Interest Payment", amount: 12.5, type: "credit" },
  { description: "Utility Bill - Electric", amount: 95.0, type: "debit" },
  { description: "Online Transfer Received", amount: 500.0, type: "credit" },
  { description: "Coffee Shop", amount: 6.75, type: "debit" },
  { description: "Pharmacy", amount: 23.18, type: "debit" },
  { description: "Streaming Service", amount: 13.99, type: "debit" },
  { description: "ATM Withdrawal", amount: 200.0, type: "debit" },
  { description: "Refund - Online Purchase", amount: 42.0, type: "credit" },
  { description: "Monthly Savings Transfer", amount: 300.0, type: "debit" },
];

/**
 * Returns all mock transactions from the shared pool with sequential dates
 * (most recent first). Not differentiated by account.
 */
export function getMockTransactions(): MockTransaction[] {
  const baseDate = new Date("2026-02-24");

  return TRANSACTION_POOL.map((tx, i) => {
    const txDate = new Date(baseDate);
    txDate.setDate(txDate.getDate() - i);
    return {
      id: `mock-${i}`,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      date: txDate.toISOString().split("T")[0],
    };
  });
}
