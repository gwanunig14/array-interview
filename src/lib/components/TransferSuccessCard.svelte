<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { formatCurrency } from "$lib/utils";

  export let amount: number;
  export let fromAccountName: string;
  export let toAccountName: string;
  export let transferDate: string;
  export let confirmationId: string;

  const dispatch = createEventDispatcher<{ done: void }>();
</script>

<div class="card">
  <div class="icon-wrap">
    <svg
      class="check-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>

  <h2 class="title">Transfer Successful</h2>
  <p class="subtitle">Your transfer has successfully been completed</p>

  <dl class="detail-list">
    <div class="detail-row">
      <dt>Amount</dt>
      <dd>{formatCurrency(amount)}</dd>
    </div>
    <div class="detail-row">
      <dt>Transfer from</dt>
      <dd>{fromAccountName}</dd>
    </div>
    <div class="detail-row">
      <dt>Transfer to</dt>
      <dd>{toAccountName}</dd>
    </div>
    <div class="detail-row">
      <dt>Transfer date</dt>
      <dd>{transferDate}</dd>
    </div>
    <div class="detail-row">
      <dt>Confirmation</dt>
      <dd>{confirmationId}</dd>
    </div>
  </dl>

  <button class="action-btn" type="button" on:click={() => dispatch("done")}>
    Done
  </button>
</div>

<style>
  .card {
    background: var(--c-white);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    padding: var(--s-6);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .icon-wrap {
    width: var(--s-16);
    height: var(--s-16);
    border-radius: var(--radius-round);
    background: var(--c-green-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-white);
    flex-shrink: 0;
    margin-bottom: var(--s-6);
  }

  .check-icon {
    width: var(--s-6);
    height: var(--s-6);
  }

  .title {
    font-size: var(--header-xs-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darker);
    height: 29px;
    text-align: center;
    margin-bottom: var(--s-2);
  }

  .subtitle {
    font-size: var(--text-sm-fs);
    color: var(--c-gary-darker);
    margin: 0 0 var(--s-12);
    text-align: center;
  }

  .detail-list {
    width: 100%;
    margin: 0;
    padding-top: var(--s-4);
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    margin-bottom: var(--s-12);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-4);
    border-bottom: var(--border-size-thin) solid var(--border-ci-light);
    height: 33px;
  }

  .detail-row dt,
  .detail-row dd {
    font-size: var(--text-sm-fs);
    color: var(--c-gray-darker);
    white-space: nowrap;
    height: 17px;
  }

  .action-btn {
    width: 100%;
    height: var(--s-10);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius);
    background: var(--c-white);
    color: var(--title-fg-ci);
    font-size: var(--text-fs);
    font-weight: var(--fw-semi-bold);
    cursor: pointer;
    transition: background 0.15s;
  }

  .action-btn:hover {
    background: var(--c-gray-lighter);
  }

  .action-btn:focus-visible {
    outline: 2px solid var(--primary-ci);
    outline-offset: 2px;
  }
</style>
