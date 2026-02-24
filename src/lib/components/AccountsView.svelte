<script lang="ts">
  import AccountCard from "./AccountCard.svelte";
  import { getMockTransactions } from "$lib/mockData";
  import type { EnrichedAccount } from "$lib/types";

  export let accounts: EnrichedAccount[];
  export let loading = false;
  export let error: string | null = null;
  const transactions = getMockTransactions();

  $: totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr + "T00:00:00"));
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
    <div class="account-columns">
      <div class="account-columns__column">
        <!-- Summary banner -->
        <div class="summary-banner" aria-label="Account summary">
          <p class="summary-banner__label">Total Balance</p>
          <p
            class="summary-banner__value"
            aria-label="Total balance {formatCurrency(totalBalance)}"
          >
            {formatCurrency(totalBalance)}
          </p>

          <p class="summary-banner__label">Across {accounts.length} accounts</p>
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
        <h3 class="account-card__section-title">Recent Transactions</h3>
        {#if transactions.length === 0}
          <p class="account-card__empty">No recent transactions.</p>
        {:else}
          <ul class="transaction-list" role="list">
            {#each transactions as tx (tx.id)}
              <li class="transaction-list__item">
                <span class="transaction-list__desc">{tx.description}</span>
                <span class="transaction-list__meta">
                  <span class="transaction-list__date"
                    >{formatDate(tx.date)}</span
                  >
                  <span
                    class="transaction-list__amount"
                    class:credit={tx.type === "credit"}
                    class:debit={tx.type === "debit"}
                    aria-label="{tx.type === 'credit'
                      ? 'Credit'
                      : 'Debit'} {formatCurrency(tx.amount)}"
                  >
                    {tx.type === "credit" ? "+" : "−"}{formatCurrency(
                      tx.amount,
                    )}
                  </span>
                </span>
              </li>
            {/each}
          </ul>
        {/if}
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

  .account-columns {
    display: flex;
    align-items: flex-start;
    gap: var(--s-6);
  }

  .account-columns__column {
    flex: 1 1 0;
    min-width: 0;
  }

  /* Summary banner */
  .summary-banner {
    align-items: center;
    gap: var(--s-8);
    background-color: var(--c-blue);
    border-radius: var(--radius-xl);
    padding: var(--s-6) var(--s-8);
    color: var(--c-white);
    margin-bottom: var(--s-6);
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

  /* Account grid */
  .accounts-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    gap: var(--s-5);
  }

  /* Transactions */
  .account-card__section-title {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0 0 var(--s-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .account-card__empty {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
  }

  .transaction-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .transaction-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding: var(--s-2) 0;
    border-bottom: var(--border-size-thin) solid var(--border-ci-light);
  }

  .transaction-list__item:last-child {
    border-bottom: none;
  }

  .transaction-list__desc {
    font-size: var(--text-sm-fs);
    color: var(--text-fg-ci);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .transaction-list__meta {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    flex-shrink: 0;
  }

  .transaction-list__date {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
  }

  .transaction-list__amount {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    min-width: 6rem;
    text-align: right;
  }

  .transaction-list__amount.credit {
    color: var(--c-green-dark);
  }

  .transaction-list__amount.debit {
    color: var(--text-fg-ci);
  }
</style>
