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

type PoolEntry = Omit<MockTransaction, "id" | "date" | "accountLabel">;

const ACCOUNT_LABEL_LIST = Object.values(ACCOUNT_TYPE_LABELS);

const TRANSACTION_POOL: PoolEntry[] = [
  {
    description: "Direct Deposit - Payroll",
    amount: 2450.0,
    type: "credit",
    transactionType: "income",
  },
  {
    description: "Amazon.com",
    amount: 87.43,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "Netflix Subscription",
    amount: 15.99,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "Grocery Store",
    amount: 134.22,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "Gas Station",
    amount: 58.75,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "Restaurant - Dinner",
    amount: 46.3,
    type: "debit",
    transactionType: "restaurant",
  },
  {
    description: "Interest Payment",
    amount: 12.5,
    type: "credit",
    transactionType: "income",
  },
  {
    description: "Utility Bill - Electric",
    amount: 95.0,
    type: "debit",
    transactionType: "payment",
  },
  {
    description: "Online Transfer Received",
    amount: 500.0,
    type: "credit",
    transactionType: "payment",
  },
  {
    description: "Coffee Shop",
    amount: 6.75,
    type: "debit",
    transactionType: "restaurant",
  },
  {
    description: "Pharmacy",
    amount: 23.18,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "Streaming Service",
    amount: 13.99,
    type: "debit",
    transactionType: "store",
  },
  {
    description: "ATM Withdrawal",
    amount: 200.0,
    type: "debit",
    transactionType: "transfer",
  },
  {
    description: "Refund - Online Purchase",
    amount: 42.0,
    type: "credit",
    transactionType: "payment",
  },
  {
    description: "Monthly Savings Transfer",
    amount: 300.0,
    type: "debit",
    transactionType: "transfer",
  },
];

/**
 * Returns all mock transactions from the shared pool with sequential dates
 * (most recent first). Each transaction is assigned a random account label
 * from the known account type labels.
 */
export function getMockTransactions(): MockTransaction[] {
  const baseDate = new Date("2026-02-24");

  return TRANSACTION_POOL.map((tx, i) => {
    const txDate = new Date(baseDate);
    txDate.setDate(txDate.getDate() - i);
    const accountLabel =
      ACCOUNT_LABEL_LIST[Math.floor(Math.random() * ACCOUNT_LABEL_LIST.length)];
    return {
      id: `mock-${i}`,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      transactionType: tx.transactionType,
      accountLabel,
      date: txDate.toISOString().split("T")[0],
    };
  });
}
