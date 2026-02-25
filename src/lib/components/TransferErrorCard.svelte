<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let message: string =
    "Your transfer could not be completed because the transaction limit for your account has been exceeded.";

  const dispatch = createEventDispatcher<{ back: void }>();
</script>

<div class="card">
  <div class="icon-wrap">
    <svg
      class="x-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </div>

  <h2 class="title">Transfer Failed</h2>
  <p class="body-text">{message}</p>

  <button class="action-btn" type="button" on:click={() => dispatch("back")}>
    Back to transfers
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
    width: 310px;
  }

  .icon-wrap {
    width: var(--s-16);
    height: var(--s-16);
    border-radius: var(--radius-round);
    background: var(--c-red-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-white);
    flex-shrink: 0;
    margin-bottom: var(--s-6);
  }

  .x-icon {
    width: 24px;
    height: 24px;
  }

  .title {
    font-size: var(--header-xs-fs);
    font-weight: var(--fw-medium);
    color: var(--c-gray-darkest);
    margin-bottom: var(--s-2);
    text-align: center;
    height: 29px;
  }

  .body-text {
    font-size: var(--text-sm-fs);
    color: var(--text-light-fg-ci);
    margin-bottom: var(--s-12);
    text-align: center;
    line-height: var(--text-sm-lh);
  }

  .action-btn {
    margin-top: var(--s-2);
    width: 100%;
    height: var(--s-10);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius);
    background: var(--c-white);
    color: var(--c-gray-darkest);
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
