import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import AccountPickerDropdown from "$lib/components/TransferView/TransferFormCard/AccountPickerDropdown.svelte";
import {
  enrichedChecking,
  enrichedSavings,
  enrichedInactive,
} from "../../../fixtures";

const defaultProps = {
  accounts: [enrichedChecking, enrichedSavings, enrichedInactive],
  selectedId: "",
  disabledId: "",
  open: false,
  pickerId: "test-picker",
  label: "Transfer from",
  listboxLabel: "Select source account",
};

describe("AccountPickerDropdown – initial render", () => {
  it("renders the label text", () => {
    render(AccountPickerDropdown, defaultProps);
    expect(screen.getByText("Transfer from")).toBeInTheDocument();
  });

  it('shows "Choose account" placeholder when nothing is selected', () => {
    render(AccountPickerDropdown, defaultProps);
    expect(screen.getByText("Choose account")).toBeInTheDocument();
  });

  it("does NOT render the dropdown list when open=false", () => {
    const { container } = render(AccountPickerDropdown, defaultProps);
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });

  it('sets aria-expanded="false" on the trigger when closed', () => {
    const { container } = render(AccountPickerDropdown, defaultProps);
    const trigger = container.querySelector('[role="button"]');
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("AccountPickerDropdown – open state", () => {
  it("renders the listbox when open=true", () => {
    render(AccountPickerDropdown, { ...defaultProps, open: true });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it('sets aria-expanded="true" on the trigger when open', () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      open: true,
    });
    const trigger = container.querySelector('[role="button"]');
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders an option for each account in the list", () => {
    render(AccountPickerDropdown, { ...defaultProps, open: true });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("shows each account displayName in the options", () => {
    render(AccountPickerDropdown, { ...defaultProps, open: true });
    expect(screen.getByText("Checking Account")).toBeInTheDocument();
    expect(screen.getByText("Savings Account")).toBeInTheDocument();
  });

  it("shows the formatted balance next to each option", () => {
    render(AccountPickerDropdown, { ...defaultProps, open: true });
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("$12,500.50")).toBeInTheDocument();
  });
});

describe("AccountPickerDropdown – selection", () => {
  it("shows the selected account name and balance in the trigger", () => {
    render(AccountPickerDropdown, { ...defaultProps, selectedId: "acct-001" });
    // format: "Checking Account...7890"
    expect(screen.getByText(/Checking Account\.\.\.7890/)).toBeInTheDocument();
    expect(screen.getByText(/\$5,000\.00 available/)).toBeInTheDocument();
  });

  it('marks the selected option with aria-selected="true"', () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      selectedId: "acct-001",
      open: true,
    });
    const options = container.querySelectorAll('[role="option"]');
    const selected = Array.from(options).find(
      (el) => el.getAttribute("aria-selected") === "true",
    );
    expect(selected).not.toBeUndefined();
  });

  it("applies picker-option--selected class to the selected option", () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      selectedId: "acct-001",
      open: true,
    });
    const selectedOption = container.querySelector(".picker-option--selected");
    expect(selectedOption).toBeInTheDocument();
  });
});

describe("AccountPickerDropdown – disabled options", () => {
  it("applies picker-option--disabled class to the disabled account", () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      disabledId: "acct-002",
      open: true,
    });
    const disabledOptions = container.querySelectorAll(
      ".picker-option--disabled",
    );
    expect(disabledOptions.length).toBeGreaterThan(0);
  });

  it('marks the disabled option with tabindex="-1"', () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      disabledId: "acct-002",
      open: true,
    });
    // The disabled option for acct-002 should have tabindex=-1
    const options = container.querySelectorAll('[role="option"]');
    const disabledOption = Array.from(options).find(
      (el) => el.getAttribute("tabindex") === "-1",
    );
    expect(disabledOption).not.toBeUndefined();
  });

  it("applies picker-option--disabled class to inactive accounts (regardless of disabledId)", () => {
    // enrichedInactive has account_status = 'CLOSED', so it should be disabled
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      disabledId: "",
      open: true,
    });
    const disabledOptions = container.querySelectorAll(
      ".picker-option--disabled",
    );
    expect(disabledOptions.length).toBeGreaterThan(0);
  });
});

describe("AccountPickerDropdown – interaction", () => {
  it('dispatches a "toggle" event and opens the dropdown when the trigger is clicked', async () => {
    const { component, container } = render(
      AccountPickerDropdown,
      defaultProps,
    );
    const handler = vi.fn();
    component.$on("toggle", handler);

    const trigger = container.querySelector('[role="button"]');
    await fireEvent.click(trigger!);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("toggles open state on trigger click (opens from closed)", async () => {
    const { container } = render(AccountPickerDropdown, defaultProps);
    const trigger = container.querySelector('[role="button"]');

    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    await fireEvent.click(trigger!);
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
  });

  it("selects an account and closes the dropdown when an option is clicked", async () => {
    const { container } = render(AccountPickerDropdown, {
      ...defaultProps,
      open: true,
    });

    const options = container.querySelectorAll('[role="option"]');
    const firstEnabledOption = Array.from(options).find(
      (el) => !el.classList.contains("picker-option--disabled"),
    );
    await fireEvent.click(firstEnabledOption!);

    // After selection the dropdown should close
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });
});
