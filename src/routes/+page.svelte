<script lang="ts">
  import "../app.css";
  import AccountsView from "$lib/components/AccountsView.svelte";
  import TransferView from "$lib/components/TransferView.svelte";
  import { enrichAccounts } from "$lib/mockData";
  import type { PageData } from "./$types";
  import type { View } from "$lib/types";

  export let data: PageData;

  $: enrichedAccounts = enrichAccounts(data.accounts.accounts);
  $: transfers = data.transfers.transfers;

  let activeView: View = "accounts";

  function setView(view: View) {
    activeView = view;
  }
</script>

<div class="page-shell">
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <span class="app-header__logo" aria-hidden="true">🏦</span>
        <span class="app-header__name">NorthWind Bank</span>
      </div>

      <nav aria-label="Main navigation">
        <ul class="nav-tabs" role="list">
          <li>
            <button
              class="nav-tab"
              class:nav-tab--active={activeView === "accounts"}
              aria-current={activeView === "accounts" ? "page" : undefined}
              on:click={() => setView("accounts")}
            >
              Accounts
            </button>
          </li>
          <li>
            <button
              class="nav-tab"
              class:nav-tab--active={activeView === "transfer"}
              aria-current={activeView === "transfer" ? "page" : undefined}
              on:click={() => setView("transfer")}
            >
              Transfer
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <main class="page-content" id="main-content">
    {#if activeView === "accounts"}
      <AccountsView accounts={enrichedAccounts} error={data.loadError} />
    {:else}
      <TransferView accounts={enrichedAccounts} {transfers} />
    {/if}
  </main>
</div>

<style>
  .page-shell {
    min-height: 100vh;
    background-color: var(--c-gray-lighter);
    font-family: var(--text-font), system-ui, sans-serif;
    color: var(--text-fg-ci);
  }

  /* Header */
  .app-header {
    background-color: var(--c-white);
    border-bottom: var(--border-size-thin) solid var(--border-ci-light);
    position: sticky;
    top: 0;
    z-index: var(--layer-2);
  }

  .app-header__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--s-6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .app-header__brand {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .app-header__logo {
    font-size: 1.25rem;
    line-height: 1;
  }

  .app-header__name {
    font-size: var(--title-fs);
    font-weight: var(--fw-semi-bold);
    color: var(--c-blue);
    letter-spacing: -0.01em;
  }

  /* Nav tabs */
  .nav-tabs {
    display: flex;
    align-items: center;
    gap: var(--s-1);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-tab {
    display: inline-flex;
    align-items: center;
    padding: var(--s-2) var(--s-4);
    border-radius: var(--radius-md);
    border: none;
    background: transparent;
    font-family: var(--text-font), system-ui, sans-serif;
    font-size: var(--text-sm-fs);
    font-weight: var(--fw-medium);
    color: var(--text-light-fg-ci);
    cursor: pointer;
    transition:
      background-color 0.12s ease,
      color 0.12s ease;
  }

  .nav-tab:hover {
    background-color: var(--c-gray-lighter);
    color: var(--text-fg-ci);
  }

  .nav-tab--active {
    background-color: var(--c-blue-lightest);
    color: var(--c-blue);
  }

  .nav-tab:focus-visible {
    outline: 3px solid var(--c-blue);
    outline-offset: 2px;
  }

  /* Main content */
  .page-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--s-8) var(--s-6);
  }

  @media (max-width: 640px) {
    .page-content {
      padding: var(--s-5) var(--s-4);
    }
  }
</style>
