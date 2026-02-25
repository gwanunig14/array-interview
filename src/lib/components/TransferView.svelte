<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EnrichedAccount, TransferSummary } from "$lib/types";
  import TransferFormCard from "./TransferFormCard.svelte";
  import TransferSummaryCard from "./TransferSummaryCard.svelte";
  import RecentTransfersCard from "./RecentTransfersCard.svelte";
  import type { EnrichedTransfer } from "./RecentTransfersCard.svelte";

  export let accounts: EnrichedAccount[];
  export let transfers: TransferSummary[];

  const dispatch = createEventDispatcher<{
    success: {
      amount: number;
      fromName: string;
      toName: string;
      date: string;
      confirmationId: string;
    };
    failure: { message: string };
  }>();

  let fromAccountId = "";
  let toAccountId = "";
  let amount = "";

  $: fromAccount = accounts.find((a) => a.account_id === fromAccountId);
  $: toAccount = accounts.find((a) => a.account_id === toAccountId);

  $: amountNum = parseFloat(amount);

  $: newFromBalance =
    fromAccount && !isNaN(amountNum) && amountNum > 0
      ? fromAccount.balance - amountNum
      : null;

  $: newToBalance =
    toAccount && !isNaN(amountNum) && amountNum > 0
      ? toAccount.balance + amountNum
      : null;

  $: enrichedTransfers = transfers.map((t): EnrichedTransfer => {
    const srcAccount = accounts.find(
      (a) => a.account_number === t.source_account.account_number,
    );
    const dstAccount = accounts.find(
      (a) => a.account_number === t.destination_account.account_number,
    );
    return {
      ...t,
      sourceDisplayName:
        srcAccount?.displayName ?? t.source_account.institution_name,
      destDisplayName:
        dstAccount?.displayName ?? t.destination_account.institution_name,
    };
  });
</script>

<div class="transfer-layout">
  <TransferFormCard
    {accounts}
    bind:fromAccountId
    bind:toAccountId
    bind:amount
    on:success={(e) => dispatch("success", e.detail)}
    on:failure={(e) => dispatch("failure", e.detail)}
  />

  <div class="right-panel">
    <TransferSummaryCard
      {fromAccount}
      {toAccount}
      {amountNum}
      {newFromBalance}
      {newToBalance}
    />
    <RecentTransfersCard transfers={enrichedTransfers} />
  </div>
</div>

<style>
  .transfer-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-6);
    align-items: start;
  }

  @media (max-width: 860px) {
    .transfer-layout {
      grid-template-columns: 1fr;
    }
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
  }
</style>
