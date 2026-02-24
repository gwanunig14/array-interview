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
      <p class="summary-account-name">
        {fromAccount ? fromAccount.displayName : "—"}
      </p>
      {#if newFromBalance !== null}
        <p class="summary-balance">
          New balance · {formatCurrency(newFromBalance)}
        </p>
      {:else}
        <p class="summary-balance summary-balance--empty">—</p>
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
      <p class="summary-account-name">
        {toAccount ? toAccount.displayName : "—"}
      </p>
      {#if newToBalance !== null}
        <p class="summary-balance">
          New balance · {formatCurrency(newToBalance)}
        </p>
      {:else}
        <p class="summary-balance summary-balance--empty">—</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .summary-card {
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    padding: var(--s-5);
    background: var(--c-white);
  }

  .card-heading {
    font-size: var(--text-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0 0 var(--s-1);
  }

  .card-subtitle {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0 0 var(--s-4);
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
    font-weight: var(--fw-medium);
    color: var(--text-fg-ci);
    margin: 0;
  }

  .summary-account-name {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--title-fg-ci);
    margin: 0;
  }

  .summary-balance {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
  }

  .summary-balance--empty {
    color: var(--c-gray-dark);
  }
</style>
