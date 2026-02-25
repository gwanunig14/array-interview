<script lang="ts">
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";

  export let fromAccount: EnrichedAccount | undefined;
  export let toAccount: EnrichedAccount | undefined;
  export let amountNum: number;
  export let newFromBalance: number | null;
  export let newToBalance: number | null;
</script>

<div class="summary-card">
  <h3 class="card-heading">Transfer summary</h3>
  <p class="card-subtitle">
    A quick view of how this transfer affects your balances.
  </p>

  <div class="summary-grid">
    <div class="summary-col">
      <p class="summary-amount">
        {#if fromAccount && !isNaN(amountNum) && amountNum > 0}
          {formatCurrency(amountNum)} From
        {:else}
          From
        {/if}
      </p>
      {#if fromAccount}
        <p class="summary-account-name">
          {fromAccount.displayName}
        </p>
      {:else}
        <p class="summary-account-name summary-account-name--empty">-</p>
      {/if}
      {#if newFromBalance !== null}
        <p class="summary-balance">
          New balance · {formatCurrency(newFromBalance)}
        </p>
      {/if}
    </div>

    <div class="summary-col">
      <p class="summary-amount">
        {#if toAccount && !isNaN(amountNum) && amountNum > 0}
          {formatCurrency(amountNum)} To
        {:else}
          To
        {/if}
      </p>
      {#if toAccount}
        <p class="summary-account-name">
          {toAccount.displayName}
        </p>
      {:else}
        <p class="summary-account-name summary-account-name--empty">-</p>
      {/if}
      {#if newToBalance !== null}
        <p class="summary-balance">
          New balance · {formatCurrency(newToBalance)}
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .summary-card {
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    padding: var(--s-4);
    background: var(--c-gray-lighter);
  }

  .card-heading {
    font-size: var(--text-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darker);
    margin: 0 0 var(--s-2);
    height: 19px;
  }

  .card-subtitle {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0 0 var(--s-6);
    height: 17px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-4);
  }

  .summary-col {
    display: flex;
    flex-direction: column;
    gap: var(--s-1);
  }

  .summary-amount {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
    height: 17px;
  }

  .summary-account-name {
    font-size: var(--text-sm-fs);
    color: var(--c-gray-darkest);
    margin-top: 8px;
    height: 17px;
  }

  .summary-balance {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin-top: 8px;
    height: 17px;
  }
</style>
