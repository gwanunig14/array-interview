<script lang="ts">
  import { getMockTransactions } from "$lib/mockData";
  import type { TransactionType } from "$lib/types";
  import { formatCurrency, formatDate } from "$lib/utils";
  import bank from "$lib/assets/bank.svg";
  import briefcase from "$lib/assets/briefcase.svg";
  import hotBeverage from "$lib/assets/hot-beverage.svg";
  import moneyBag from "$lib/assets/money-bag.svg";
  import shoppingCart from "$lib/assets/shopping-cart.svg";

  $: transactions = getMockTransactions();

  function getTransactionImage(
    transactionType: TransactionType,
  ): string | null {
    switch (transactionType) {
      case "restaurant":
        return hotBeverage;
      case "store":
        return shoppingCart;
      case "income":
        return briefcase;
      case "payment":
        return moneyBag;
      case "transfer":
        return bank;
      default:
        return null;
    }
  }
</script>

<section aria-label="transactions overview">
  <div class="transaction-card" aria-label="Recent Transactions">
    <h3 class="transaction-card__section-title">Recent Activity</h3>
    {#if transactions.length === 0}
      <p class="transaction-card__empty">No recent transactions.</p>
    {:else}
      <div class="transaction-card__list-title">
        Latest movements across all accounts
      </div>
      <ul class="transaction-list" role="list">
        {#each transactions as tx (tx.id)}
          <li class="transaction-list__item">
            <div class="transaction-list__item__image-container">
              <div class="transaction-list__item_image">
                <img
                  src={getTransactionImage(tx.transactionType)}
                  alt="NorthWind"
                  class="app-header__logo"
                />
              </div>
            </div>
            <div class="transaction-list__item__information">
              <span class="transaction-list__item__desc">{tx.description}</span>
              <span class="transaction-list__item__meta"
                >{formatDate(tx.date)} · {tx.accountLabel}</span
              >
            </div>
            <span
              class="transaction-list__item__amount"
              class:credit={tx.type === "credit"}
              class:debit={tx.type === "debit"}
              aria-label="{tx.type === 'credit'
                ? 'Credit'
                : 'Debit'} {formatCurrency(tx.amount)}"
            >
              {tx.type === "credit" ? "+" : "−"}{formatCurrency(tx.amount)}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .transaction-card {
    align-items: center;
    background-color: var(--c-gray-lighter);
    border-radius: var(--radius-xl);
    border-width: var(--border-size-thin);
    border-color: var(--border-ci-light);
    padding: var(--s-4);
  }

  .transaction-card__section-title {
    font-size: var(--text-fs);
    font-weight: var(--fw-medium);
    color: var(--title-fg-ci);
    margin: 0 0 var(--s-2);
  }

  .transaction-card__empty {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
  }

  .transaction-card__list-title {
    color: var(--text-light-fg-ci);
    font-size: var(--text-sm-fs);
    font-weight: var(--text-fw);
    margin-bottom: var(--s-6);
  }

  .transaction-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-6);
  }

  .transaction-list__item {
    display: flex;
    align-items: center;
    padding: var(--s-2);
    height: var(--s-10);
  }

  .transaction-list__item__image-container {
    background-color: var(--c-gray-light);
    border-radius: var(--radius-round);
    border-width: var(--border-size-thin);
    border-color: var(--border-ci);
    height: var(--number-fs);
    width: var(--number-fs);
    padding: var(--s-2-5);
    margin-right: var(--s-4);
  }

  .transaction-list__item__information {
    align-items: left;
  }

  .transaction-list__item__desc {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    color: var(--title-fg-ci);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: var(--s-2);
  }

  .transaction-list__item__meta {
    display: flex;
    align-items: center;
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-medium);
    flex-shrink: 0;
    color: var(--text-light-fg-ci);
  }

  .transaction-list__item__amount {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    min-width: 6rem;
    text-align: right;
    margin-left: auto;
  }

  .transaction-list__item__amount.credit {
    color: var(--c-green-dark);
  }

  .transaction-list__item__amount.debit {
    color: var(--text-fg-ci);
  }
</style>
