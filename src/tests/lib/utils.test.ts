import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  formatAccountType,
} from "$lib/utils";

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats a positive integer in USD", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("formats a decimal amount in USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a negative amount", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });

  it("formats a small fractional amount", () => {
    expect(formatCurrency(0.01)).toBe("$0.01");
  });

  it("formats a EUR amount with the correct symbol", () => {
    const result = formatCurrency(100, "EUR");
    // Node Intl in en-US locale renders EUR as "€100.00"
    expect(result).toMatch(/€/);
    expect(result).toContain("100.00");
  });

  it("formats a large amount with comma separators", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it('formats a bare date string as "Mon D"', () => {
    // appends T00:00:00 locally, so always stays on the same calendar date
    expect(formatDate("2026-02-03")).toBe("Feb 3");
  });

  it("formats a full ISO timestamp", () => {
    // mid-day UTC stays Feb 15 in any timezone
    expect(formatDate("2026-02-15T12:00:00Z")).toBe("Feb 15");
  });

  it("formats the first of a month", () => {
    expect(formatDate("2026-01-01")).toBe("Jan 1");
  });

  it("formats the last day of a month", () => {
    expect(formatDate("2026-12-31")).toBe("Dec 31");
  });

  it("returns an em-dash for an empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("returns an em-dash for a falsy value", () => {
    // cast to string to simulate runtime bad data coming from API
    expect(formatDate(undefined as unknown as string)).toBe("—");
  });
});

// ─── formatDateLong ───────────────────────────────────────────────────────────

describe("formatDateLong", () => {
  // Use mid-day UTC timestamps so the result is the same day in all timezones.
  it('formats a date string as "Mon D, YYYY"', () => {
    expect(formatDateLong("2026-02-15T12:00:00Z")).toBe("Feb 15, 2026");
  });

  it("includes the full year", () => {
    expect(formatDateLong("2000-07-15T12:00:00Z")).toBe("Jul 15, 2000");
  });

  it("returns an em-dash for an empty string", () => {
    expect(formatDateLong("")).toBe("—");
  });
});

// ─── formatAccountType ────────────────────────────────────────────────────────

describe("formatAccountType", () => {
  it("title-cases a single-word type", () => {
    expect(formatAccountType("CHECKING")).toBe("Checking");
  });

  it("title-cases a single-word savings type", () => {
    expect(formatAccountType("SAVINGS")).toBe("Savings");
  });

  it("title-cases each word in a multi-word type", () => {
    expect(formatAccountType("MONEY_MARKET")).toBe("Money Market");
  });

  it("title-cases each word in a compound business type", () => {
    expect(formatAccountType("BUSINESS_CHECKING")).toBe("Business Checking");
  });

  it("preserves CD as an acronym", () => {
    expect(formatAccountType("CD")).toBe("CD");
  });

  it("preserves IRA as an acronym", () => {
    expect(formatAccountType("IRA")).toBe("IRA");
  });

  it("preserves HSA as an acronym", () => {
    expect(formatAccountType("HSA")).toBe("HSA");
  });

  it("handles lowercase input", () => {
    expect(formatAccountType("checking")).toBe("Checking");
  });

  it("handles mixed-case input", () => {
    expect(formatAccountType("sAvInGs")).toBe("Savings");
  });
});
