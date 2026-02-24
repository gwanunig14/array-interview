<script lang="ts">
  import type { EnrichedAccount } from "$lib/types";

  export let account: EnrichedAccount;

  const isActive = account.account_status.toUpperCase() === "ACTIVE";

  function maskAccountNumber(num: string): string {
    if (num.length <= 4) return num;
    return "••••" + num.slice(-4);
  }

  function formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }
</script>

<article
  class="account-card"
  class:inactive={!isActive}
  aria-label={account.displayName}
>
  <header class="account-card__header">
    <div class="account-card__title-row">
      <h2 class="account-card__name">{account.displayName}</h2>
      <span
        class="status-badge"
        class:status-badge--active={isActive}
        class:status-badge--inactive={!isActive}
        aria-label="Account status: {isActive ? 'Active' : 'Inactive'}"
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
    <p class="account-card__number">
      <span class="sr-only">Account number ending in </span>
      <span aria-hidden="true">{maskAccountNumber(account.account_number)}</span
      >
      <span class="sr-only">{account.account_number.slice(-4)}</span>
    </p>
  </header>

  <div class="account-card__balance-row">
    <div>
      <p class="account-card__balance-label">Current Balance</p>
      <p class="account-card__balance">
        {formatCurrency(account.balance, account.currency)}
      </p>
    </div>
    <p class="account-card__type">{account.account_type}</p>
  </div>
</article>

<style>
  .account-card {
    background-color: var(--c-white);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    padding: var(--s-6);
    display: flex;
    flex-direction: column;
    gap: var(--s-5);
    transition: box-shadow 0.15s ease;
  }

  .account-card:focus-within {
    box-shadow: var(--shadow-md);
  }

  .account-card.inactive {
    background-color: var(--c-gray-lighter);
    border-color: var(--border-ci-light);
    opacity: 0.75;
  }

  /* Header */
  .account-card__header {
    display: flex;
    flex-direction: column;
    gap: var(--s-1);
  }

  .account-card__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
  }

  .account-card__name {
    font-size: var(--title-md-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0;
  }

  .account-card__number {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
    font-family: ui-monospace, monospace;
    letter-spacing: 0.04em;
  }

  /* Status badge */
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--s-05) var(--s-2);
    border-radius: var(--radius-round);
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-medium);
    flex-shrink: 0;
  }

  .status-badge--active {
    background-color: var(--c-green-light);
    color: var(--c-green-dark);
  }

  .status-badge--inactive {
    background-color: var(--c-gray-light);
    color: var(--c-gray-dark);
  }

  /* Balance */
  .account-card__balance-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--s-4);
  }

  .account-card__balance-label {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: var(--fw-medium);
    margin: 0 0 var(--s-1);
  }

  .account-card__balance {
    font-size: var(--number-sm-fs);
    font-weight: var(--fw-semi-bold);
    font-family: var(--number-font);
    color: var(--title-fg-ci);
    margin: 0;
  }

  .account-card__type {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    font-weight: var(--fw-medium);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
    padding-bottom: var(--s-1);
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
