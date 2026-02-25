<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import type { ActionResult } from "@sveltejs/kit";
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";
  import TransferFields from "./TransferFields.svelte";
  import FormAlert from "./FormAlert.svelte";

  const dispatch = createEventDispatcher<{
    success: {
      amount: number;
      fromName: string;
      toName: string;
      date: string;
      confirmationId: string;
    };
    failure: { message: string };
  }>();

  export let accounts: EnrichedAccount[];
  export let fromAccountId: string;
  export let toAccountId: string;
  export let amount: string;

  let submitting = false;
  let validationError = "";

  $: fromAccount = accounts.find((a) => a.account_id === fromAccountId);
  $: toAccount = accounts.find((a) => a.account_id === toAccountId);

  $: amountNum = parseFloat(amount);
  $: exceedsBalance =
    fromAccount &&
    !isNaN(amountNum) &&
    amountNum > 0 &&
    amountNum > fromAccount.balance;

  function isActive(account: EnrichedAccount): boolean {
    return account.account_status.toUpperCase() === "ACTIVE";
  }

  function validateForm(): string | null {
    if (!fromAccountId) return "Please select a source account.";
    if (!toAccountId) return "Please select a destination account.";
    if (fromAccountId === toAccountId)
      return "Source and destination accounts must be different.";
    if (!fromAccount || !isActive(fromAccount))
      return "Source account must be active.";
    if (!toAccount || !isActive(toAccount))
      return "Destination account must be active.";
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0)
      return "Please enter a valid amount greater than zero.";
    if (fromAccount && amt > fromAccount.balance)
      return `Amount exceeds available balance of ${formatCurrency(fromAccount.balance)}.`;
    return null;
  }

  function handleSubmit({
    formData,
    cancel,
  }: {
    formData: FormData;
    cancel: () => void;
  }) {
    const err = validateForm();
    if (err) {
      validationError = err;
      cancel();
      return;
    }
    validationError = "";
    submitting = true;

    if (fromAccount) {
      formData.set("fromAccountNumber", fromAccount.account_number);
      formData.set("fromRoutingNumber", fromAccount.routing_number);
      formData.set("fromAccountHolder", fromAccount.account_holder_name);
    }
    if (toAccount) {
      formData.set("toAccountNumber", toAccount.account_number);
      formData.set("toRoutingNumber", toAccount.routing_number);
      formData.set("toAccountHolder", toAccount.account_holder_name);
    }

    return async ({ result }: { result: ActionResult }) => {
      submitting = false;
      if (result.type === "success" && result.data?.success) {
        const snapAmount = parseFloat(amount);
        const snapFromName = fromAccount
          ? `${fromAccount.displayName}...${fromAccount.account_number.slice(-4)}`
          : "";
        const snapToName = toAccount
          ? `${toAccount.displayName}...${toAccount.account_number.slice(-4)}`
          : "";
        const snapDate = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
        }).format(new Date());
        fromAccountId = "";
        toAccountId = "";
        amount = "";
        await invalidateAll();
        dispatch("success", {
          amount: snapAmount,
          fromName: snapFromName,
          toName: snapToName,
          date: snapDate,
          confirmationId: result.data.transferId ?? "",
        });
      } else if (result.type === "failure") {
        dispatch("failure", {
          message: result.data?.error ?? "Transfer failed. Please try again.",
        });
      }
    };
  }
</script>

<section aria-labelledby="transfer-form-heading">
  <h2 id="transfer-form-heading" class="section-heading">
    Transfer between accounts
  </h2>
  <p class="section-subtitle">Move money instantly between your accounts.</p>

  <form
    method="POST"
    action="?/transfer"
    use:enhance={handleSubmit}
    novalidate
    aria-label="Balance transfer form"
  >
    <input type="hidden" name="fromAccountId" value={fromAccountId} />
    <input type="hidden" name="toAccountId" value={toAccountId} />

    <div class="form-card">
      <TransferFields
        {accounts}
        bind:fromAccountId
        bind:toAccountId
        bind:amount
      />

      {#if validationError}
        <FormAlert id="form-error" variant="error" message={validationError} />
      {/if}

      <p class="disclaimer">
        By continuing, I authorize Northwind Bank to transfer money as indicated
      </p>

      <button
        type="submit"
        class="btn btn--primary btn--full"
        disabled={submitting ||
          !!exceedsBalance ||
          (fromAccountId === "" && toAccountId === "" && amount === "")}
        aria-busy={submitting}
      >
        {#if submitting}
          <span class="btn-spinner" aria-hidden="true"></span>
          Processing…
        {:else}
          Complete transfer
        {/if}
      </button>
    </div>
  </form>
</section>

<style>
  .section-heading {
    font-size: var(--title-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darker);
    margin-bottom: var(--s-2);
  }

  .section-subtitle {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-base);
    color: var(--c-gray-darker);
    margin-bottom: var(--s-6);
  }

  /* ── Form card ─────────────────────────────────────────────────────────── */
  .form-card {
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    padding: var(--s-6);
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
    background: var(--c-white);
  }

  /* ── Disclaimer & submit ───────────────────────────────────────────────── */
  .disclaimer {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    text-align: center;
    margin: var(--s-2) 0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    padding: 0 var(--s-6);
    height: var(--s-12);
    border-radius: var(--input-radius);
    font-family: "Heebo", sans-serif;
    font-size: var(--text-fs);
    font-weight: var(--fw-semi-bold);
    cursor: pointer;
    border: none;
    transition:
      background-color 0.15s ease,
      opacity 0.15s ease;
  }

  .btn:focus-visible {
    outline: var(--focus-border-size) solid var(--focus-border-ci);
    outline-offset: var(--focus-outline-offset);
  }

  .btn--primary {
    background-color: var(--c-blue);
    color: var(--c-white);
  }

  .btn--primary:hover:not(:disabled) {
    background-color: var(--c-blue-dark);
  }

  .btn--primary:disabled {
    background-color: var(--c-gray-dark);
    cursor: not-allowed;
  }

  .btn--full {
    width: 100%;
  }

  .btn-spinner {
    display: inline-block;
    width: var(--spinner-sm);
    height: var(--spinner-sm);
    border: var(--border-size) solid rgba(255, 255, 255, 0.4);
    border-top-color: var(--c-white);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
