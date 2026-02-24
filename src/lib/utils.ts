/** Format a number as a USD (or given currency) string. */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Format a date string as "Mon D" (e.g. "Feb 3"). */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}

/** Format a date string as "Mon D, YYYY" (e.g. "Feb 3, 2026"). */
export function formatDateLong(dateStr: string): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}
