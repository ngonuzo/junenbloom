/**
 * Money helpers in integer cents (CAD).
 * Never use floating-point arithmetic for pricing (NFR-03 / T2.6 / ADR-011).
 */
export function formatCents(cents: number, options?: { showCad?: boolean }): string {
  const wholeDollars = cents % 100 === 0;
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: wholeDollars ? 0 : 2,
    maximumFractionDigits: wholeDollars ? 0 : 2,
  }).format(cents / 100);

  return options?.showCad ? `${formatted} CAD` : formatted;
}
