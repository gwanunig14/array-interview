/**
 * TransferView network/malformed-data failure tests.
 *
 * TransferFormCard uses `use:enhance` and `invalidateAll` — both are stubbed so
 * the full view tree mounts cleanly in jsdom without a SvelteKit runtime.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

vi.mock("$app/forms", () => ({
  enhance: () => ({ destroy: () => {} }),
}));

vi.mock("$app/navigation", () => ({
  invalidateAll: vi.fn().mockResolvedValue(undefined),
}));

import TransferView from "$lib/components/TransferView/TransferView.svelte";
import {
  enrichedChecking,
  enrichedSavings,
  enrichedOutbound,
} from "../../fixtures";
import type { EnrichedAccount } from "$lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultProps = {
  accounts: [enrichedChecking, enrichedSavings],
  transfers: [],
};

// ─── Empty API responses ───────────────────────────────────────────────────────

describe("TransferView – empty API responses", () => {
  it("renders without crashing when accounts array is empty", () => {
    render(TransferView, { accounts: [], transfers: [] });
    expect(screen.getByText("Transfer between accounts")).toBeInTheDocument();
  });

  it("shows no-transfers empty state when transfers array is empty", () => {
    render(TransferView, defaultProps);
    expect(screen.getByText("No recent transfers found.")).toBeInTheDocument();
  });

  it("shows transfer summary placeholders when no account is selected", () => {
    render(TransferView, defaultProps);
    // Both From and To columns show "—" placeholder when no account selected
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Malformed account data ────────────────────────────────────────────────────

describe("TransferView – malformed account data", () => {
  const missingBalance = {
    ...enrichedChecking,
    balance: undefined as unknown as number,
  } satisfies EnrichedAccount;

  it("renders without crashing when account balance is missing", () => {
    render(TransferView, {
      accounts: [missingBalance, enrichedSavings],
      transfers: [],
    });
    expect(screen.getByText("Transfer between accounts")).toBeInTheDocument();
  });

  it("does NOT show $NaN in the summary card when balance is missing", () => {
    render(TransferView, {
      accounts: [missingBalance, enrichedSavings],
      transfers: [],
    });
    expect(screen.queryByText(/\$NaN/)).not.toBeInTheDocument();
  });

  it("renders without crashing when account displayName is missing", () => {
    const missingName = {
      ...enrichedChecking,
      displayName: undefined as unknown as string,
    } satisfies EnrichedAccount;
    render(TransferView, {
      accounts: [missingName, enrichedSavings],
      transfers: [],
    });
    expect(screen.getByText("Transfer between accounts")).toBeInTheDocument();
  });
});

// ─── Malformed transfer data ───────────────────────────────────────────────────

describe("TransferView – malformed transfer data", () => {
  it("does NOT show $NaN when transfer amount is missing", () => {
    const missingAmount = {
      ...enrichedOutbound,
      amount: undefined as unknown as number,
    };
    render(TransferView, {
      ...defaultProps,
      transfers: [missingAmount],
    });
    expect(screen.queryByText(/\$NaN/)).not.toBeInTheDocument();
  });

  it("falls back gracefully when transfer initiated_date is missing", () => {
    const missingDate = {
      ...enrichedOutbound,
      initiated_date: undefined as unknown as string,
    };
    render(TransferView, {
      ...defaultProps,
      transfers: [missingDate],
    });
    // formatDate returns "—" for falsy input — ensure no crash and no raw undefined
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    expect(screen.getByText("Recent transfers")).toBeInTheDocument();
  });

  it("falls back gracefully when sourceDisplayName is missing", () => {
    const missingSource = {
      ...enrichedOutbound,
      sourceDisplayName: undefined as unknown as string,
    };
    render(TransferView, {
      ...defaultProps,
      transfers: [missingSource],
    });
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  it("renders the transfers list when data is valid", () => {
    render(TransferView, {
      ...defaultProps,
      transfers: [enrichedOutbound],
    });
    expect(
      screen.getByRole("list", { name: "Recent transfers" }),
    ).toBeInTheDocument();
    expect(screen.getByText("To Savings Account")).toBeInTheDocument();
  });
});
