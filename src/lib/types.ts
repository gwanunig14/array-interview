/**
 * Application-level TypeScript types.
 *
 * API response types live in $lib/server/northwind.ts.
 * This file contains types used across client-side components.
 */

import type { AccountSummary } from "$lib/server/northwind";

// Re-export API types for convenience in components
export type { AccountSummary, TransferSummary } from "$lib/server/northwind";

// ─── View State ───────────────────────────────────────────────────────────────

export type View = "accounts" | "transfer";

// ─── Enriched Account ─────────────────────────────────────────────────────────

/**
 * AccountSummary enriched with a human-friendly display name derived from
 * account_type. The API does not provide a "name" field, so this is generated
 * client-side (see $lib/mockData.ts).
 */
export interface EnrichedAccount extends AccountSummary {
  displayName: string;
}

// ─── Mock Transaction ─────────────────────────────────────────────────────────

export type TransactionType =
  | "restaurant"
  | "store"
  | "income"
  | "payment"
  | "transfer";

/**
 * A mock recent transaction shown in the AccountCard.
 * The NorthWind API does not expose per-account transaction history,
 * so these are generated deterministically from mock data (see $lib/mockData.ts).
 */
export interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
  transactionType: TransactionType;
  accountLabel: string;
}

// ─── Transfer Form ────────────────────────────────────────────────────────────

export interface TransferFormState {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
}

export interface TransferActionResult {
  success?: true;
  transferId?: string;
  error?: string;
}
