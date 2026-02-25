<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";
  import TransferFields from "./TransferFields.svelte";

  export let accounts: EnrichedAccount[];
  export let fromAccountId: string;
  export let toAccountId: string;
  export let amount: string;

  let submitting = false;
  let validationError = "";
  let serverError = "";
  let successMessage = "";
  let successTransferId = "";

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
    serverError = "";
    successMessage = "";
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async ({ result }: { result: any }) => {
      submitting = false;
      if (result.type === "success" && result.data?.success) {
        const transferredAmount = parseFloat(amount);
        successMessage = `${formatCurrency(transferredAmount)} successfully transferred.`;
        successTransferId = result.data.transferId ?? "";
        fromAccountId = "";
        toAccountId = "";
        amount = "";
        await invalidateAll();
      } else if (result.type === "failure") {
        serverError =
          result.data?.error ?? "Transfer failed. Please try again.";
      }
    };
  }
</script>

<section aria-labelledby="transfer-form-heading">
  <h2 id="transfer-form-heading" class="section-heading">
    Transfer between accounts
  </h2>
  <p class="section-subtitle">Move money instantly between your accounts.</p>

  {#if successMessage}
    <div class="alert alert--success" role="alert" aria-live="polite">
      <p class="alert__title">Transfer Submitted</p>
      <p>{successMessage}</p>
      {#if successTransferId}
        <p class="alert__ref">Reference: <code>{successTransferId}</code></p>
      {/if}
    </div>
  {/if}

  {#if serverError}
    <div class="alert alert--error" role="alert" aria-live="assertive">
      <p class="alert__title">Transfer Failed</p>
      <p>{serverError}</p>
    </div>
  {/if}

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
        <div id="form-error" class="alert alert--error" role="alert">
          {validationError}
        </div>
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

  /* ── Alerts ────────────────────────────────────────────────────────────── */
  .alert {
    border-radius: var(--radius-lg);
    padding: var(--s-4) var(--s-5);
    margin-bottom: var(--s-5);
    font-size: var(--text-sm-fs);
  }

  .alert p {
    margin: 0;
  }

  .alert p + p {
    margin-top: var(--s-1);
  }

  .alert__title {
    font-weight: var(--fw-semi-bold);
    font-size: var(--text-fs);
    margin: 0 0 var(--s-1) !important;
  }

  .alert__ref {
    margin-top: var(--s-2) !important;
    color: inherit;
    opacity: 0.8;
  }

  .alert__ref code {
    font-family: ui-monospace, monospace;
    font-size: var(--text-xs-fs);
  }

  .alert--success {
    background-color: var(--c-green-light);
    color: var(--c-green-dark);
    border: var(--border-size-thin) solid var(--c-green);
  }

  .alert--error {
    background-color: var(--c-red-lighter);
    color: var(--c-red-dark);
    border: var(--border-size-thin) solid var(--c-red-light);
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
    outline: 3px solid var(--c-blue);
    outline-offset: 2px;
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
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.4);
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
