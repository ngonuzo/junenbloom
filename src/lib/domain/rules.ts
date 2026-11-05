export type TreeHeightBand = "under_7ft" | "7_to_9ft" | "over_9ft";
export type SpaceCategory = "residential" | "commercial";

export interface InquiryRoutingInput {
  optionSlug: string;
  treeHeightBand: TreeHeightBand;
  spaceCategory: SpaceCategory;
}

export interface InquiryRoutingResult {
  customQuote: boolean;
  slotsRequired: number;
  reason: string;
}

/**
 * BR-04 / FR-61: Trees over 9 ft and commercial spaces route to custom quote and use 2 capacity slots.
 */
export function routeInquiry(input: InquiryRoutingInput): InquiryRoutingResult {
  const isOver9Ft = input.treeHeightBand === "over_9ft";
  const isCommercial = input.spaceCategory === "commercial";
  const isFullService = input.optionSlug === "full-service-holiday";

  if (isOver9Ft || isCommercial) {
    return {
      customQuote: true,
      slotsRequired: 2,
      reason: isOver9Ft
        ? "Trees over 9 ft need more hands and take two installation slots."
        : "Business spaces take two installation slots.",
    };
  }

  if (isFullService) {
    return {
      customQuote: true,
      slotsRequired: 2,
      reason: "Custom Service includes sourcing and styling across several rooms.",
    };
  }

  return {
    customQuote: false,
    slotsRequired: 1,
    reason: "A standard home installation.",
  };
}

/**
 * BR-05 / FR-66: Weekly install cap (default 4) and season cap (default 24).
 */
export function canAcceptInstall(params: {
  weeklyBookedSlots: number;
  seasonBookedSlots: number;
  requestedSlots: number;
  weeklyCap?: number;
  seasonCap?: number;
}): { allowed: boolean; waitlistReason: string | null } {
  const weeklyCap = params.weeklyCap ?? 4;
  const seasonCap = params.seasonCap ?? 24;

  if (params.seasonBookedSlots + params.requestedSlots > seasonCap) {
    return {
      allowed: false,
      waitlistReason: "Our styling calendar is full for the season. We can add you to the waitlist.",
    };
  }

  if (params.weeklyBookedSlots + params.requestedSlots > weeklyCap) {
    return {
      allowed: false,
      waitlistReason: "That week is fully booked. Please choose another week, or join the waitlist.",
    };
  }

  return {
    allowed: true,
    waitlistReason: null,
  };
}
