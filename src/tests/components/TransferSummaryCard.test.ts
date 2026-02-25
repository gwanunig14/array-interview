import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import TransferSummaryCard from "$lib/components/TransferSummaryCard.svelte";
import { enrichedChecking, enrichedSavings } from "../fixtures";

describe("TransferSummaryCard – empty state", () => {
  it('renders the "Transfer summary" heading', () => {
    render(TransferSummaryCard, {
      fromAccount: undefined,
      toAccount: undefined,
      amountNum: NaN,
      newFromBalance: null,
      newToBalance: null,
    });
    expect(screen.getByText("Transfer summary")).toBeInTheDocument();
  });

  it('shows placeholder "From" text when no fromAccount is selected', () => {
    render(TransferSummaryCard, {
      fromAccount: undefined,
      toAccount: undefined,
      amountNum: NaN,
      newFromBalance: null,
      newToBalance: null,
    });
    // The summary-amount paragraph shows just "From" when no account + no valid amount
    const fromLabels = screen.getAllByText("From");
    expect(fromLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows placeholder "To" text when no toAccount is selected', () => {
    render(TransferSummaryCard, {
      fromAccount: undefined,
      toAccount: undefined,
      amountNum: NaN,
      newFromBalance: null,
      newToBalance: null,
    });
    const toLabels = screen.getAllByText("To");
    expect(toLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "-" placeholder when fromAccount is not set', () => {
    render(TransferSummaryCard, {
      fromAccount: undefined,
      toAccount: undefined,
      amountNum: NaN,
      newFromBalance: null,
      newToBalance: null,
    });
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});

describe("TransferSummaryCard – with data", () => {
  it('shows "$X.XX From" when a fromAccount and valid amount are provided', () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("$100.00 From")).toBeInTheDocument();
  });

  it('shows "$X.XX To" when a toAccount and valid amount are provided', () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("$100.00 To")).toBeInTheDocument();
  });

  it("shows the fromAccount displayName", () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
  });

  it("shows the toAccount displayName", () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("Savings Account")).toBeInTheDocument();
  });

  it("shows the new from-balance when newFromBalance is provided", () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("New balance · $4,900.00")).toBeInTheDocument();
  });

  it("shows the new to-balance when newToBalance is provided", () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: 100,
      newFromBalance: 4900,
      newToBalance: 12600.5,
    });
    expect(screen.getByText("New balance · $12,600.50")).toBeInTheDocument();
  });

  it("does NOT show new balances when they are null", () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: enrichedSavings,
      amountNum: NaN,
      newFromBalance: null,
      newToBalance: null,
    });
    expect(screen.queryByText(/New balance/)).not.toBeInTheDocument();
  });

  it('shows "From" (no amount) when amountNum is zero', () => {
    render(TransferSummaryCard, {
      fromAccount: enrichedChecking,
      toAccount: undefined,
      amountNum: 0,
      newFromBalance: null,
      newToBalance: null,
    });
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00 From/)).not.toBeInTheDocument();
  });
});
