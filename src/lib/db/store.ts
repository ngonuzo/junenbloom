import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DEFAULT_ZONES, DEFAULT_PREFIX_MAP, type DeliveryZone } from "../domain/zones";
import { formatPublicId } from "../domain/ids";
import { calculateRetainer } from "../domain/pricing";
import { SEED_PRODUCTS } from "./seed-products";

export type ProductType = "gift" | "board" | "styling";
export type ProductStatus = "live" | "sample" | "hidden" | "archived";

export interface ProductOption {
  id: string;
  label: string;
  serves?: string;
  priceCents: number;
  stockOnHand: number;
}

/**
 * Owned photography (DR-17). Order matters: [0] is the cover, [1] shows what is
 * inside, [2+] are details. Products without images show the placeholder (DR-18).
 */
export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position used when a slot crops the photo, e.g. "50% 40%". */
  focal?: string;
  /** Short line shown beneath the photo on the product page. */
  caption?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  categorySlug: string;
  categoryName: string;
  type: ProductType;
  status: ProductStatus;
  priceCents: number;
  priceIsFrom: boolean;
  shortDescription: string;
  contents: string[];
  allergens: string[];
  leadTimeHours: number;
  trackStock: boolean;
  stockOnHand: number;
  lowStockThreshold: number;
  featured: boolean;
  aspectRatio: "4:5" | "3:2";
  tone: "emerald" | "sage" | "cream";
  motif: "vessel" | "linen" | "hearth" | "board" | "tree" | "botanical";
  includes?: string[];
  excludes?: string[];
  /** Optional line shown under the short description (styling options). */
  note?: string;
  images?: ProductImage[];
  options: ProductOption[];
}

/** A charcuterie delivery or pickup window offered every day (FR-50, FR-86). */
export interface BoardWindow {
  label: string;
  capacity: number;
}

export const DEFAULT_BOARD_WINDOWS: BoardWindow[] = [
  { label: "11:00 AM – 1:00 PM", capacity: 6 },
  { label: "1:30 PM – 3:30 PM", capacity: 6 },
  { label: "4:00 PM – 6:00 PM", capacity: 6 },
];

export const DEFAULT_BOARD_DAYS_AHEAD = 21;

export interface BoardSlot {
  id: string;
  day: string; // YYYY-MM-DD
  window: string;
  capacity: number;
  booked: number;
  blocked: boolean;
}

export type OrderStatus =
  | "awaiting_payment"
  | "received"
  | "preparing"
  | "ready"
  | "out"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItemRecord {
  productId: string;
  productSlug: string;
  optionId?: string;
  nameSnapshot: string;
  optionLabel?: string;
  qty: number;
  unitCents: number;
}

export interface OrderRecord {
  id: string;
  publicId: string;
  token: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfilment: "delivery" | "pickup";
  postalCode: string;
  zoneCode: DeliveryZone["code"] | "PICKUP";
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  serviceDate: string;
  window: string;
  slotId?: string;
  giftNote: string;
  allergyNotes: string;
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  totalCents: number;
  status: OrderStatus;
  needsAttention: boolean;
  attentionReason?: string;
  owner: "June (Curator)" | "Bloom (Styling & Ops)";
  items: OrderItemRecord[];
  createdAt: string;
  events: Array<{ at: string; event: string; note?: string }>;
}

export type InquiryStatus =
  | "new"
  | "consult"
  | "quote_sent"
  | "accepted"
  | "retainer_paid"
  | "scheduled"
  | "installed"
  | "balance_paid"
  | "done";

export interface StylingInquiryRecord {
  id: string;
  publicId: string;
  optionSlug: string;
  optionName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  areaAndPostal: string;
  spaceCategory: "residential" | "commercial";
  treeHeightBand: "under_7ft" | "7_to_9ft" | "over_9ft";
  treeSupply: "client_owned" | "source_for_me";
  preferredDates: string[];
  palette: string;
  addOns: string[];
  budgetBand: string;
  notes: string;
  customQuote: boolean;
  slotsRequired: number;
  status: InquiryStatus;
  owner: "June (Curator)" | "Bloom (Styling & Ops)";
  quoteTotalCents?: number;
  retainerCents?: number;
  balanceCents?: number;
  quoteToken?: string;
  createdAt: string;
}

