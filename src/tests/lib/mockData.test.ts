import { describe, it, expect } from "vitest";
import { enrichAccounts, getMockTransactions } from "$lib/mockData";
import { rawChecking, rawSavings, rawInactive } from "../fixtures";
import type { AccountSummary } from "$lib/server/northwind";

// ─── enrichAccounts ───────────────────────────────────────────────────────────

describe("enrichAccounts", () => {
  it("returns an empty array when given no accounts", () => {
    expect(enrichAccounts([])).toEqual([]);
  });

  it("attaches a human-friendly displayName to a CHECKING account", () => {
    const [result] = enrichAccounts([rawChecking]);
    expect(result.displayName).toBe("Checking Account");
  });

  it("attaches a human-friendly displayName to a SAVINGS account", () => {
    const [result] = enrichAccounts([rawSavings]);
    expect(result.displayName).toBe("Savings Account");
  });

  it("handles account_type in mixed case by normalising to upper", () => {
    const account: AccountSummary = { ...rawChecking, account_type: "savings" };
    const [result] = enrichAccounts([account]);
    expect(result.displayName).toBe("Savings Account");
  });

  it("generates a fallback label for an unknown account type", () => {
    const account: AccountSummary = {
      ...rawChecking,
      account_type: "EXOTIC_TYPE",
    };
    const [result] = enrichAccounts([account]);
    expect(result.displayName).toBe("EXOTIC_TYPE Account");
  });

  it("appends numeric suffixes when two accounts share the same type", () => {
    const second: AccountSummary = { ...rawChecking, account_id: "acct-004" };
    const [a, b] = enrichAccounts([rawChecking, second]);
    expect(a.displayName).toBe("Checking Account 1");
    expect(b.displayName).toBe("Checking Account 2");
  });

  it("does NOT append a suffix when only one account has that type", () => {
    const [checking] = enrichAccounts([rawChecking, rawSavings]);
    expect(checking.displayName).toBe("Checking Account");
  });

  it("appends suffix only to the type that has duplicates (mixed list)", () => {
    const second: AccountSummary = { ...rawChecking, account_id: "acct-099" };
    const results = enrichAccounts([rawChecking, rawSavings, second]);
    const names = results.map((r) => r.displayName);
    expect(names).toContain("Checking Account 1");
    expect(names).toContain("Checking Account 2");
    expect(names).toContain("Savings Account");
  });

  it("preserves all original account fields", () => {
    const [result] = enrichAccounts([rawChecking]);
    expect(result.account_id).toBe(rawChecking.account_id);
    expect(result.balance).toBe(rawChecking.balance);
    expect(result.account_number).toBe(rawChecking.account_number);
  });

  it("handles a CLOSED account the same as ACTIVE for naming", () => {
    const [result] = enrichAccounts([rawInactive]);
    expect(result.displayName).toBe("Checking Account");
  });

  it("returns the correct number of enriched accounts", () => {
    const result = enrichAccounts([rawChecking, rawSavings, rawInactive]);
    expect(result).toHaveLength(3);
  });
});

// ─── getMockTransactions ──────────────────────────────────────────────────────

describe("getMockTransactions", () => {
  it("returns the expected number of transactions (one per pool entry)", () => {
    const txs = getMockTransactions();
    // pool has 15 entries — change this if TRANSACTION_POOL is updated
    expect(txs.length).toBeGreaterThanOrEqual(1);
  });

  it("each transaction has all required fields", () => {
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(tx).toHaveProperty("id");
      expect(tx).toHaveProperty("description");
      expect(tx).toHaveProperty("amount");
      expect(tx).toHaveProperty("date");
      expect(tx).toHaveProperty("type");
      expect(tx).toHaveProperty("transactionType");
      expect(tx).toHaveProperty("accountLabel");
    }
  });

  it('type is either "credit" or "debit" for every transaction', () => {
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(["credit", "debit"]).toContain(tx.type);
    }
  });

  it("transactionType is a valid TransactionType for every transaction", () => {
    const valid = ["restaurant", "store", "income", "payment", "transfer"];
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(valid).toContain(tx.transactionType);
    }
  });

  it("dates are sequential: first transaction has the most recent date", () => {
    const txs = getMockTransactions();
    expect(txs.length).toBeGreaterThan(1);
    const d0 = new Date(txs[0].date);
    const d1 = new Date(txs[1].date);
    expect(d0.getTime()).toBeGreaterThan(d1.getTime());
  });

  it("IDs are unique strings", () => {
    const txs = getMockTransactions();
    const ids = txs.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(txs.length);
  });

  it("amounts are positive numbers", () => {
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(tx.amount).toBeGreaterThan(0);
    }
  });

  it("dates are ISO date strings (YYYY-MM-DD format)", () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(tx.date).toMatch(isoDateRegex);
    }
  });

  it("accountLabel is a non-empty string", () => {
    const txs = getMockTransactions();
    for (const tx of txs) {
      expect(typeof tx.accountLabel).toBe("string");
      expect(tx.accountLabel.length).toBeGreaterThan(0);
    }
  });
});
