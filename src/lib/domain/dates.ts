/**
 * Lead time and date eligibility rules (BR-06: 48h boards, BR-07: 72h gifts).
 */
export function isDateEligible(
  serviceDateIso: string,
  leadTimeHours: number,
  blockedDates: string[] = [],
  now: Date = new Date()
): { eligible: boolean; reason?: string } {
  if (!serviceDateIso) {
    return { eligible: false, reason: "Select a delivery or pickup date." };
  }

  if (blockedDates.includes(serviceDateIso)) {
    return { eligible: false, reason: "Our studio is closed for fulfilment on this date." };
  }

  const target = new Date(`${serviceDateIso}T12:00:00`);
  if (Number.isNaN(target.getTime())) {
    return { eligible: false, reason: "Invalid date format." };
  }

  const minTimeMs = now.getTime() + leadTimeHours * 60 * 60 * 1000;
  if (target.getTime() < minTimeMs) {
    return {
      eligible: false,
      reason: `Requires at least ${leadTimeHours} hours lead time. For rush requests, please message us directly.`,
    };
  }

  return { eligible: true };
}

export function generateUpcomingDates(
  count: number = 14,
  leadTimeHours: number = 48,
  blockedDates: string[] = [],
  now: Date = new Date()
): Array<{ iso: string; label: string; shortLabel: string; eligible: boolean }> {
  const results: Array<{ iso: string; label: string; shortLabel: string; eligible: boolean }> = [];
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const check = isDateEligible(iso, leadTimeHours, blockedDates, now);
    const label = d.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const shortLabel = d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    });
    results.push({
      iso,
      label,
      shortLabel,
      eligible: check.eligible,
    });
  }

  return results;
}