export interface SiteSettings {
  giftingOpen: boolean;
  charcuterieOpen: boolean;
  stylingOpen: boolean;
  takedownStorageOpen: boolean;
  taxMode: boolean;
  bannerText: string;
  pickupAddress: string;
  pickupHours: string;
  boardLeadTimeHours: number;
  giftLeadTimeHours: number;
  weeklyInstallSlots: number;
  seasonCap: number;
  notifyEmails: string[];
  blockedDates: string[];
  /** Windows created for every upcoming day, with how many boards each can take. */
  boardWindows: BoardWindow[];
  /** How many days ahead board slots are kept open for booking. */
  boardDaysAhead: number;
}

export interface StoreState {
  /** Seed content version; see migrateStore. */
  seedVersion?: number;
  sequenceCounter: number;
  settings: SiteSettings;
  zones: DeliveryZone[];
  prefixMap: Record<string, DeliveryZone["code"]>;
  products: Product[];
  slots: BoardSlot[];
  orders: OrderRecord[];
  inquiries: StylingInquiryRecord[];
  waitlistEntries: Array<{
    id: string;
    email: string;
    name: string;
    productSlug: string;
    createdAt: string;
  }>;
  contactMessages: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    topic: string;
    message: string;
    createdAt: string;
  }>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "jb-store.json");

