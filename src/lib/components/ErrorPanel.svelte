<script lang="ts">
  /** Bold heading shown above the detail message. */
  export let title: string = "Something went wrong";

  /** Detail message text. */
  export let message: string = "";
</script>

<div class="state-panel state-panel--error" role="alert">
  <p class="state-panel__title">{title}</p>
  {#if message}
    <p>{message}</p>
  {/if}
</div>

<style>
  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--s-3);
    padding: var(--s-12) var(--s-6);
    text-align: center;
    color: var(--text-light-fg-ci);
    font-size: var(--text-sm-fs);
  }

  .state-panel--error {
    background-color: var(--c-red-lighter);
    border: var(--border-size-thin) solid var(--c-red-light);
    border-radius: var(--radius-xl);
    color: var(--c-red-dark);
  }

  .state-panel__title {
    font-weight: var(--fw-semi-bold);
    font-size: var(--text-fs);
    margin: 0;
  }

  .state-panel p:not(.state-panel__title) {
    margin: 0;
  }
</style>
