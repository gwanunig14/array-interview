<script lang="ts">
  import "../app.css";
  import ComponentWrapper from "../lib/components/ComponentWrapper.svelte";
  import type { PageData } from "./$types";
  import type { AccountSummary } from "$lib/server/northwind";

  export let data: PageData;

  const accounts = data.accounts.accounts.filter(
    (account: AccountSummary) =>
      account.account_holder_name === "Robert Thompson",
  );

  let total = 0;
  accounts.forEach((ac) => {
    total += ac.balance;
  });

  console.log(data.transfers);
</script>

<ComponentWrapper card>
  <div>{total}</div>
</ComponentWrapper>
<ComponentWrapper card>
  {#each accounts as account (account.account_id)}
    <div>{account.account_type}</div>
    <div>{account.balance}</div>
    <div>{account.account_status}</div>
  {/each}
</ComponentWrapper>
<ComponentWrapper card></ComponentWrapper>