/** Calendar date (YYYY-MM-DD) `offset` days from today, matching generateUpcomingDates. */
export function dayIso(offset = 0, now: Date = new Date()): string {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function windowKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Keeps board slots rolling forward (FR-86): every day from today to the booking
 * horizon has one slot per window in the template. Existing slots, bookings and
 * per-day changes are never touched. Old unbooked slots are tidied away.
 * Returns true when anything changed.
 */
export function ensureRollingSlots(state: StoreState, now: Date = new Date()): boolean {
  const windows = state.settings.boardWindows?.length ? state.settings.boardWindows : DEFAULT_BOARD_WINDOWS;
  const daysAhead = state.settings.boardDaysAhead || DEFAULT_BOARD_DAYS_AHEAD;
  const have = new Set(state.slots.map((s) => `${s.day}|${s.window}`));
  let changed = false;

  for (let i = 0; i <= daysAhead; i++) {
    const day = dayIso(i, now);
    for (const w of windows) {
      if (!have.has(`${day}|${w.label}`)) {
        state.slots.push({
          id: `slot-${day}-${windowKey(w.label)}`,
          day,
          window: w.label,
          capacity: w.capacity,
          booked: 0,
          blocked: false,
        });
        have.add(`${day}|${w.label}`);
        changed = true;
      }
    }
  }

  const cutoff = dayIso(-60, now);
  const before = state.slots.length;
  state.slots = state.slots.filter((s) => s.day >= cutoff || s.booked > 0);
  if (state.slots.length !== before) changed = true;

  if (changed) {
    const order = new Map(windows.map((w, i) => [w.label, i]));
    state.slots.sort((a, b) =>
      a.day === b.day ? (order.get(a.window) ?? 99) - (order.get(b.window) ?? 99) : a.day < b.day ? -1 : 1
    );
  }
  return changed;
}

function buildInitialSlots(): BoardSlot[] {
  const slots: BoardSlot[] = [];
  return slots;
}

export function createInitialStore(): StoreState {
  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    seedVersion: SEED_VERSION,
    sequenceCounter: 18,
    settings: {
      giftingOpen: true,
      charcuterieOpen: true,
      stylingOpen: true,
      takedownStorageOpen: true,
      taxMode: false,
      bannerText: "Holiday styling dates for 2026 are open. Gift boxes and charcuterie board pickup available.",
      pickupAddress: "Pickup address to be confirmed by the founders",
      pickupHours: "Monday to Saturday, 10 am to 5:30 pm\nSunday, 4 to 6 pm",
      boardLeadTimeHours: 48,
      giftLeadTimeHours: 72,
      weeklyInstallSlots: 4,
      seasonCap: 24,
      notifyEmails: ["sister1@juneandbloomlifestyle.com", "sister2@juneandbloomlifestyle.com"],
      blockedDates: [],
      boardWindows: DEFAULT_BOARD_WINDOWS.map((w) => ({ ...w })),
      boardDaysAhead: DEFAULT_BOARD_DAYS_AHEAD,
    },
    zones: DEFAULT_ZONES,
    prefixMap: DEFAULT_PREFIX_MAP,
    products: SEED_PRODUCTS.map((p) => ({ ...p, options: p.options.map((o) => ({ ...o })) })),
    slots: buildInitialSlots(),
    orders: [
      {
        id: "ord-demo-1",
        publicId: "JB-2610-016",
        token: "demo-token-016",
        customerName: "Claire Vance",
        customerEmail: "claire.vance@example.com",
        customerPhone: "416-555-0192",
        fulfilment: "delivery",
        postalCode: "M4W 1A8",
        zoneCode: "CORE",
        recipientName: "Julian & Marcus Vance",
        recipientPhone: "416-555-0144",
        addressLine: "88 Roxborough St E",
        city: "Toronto",
        serviceDate: todayIso,
        window: "1:30 PM – 4:30 PM",
        giftNote: "Wishing you both the warmest first autumn in Rosedale. With love, Claire.",
        allergyNotes: "None",
        subtotalCents: 16500,
        deliveryCents: 1500,
        taxCents: 0,
        totalCents: 18000,
        status: "preparing",
        needsAttention: false,
        owner: "June (Curator)",
        items: [
          {
            productId: "prod-sig-family",
            productSlug: "signature-family-box",
            optionId: "opt-family-standard",
            nameSnapshot: "The Signature Family Box",
            optionLabel: "Classic, six pieces",
            qty: 1,
            unitCents: 16500,
          },
        ],
        createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        events: [
          { at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), event: "Order paid via Stripe Checkout" },
          { at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), event: "Advanced to Preparing by June" },
        ],
      },
      {
        id: "ord-demo-2",
        publicId: "JB-2610-017",
        token: "demo-token-017",
        customerName: "Devon Sterling",
        customerEmail: "d.sterling@example.com",
        customerPhone: "416-555-0188",
        fulfilment: "pickup",
        postalCode: "L6J 3W2",
        zoneCode: "PICKUP",
        recipientName: "Devon Sterling",
        recipientPhone: "416-555-0188",
        addressLine: "Studio pickup",
        city: "Toronto",
        serviceDate: todayIso,
        window: "4:00 PM – 6:00 PM",
        slotId: "slot-demo",
        giftNote: "Happy anniversary, my love.",
        allergyNotes: "No walnuts please · almonds & pistachios are fine.",
        subtotalCents: 15500,
        deliveryCents: 0,
        taxCents: 0,
        totalCents: 15500,
        status: "received",
        needsAttention: false,
        owner: "Bloom (Styling & Ops)",
        items: [
          {
            productId: "board-gathering",
            productSlug: "gathering-board",
            optionId: "opt-board-m",
            nameSnapshot: "The Gathering Board",
            optionLabel: "Medium, serves 8 to 10",
            qty: 1,
            unitCents: 15500,
          },
        ],
        createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
        events: [
          { at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), event: "Order paid via Stripe Checkout" },
        ],
      },
    ],
    inquiries: [
      {
        id: "inq-demo-1",
        publicId: "JB-2610-018",
        optionSlug: "decorating-plus-sourcing",
        optionName: "Decorating plus sourcing",
        customerName: "Elena Rostova",
        customerEmail: "elena@rostovastudio.ca",
        customerPhone: "647-555-0130",
        areaAndPostal: "Oakville · L6J 4Z2",
        spaceCategory: "residential",
        treeHeightBand: "7_to_9ft",
        treeSupply: "client_owned",
        preferredDates: ["2026-11-21", "2026-11-22"],
        palette: "Champagne gold, deep forest velvet & dried magnolia",
        addOns: ["Mantle & staircase garland", "Signature gift wrapping"],
        budgetBand: "$900 – $1,400",
        notes: "9 ft Balsam Hill Fraser Fir in the formal living room. Two friendly golden retrievers at home.",
        customQuote: false,
        slotsRequired: 1,
        status: "quote_sent",
        owner: "Bloom (Styling & Ops)",
        quoteTotalCents: 95000,
        retainerCents: 38000,
        balanceCents: 57000,
        quoteToken: "quote-token-018",
        createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
      },
    ],
    waitlistEntries: [],
    contactMessages: [],
  };
}

const SEED_VERSION = 14;

/** Earlier seed values; a setting still holding one of these is refreshed to the current seed. */
const LEGACY_SEED_SETTINGS: Partial<Record<keyof SiteSettings, string[]>> = {
  bannerText: [
    "Autumn & Holiday Curations · Complimentary studio pickup or white-glove GTA delivery",
    "Holiday styling dates for 2026 are open. Pickup is always free.",
  ],
  pickupAddress: ["June & Bloom Studio · 142 Davenport Rd, Suite 204, Yorkville, Toronto, ON M5R 1J1"],
  pickupHours: ["Tuesday to Sunday · 10:00 AM to 5:30 PM", "Tuesday to Sunday, 10 am to 5:30 pm"],
};

