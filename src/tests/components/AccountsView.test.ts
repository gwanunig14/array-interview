import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import AccountsView from "$lib/components/AccountsView/AccountsView.svelte";
import { enrichedChecking, enrichedSavings } from "../fixtures";

describe("AccountsView – failed API calls", () => {
  it("renders network error message", () => {
    render(AccountsView, {
      accounts: [],
      error: "Failed to fetch",
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("renders 500 Internal Server Error message", () => {
    render(AccountsView, {
      accounts: [],
      error: "Internal Server Error",
    });
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
  });

  it("renders 401 Unauthorized message", () => {
    render(AccountsView, {
      accounts: [],
      error: "Unauthorized: invalid API key",
    });
    expect(
      screen.getByText("Unauthorized: invalid API key"),
    ).toBeInTheDocument();
  });

  it("renders timeout error message", () => {
    render(AccountsView, {
      accounts: [],
      error: "Request timed out",
    });
    expect(screen.getByText("Request timed out")).toBeInTheDocument();
  });

  it("renders fallback message when error has no detail", () => {
    render(AccountsView, {
      accounts: [],
      error: "Failed to load account data.",
    });
    expect(
      screen.getByText("Failed to load account data."),
    ).toBeInTheDocument();
  });
});

describe("AccountsView – loading state", () => {
  it("shows the loading spinner copy when loading=true", () => {
    render(AccountsView, { accounts: [], loading: true });
    expect(screen.getByText("Loading your accounts…")).toBeInTheDocument();
  });

  it('has role="status" with aria-live="polite" while loading', () => {
    const { container } = render(AccountsView, { accounts: [], loading: true });
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("does NOT render the accounts grid while loading", () => {
    const { container } = render(AccountsView, { accounts: [], loading: true });
    expect(container.querySelector(".accounts-grid")).not.toBeInTheDocument();
  });
});

describe("AccountsView – error state", () => {
  it("renders the error panel when an error string is provided", () => {
    render(AccountsView, { accounts: [], error: "API unavailable" });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the error message text", () => {
    render(AccountsView, { accounts: [], error: "Could not load data" });
    expect(screen.getByText("Could not load data")).toBeInTheDocument();
  });

  it("does NOT render accounts when error is present", () => {
    const { container } = render(AccountsView, {
      accounts: [enrichedChecking],
      error: "Something went wrong",
    });
    expect(container.querySelector(".accounts-grid")).not.toBeInTheDocument();
  });
});

describe("AccountsView – malformed account data", () => {
  const malformedAccount = {
    ...enrichedChecking,
    balance: undefined as unknown as number,
  };

  it("shows the unavailable message when balance is missing", () => {
    render(AccountsView, {
      accounts: [malformedAccount],
      loading: false,
      error: null,
    });
    expect(
      screen.getByText(
        "A network error occurred and the total is not currently available. Please try again later.",
      ),
    ).toBeInTheDocument();
  });

  it("does NOT show $NaN when balance is missing", () => {
    render(AccountsView, {
      accounts: [malformedAccount],
      loading: false,
      error: null,
    });
    expect(screen.queryByText(/\$NaN/)).not.toBeInTheDocument();
  });
});

describe("AccountsView – empty accounts", () => {
  it('shows "No accounts found" when accounts array is empty', () => {
    render(AccountsView, { accounts: [], loading: false, error: null });
    expect(screen.getByText("No accounts found")).toBeInTheDocument();
  });

  it("shows the summary banner with $0.00 total when no accounts", () => {
    render(AccountsView, { accounts: [], loading: false, error: null });
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it('shows "Across 0 accounts"', () => {
    render(AccountsView, { accounts: [], loading: false, error: null });
    expect(screen.getByText("Across 0 accounts")).toBeInTheDocument();
  });
});

describe("AccountsView – with accounts", () => {
  it("renders an AccountCard for each account", () => {
    render(AccountsView, {
      accounts: [enrichedChecking, enrichedSavings],
      loading: false,
      error: null,
    });
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
    expect(screen.getByText("Savings Account")).toBeInTheDocument();
  });

  it("renders the sum of all balances as the total", () => {
    // enrichedChecking.balance = 5000, enrichedSavings.balance = 12500.50
    render(AccountsView, {
      accounts: [enrichedChecking, enrichedSavings],
      loading: false,
      error: null,
    });
    expect(screen.getByText("$17,500.50")).toBeInTheDocument();
  });

  it('shows "Across 2 accounts" for two accounts', () => {
    render(AccountsView, {
      accounts: [enrichedChecking, enrichedSavings],
      loading: false,
      error: null,
    });
    expect(screen.getByText("Across 2 accounts")).toBeInTheDocument();
  });

  it('shows "Across 1 accounts" for one account', () => {
    render(AccountsView, {
      accounts: [enrichedChecking],
      loading: false,
      error: null,
    });
    expect(screen.getByText("Across 1 accounts")).toBeInTheDocument();
  });

  it('renders the account list with role="list" and aria-label', () => {
    const { container } = render(AccountsView, {
      accounts: [enrichedChecking],
      loading: false,
      error: null,
    });
    const list = container.querySelector('[aria-label="Account list"]');
    expect(list).toBeInTheDocument();
  });

  it('has the "Total balance" label in the summary banner', () => {
    render(AccountsView, {
      accounts: [enrichedChecking],
      loading: false,
      error: null,
    });
    expect(screen.getByText("Total balance")).toBeInTheDocument();
  });
});
