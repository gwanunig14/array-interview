<script lang="ts">
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";
  import AccountPickerDropdown from "./AccountPickerDropdown.svelte";

  export let accounts: EnrichedAccount[];
  export let fromAccountId: string;
  export let toAccountId: string;
  export let amount: string;

  let fromOpen = false;
  let toOpen = false;

  $: fromAccount = accounts.find((a) => a.account_id === fromAccountId);

  $: amountNum = parseFloat(amount);
  $: exceedsBalance =
    fromAccount &&
    !isNaN(amountNum) &&
    amountNum > 0 &&
    amountNum > fromAccount.balance;

  function closeDropdowns() {
    fromOpen = false;
    toOpen = false;
  }
</script>

<svelte:window on:click={closeDropdowns} />

<AccountPickerDropdown
  {accounts}
  bind:selectedId={fromAccountId}
  disabledId={toAccountId}
  bind:open={fromOpen}
  pickerId="from-picker"
  label="Transfer from"
  listboxLabel="Select source account"
  on:toggle={() => (toOpen = false)}
/>

<AccountPickerDropdown
  {accounts}
  bind:selectedId={toAccountId}
  disabledId={fromAccountId}
  bind:open={toOpen}
  pickerId="to-picker"
  label="Transfer to"
  listboxLabel="Select destination account"
  on:toggle={() => (fromOpen = false)}
/>

<!-- Amount -->
<div class="form-field">
  <label for="transfer-amount" class="form-label">Transfer amount</label>
  <div class="input-prefix-wrapper">
    <span class="input-prefix" aria-hidden="true">$</span>
    <input
      id="transfer-amount"
      type="number"
      name="amount"
      class="amount-input amount-input--with-prefix"
      class:amount-input--error={exceedsBalance}
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

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }

  .form-label {
    font-size: var(--text-sm-fs);
    color: var(--c-gray-darker);
  }

  .form-error-inline {
    font-size: var(--text-xs-fs);
    color: var(--c-red-dark);
    margin: 0;
  }

  /* ── Amount input ──────────────────────────────────────────────────────── */
  .amount-input {
    height: 51px;
    padding: var(--input-padding);
    border: var(--input-border-size) solid var(--input-border-ci);
    border-radius: var(--radius-xl);
    background-color: var(--input-bg-ci);
    color: var(--c-gray-darkest);
    font-size: var(--input-fs);
    width: 100%;
    outline: none;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .amount-input::placeholder {
    color: var(--c-gray-darkest);
  }

  .amount-input:focus {
    border-color: var(--c-blue);
    box-shadow: 0 0 0 3px rgba(22, 101, 216, 0.15);
  }

  .amount-input--error {
    border-color: var(--input-error-border-ci);
    background-color: var(--input-error-bg-ci);
  }

  .amount-input--error:focus {
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

  .amount-input--with-prefix {
    padding: var(--s-4);
    padding-left: var(--s-8);
  }
</style>
