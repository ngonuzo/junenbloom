import { describe, expect, it } from "vitest";
import { createInitialStore, dayIso, ensureRollingSlots } from "@/lib/db/store";

const NOW = new Date("2026-11-05T15:00:00");

function emptyStore() {
  const s = createInitialStore();
  s.slots = [];
  s.settings.boardWindows = [
    { label: "Morning", capacity: 6 },
    { label: "Afternoon", capacity: 4 },
  ];
  s.settings.boardDaysAhead = 14;
  return s;
}

describe("ensureRollingSlots (FR-86)", () => {
  it("creates one slot per window for today through the booking horizon", () => {
    const s = emptyStore();
    expect(ensureRollingSlots(s, NOW)).toBe(true);
    expect(s.slots).toHaveLength(15 * 2);
    expect(s.slots[0]).toMatchObject({ day: dayIso(0, NOW), window: "Morning", capacity: 6, booked: 0 });
    expect(s.slots.at(-1)).toMatchObject({ day: dayIso(14, NOW), window: "Afternoon", capacity: 4 });
  });

  it("does nothing the second time", () => {
    const s = emptyStore();
    ensureRollingSlots(s, NOW);
    expect(ensureRollingSlots(s, NOW)).toBe(false);
    expect(s.slots).toHaveLength(30);
  });

  it("keeps per-day changes and bookings", () => {
    const s = emptyStore();
    ensureRollingSlots(s, NOW);
    s.slots[0].capacity = 2;
    s.slots[0].booked = 2;
    s.slots[1].blocked = true;
    ensureRollingSlots(s, new Date("2026-11-06T15:00:00"));
    expect(s.slots.find((x) => x.id === s.slots[0].id)).toMatchObject({ capacity: 2, booked: 2 });
    expect(s.slots.some((x) => x.blocked)).toBe(true);
  });

  it("tidies away old unbooked slots but keeps booked ones", () => {
    const s = emptyStore();
    s.slots.push(
      { id: "old-empty", day: dayIso(-90, NOW), window: "Morning", capacity: 6, booked: 0, blocked: false },
      { id: "old-booked", day: dayIso(-90, NOW), window: "Morning", capacity: 6, booked: 3, blocked: false }
    );
    ensureRollingSlots(s, NOW);
    expect(s.slots.some((x) => x.id === "old-empty")).toBe(false);
    expect(s.slots.some((x) => x.id === "old-booked")).toBe(true);
  });
});
