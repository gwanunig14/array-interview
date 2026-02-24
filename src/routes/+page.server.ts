import { northwind } from "$lib/server/northwind";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [accountsResponse, transfersResponse] = await Promise.all([
    northwind.accounts.list({ limit: 100 }),
    northwind.transfers.list(),
  ]);

  console.log("=== /external/accounts ===");
  console.log(JSON.stringify(accountsResponse, null, 2));

  console.log("=== /external/transfers ===");
  console.log(JSON.stringify(transfersResponse, null, 2));

  return {
    accounts: accountsResponse,
    transfers: transfersResponse,
  };
};
