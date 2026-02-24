<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { EnrichedAccount, TransferSummary } from "$lib/types";
  import { formatCurrency, formatDateLong as formatDate } from "$lib/utils";

  export let accounts: EnrichedAccount[];
  export let transfers: TransferSummary[];

  let fromAccountId = "";
  let toAccountId = "";
  let amount = "";
  let description = "";

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

    // Inject account details required by the server action
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
        description = "";
        await invalidateAll();
      } else if (result.type === "failure") {
        serverError =
          result.data?.error ?? "Transfer failed. Please try again.";
      }
    };
  }

  function transferStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "status--completed";
      case "PENDING":
      case "PROCESSING":
        return "status--pending";
      case "FAILED":
      case "CANCELLED":
        return "status--failed";
      default:
        return "";
    }
  }
</script>

<div class="transfer-layout">
  <!-- Transfer Form -->
  <section aria-labelledby="transfer-form-heading">
    <h2 id="transfer-form-heading" class="section-heading">Balance Transfer</h2>

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
      <div class="form-grid">
        <!-- From Account -->
        <div class="form-field">
          <label for="from-account" class="form-label">
            From Account <span class="required" aria-hidden="true">*</span>
          </label>
          <select
            id="from-account"
            name="fromAccountId"
            class="form-select"
            bind:value={fromAccountId}
            required
            aria-required="true"
            aria-describedby={validationError ? "form-error" : undefined}
          >
            <option value="" disabled>Select source account</option>
            {#each accounts as account (account.account_id)}
              <option
                value={account.account_id}
                disabled={!isActive(account)}
                aria-label="{account.displayName} — {formatCurrency(
                  account.balance,
                )}{!isActive(account) ? ' (Inactive)' : ''}"
              >
                {account.displayName}
                {!isActive(account) ? "(Inactive)" : ""}
                — {formatCurrency(account.balance)}
              </option>
            {/each}
          </select>
          {#if fromAccount}
            <p class="form-hint">
              Available: <strong>{formatCurrency(fromAccount.balance)}</strong>
            </p>
          {/if}
        </div>

        <!-- To Account -->
        <div class="form-field">
          <label for="to-account" class="form-label">
            To Account <span class="required" aria-hidden="true">*</span>
          </label>
          <select
            id="to-account"
            name="toAccountId"
            class="form-select"
            bind:value={toAccountId}
            required
            aria-required="true"
          >
            <option value="" disabled>Select destination account</option>
            {#each accounts as account (account.account_id)}
              <option
                value={account.account_id}
                disabled={!isActive(account) ||
                  account.account_id === fromAccountId}
                aria-label="{account.displayName}{!isActive(account)
                  ? ' (Inactive)'
                  : ''}"
              >
                {account.displayName}
                {!isActive(account) ? "(Inactive)" : ""}
              </option>
            {/each}
          </select>
        </div>

        <!-- Amount -->
        <div class="form-field">
          <label for="transfer-amount" class="form-label">
            Amount <span class="required" aria-hidden="true">*</span>
          </label>
          <div class="input-prefix-wrapper">
            <span class="input-prefix" aria-hidden="true">$</span>
            <input
              id="transfer-amount"
              type="number"
              name="amount"
              class="form-input form-input--with-prefix"
              class:form-input--error={exceedsBalance}
              bind:value={amount}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              aria-required="true"
              aria-describedby={exceedsBalance ? "amount-error" : undefined}
            />
          </div>
          {#if exceedsBalance}
            <p id="amount-error" class="form-error-inline" role="alert">
              Amount exceeds available balance of {formatCurrency(
                fromAccount?.balance ?? 0,
              )}.
            </p>
          {/if}
        </div>

        <!-- Description -->
        <div class="form-field">
          <label for="transfer-desc" class="form-label">
            Description <span class="optional">(optional)</span>
          </label>
          <input
            id="transfer-desc"
            type="text"
            name="description"
            class="form-input"
            bind:value={description}
            maxlength="120"
            placeholder="e.g. Monthly savings transfer"
          />
        </div>
      </div>

      {#if validationError}
        <div id="form-error" class="alert alert--error" role="alert">
          {validationError}
        </div>
      {/if}

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn--primary"
          disabled={submitting || !!exceedsBalance}
          aria-busy={submitting}
        >
          {#if submitting}
            <span class="btn-spinner" aria-hidden="true"></span>
            Processing…
          {:else}
            Submit Transfer
          {/if}
        </button>
      </div>
    </form>
  </section>

  <!-- Recent Transfers -->
  <section aria-labelledby="recent-transfers-heading">
    <h2 id="recent-transfers-heading" class="section-heading">
      Recent Transfers
    </h2>

    {#if transfers.length === 0}
      <div class="empty-state">
        <p>No recent transfers found.</p>
      </div>
    {:else}
      <div class="table-wrapper" role="region" aria-label="Recent transfers">
        <table class="transfers-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col" class="col-right">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each transfers as transfer (transfer.transfer_id)}
              <tr>
                <td class="col-date">{formatDate(transfer.initiated_date)}</td>
                <td class="col-desc">{transfer.description || "—"}</td>
                <td class="col-account">
                  <span class="account-chip">
                    ••••{transfer.source_account.account_number.slice(-4)}
                  </span>
                </td>
                <td class="col-account">
                  <span class="account-chip">
                    ••••{transfer.destination_account.account_number.slice(-4)}
                  </span>
                </td>
                <td class="col-amount col-right">
                  {formatCurrency(transfer.amount, transfer.currency)}
                </td>
                <td>
                  <span
                    class="status-chip {transferStatusClass(transfer.status)}"
                    aria-label="Status: {transfer.status}"
                  >
                    {transfer.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>

<style>
  .transfer-layout {
    display: flex;
    flex-direction: column;
    gap: var(--s-10);
  }

  /* Section heading */
  .section-heading {
    font-size: var(--title-lg-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0 0 var(--s-5);
  }

  /* Alerts */
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

  /* Form layout */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-5);
  }

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }

  .form-label {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    color: var(--text-fg-ci);
  }

  .required {
    color: var(--c-red);
  }

  .optional {
    font-weight: var(--fw-base);
    color: var(--text-light-fg-ci);
    font-size: var(--text-xs-fs);
  }

  .form-hint {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
  }

  .form-error-inline {
    font-size: var(--text-xs-fs);
    color: var(--c-red-dark);
    margin: 0;
  }

  /* Inputs */
  .form-select,
  .form-input {
    height: var(--input-height);
    padding: var(--input-padding);
    border: var(--input-border-size) solid var(--input-border-ci);
    border-radius: var(--input-radius);
    background-color: var(--input-bg-ci);
    color: var(--input-fg-ci);
    font-size: var(--input-fs);
    width: 100%;
    appearance: auto;
    outline: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .form-select:focus,
  .form-input:focus {
    border-color: var(--c-blue);
    box-shadow: 0 0 0 3px rgba(22, 101, 216, 0.15);
  }

  .form-select:disabled,
  .form-input:disabled {
    color: var(--input-disabled-fg-ci);
    cursor: not-allowed;
    background-color: var(--c-gray-lighter);
  }

  .form-input--error {
    border-color: var(--input-error-border-ci);
    background-color: var(--input-error-bg-ci);
  }

  .form-input--error:focus {
    border-color: var(--c-red-dark);
    box-shadow: 0 0 0 3px rgba(245, 55, 88, 0.15);
  }

  /* Amount prefix */
  .input-prefix-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-prefix {
    position: absolute;
    left: var(--s-3);
    color: var(--text-light-fg-ci);
    font-size: var(--input-fs);
    pointer-events: none;
    user-select: none;
  }

  .form-input--with-prefix {
    padding-left: var(--s-6);
  }

  /* Submit button */
  .form-actions {
    margin-top: var(--s-6);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    padding: 0 var(--s-6);
    height: var(--input-height);
    border-radius: var(--input-radius);
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
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
    opacity: 0.55;
    cursor: not-allowed;
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

  /* Transfers table */
  .table-wrapper {
    overflow-x: auto;
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
  }

  .transfers-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm-fs);
    white-space: nowrap;
  }

  .transfers-table thead {
    background-color: var(--c-gray-lighter);
    border-bottom: var(--border-size-thin) solid var(--border-ci);
  }

  .transfers-table th {
    padding: var(--s-3) var(--s-4);
    text-align: left;
    font-weight: var(--fw-semi-bold);
    color: var(--text-light-fg-ci);
    font-size: var(--text-xs-fs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .transfers-table td {
    padding: var(--s-3) var(--s-4);
    color: var(--text-fg-ci);
    border-bottom: var(--border-size-thin) solid var(--border-ci-light);
  }

  .transfers-table tbody tr:last-child td {
    border-bottom: none;
  }

  .transfers-table tbody tr:hover {
    background-color: var(--c-gray-lighter);
  }

  .col-right {
    text-align: right;
  }

  .col-date {
    color: var(--text-light-fg-ci);
  }

  .col-desc {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-amount {
    font-weight: var(--fw-medium);
  }

  .account-chip {
    font-family: ui-monospace, monospace;
    font-size: var(--text-xs-fs);
    background-color: var(--c-gray-light);
    padding: 2px var(--s-2);
    border-radius: var(--radius-sm);
    letter-spacing: 0.04em;
  }

  .status-chip {
    display: inline-block;
    padding: 2px var(--s-2);
    border-radius: var(--radius-round);
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-medium);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .status--completed {
    background-color: var(--c-green-light);
    color: var(--c-green-dark);
  }

  .status--pending {
    background-color: var(--c-blue-lighter);
    color: var(--c-blue-dark);
  }

  .status--failed {
    background-color: var(--c-red-lighter);
    color: var(--c-red-dark);
  }

  /* Empty state */
  .empty-state {
    padding: var(--s-10) var(--s-6);
    text-align: center;
    color: var(--text-light-fg-ci);
    font-size: var(--text-sm-fs);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
  }

  .empty-state p {
    margin: 0;
  }
</style>
