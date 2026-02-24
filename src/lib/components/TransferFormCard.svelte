<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";

  export let accounts: EnrichedAccount[];
  export let fromAccountId: string;
  export let toAccountId: string;
  export let amount: string;

  let submitting = false;
  let validationError = "";
  let serverError = "";
  let successMessage = "";
  let successTransferId = "";

  let fromOpen = false;
  let toOpen = false;

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

  function closeDropdowns() {
    fromOpen = false;
    toOpen = false;
  }

  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  function selectFrom(id: string) {
    fromAccountId = id;
    fromOpen = false;
  }

  function selectTo(id: string) {
    toAccountId = id;
    toOpen = false;
  }
</script>

<svelte:window on:click={closeDropdowns} />

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
      <!-- Transfer from -->
      <div class="form-field">
        <label class="form-label" for="from-picker">Transfer from</label>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div
          id="from-picker"
          class="account-picker"
          class:account-picker--open={fromOpen}
          on:click|stopPropagation={() => {
            toOpen = false;
            fromOpen = !fromOpen;
          }}
          role="button"
          tabindex="0"
          aria-haspopup="listbox"
          aria-expanded={fromOpen}
          on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toOpen = false;
              fromOpen = !fromOpen;
            }
          }}
        >
          {#if fromAccount}
            <div class="picker-selected">
              <span class="picker-name"
                >{fromAccount.displayName}...{fromAccount.account_number.slice(
                  -4,
                )}</span
              >
              <span class="picker-balance"
                >{formatCurrency(fromAccount.balance)} available</span
              >
            </div>
          {:else}
            <span class="picker-placeholder">Choose account</span>
          {/if}
          <svg
            class="picker-chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          {#if fromOpen}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <ul
              class="picker-dropdown"
              role="listbox"
              aria-label="Select source account"
              on:click={stopPropagation}
            >
              {#each accounts as account (account.account_id)}
                <li
                  class="picker-option"
                  class:picker-option--disabled={!isActive(account) ||
                    account.account_id === toAccountId}
                  class:picker-option--selected={account.account_id ===
                    fromAccountId}
                  role="option"
                  aria-selected={account.account_id === fromAccountId}
                  tabindex={!isActive(account) ||
                  account.account_id === toAccountId
                    ? -1
                    : 0}
                  on:click={() => {
                    if (isActive(account) && account.account_id !== toAccountId)
                      selectFrom(account.account_id);
                  }}
                  on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (
                        isActive(account) &&
                        account.account_id !== toAccountId
                      )
                        selectFrom(account.account_id);
                    }
                  }}
                >
                  <span class="option-name">{account.displayName}</span>
                  <span class="option-balance"
                    >{formatCurrency(account.balance)}</span
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Transfer to -->
      <div class="form-field">
        <label class="form-label" for="to-picker">Transfer to</label>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div
          id="to-picker"
          class="account-picker"
          class:account-picker--open={toOpen}
          on:click|stopPropagation={() => {
            fromOpen = false;
            toOpen = !toOpen;
          }}
          role="button"
          tabindex="0"
          aria-haspopup="listbox"
          aria-expanded={toOpen}
          on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fromOpen = false;
              toOpen = !toOpen;
            }
          }}
        >
          {#if toAccount}
            <div class="picker-selected">
              <span class="picker-name"
                >{toAccount.displayName}...{toAccount.account_number.slice(
                  -4,
                )}</span
              >
              <span class="picker-balance"
                >{formatCurrency(toAccount.balance)} available</span
              >
            </div>
          {:else}
            <span class="picker-placeholder">Choose account</span>
          {/if}
          <svg
            class="picker-chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          {#if toOpen}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <ul
              class="picker-dropdown"
              role="listbox"
              aria-label="Select destination account"
              on:click={stopPropagation}
            >
              {#each accounts as account (account.account_id)}
                <li
                  class="picker-option"
                  class:picker-option--disabled={!isActive(account) ||
                    account.account_id === fromAccountId}
                  class:picker-option--selected={account.account_id ===
                    toAccountId}
                  role="option"
                  aria-selected={account.account_id === toAccountId}
                  tabindex={!isActive(account) ||
                  account.account_id === fromAccountId
                    ? -1
                    : 0}
                  on:click={() => {
                    if (
                      isActive(account) &&
                      account.account_id !== fromAccountId
                    )
                      selectTo(account.account_id);
                  }}
                  on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (
                        isActive(account) &&
                        account.account_id !== fromAccountId
                      )
                        selectTo(account.account_id);
                    }
                  }}
                >
                  <span class="option-name">{account.displayName}</span>
                  <span class="option-balance"
                    >{formatCurrency(account.balance)}</span
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Amount -->
      <div class="form-field">
        <label for="transfer-amount" class="form-label">Transfer amount</label>
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
        disabled={submitting || !!exceedsBalance}
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
    font-size: var(--title-lg-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0 0 var(--s-1);
  }

  .section-subtitle {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0 0 var(--s-5);
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
    padding: var(--s-5);
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
    background: var(--c-white);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }

  .form-label {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    color: var(--text-light-fg-ci);
  }

  .form-error-inline {
    font-size: var(--text-xs-fs);
    color: var(--c-red-dark);
    margin: 0;
  }

  /* ── Account picker ────────────────────────────────────────────────────── */
  .account-picker {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--s-3) var(--s-4);
    border: var(--input-border-size) solid var(--input-border-ci);
    border-radius: var(--input-radius);
    background: var(--input-bg-ci);
    cursor: pointer;
    min-height: var(--input-height);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    user-select: none;
  }

  .account-picker:hover {
    border-color: var(--c-gray-dark);
  }

  .account-picker:focus,
  .account-picker--open {
    outline: none;
    border-color: var(--c-blue);
    box-shadow: 0 0 0 3px rgba(22, 101, 216, 0.15);
  }

  .picker-selected {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .picker-name {
    font-size: var(--text-sm-fs);
    color: var(--input-fg-ci);
    font-weight: var(--fw-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .picker-balance {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
  }

  .picker-placeholder {
    font-size: var(--text-sm-fs);
    color: var(--c-blue);
    font-weight: var(--fw-medium);
  }

  .picker-chevron {
    flex-shrink: 0;
    color: var(--text-light-fg-ci);
    margin-left: var(--s-2);
  }

  .picker-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--c-white);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    list-style: none;
    margin: 0;
    padding: var(--s-1) 0;
    z-index: var(--layer-3);
    max-height: 220px;
    overflow-y: auto;
  }

  .picker-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--s-3) var(--s-4);
    cursor: pointer;
    font-size: var(--text-sm-fs);
    transition: background-color 0.1s ease;
  }

  .picker-option:hover:not(.picker-option--disabled) {
    background-color: var(--c-gray-lighter);
  }

  .picker-option--selected {
    background-color: var(--c-blue-lightest);
    color: var(--c-blue);
  }

  .picker-option--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .option-name {
    font-weight: var(--fw-medium);
    color: var(--text-fg-ci);
  }

  .picker-option--selected .option-name {
    color: var(--c-blue);
  }

  .option-balance {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    margin-left: var(--s-3);
    flex-shrink: 0;
  }

  /* ── Amount input ──────────────────────────────────────────────────────── */
  .form-input {
    height: var(--input-height);
    padding: var(--input-padding);
    border: var(--input-border-size) solid var(--input-border-ci);
    border-radius: var(--input-radius);
    background-color: var(--input-bg-ci);
    color: var(--input-fg-ci);
    font-size: var(--input-fs);
    width: 100%;
    outline: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .form-input:focus {
    border-color: var(--c-blue);
    box-shadow: 0 0 0 3px rgba(22, 101, 216, 0.15);
  }

  .form-input--error {
    border-color: var(--input-error-border-ci);
    background-color: var(--input-error-bg-ci);
  }

  .form-input--error:focus {
    border-color: var(--c-red-dark);
    box-shadow: 0 0 0 3px rgba(245, 55, 88, 0.15);
  }

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

  /* ── Disclaimer & submit ───────────────────────────────────────────────── */
  .disclaimer {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    text-align: center;
    margin: 0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    padding: 0 var(--s-6);
    height: var(--input-height);
    border-radius: var(--input-radius);
    font-size: var(--text-sm-fs);
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
    opacity: 0.55;
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
