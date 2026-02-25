<script lang="ts">
  import "../app.css";
  import AccountsView from "$lib/components/AccountsView.svelte";
  import TransferView from "$lib/components/TransferView.svelte";
  import { enrichAccounts } from "$lib/mockData";
  import type { PageData } from "./$types";
  import type { View } from "$lib/types";
  import logo from "$lib/assets/logo.svg";
  import ComponentWrapper from "$lib/components/ComponentWrapper.svelte";

  export let data: PageData;

  $: enrichedAccounts = enrichAccounts(data.accounts.accounts);
  $: transfers = data.transfers.transfers;

  let activeView: View = "accounts";

  function setView(view: View) {
    activeView = view;
  }
</script>

<div class="page-shell">
  <ComponentWrapper card>
    <div class="app-header__inner">
      <div class="app-header__brand">
        <img src={logo} alt="NorthWind" class="app-header__logo" />
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

    <main class="page-content" id="main-content">
      {#if activeView === "accounts"}
        <AccountsView accounts={enrichedAccounts} error={data.loadError} />
      {:else}
        <TransferView accounts={enrichedAccounts} {transfers} />
      {/if}
    </main>
  </ComponentWrapper>
</div>

<style>
  .page-shell {
    min-height: 100vh;
    background-color: var(--c-gray-lighter);
    color: var(--text-fg-ci);
    padding: var(--s-6);
  }

  /* Header */
  .app-header__inner {
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--s-6);
  }

  .app-header__brand {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .app-header__logo {
    height: 20px;
    width: auto;
    display: block;
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
    padding: var(--s-6) 0 0;
  }

  @media (max-width: 640px) {
    .page-content {
      padding: var(--s-5) var(--s-4);
    }
  }
</style>
