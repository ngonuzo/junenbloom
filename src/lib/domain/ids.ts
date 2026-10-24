/**
 * Order and Inquiry public ID generator: JB-YYMM-### (BR-01 / FR-15).
 * Sequence resets monthly.
 */
export function formatYearMonth(date: Date = new Date()): string {
  const yy = String(date.getUTCFullYear()).slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}${mm}`;
}

export function formatPublicId(date: Date, sequenceNumber: number): string {
  const yymm = formatYearMonth(date);
  const seq = String(Math.max(1, sequenceNumber)).padStart(3, "0");
  return `JB-${yymm}-${seq}`;
}
