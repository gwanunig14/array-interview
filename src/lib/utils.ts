/** Format a number as a USD (or given currency) string. */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Format a date string as "Mon D" (e.g. "Feb 3"). Handles both date-only
 *  strings ("2026-02-03") and full ISO timestamps ("2026-02-03T13:52:38Z"). */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  // Only append a local-noon time if the string is a bare date (no "T") to
  // avoid the Date constructor interpreting it as UTC midnight and shifting
  // it into the previous day in negative-offset timezones.
  const d = dateStr.includes("T")
    ? new Date(dateStr)
    : new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
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
