/**
 * TransferFormCard tests.
 *
 * The component uses `use:enhance` from `$app/forms` (a SvelteKit form enhancement
 * action) and `invalidateAll` from `$app/navigation`. Both are stubbed here so
 * the component mounts cleanly in jsdom without a SvelteKit runtime.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

vi.mock("$app/forms", () => ({
  enhance: () => ({ destroy: () => {} }),
}));

vi.mock("$app/navigation", () => ({
  invalidateAll: vi.fn().mockResolvedValue(undefined),
}));

import TransferFormCard from "$lib/components/TransferView/TransferFormCard/TransferFormCard.svelte";
import { enrichedChecking, enrichedSavings } from "../../../fixtures";

const defaultProps = {
  accounts: [enrichedChecking, enrichedSavings],
  fromAccountId: "",
  toAccountId: "",
  amount: "",
};

describe("TransferFormCard – structure", () => {
  it("renders the section heading", () => {
    render(TransferFormCard, defaultProps);
    expect(screen.getByText("Transfer between accounts")).toBeInTheDocument();
  });

  it("renders the subtitle copy", () => {
    render(TransferFormCard, defaultProps);
    expect(
      screen.getByText("Move money instantly between your accounts."),
    ).toBeInTheDocument();
  });

  it("renders the disclaimer text", () => {
    render(TransferFormCard, defaultProps);
    expect(screen.getByText(/By continuing, I authorize/)).toBeInTheDocument();
  });

  it('renders the "Complete transfer" submit button', () => {
    render(TransferFormCard, defaultProps);
    expect(
      screen.getByRole("button", { name: /complete transfer/i }),
    ).toBeInTheDocument();
  });

  it("renders the form with aria-label", () => {
    const { container } = render(TransferFormCard, defaultProps);
    const form = container.querySelector(
      'form[aria-label="Balance transfer form"]',
    );
    expect(form).toBeInTheDocument();
  });

  it("renders the form with novalidate attribute (client-side validation)", () => {
    const { container } = render(TransferFormCard, defaultProps);
    expect(container.querySelector("form")).toHaveAttribute("novalidate");
  });
});

describe("TransferFormCard – button disabled state", () => {
  it("is disabled when all fields are empty", () => {
    render(TransferFormCard, defaultProps);
    const btn = screen.getByRole("button", { name: /complete transfer/i });
    expect(btn).toBeDisabled();
  });

  it("is disabled when balance is exceeded", () => {
    render(TransferFormCard, {
      accounts: [enrichedChecking, enrichedSavings],
      fromAccountId: "acct-001", // balance = 5000
      toAccountId: "acct-002",
      amount: "99999",
    });
    const btn = screen.getByRole("button", { name: /complete transfer/i });
    expect(btn).toBeDisabled();
  });

  it("is enabled when valid accounts are selected and amount is within balance", () => {
    render(TransferFormCard, {
      accounts: [enrichedChecking, enrichedSavings],
      fromAccountId: "acct-001",
      toAccountId: "acct-002",
      amount: "100",
    });
    const btn = screen.getByRole("button", { name: /complete transfer/i });
    expect(btn).not.toBeDisabled();
  });
});

describe("TransferFormCard – validation error display", () => {
  it("does NOT show a FormAlert on initial render", () => {
    const { container } = render(TransferFormCard, defaultProps);
    // The FormAlert is only shown after a failed submit attempt
    expect(container.querySelector(".alert--error")).not.toBeInTheDocument();
  });
});

describe("TransferFormCard – field rendering", () => {
  it('renders the "Transfer from" picker label', () => {
    render(TransferFormCard, defaultProps);
    expect(screen.getByText("Transfer from")).toBeInTheDocument();
  });

  it('renders the "Transfer to" picker label', () => {
    render(TransferFormCard, defaultProps);
    expect(screen.getByText("Transfer to")).toBeInTheDocument();
  });

  it("renders the amount input", () => {
    render(TransferFormCard, defaultProps);
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
  });
});
