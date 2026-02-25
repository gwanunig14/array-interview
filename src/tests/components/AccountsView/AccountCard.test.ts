import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import AccountCard from "$lib/components/AccountsView/AccountCard.svelte";
import {
  enrichedChecking,
  enrichedSavings,
  enrichedInactive,
} from "../../fixtures";
import type { EnrichedAccount } from "$lib/types";

describe("AccountCard – content", () => {
  it("renders the account displayName as a heading", () => {
    render(AccountCard, { account: enrichedChecking });
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
  });

  it("renders the formatted balance", () => {
    render(AccountCard, { account: enrichedChecking });
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
  });

  it("renders the account type in title case", () => {
    const { container } = render(AccountCard, { account: enrichedChecking });
    const typeSpan = container.querySelector(".account-type");
    expect(typeSpan?.textContent?.trim()).toBe("Checking");
  });

  it('shows "Available" for an ACTIVE account', () => {
    render(AccountCard, { account: enrichedChecking });
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it('shows "Unavailable" for a non-ACTIVE account', () => {
    render(AccountCard, { account: enrichedInactive });
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  it("renders the displayName in the article aria-label", () => {
    const { container } = render(AccountCard, { account: enrichedChecking });
    const article = container.querySelector("article");
    expect(article).toHaveAttribute("aria-label", "Checking Account");
  });

  it("shows the last 4 digits of the account number", () => {
    const { container } = render(AccountCard, { account: enrichedChecking });
    // The masked span has the full masked text; sr-only has just the last 4
    expect(container.textContent).toContain("7890");
  });
});

describe("AccountCard – state classes", () => {
  it("does NOT apply the inactive class for an ACTIVE account", () => {
    const { container } = render(AccountCard, { account: enrichedChecking });
    expect(container.querySelector("article.inactive")).not.toBeInTheDocument();
  });

  it("applies the inactive class for a non-ACTIVE account", () => {
    const { container } = render(AccountCard, { account: enrichedInactive });
    expect(container.querySelector("article.inactive")).toBeInTheDocument();
  });

  it("does NOT apply the negative-balance class for a positive balance", () => {
    const { container } = render(AccountCard, { account: enrichedChecking });
    expect(
      container.querySelector(".account-card__balance-negative"),
    ).not.toBeInTheDocument();
  });

  it("applies the negative-balance class when balance is below zero", () => {
    const negativeAccount: EnrichedAccount = {
      ...enrichedChecking,
      balance: -100,
    };
    const { container } = render(AccountCard, { account: negativeAccount });
    expect(
      container.querySelector(".account-card__balance-negative"),
    ).toBeInTheDocument();
  });

  it('does NOT apply inactive class when account_status is lowercase "active"', () => {
    const account: EnrichedAccount = {
      ...enrichedChecking,
      account_status: "active",
    };
    const { container } = render(AccountCard, { account });
    expect(container.querySelector("article.inactive")).not.toBeInTheDocument();
  });
});

describe("AccountCard – currency formatting", () => {
  it("formats a savings balance with cents", () => {
    render(AccountCard, { account: enrichedSavings });
    expect(screen.getByText("$12,500.50")).toBeInTheDocument();
  });

  it("formats a zero balance", () => {
    const zeroAccount: EnrichedAccount = { ...enrichedChecking, balance: 0 };
    render(AccountCard, { account: zeroAccount });
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });
});