/**
 * Brings a store written by an older seed up to date without touching orders,
 * inquiries, waitlist entries or messages. Only placeholder catalogue content and
 * settings that still hold their original seed values are refreshed.
 */
function migrateStore(state: StoreState): StoreState {
  if ((state.seedVersion ?? 1) >= SEED_VERSION) return state;
  const fresh = createInitialStore();
  const settings = { ...state.settings };
  for (const [key, legacy] of Object.entries(LEGACY_SEED_SETTINGS)) {
    const k = key as keyof SiteSettings;
    if (legacy.includes(settings[k] as string)) {
      (settings as Record<string, unknown>)[k] = fresh.settings[k];
    }
  }
  // Seed products take the new placeholder copy but keep their live stock counts;
  // anything the founders added in the dashboard is kept as it is.
  const seedIds = new Set(fresh.products.map((p) => p.id));
  const products = [
    ...fresh.products.map((p) => {
      const existing = state.products.find((e) => e.id === p.id);
      return existing ? { ...p, stockOnHand: existing.stockOnHand } : p;
    }),
    ...state.products.filter((p) => !seedIds.has(p.id)),
  ];
  // Demo records from the original seed are refreshed; real orders and inquiries are untouched.
  const orders = state.orders.map((o) =>
    o.id.startsWith("ord-demo-") ? fresh.orders.find((f) => f.id === o.id) ?? o : o
  );
  const inquiries = state.inquiries.map((i) =>
    i.id.startsWith("inq-demo-") ? fresh.inquiries.find((f) => f.id === i.id) ?? i : i
  );
  const migrated: StoreState = {
    ...state,
    seedVersion: SEED_VERSION,
    settings,
    zones: fresh.zones,
    products,
    orders,
    inquiries,
  };
  writeStore(migrated);
  return migrated;
}

/** Fills settings added after a store was first written, and keeps slots rolling. */
function prepareStore(state: StoreState): StoreState {
  let changed = false;
  if (!state.settings.boardWindows?.length) {
    state.settings.boardWindows = DEFAULT_BOARD_WINDOWS.map((w) => ({ ...w }));
    changed = true;
  }
  if (!state.settings.boardDaysAhead) {
    state.settings.boardDaysAhead = DEFAULT_BOARD_DAYS_AHEAD;
    changed = true;
  }
  if (ensureRollingSlots(state)) changed = true;
  if (changed) writeStore(state);
  return state;
}

export function readStore(): StoreState {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      return prepareStore(migrateStore(JSON.parse(raw) as StoreState));
    }
  } catch {
    // Fallback to initial store
  }
  const initial = createInitialStore();
  ensureRollingSlots(initial);
  writeStore(initial);
  return initial;
}

export function writeStore(state: StoreState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Ignore read-only filesystem errors in serverless edge environments
  }
}

