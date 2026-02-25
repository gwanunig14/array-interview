import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import RecentTransfersCard from "$lib/components/TransferView/RecentTransfersCard.svelte";
import { enrichedOutbound, enrichedInbound } from "../../fixtures";

describe("RecentTransfersCard – empty state", () => {
  it('renders the "Recent transfers" heading', () => {
    render(RecentTransfersCard, { transfers: [] });
    expect(screen.getByText("Recent transfers")).toBeInTheDocument();
  });

  it('shows "No recent transfers found." when the list is empty', () => {
    render(RecentTransfersCard, { transfers: [] });
    expect(screen.getByText("No recent transfers found.")).toBeInTheDocument();
  });

  it("does NOT render the transfer list when empty", () => {
    const { container } = render(RecentTransfersCard, { transfers: [] });
    expect(container.querySelector(".transfer-list")).not.toBeInTheDocument();
  });
});

describe("RecentTransfersCard – with transfers", () => {
  it("renders a list item for each transfer", () => {
    render(RecentTransfersCard, {
      transfers: [enrichedOutbound, enrichedInbound],
    });
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("shows destination display name in the transfer title", () => {
    render(RecentTransfersCard, { transfers: [enrichedOutbound] });
    expect(screen.getByText("To Savings Account")).toBeInTheDocument();
  });

  it("shows source display name in the meta line", () => {
    render(RecentTransfersCard, { transfers: [enrichedOutbound] });
    expect(screen.getByText(/From Checking Account/)).toBeInTheDocument();
  });

  it("formats the transfer amount in USD", () => {
    render(RecentTransfersCard, { transfers: [enrichedOutbound] });
    expect(screen.getByText("-$250.00")).toBeInTheDocument();
  });

  it("shows a negative amount with transfer-amount--negative class for OUTBOUND", () => {
    const { container } = render(RecentTransfersCard, {
      transfers: [enrichedOutbound],
    });
    const amountEl = container.querySelector(".transfer-amount");
    expect(amountEl).toHaveClass("transfer-amount--negative");
    expect(amountEl).not.toHaveClass("transfer-amount--positive");
  });

  it("shows a positive amount prefix (+) for INBOUND", () => {
    render(RecentTransfersCard, { transfers: [enrichedInbound] });
    expect(screen.getByText("+$500.00")).toBeInTheDocument();
  });

  it("applies transfer-amount--positive class for INBOUND", () => {
    const { container } = render(RecentTransfersCard, {
      transfers: [enrichedInbound],
    });
    const amountEl = container.querySelector(".transfer-amount");
    expect(amountEl).toHaveClass("transfer-amount--positive");
    expect(amountEl).not.toHaveClass("transfer-amount--negative");
  });

  it('formats the initiated_date in "Mon D" format', () => {
    render(RecentTransfersCard, { transfers: [enrichedOutbound] });
    // enrichedOutbound.initiated_date = '2026-02-15T12:00:00Z' → "Feb 15"
    expect(screen.getByText(/Feb 15/)).toBeInTheDocument();
  });

  it('renders a transfer list with role="list" aria-label', () => {
    const { container } = render(RecentTransfersCard, {
      transfers: [enrichedOutbound],
    });
    const list = container.querySelector('[aria-label="Recent transfers"]');
    expect(list).toBeInTheDocument();
  });

  it("handles direction in mixed case (outbound lowercase)", () => {
    const transfer = { ...enrichedOutbound, direction: "outbound" };
    const { container } = render(RecentTransfersCard, {
      transfers: [transfer],
    });
    const amountEl = container.querySelector(".transfer-amount");
    expect(amountEl).toHaveClass("transfer-amount--negative");
  });
});
