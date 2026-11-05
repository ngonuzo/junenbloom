export interface DeliveryZone {
  code: "CORE" | "EXTENDED" | "OUTER";
  name: string;
  areasSummary: string;
  feeCents: number;
  minOrderCents: number;
  quoteOnly: boolean;
  deliveryDays: string;
}

export interface PostalLookupResult {
  normalizedPrefix: string;
  matched: boolean;
  zone: DeliveryZone | null;
  earliestWindowLabel: string;
  message: string;
}

export const DEFAULT_ZONES: DeliveryZone[] = [
  {
    code: "CORE",
    name: "Toronto",
    areasSummary: "Downtown, Midtown, North York, Etobicoke, Scarborough and York",
    feeCents: 1500,
    minOrderCents: 10000,
    quoteOnly: false,
    deliveryDays: "Monday to Saturday (limited Sunday window)",
  },
  {
    code: "EXTENDED",
    name: "Surrounding GTA",
    areasSummary: "Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill, Pickering and Ajax",
    feeCents: 2500,
    minOrderCents: 12000,
    quoteOnly: false,
    deliveryDays: "Monday to Saturday (limited Sunday window)",
  },
  {
    code: "OUTER",
    name: "Outer GTA",
    areasSummary: "Burlington, Milton, Aurora, Newmarket, King, Whitby and Oshawa",
    feeCents: 4500,
    minOrderCents: 15000,
    quoteOnly: false,
    deliveryDays: "Monday to Saturday (limited Sunday window)",
  },
];

export const DEFAULT_PREFIX_MAP: Record<string, DeliveryZone["code"]> = {
  // Toronto (M1 to M9) -> CORE
  M1: "CORE",
  M2: "CORE",
  M3: "CORE",
  M4: "CORE",
  M5: "CORE",
  M6: "CORE",
  M7: "CORE",
  M8: "CORE",
  M9: "CORE",
  // Extended GTA (Peel / York / Durham inner FSA prefixes)
  L3P: "EXTENDED",
  L3R: "EXTENDED",
  L3S: "EXTENDED",
  L3T: "EXTENDED",
  L4B: "EXTENDED",
  L4C: "EXTENDED",
  L4E: "EXTENDED",
  L4H: "EXTENDED",
  L4J: "EXTENDED",
  L4K: "EXTENDED",
  L4L: "EXTENDED",
  L4S: "EXTENDED",
  L4T: "EXTENDED",
  L4V: "EXTENDED",
  L4W: "EXTENDED",
  L4X: "EXTENDED",
  L4Y: "EXTENDED",
  L4Z: "EXTENDED",
  L5A: "EXTENDED",
  L5B: "EXTENDED",
  L5C: "EXTENDED",
  L5E: "EXTENDED",
  L5G: "EXTENDED",
  L5H: "EXTENDED",
  L5J: "EXTENDED",
  L5K: "EXTENDED",
  L5L: "EXTENDED",
  L5M: "EXTENDED",
  L5N: "EXTENDED",
  L5R: "EXTENDED",
  L5S: "EXTENDED",
  L5T: "EXTENDED",
  L5V: "EXTENDED",
  L5W: "EXTENDED",
  L6A: "EXTENDED",
  L6B: "EXTENDED",
  L6C: "EXTENDED",
  L6E: "EXTENDED",
  L6G: "EXTENDED",
  L6H: "EXTENDED",
  L6J: "EXTENDED",
  L6K: "EXTENDED",
  L6L: "EXTENDED",
  L6M: "EXTENDED",
  L6P: "EXTENDED",
  L6R: "EXTENDED",
  L6S: "EXTENDED",
  L6T: "EXTENDED",
  L6V: "EXTENDED",
  L6W: "EXTENDED",
  L6X: "EXTENDED",
  L6Y: "EXTENDED",
  L6Z: "EXTENDED",
  L1S: "EXTENDED",
  L1T: "EXTENDED",
  L1V: "EXTENDED",
  L1W: "EXTENDED",
  L1X: "EXTENDED",
  L1Z: "EXTENDED",
  // Outer GTA
  L1G: "OUTER",
  L1H: "OUTER",
  L1J: "OUTER",
  L1K: "OUTER",
  L1L: "OUTER",
  L1M: "OUTER",
  L1N: "OUTER",
  L1P: "OUTER",
  L1R: "OUTER",
  L3X: "OUTER",
  L3Y: "OUTER",
  L4G: "OUTER",
  L7B: "OUTER",
  L7E: "OUTER",
  L7L: "OUTER",
  L7M: "OUTER",
  L7N: "OUTER",
  L7P: "OUTER",
  L7R: "OUTER",
  L7S: "OUTER",
  L7T: "OUTER",
  L9T: "OUTER",
};

export function normalizePostalPrefix(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 3);
}

export function zoneForPostalCode(
  rawPostalCode: string,
  zones: DeliveryZone[] = DEFAULT_ZONES,
  prefixMap: Record<string, DeliveryZone["code"]> = DEFAULT_PREFIX_MAP
): PostalLookupResult {
  const prefix = normalizePostalPrefix(rawPostalCode);
  if (prefix.length < 3) {
    return {
      normalizedPrefix: prefix,
      matched: false,
      zone: null,
      earliestWindowLabel: "",
      message: "Enter at least the first three characters, for example M5V.",
    };
  }

  const exactCode = prefixMap[prefix] ?? prefixMap[prefix.slice(0, 2)];
  if (!exactCode) {
    return {
      normalizedPrefix: prefix,
      matched: false,
      zone: null,
      earliestWindowLabel: "By arrangement",
      message:
        "This postal code is outside our delivery area. Pickup is always available, or message us and we will see what we can arrange.",
    };
  }

  const zone = zones.find((z) => z.code === exactCode) ?? null;
  if (!zone) {
    return {
      normalizedPrefix: prefix,
      matched: false,
      zone: null,
      earliestWindowLabel: "",
      message: "Outside our standard GTA delivery area.",
    };
  }

  return {
    normalizedPrefix: prefix,
    matched: true,
    zone,
    earliestWindowLabel: zone.deliveryDays,
    message: `We deliver to ${prefix}.`,
  };
}
