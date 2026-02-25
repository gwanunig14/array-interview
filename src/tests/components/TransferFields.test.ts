import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import TransferFields from "$lib/components/TransferFields.svelte";
import { enrichedChecking, enrichedSavings } from "../fixtures";
import type { EnrichedAccount } from "$lib/types";

const accounts = [enrichedChecking, enrichedSavings];

describe("TransferFields – labels", () => {
  it('renders the "Transfer from" label', () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    expect(screen.getByText("Transfer from")).toBeInTheDocument();
  });

  it('renders the "Transfer to" label', () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    expect(screen.getByText("Transfer to")).toBeInTheDocument();
  });

  it('renders the "Transfer amount" label', () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    expect(screen.getByText("Transfer amount")).toBeInTheDocument();
  });

  it('renders the amount input with placeholder "0.00"', () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
  });

  it('renders the "$" prefix indicator', () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    expect(container.querySelector(".input-prefix")).toHaveTextContent("$");
  });
});

describe("TransferFields – balance validation", () => {
  it("does NOT show an error when amount is within balance", () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "acct-001", // balance = 5000
      toAccountId: "acct-002",
      amount: "100",
    });
    expect(
      screen.queryByText(/Amount exceeds available balance/),
    ).not.toBeInTheDocument();
  });

  it("shows an error when amount exceeds the from-account balance", () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "acct-001", // balance = 5000
      toAccountId: "acct-002",
      amount: "9999",
    });
    expect(
      screen.getByText(/Amount exceeds available balance/),
    ).toBeInTheDocument();
  });

  it("applies amount-input--error class when amount exceeds balance", () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "9999",
    });
    expect(container.querySelector(".amount-input--error")).toBeInTheDocument();
  });

  it("does NOT apply amount-input--error class when amount is within balance", () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "100",
    });
    expect(
      container.querySelector(".amount-input--error"),
    ).not.toBeInTheDocument();
  });

  it("shows the exact available balance in the error message", () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "acct-001", // balance = $5,000.00
      toAccountId: "acct-002",
      amount: "9999",
    });
    // The error paragraph specifically includes the word "exceeds" so we can
    // distinguish it from the picker balance that also shows "$5,000.00".
    const errorEl = screen.getByRole("alert");
    expect(errorEl.textContent).toMatch(/\$5,000\.00/);
  });

  it("does NOT show error when no fromAccount is selected yet", () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "9999",
    });
    expect(
      screen.queryByText(/Amount exceeds available balance/),
    ).not.toBeInTheDocument();
  });

  it("does NOT show error when the amount is exactly equal to the balance", () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "5000",
    });
    expect(
      screen.queryByText(/Amount exceeds available balance/),
    ).not.toBeInTheDocument();
  });

  it("links the error message to the input via aria-describedby when exceeds balance", () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "9999",
    });
    const input = container.querySelector("#transfer-amount");
    expect(input).toHaveAttribute("aria-describedby", "amount-error");
  });

  it('the amount error element has role="alert"', () => {
    render(TransferFields, {
      accounts,
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "9999",
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("TransferFields – amount input attributes", () => {
  it('uses inputmode="decimal" on the amount input', () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    const input = container.querySelector("#transfer-amount");
    expect(input).toHaveAttribute("inputmode", "decimal");
  });

  it("marks the amount input as required", () => {
    const { container } = render(TransferFields, {
      accounts,
      fromAccountId: "",
      toAccountId: "",
      amount: "",
    });
    const input = container.querySelector("#transfer-amount");
    expect(input).toHaveAttribute("required");
  });
});
