<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EnrichedAccount } from "$lib/types";
  import { formatCurrency } from "$lib/utils";

  export let accounts: EnrichedAccount[];
  export let selectedId: string;
  export let disabledId: string = "";
  export let open: boolean = false;
  export let pickerId: string;
  export let label: string;
  export let listboxLabel: string;

  const dispatch = createEventDispatcher<{ toggle: void }>();

  $: selectedAccount = accounts.find((a) => a.account_id === selectedId);

  function isActive(account: EnrichedAccount): boolean {
    return account.account_status.toUpperCase() === "ACTIVE";
  }

  function isDisabled(account: EnrichedAccount): boolean {
    return !isActive(account) || account.account_id === disabledId;
  }

  function handleToggle() {
    dispatch("toggle");
    open = !open;
  }

  function handleSelect(id: string) {
    selectedId = id;
    open = false;
  }

  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }
</script>

<div class="form-field">
  <label class="form-label" for={pickerId}>{label}</label>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    id={pickerId}
    class="account-picker"
    class:account-picker--open={open}
    on:click|stopPropagation={handleToggle}
    role="button"
    tabindex="0"
    aria-haspopup="listbox"
    aria-expanded={open}
    on:keydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    }}
  >
    {#if selectedAccount}
      <div class="picker-selected">
        <span class="picker-name"
          >{selectedAccount.displayName}...{selectedAccount.account_number.slice(
            -4,
          )}</span
        >
        <span class="picker-balance"
          >{formatCurrency(selectedAccount.balance)} available</span
        >
      </div>
    {:else}
      <span class="picker-placeholder">Choose account</span>
    {/if}

    <svg
      class="picker-chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    {#if open}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <ul
        class="picker-dropdown"
        role="listbox"
        aria-label={listboxLabel}
        on:click={stopPropagation}
      >
        {#each accounts as account (account.account_id)}
          <li
            class="picker-option"
            class:picker-option--disabled={isDisabled(account)}
            class:picker-option--selected={account.account_id === selectedId}
            role="option"
            aria-selected={account.account_id === selectedId}
            tabindex={isDisabled(account) ? -1 : 0}
            on:click|stopPropagation={() => {
              if (!isDisabled(account)) handleSelect(account.account_id);
            }}
            on:keydown|stopPropagation={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isDisabled(account)) handleSelect(account.account_id);
              }
            }}
          >
            <span class="option-name">{account.displayName}</span>
            <span class="option-balance">{formatCurrency(account.balance)}</span
            >
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }

  .form-label {
    font-size: var(--text-sm-fs);
    color: var(--c-gray-darker);
  }

  /* ── Account picker ────────────────────────────────────────────────────── */
  .account-picker {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--s-4);
    border: var(--input-border-size) solid var(--input-border-ci);
    border-radius: var(--radius-lg);
    background: var(--input-bg-ci);
    cursor: pointer;
    min-height: var(--input-height);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    user-select: none;
    margin-bottom: var(--s-2);
  }

  .account-picker:hover {
    border-color: var(--c-gray-dark);
  }

  .account-picker:focus,
  .account-picker--open {
    outline: none;
    border-color: var(--c-blue);
    box-shadow: 0 0 0 3px rgba(22, 101, 216, 0.15);
  }

  .picker-selected {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    min-width: 0;
  }

  .picker-name {
    font-size: var(--text-fs);
    color: var(--c-gray-darkest);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 19px;
  }

  .picker-balance {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    height: 15px;
  }

  .picker-placeholder {
    font-size: var(--text-fs);
    color: var(--c-blue);
  }

  .picker-chevron {
    flex-shrink: 0;
    color: var(--text-light-fg-ci);
    margin-left: var(--s-2);
  }

  .picker-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--c-white);
    border: var(--border-size-thin) solid var(--border-ci);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    list-style: none;
    margin: 0;
    padding: var(--s-1) 0;
    z-index: var(--layer-3);
    max-height: 220px;
    overflow-y: auto;
  }

  .picker-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--s-3) var(--s-4);
    cursor: pointer;
    font-size: var(--text-sm-fs);
    transition: background-color 0.1s ease;
  }

  .picker-option:hover:not(.picker-option--disabled) {
    background-color: var(--c-gray-lighter);
  }

  .picker-option--selected {
    background-color: var(--c-blue-lightest);
    color: var(--c-blue);
  }

  .picker-option--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .option-name {
    font-weight: var(--fw-medium);
    color: var(--text-fg-ci);
  }

  .picker-option--selected .option-name {
    color: var(--c-blue);
  }

  .option-balance {
    font-size: var(--text-xs-fs);
    color: var(--text-light-fg-ci);
    margin-left: var(--s-3);
    flex-shrink: 0;
  }
</style>
