<script lang="ts">
  /** Visual variant — drives colour scheme and aria-live value. */
  export let variant: "success" | "error";

  /** Optional bold heading displayed above the message. */
  export let title: string = "";

  /** Primary message text. */
  export let message: string = "";

  /**
   * Optional confirmation/reference ID shown at the bottom.
   * Only rendered when non-empty.
   */
  export let refId: string = "";

  /**
   * Optional HTML id attribute — useful when another element needs to
   * reference this alert via aria-describedby.
   */
  export let id: string = "";
</script>

<div
  {id}
  class="alert"
  class:alert--success={variant === "success"}
  class:alert--error={variant === "error"}
  role="alert"
  aria-live={variant === "success" ? "polite" : "assertive"}
>
  {#if title}
    <p class="alert__title">{title}</p>
  {/if}
  {#if message}
    <p>{message}</p>
  {/if}
  <slot />
  {#if refId}
    <p class="alert__ref">Reference: <code>{refId}</code></p>
  {/if}
</div>

<style>
  .alert {
    border-radius: var(--radius-lg);
    padding: var(--s-4) var(--s-5);
    margin-bottom: var(--s-5);
    font-size: var(--text-sm-fs);
  }

  .alert :global(p) {
    margin: 0;
  }

  .alert :global(p + p) {
    margin-top: var(--s-1);
  }

  .alert__title {
    font-weight: var(--fw-semi-bold);
    font-size: var(--text-fs);
    margin: 0 0 var(--s-1);
  }

  .alert__ref {
    margin-top: var(--s-2);
    color: inherit;
    opacity: 0.8;
  }

  .alert__ref code {
    font-family: ui-monospace, monospace;
    font-size: var(--text-xs-fs);
  }

  .alert--success {
    background-color: var(--c-green-light);
    color: var(--c-green-dark);
    border: var(--border-size-thin) solid var(--c-green);
  }

  .alert--error {
    background-color: var(--c-red-lighter);
    color: var(--c-red-dark);
    border: var(--border-size-thin) solid var(--c-red-light);
  }
</style>
