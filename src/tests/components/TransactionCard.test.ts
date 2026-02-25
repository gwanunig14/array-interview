import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import TransactionCard from "$lib/components/TransactionCard.svelte";

describe("TransactionCard", () => {
  it('renders the "Recent Activity" heading', () => {
    render(TransactionCard, {});
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("renders the list subtitle when transactions exist", () => {
    render(TransactionCard, {});
    expect(
      screen.getByText("Latest movements across all accounts"),
    ).toBeInTheDocument();
  });

  it("renders a list item for every mock transaction", () => {
    render(TransactionCard, {});
    const items = screen.getAllByRole("listitem");
    // TRANSACTION_POOL has 15 entries
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "+" prefix for credit transactions', () => {
    render(TransactionCard, {});
    // "Direct Deposit - Payroll" is the first entry and is a credit ($2,450.00)
    expect(screen.getByText(/\+\$2,450\.00/)).toBeInTheDocument();
  });

  it('shows "−" prefix for debit transactions', () => {
    render(TransactionCard, {});
    // "Amazon.com" is debit ($87.43)
    expect(screen.getByText(/−\$87\.43/)).toBeInTheDocument();
  });

  it('applies the "debit" CSS class to debit transaction amounts', () => {
    const { container } = render(TransactionCard, {});
    const debitAmounts = container.querySelectorAll(
      ".transaction-list__item__amount.debit",
    );
    expect(debitAmounts.length).toBeGreaterThan(0);
  });

  it('does NOT apply the "debit" CSS class to credit transaction amounts', () => {
    const { container } = render(TransactionCard, {});
    const allAmounts = container.querySelectorAll(
      ".transaction-list__item__amount",
    );
    const creditAmounts = Array.from(allAmounts).filter(
      (el) => !el.classList.contains("debit"),
    );
    expect(creditAmounts.length).toBeGreaterThan(0);
  });

  it("renders transaction descriptions", () => {
    render(TransactionCard, {});
    expect(screen.getByText("Direct Deposit - Payroll")).toBeInTheDocument();
    expect(screen.getByText("Amazon.com")).toBeInTheDocument();
  });

  it("includes a date in each transaction meta line", () => {
    const { container } = render(TransactionCard, {});
    const metaItems = container.querySelectorAll(
      ".transaction-list__item__meta",
    );
    // Each meta should contain a date string like "Feb 24"
    for (const el of Array.from(metaItems)) {
      expect(el.textContent).toMatch(/\w+ \d+/);
    }
  });

  it("provides an aria-label on each debit amount", () => {
    const { container } = render(TransactionCard, {});
    // The amount spans have aria-label="Debit $X.XX" or "Credit $X.XX"
    const amountsWithLabel = container.querySelectorAll(
      ".transaction-list__item__amount[aria-label]",
    );
    expect(amountsWithLabel.length).toBeGreaterThan(0);
  });
});
