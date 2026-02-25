import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import TransferSuccessCard from "$lib/components/TransferView/TransferSuccessCard.svelte";

const defaultProps = {
  amount: 250,
  fromAccountName: "Checking Account...7890",
  toAccountName: "Savings Account...3210",
  transferDate: "February 25",
  confirmationId: "TRF-1234567-ABCDE",
};

describe("TransferSuccessCard – content", () => {
  it('renders the "Transfer Successful" heading', () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("Transfer Successful")).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(TransferSuccessCard, defaultProps);
    expect(
      screen.getByText(/Your transfer has successfully been completed/),
    ).toBeInTheDocument();
  });

  it("renders the formatted transfer amount", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("$250.00")).toBeInTheDocument();
  });

  it("renders the fromAccountName", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("Checking Account...7890")).toBeInTheDocument();
  });

  it("renders the toAccountName", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("Savings Account...3210")).toBeInTheDocument();
  });

  it("renders the transferDate", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("February 25")).toBeInTheDocument();
  });

  it("renders the confirmationId", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("TRF-1234567-ABCDE")).toBeInTheDocument();
  });

  it('renders the "Done" button', () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
  });

  it("shows all five detail rows (Amount, Transfer from, Transfer to, Transfer date, Confirmation)", () => {
    render(TransferSuccessCard, defaultProps);
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Transfer from")).toBeInTheDocument();
    expect(screen.getByText("Transfer to")).toBeInTheDocument();
    expect(screen.getByText("Transfer date")).toBeInTheDocument();
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });
});

describe("TransferSuccessCard – events", () => {
  it('dispatches a "done" event when the Done button is clicked', async () => {
    const { component } = render(TransferSuccessCard, defaultProps);
    const handler = vi.fn();
    component.$on("done", handler);

    await fireEvent.click(screen.getByRole("button", { name: /done/i }));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("TransferSuccessCard – edge cases", () => {
  it("formats a decimal amount correctly", () => {
    render(TransferSuccessCard, { ...defaultProps, amount: 1234.56 });
    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
  });

  it("formats a large amount with comma separators", () => {
    render(TransferSuccessCard, { ...defaultProps, amount: 10000 });
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();
  });
});
