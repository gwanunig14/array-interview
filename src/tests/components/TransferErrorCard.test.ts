import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import TransferErrorCard from "$lib/components/TransferErrorCard.svelte";

describe("TransferErrorCard – content", () => {
  it('renders the "Transfer Failed" heading', () => {
    render(TransferErrorCard, {});
    expect(screen.getByText("Transfer Failed")).toBeInTheDocument();
  });

  it("renders the default message when no message prop is given", () => {
    render(TransferErrorCard, {});
    expect(
      screen.getByText(/transaction limit for your account has been exceeded/i),
    ).toBeInTheDocument();
  });

  it("renders a custom message when provided", () => {
    render(TransferErrorCard, { message: "The account is closed." });
    expect(screen.getByText("The account is closed.")).toBeInTheDocument();
  });

  it("does NOT render the default message when a custom message is given", () => {
    render(TransferErrorCard, { message: "Custom error" });
    expect(screen.queryByText(/transaction limit/i)).not.toBeInTheDocument();
  });

  it('renders the "Back to transfers" button', () => {
    render(TransferErrorCard, {});
    expect(
      screen.getByRole("button", { name: /back to transfers/i }),
    ).toBeInTheDocument();
  });
});

describe("TransferErrorCard – events", () => {
  it('dispatches a "back" event when the button is clicked', async () => {
    const { component } = render(TransferErrorCard, {});
    const handler = vi.fn();
    component.$on("back", handler);

    await fireEvent.click(
      screen.getByRole("button", { name: /back to transfers/i }),
    );

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
