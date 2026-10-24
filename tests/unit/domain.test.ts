import { describe, it, expect } from "vitest";
import { formatPublicId } from "@/lib/domain/ids";
import { zoneForPostalCode } from "@/lib/domain/zones";
import { priceOrder, calculateRetainer } from "@/lib/domain/pricing";
import { routeInquiry, canAcceptInstall } from "@/lib/domain/rules";
import { isDateEligible } from "@/lib/domain/dates";
import { formatCents } from "@/lib/domain/money";

describe("June & Bloom Domain Services (BR-01 to BR-14)", () => {
  it("formats monthly public IDs as JB-YYMM-### (BR-01)", () => {
    const d = new Date("2026-10-23T12:00:00Z");
    expect(formatPublicId(d, 1)).toBe("JB-2610-001");
    expect(formatPublicId(d, 42)).toBe("JB-2610-042");
  });

  it("formats integer cents cleanly in CAD (T2.6)", () => {
    expect(formatCents(12000)).toBe("$120");
    expect(formatCents(12050)).toBe("$120.50");
  });

  it("resolves GTA postal prefixes to Core, Extended, Outer, or outside (FR-40 / BR-08)", () => {
    const core = zoneForPostalCode("m5v 2t6");
    expect(core.matched).toBe(true);
    expect(core.zone?.code).toBe("CORE");
    expect(core.zone?.feeCents).toBe(1500);

    const extended = zoneForPostalCode("L6J 1A1");
    expect(extended.matched).toBe(true);
    expect(extended.zone?.code).toBe("EXTENDED");
    expect(extended.zone?.feeCents).toBe(2500);

    const outer = zoneForPostalCode("L7N 2B2");
    expect(outer.matched).toBe(true);
    expect(outer.zone?.code).toBe("OUTER");
    expect(outer.zone?.feeCents).toBe(4500);

    const outside = zoneForPostalCode("K1A 0A6");
    expect(outside.matched).toBe(false);
    expect(outside.zone).toBeNull();
  });

  it("computes server-authoritative order totals, zone minimums, and free pickup (BR-08 / BR-12)", () => {
    const coreZone = zoneForPostalCode("M4W").zone;
    const deliveryTotals = priceOrder(
      [{ unitCents: 12000, qty: 1 }],
      coreZone,
      "delivery",
      false
    );
    expect(deliveryTotals.subtotalCents).toBe(12000);
    expect(deliveryTotals.deliveryCents).toBe(1500);
    expect(deliveryTotals.totalCents).toBe(13500);
    expect(deliveryTotals.meetsMinimum).toBe(true);

    const pickupTotals = priceOrder(
      [{ unitCents: 12000, qty: 1 }],
      coreZone,
      "pickup",
      true
    );
    expect(pickupTotals.deliveryCents).toBe(0);
    expect(pickupTotals.taxCents).toBe(1560); // 13% HST on $120.00
    expect(pickupTotals.totalCents).toBe(13560);
  });

  it("calculates 40% styling retainer and 60% balance to the cent (BR-02 / FR-64 / FR-65)", () => {
    const breakdown = calculateRetainer(42500);
    expect(breakdown.retainerCents).toBe(17000);
    expect(breakdown.balanceCents).toBe(25500);
    expect(breakdown.retainerCents + breakdown.balanceCents).toBe(42500);
  });

  it("routes >9ft trees and commercial inquiries to custom quote & 2 capacity slots (BR-04)", () => {
    const standard = routeInquiry({
      optionSlug: "decorating-only",
      treeHeightBand: "7_to_9ft",
      spaceCategory: "residential",
    });
    expect(standard.customQuote).toBe(false);
    expect(standard.slotsRequired).toBe(1);

    const tallTree = routeInquiry({
      optionSlug: "decorating-only",
      treeHeightBand: "over_9ft",
      spaceCategory: "residential",
    });
    expect(tallTree.customQuote).toBe(true);
    expect(tallTree.slotsRequired).toBe(2);

    const commercial = routeInquiry({
      optionSlug: "decorating-plus-sourcing",
      treeHeightBand: "7_to_9ft",
      spaceCategory: "commercial",
    });
    expect(commercial.customQuote).toBe(true);
    expect(commercial.slotsRequired).toBe(2);
  });

  it("enforces weekly (4) and seasonal (24) installation capacity caps (BR-05)", () => {
    expect(
      canAcceptInstall({
        weeklyBookedSlots: 2,
        seasonBookedSlots: 10,
        requestedSlots: 2,
      }).allowed
    ).toBe(true);

    expect(
      canAcceptInstall({
        weeklyBookedSlots: 3,
        seasonBookedSlots: 10,
        requestedSlots: 2,
      }).allowed
    ).toBe(false);

    expect(
      canAcceptInstall({
        weeklyBookedSlots: 0,
        seasonBookedSlots: 23,
        requestedSlots: 2,
      }).allowed
    ).toBe(false);
  });

  it("enforces lead time hours and blocked dates (BR-06 / BR-07)", () => {
    const now = new Date("2026-10-23T10:00:00");
    expect(isDateEligible("2026-10-23", 48, [], now).eligible).toBe(false);
    expect(isDateEligible("2026-10-27", 48, [], now).eligible).toBe(true);
    expect(isDateEligible("2026-10-27", 48, ["2026-10-27"], now).eligible).toBe(
      false
    );
  });
});
