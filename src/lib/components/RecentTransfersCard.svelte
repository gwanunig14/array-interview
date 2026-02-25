<script context="module" lang="ts">
  import type { TransferSummary } from "$lib/types";

  export type EnrichedTransfer = TransferSummary & {
    sourceDisplayName: string;
    destDisplayName: string;
  };
</script>

<script lang="ts">
  import { formatCurrency, formatDate } from "$lib/utils";
  import bankIcon from "$lib/assets/bank.svg";

  export let transfers: EnrichedTransfer[];
</script>

<div class="recent-card">
  <h3 class="card-heading">Recent transfers</h3>
  <p class="card-subtitle">
    Quick reference of your latest internal transfers.
  </p>

  {#if transfers.length === 0}
    <p class="empty-state">No recent transfers found.</p>
  {:else}
    <ul class="transfer-list" aria-label="Recent transfers">
      {#each transfers as transfer (transfer.transfer_id)}
        {@const isOutbound = transfer.direction.toUpperCase() === "OUTBOUND"}
        <li class="transfer-item">
          <span class="transfer-icon" aria-hidden="true">
            <img src={bankIcon} alt="" width="20" height="20" />
          </span>
          <div class="transfer-info">
            <p class="transfer-title">To {transfer.destDisplayName}</p>
            <p class="transfer-meta">
              {formatDate(transfer.initiated_date)} · From {transfer.sourceDisplayName}
            </p>
          </div>
          <span
            class="transfer-amount"
            class:transfer-amount--negative={isOutbound}
            class:transfer-amount--positive={!isOutbound}
          >
            {isOutbound ? "-" : "+"}{formatCurrency(
              transfer.amount,
              transfer.currency,
            )}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .recent-card {
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

  .transfer-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-6);
  }

  .transfer-item {
    display: flex;
    align-items: flex-start;
    gap: var(--s-4);
  }

  .transfer-icon {
    flex-shrink: 0;
    width: var(--s-8);
    height: var(--s-8);
    border-radius: var(--radius-round);
    background: var(--c-gray-light);
    border: var(--border-size-thin) solid var(--border-ci);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--s-2-5);
  }

  .transfer-info {
    flex: 1;
    min-width: 0;
  }

  .transfer-title {
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darker);
    margin: 0 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 17px;
    margin-bottom: var(--s-2);
  }

  .transfer-meta {
    font-size: var(--text-xs-fs);
    font-weight: var(--fw-medium);
    color: var(--text-light-fg-ci);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 15px;
  }

  .transfer-amount {
    flex-shrink: 0;
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    height: 17px;
  }

  .transfer-amount--negative {
    color: var(--c-red);
  }

  .transfer-amount--positive {
    color: var(--c-black);
  }

  .empty-state {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin: 0;
    padding: var(--s-4) 0;
    text-align: center;
  }
</style>