export function createOrderInStore(input: {
  items: Array<{ productSlug: string; optionId?: string; qty: number }>;
  fulfilment: "delivery" | "pickup";
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  serviceDate: string;
  window: string;
  slotId?: string;
  giftNote: string;
  allergyNotes: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): { order?: OrderRecord; error?: string } {
  const store = readStore();

  // Server is the authority on the service area (FR-43): no zone, no delivery.
  const prefix = input.postalCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  const matchedZoneCode = store.prefixMap[prefix] ?? store.prefixMap[prefix.slice(0, 2)];
  const zone = matchedZoneCode ? store.zones.find((z) => z.code === matchedZoneCode) : undefined;
  if (input.fulfilment === "delivery" && !zone) {
    return { error: "This postal code is outside our delivery area. Pickup is always available." };
  }
  if (input.items.length === 0) {
    return { error: "Your order is empty." };
  }

  store.sequenceCounter += 1;
  const publicId = formatPublicId(new Date(), store.sequenceCounter);
  const token = crypto.randomBytes(16).toString("hex");

  const resolvedItems: OrderItemRecord[] = [];
  let subtotalCents = 0;
  let needsAttention = false;
  let attentionReason: string | undefined;

  for (const reqItem of input.items) {
    const product = store.products.find((p) => p.slug === reqItem.productSlug);
    if (!product) continue;

    const option = reqItem.optionId
      ? product.options.find((o) => o.id === reqItem.optionId)
      : product.options[0];

    const unitCents = option ? option.priceCents : product.priceCents;
    const qty = Math.max(1, Math.floor(reqItem.qty));
    subtotalCents += unitCents * qty;

    if (product.trackStock) {
      if (product.stockOnHand < qty) {
        needsAttention = true;
        attentionReason = `Last-item race on ${product.name}: stock was ${product.stockOnHand} when payment completed.`;
        product.stockOnHand = 0;
      } else {
        product.stockOnHand -= qty;
      }
    }

    resolvedItems.push({
      productId: product.id,
      productSlug: product.slug,
      optionId: option?.id,
      nameSnapshot: product.name,
      optionLabel: option?.label,
      qty,
      unitCents,
    });
  }

  // If slotId is provided, decrement slot capacity (FR-51 / BR-09)
  if (input.slotId) {
    const slot = store.slots.find((s) => s.id === input.slotId);
    if (slot) {
      if (slot.blocked || slot.booked >= slot.capacity) {
        needsAttention = true;
        attentionReason = slot.blocked
          ? `Slot ${slot.day} (${slot.window}) was closed before payment.`
          : `Slot ${slot.day} (${slot.window}) reached capacity simultaneously.`;
      } else {
        slot.booked += 1;
      }
    }
  }

  const deliveryCents = input.fulfilment === "pickup" || !zone ? 0 : zone.feeCents;
  const taxCents = store.settings.taxMode
    ? Math.round((subtotalCents + deliveryCents) * 0.13)
    : 0;
  const totalCents = subtotalCents + deliveryCents + taxCents;

  const order: OrderRecord = {
    id: `ord-${Date.now()}`,
    publicId,
    token,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    fulfilment: input.fulfilment,
    postalCode: input.postalCode.toUpperCase(),
    zoneCode: input.fulfilment === "pickup" || !zone ? "PICKUP" : zone.code,
    recipientName: input.recipientName || input.customerName,
    recipientPhone: input.recipientPhone || input.customerPhone,
    addressLine: input.fulfilment === "pickup" ? "Studio pickup" : input.addressLine,
    city: input.fulfilment === "pickup" ? "Toronto" : input.city,
    serviceDate: input.serviceDate,
    window: input.window,
    slotId: input.slotId,
    giftNote: input.giftNote.slice(0, 200),
    allergyNotes: input.allergyNotes || "None",
    subtotalCents,
    deliveryCents,
    taxCents,
    totalCents,
    status: "received",
    needsAttention,
    attentionReason,
    owner: resolvedItems.some((i) => i.productSlug.includes("board"))
      ? "Bloom (Styling & Ops)"
      : "June (Curator)",
    items: resolvedItems,
    createdAt: new Date().toISOString(),
    events: [
      {
        at: new Date().toISOString(),
        event: "Order created & verified (Server-side pricing authority)",
      },
    ],
  };

  store.orders.unshift(order);
  writeStore(store);
  return { order };
}

export function createInquiryInStore(input: {
  optionSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  areaAndPostal: string;
  spaceCategory: "residential" | "commercial";
  treeHeightBand: "under_7ft" | "7_to_9ft" | "over_9ft";
  treeSupply: "client_owned" | "source_for_me";
  preferredDates: string[];
  palette: string;
  addOns: string[];
  budgetBand: string;
  notes: string;
}): StylingInquiryRecord {
  const store = readStore();
  store.sequenceCounter += 1;
  const publicId = formatPublicId(new Date(), store.sequenceCounter);
  const product = store.products.find((p) => p.slug === input.optionSlug);
  const optionName = product?.name ?? "Holiday Styling";

  const customQuote =
    input.treeHeightBand === "over_9ft" ||
    input.spaceCategory === "commercial" ||
    input.optionSlug === "full-service-holiday";
  const slotsRequired = customQuote ? 2 : 1;

  const baseEstimate = product?.priceCents ?? 42500;
  const { totalCents, retainerCents, balanceCents } = calculateRetainer(baseEstimate);

  const inquiry: StylingInquiryRecord = {
    id: `inq-${Date.now()}`,
    publicId,
    optionSlug: input.optionSlug,
    optionName,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    areaAndPostal: input.areaAndPostal,
    spaceCategory: input.spaceCategory,
    treeHeightBand: input.treeHeightBand,
    treeSupply: input.treeSupply,
    preferredDates: input.preferredDates,
    palette: input.palette,
    addOns: input.addOns,
    budgetBand: input.budgetBand,
    notes: input.notes,
    customQuote,
    slotsRequired,
    status: "new",
    owner: "Bloom (Styling & Ops)",
    quoteTotalCents: totalCents,
    retainerCents,
    balanceCents,
    quoteToken: crypto.randomBytes(12).toString("hex"),
    createdAt: new Date().toISOString(),
  };

  store.inquiries.unshift(inquiry);
  writeStore(store);
  return inquiry;
}
