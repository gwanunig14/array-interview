<script lang="ts">
  import AccountCard from "./AccountCard.svelte";
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";
  import TransactionCard from "./TransactionCard.svelte";
  import ErrorPanel from "./ErrorPanel.svelte";

  export let accounts: EnrichedAccount[];
  export let loading = false;
  export let error: string | null = null;

  $: totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
</script>

<section aria-label="Accounts overview">
  {#if loading}
    <div class="state-panel" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading your accounts…</p>
    </div>
  {:else if error}
    <ErrorPanel title="Unable to load accounts" message={error} />
  {:else}
    <div class="account-columns">
      <div class="account-columns__column">
        <!-- Summary banner -->
        <div class="summary-banner" aria-label="Account summary">
          <p class="summary-banner__label">Total balance</p>
          <p
            class="summary-banner__value"
            aria-label="Total balance {formatCurrency(totalBalance)}"
          >
            {formatCurrency(totalBalance)}
          </p>

          <p class="summary-banner__accounts">
            Across {accounts.length} accounts
          </p>
        </div>

        {#if accounts.length === 0}
          <div class="state-panel">
            <p class="state-panel__title">No accounts found</p>
            <p>There are no accounts associated with this profile.</p>
          </div>
        {:else}
          <ul class="accounts-grid" role="list" aria-label="Account list">
            <div class="accounts-header">Your accounts</div>
            {#each accounts as account (account.account_id)}
              <li>
                <AccountCard {account} />
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <div
        class="account-columns__column account-card__transactions"
        aria-label="Recent transactions"
      >
        <TransactionCard />
      </div>
    </div>
  {/if}
</section>

<style>
  /* Loading / error states */
  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--s-3);
    padding: var(--s-12) var(--s-6);
    text-align: center;
    color: var(--text-light-fg-ci);
    font-size: var(--text-sm-fs);
  }

  .state-panel__title {
    font-weight: var(--fw-semi-bold);
    font-size: var(--text-fs);
    margin: 0;
  }

  .state-panel p:not(.state-panel__title) {
    margin: 0;
  }

  /* Spinner */
  .spinner {
    display: block;
    width: var(--spinner-md);
    height: var(--spinner-md);
    border: var(--border-size-md) solid var(--c-gray-light);
    border-top-color: var(--c-blue);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .account-columns {
    display: flex;
    align-items: flex-start;
    gap: var(--s-12);
  }

  .account-columns__column {
    flex: 1 1 0;
    min-width: 0;
  }

  @media (max-width: 640px) {
    .account-columns {
      flex-direction: column;
      align-items: stretch;
      gap: var(--s-6);
      padding: 0 var(--s-6);
    }
  }

  /* Summary banner */
  .summary-banner {
    align-items: center;
    gap: var(--s-8);
    background-color: var(--c-blue);
    border-radius: var(--radius-xl);
    padding: var(--s-4);
    color: var(--c-white);
    margin-bottom: var(--s-6);
  }

  .summary-banner__label {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-base);
    margin-bottom: var(--s-3);
  }

  .summary-banner__value {
    font-size: var(--number-fs);
    font-weight: var(--fw-bold);
    margin-bottom: var(--s-3);
  }

  .summary-banner__accounts {
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-base);
  }

  /* Account grid */
  .accounts-grid {
    display: grid;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: var(--s-2);
    margin-top: var(--s-12);
  }

  .accounts-header {
    font-size: var(--text-fs);
    font-weight: var(--fw-medium);
    margin-bottom: var(--s-6);
  }
</style>
