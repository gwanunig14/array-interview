<script lang="ts">
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency, formatAccountType } from "$lib/utils";

  export let account: EnrichedAccount;

  const isActive = account.account_status.toUpperCase() === "ACTIVE";

  function maskAccountNumber(num: string): string {
    if (num.length <= 4) return num;
    return "**** " + num.slice(-4);
  }
</script>

<article
  class="account-card"
  class:inactive={!isActive}
  aria-label={account.displayName}
>
  <div class="account-card__top-row">
    <h2 class="account-card__name">{account.displayName}</h2>
    <div>
      <p
        class="account-card__balance"
        class:account-card__balance-negative={account.balance < 0}
      >
        {isNaN(account.balance)
          ? "Network Error. Please try again later."
          : formatCurrency(account.balance, account.currency)}
      </p>
    </div>
  </div>
  <div class="account-card__bottom-row">
    <p class="account-card__number">
      <span aria-hidden="true">{maskAccountNumber(account.account_number)}</span
      >
      <span class="sr-only">{account.account_number.slice(-4)}</span>
      <span class="account-type">
        {formatAccountType(account.account_type)}</span
      >
    </p>
    <p class="account-card__number">
      <span
        class="status"
        aria-label="Account status: {isActive ? 'Available' : 'Unavailable'}"
      >
        {isActive ? "Available" : "Unavailable"}
      </span>
    </p>
  </div>
</article>

<style>
  .account-card {
    background-color: var(--c-white);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    padding: var(--s-4);
    display: flex;
    flex-direction: column;
  }

  .account-card.inactive {
    opacity: 0.4;
  }

  .account-card__top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--s-4);
    height: var(--text-lh);
  }

  .account-card__name {
    font-size: var(--title-fs);
    font-weight: var(--fw-base);
    color: var(--title-fg-ci);
    height: var(--text-lh);
  }

  .account-card__balance {
    font-size: var(--number-sm-fs);
    font-size: var(--title-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darkest);
    height: var(--text-lh);
  }

  .account-card__balance-negative {
    color: var(--c-red-dark);
  }

  .account-card__bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    height: var(--tag-height);
  }

  .account-card__number {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
    letter-spacing: var(--text-ls-wide);
    height: var(--text-sm-lh-tight);
  }

  .account-type {
    display: inline-flex;
    align-items: center;
    padding: var(--s-2);
    border-radius: var(--radius-md);
    font-family: "Heebo", sans-serif;
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    letter-spacing: var(--text-ls-tight);
    flex-shrink: 0;
    background-color: var(--c-gray-lighter-b);
    color: var(--c-black);
  }

  .status {
    display: inline-flex;
    align-items: end;
    border-radius: var(--radius-round);
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-base);
    flex-shrink: 0;
    color: var(--text-light-fg-ci);
    height: var(--text-sm-lh-tight);
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: var(--s-025);
    height: var(--s-025);
    padding: 0;
    margin: calc(-1 * var(--s-025));
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
