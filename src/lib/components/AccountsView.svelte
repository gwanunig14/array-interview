<script lang="ts">
  import AccountCard from "./AccountCard.svelte";
  import { getMockTransactions } from "$lib/mockData";
  import type { EnrichedAccount } from "$lib/types";

  export let accounts: EnrichedAccount[];
  export let loading = false;
  export let error: string | null = null;

  $: totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  $: activeCount = accounts.filter(
    (a) => a.account_status.toUpperCase() === "ACTIVE",
  ).length;

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
</script>

<section aria-label="Accounts overview">
  {#if loading}
    <div class="state-panel" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading your accounts…</p>
    </div>
  {:else if error}
    <div class="state-panel state-panel--error" role="alert">
      <p class="state-panel__title">Unable to load accounts</p>
      <p>{error}</p>
    </div>
  {:else}
    <!-- Summary banner -->
    <div class="summary-banner" aria-label="Account summary">
      <div class="summary-banner__col">
        <p class="summary-banner__label">Total Balance</p>
        <p
          class="summary-banner__value"
          aria-label="Total balance {formatCurrency(totalBalance)}"
        >
          {formatCurrency(totalBalance)}
        </p>
      </div>
      <div class="summary-banner__divider" aria-hidden="true"></div>
      <div class="summary-banner__col">
        <p class="summary-banner__label">Accounts</p>
        <p class="summary-banner__value">
          {accounts.length}
          <span class="summary-banner__sub">({activeCount} active)</span>
        </p>
      </div>
    </div>

    {#if accounts.length === 0}
      <div class="state-panel">
        <p class="state-panel__title">No accounts found</p>
        <p>There are no accounts associated with this profile.</p>
      </div>
    {:else}
      <ul class="accounts-grid" role="list" aria-label="Account list">
        {#each accounts as account (account.account_id)}
          <li>
            <AccountCard
              {account}
              transactions={getMockTransactions(account.account_number)}
            />
          </li>
        {/each}
      </ul>
    {/if}
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

  .state-panel--error {
    background-color: var(--c-red-lighter);
    border: var(--border-size-thin) solid var(--c-red-light);
    border-radius: var(--radius-xl);
    color: var(--c-red-dark);
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
    width: 28px;
    height: 28px;
    border: 3px solid var(--c-gray-light);
    border-top-color: var(--c-blue);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Summary banner */
  .summary-banner {
    display: flex;
    align-items: center;
    gap: var(--s-8);
    background-color: var(--c-blue);
    border-radius: var(--radius-xl);
    padding: var(--s-6) var(--s-8);
    color: var(--c-white);
    margin-bottom: var(--s-6);
  }

  .summary-banner__divider {
    width: 1px;
    height: 2.5rem;
    background-color: rgba(255, 255, 255, 0.3);
  }

  .summary-banner__label {
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-medium);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 var(--s-1);
    opacity: 0.8;
  }

  .summary-banner__value {
    font-size: var(--number-sm-fs);
    font-weight: var(--fw-bold);
    font-family: var(--number-font);
    margin: 0;
  }

  .summary-banner__sub {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-base);
    opacity: 0.8;
    margin-left: var(--s-2);
  }

  /* Account grid */
  .accounts-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--s-5);
  }
</style>
