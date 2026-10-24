"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Package,
  Calendar,
  Boxes,
  Sparkles,
  Sliders,
  Printer,
  Plus,
  Minus,
  Bell,
  Lock,
  ExternalLink,
} from "lucide-react";
import type { StoreState, OrderRecord, OrderStatus } from "@/lib/db/store";
import { formatCents } from "@/lib/domain/money";
import { MonogramMark } from "@/components/brand/Wordmark";

const ALLOWED_FOUNDERS = [
  "sister1@juneandbloomlifestyle.com",
  "sister2@juneandbloomlifestyle.com",
];

const ORDER_STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "out",
  "delivered",
];

type AdminTab = "orders" | "today" | "inventory" | "inquiries" | "settings";

export default function AdminDashboardPage() {
  const [founderEmail, setFounderEmail] = useState<string>(ALLOWED_FOUNDERS[0]);
  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");

  const [store, setStore] = useState<StoreState | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdPriceDollars, setNewProdPriceDollars] = useState("145");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdItems, setNewProdItems] = useState(
    "Hand-thrown ceramic mug, Artisanal shortbread, Linen napkin set, Wax-sealed note card"
  );

  const fetchStore = useCallback(async () => {
    const res = await fetch("/api/store");
    const data = (await res.json()) as StoreState;
    setStore(data);
  }, []);

  useEffect(() => {
    fetchStore();
    // 10-second live polling (FR-81 / ADR-008)
    const interval = setInterval(fetchStore, 10000);
    return () => clearInterval(interval);
  }, [fetchStore]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = founderEmail.trim().toLowerCase();
    if (!ALLOWED_FOUNDERS.includes(clean)) {
      setAuthError(
        "Access refused: Only the two allow-listed founder emails may enter the studio."
      );
      setAuthenticated(false);
      return;
    }
    setAuthError("");
    setAuthenticated(true);
  }

  async function advanceOrderStatus(order: OrderRecord) {
    const idx = ORDER_STATUS_FLOW.indexOf(order.status);
    const nextStatus =
      ORDER_STATUS_FLOW[Math.min(ORDER_STATUS_FLOW.length - 1, idx + 1)];
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "advance_order_status",
        payload: { publicId: order.publicId, status: nextStatus },
      }),
    });
    await fetchStore();
    showToast(`${order.publicId} advanced to ${nextStatus.toUpperCase()}`);
  }

  async function adjustProductStock(productId: string, delta: number) {
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "adjust_stock",
        payload: { productId, delta },
      }),
    });
    await fetchStore();
    showToast("Inventory updated & logged");
  }

  async function toggleSwitch(key: string) {
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_setting",
        payload: { key },
      }),
    });
    await fetchStore();
    showToast(`Updated ${key} on public storefront`);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProdName) return;
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_product",
        payload: {
          name: newProdName,
          priceCents: Math.round(Number(newProdPriceDollars) * 100),
          shortDescription: newProdDesc,
          contents: newProdItems.split(",").map((s) => s.trim()),
          stockOnHand: 6,
        },
      }),
    });
    setNewProdName("");
    setNewProdDesc("");
    await fetchStore();
    showToast("New gift box published to storefront");
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <form
          onSubmit={handleLoginSubmit}
          className="rounded-[4px] bg-[var(--surface-cream)] p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <MonogramMark size={36} />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold-text)]">
                Private Studio (FR-80)
              </p>
              <h1 className="font-heading text-2xl text-[var(--emerald)]">
                Founders Allow-List Sign-In
              </h1>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-[0.14em]">
              Founder Email
            </label>
            <input
              type="email"
              required
              value={founderEmail}
              onChange={(e) => setFounderEmail(e.target.value)}
              className="w-full rounded-[4px] bg-[var(--ivory)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
            />
          </div>

          {authError && (
            <p className="rounded-[4px] bg-[var(--surface-sage)] p-3 text-xs text-[var(--emerald)]">
              {authError}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {ALLOWED_FOUNDERS.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => setFounderEmail(email)}
                className="rounded-full bg-[var(--ivory)] px-3 py-1 text-[var(--emerald)]"
              >
                Use {email}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full rounded-[4px] bg-[var(--emerald)] py-3.5 text-xs uppercase tracking-[0.16em] font-medium text-[var(--ivory)]"
          >
            Verify Founder Access
          </button>
        </form>
      </div>
    );
  }

  if (!store) {
    return <div className="p-12 text-center text-sm">Loading studio...</div>;
  }

  // Printable Packing Slip & Handwritten Gift Note View (FR-88 / FR-17)
  if (printingOrder) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 space-y-8 bg-[var(--ivory)]">
        <div className="flex items-center justify-between no-print">
          <button
            type="button"
            onClick={() => setPrintingOrder(null)}
            className="text-xs uppercase tracking-[0.15em] text-[var(--emerald)]"
          >
            &larr; Back to Orders
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--emerald)] px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-[var(--ivory)]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Packing Slip &amp; Gift Card</span>
          </button>
        </div>

        <div className="rounded-[4px] bg-[var(--surface-cream)] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold-text)]">
                June &amp; Bloom · Packing Slip
              </p>
              <h1 className="font-heading text-3xl text-[var(--emerald)]">
                {printingOrder.publicId}
              </h1>
            </div>
            <div className="text-right text-xs">
              <p className="font-medium text-[var(--emerald)]">
                {printingOrder.serviceDate} · {printingOrder.window}
              </p>
              <p className="opacity-75">
                {printingOrder.fulfilment.toUpperCase()} ({printingOrder.zoneCode})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
              <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                Recipient
              </p>
              <p className="font-medium text-sm text-[var(--emerald)]">
                {printingOrder.recipientName}
              </p>
              <p>{printingOrder.addressLine}, {printingOrder.city}</p>
              <p>{printingOrder.postalCode} · {printingOrder.recipientPhone}</p>
            </div>
            <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
              <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                Allergen &amp; Prep Alert (BR-10)
              </p>
              <p className="font-medium text-sm text-[var(--emerald)]">
                {printingOrder.allergyNotes}
              </p>
              <p className="opacity-75">Owner: {printingOrder.owner}</p>
            </div>
          </div>

          <div className="rounded-[4px] bg-[var(--ivory)] p-5 space-y-2 text-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--gold-text)]">
              Items to Pack
            </p>
            {printingOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  [ ] {item.qty} &times; {item.nameSnapshot}{" "}
                  {item.optionLabel ? `(${item.optionLabel})` : ""}
                </span>
                <span>{formatCents(item.unitCents * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Cut-out Linen Gift Card */}
          <div className="rounded-[4px] bg-[var(--ivory)] p-8 text-center space-y-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--gold-text)]">
              Handwritten Linen Gift Card · Transcribe by Hand
            </p>
            <p className="font-heading italic text-2xl text-[var(--emerald)]">
              &ldquo;{printingOrder.giftNote}&rdquo;
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink)] opacity-60">
              June &amp; Bloom · memories that inspire
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenueCents = store.orders.reduce((s, o) => s + o.totalCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-8">
      {/* Live Toast Alert (FR-73) */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 rounded-[4px] bg-[var(--emerald)] px-5 py-3 text-xs uppercase tracking-[0.14em] text-[var(--ivory)] shadow-xl flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--gold)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Header */}
      <div className="rounded-[4px] bg-[var(--surface-cream)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <MonogramMark size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--gold-text)]">
                Founders Studio · Live 10s Sync · {founderEmail}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl text-[var(--emerald)]">
              Orders, Tracker, Inventory &amp; Styling Pipeline
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAuthenticated(false)}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-xs text-[var(--ink)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Test Allow-List Gate</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--gold-text)]">
            Active Orders
          </p>
          <p className="font-heading text-3xl text-[var(--emerald)] mt-1">
            {store.orders.length}
          </p>
        </div>
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--gold-text)]">
            Studio Revenue (CAD)
          </p>
          <p className="font-heading text-3xl text-[var(--emerald)] mt-1">
            {formatCents(totalRevenueCents)}
          </p>
        </div>
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--gold-text)]">
            Styling Inquiries
          </p>
          <p className="font-heading text-3xl text-[var(--emerald)] mt-1">
            {store.inquiries.length}
          </p>
        </div>
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--gold-text)]">
            Waitlist / Messages
          </p>
          <p className="font-heading text-3xl text-[var(--emerald)] mt-1">
            {store.waitlistEntries.length + store.contactMessages.length}
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Desktop + Phone Bottom Bar: T8.2) */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "orders" as const, label: "Orders & Tracker", icon: Package },
          { id: "today" as const, label: "Today & Run Sheet", icon: Calendar },
          { id: "inventory" as const, label: "Inventory & Products", icon: Boxes },
          { id: "inquiries" as const, label: "Styling Pipeline", icon: Sparkles },
          { id: "settings" as const, label: "Offer Switches", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors ${
                active
                  ? "text-[var(--ivory)] font-medium"
                  : "bg-[var(--surface-cream)] text-[var(--ink)]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab-pill"
                  className="absolute inset-0 rounded-full bg-[var(--emerald)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS & TRACKER BOARD (FR-81 to FR-83) */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {store.orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[4px] bg-[var(--surface-cream)] p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-heading text-2xl text-[var(--emerald)]">
                    {order.publicId}
                  </span>
                  <span className="rounded-full bg-[var(--emerald)] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ivory)]">
                    {order.status}
                  </span>
                  <span className="rounded-full bg-[var(--ivory)] px-3 py-1 text-xs text-[var(--ink)]">
                    {order.zoneCode} · {order.serviceDate} ({order.window})
                  </span>
                  <span className="text-xs text-[var(--gold-text)]">
                    Owner: {order.owner}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintingOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-xs text-[var(--emerald)] hover:bg-[var(--surface-sage)]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Packing Slip</span>
                  </button>
                  <Link
                    href={`/order/${order.publicId}?t=${order.token}`}
                    className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-xs text-[var(--emerald)]"
                  >
                    <span>Customer View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  {order.status !== "delivered" && (
                    <button
                      type="button"
                      onClick={() => advanceOrderStatus(order)}
                      className="rounded-[4px] bg-[var(--emerald)] px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium text-[var(--ivory)]"
                    >
                      Tap to Advance Status &rarr;
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Items ({formatCents(order.totalCents)})
                  </p>
                  {order.items.map((item, i) => (
                    <p key={i} className="font-medium text-[var(--emerald)]">
                      {item.qty} &times; {item.nameSnapshot}{" "}
                      {item.optionLabel ? `(${item.optionLabel})` : ""}
                    </p>
                  ))}
                </div>

                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Recipient &amp; Address
                  </p>
                  <p className="font-medium text-[var(--emerald)]">
                    {order.recipientName} ({order.recipientPhone})
                  </p>
                  <p className="opacity-80">
                    {order.addressLine}, {order.city} · {order.postalCode}
                  </p>
                </div>

                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Linen Gift Note &amp; Allergies
                  </p>
                  <p className="italic text-[var(--emerald)]">
                    &ldquo;{order.giftNote}&rdquo;
                  </p>
                  <p className="opacity-80">Allergies: {order.allergyNotes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TODAY & DELIVERY RUN SHEET (FR-45 / FR-89) */}
      {activeTab === "today" && (
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold-text)]">
                Grouped by Zone &amp; Window (FR-45)
              </p>
              <h2 className="font-heading text-2xl text-[var(--emerald)]">
                Delivery Run Sheet &amp; Prep Schedule
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--emerald)] px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-[var(--ivory)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Run Sheet</span>
            </button>
          </div>

          <div className="space-y-3">
            {store.orders.map((o) => (
              <div
                key={o.id}
                className="rounded-[4px] bg-[var(--ivory)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-medium text-[var(--emerald)]">
                    [{o.zoneCode}] {o.window} · {o.publicId}
                  </span>
                  <p>
                    {o.recipientName}, {o.addressLine}, {o.city} ({o.postalCode}) · Tel:{" "}
                    {o.recipientPhone}
                  </p>
                </div>
                <div className="sm:text-right space-y-1">
                  <p className="font-medium text-[var(--emerald)]">
                    {o.items.map((i) => `${i.qty}x ${i.nameSnapshot}`).join(", ")}
                  </p>
                  <p className="text-[var(--gold-text)]">
                    Allergy Note: {o.allergyNotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY & PRODUCTS MANAGER (FR-84 / FR-85) */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-3">
            {store.products
              .filter((p) => p.type !== "styling")
              .map((product) => {
                const low =
                  product.trackStock &&
                  product.stockOnHand <= product.lowStockThreshold;
                return (
                  <div
                    key={product.id}
                    className="rounded-[4px] bg-[var(--surface-cream)] p-5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-lg text-[var(--emerald)]">
                          {product.name}
                        </span>
                        <span className="rounded-full bg-[var(--ivory)] px-2.5 py-0.5 text-[11px] uppercase tracking-wider">
                          {product.status}
                        </span>
                        {low && (
                          <span className="rounded-full bg-[var(--surface-sage)] px-2.5 py-0.5 text-[11px] text-[var(--emerald)] font-medium">
                            Low stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-75 mt-0.5">
                        {formatCents(product.priceCents)} · {product.categoryName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustProductStock(product.id, -1)}
                        className="rounded-[4px] bg-[var(--ivory)] p-2 text-[var(--emerald)]"
                        aria-label="Decrement stock"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {product.stockOnHand}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustProductStock(product.id, 1)}
                        className="rounded-[4px] bg-[var(--ivory)] p-2 text-[var(--emerald)]"
                        aria-label="Increment stock"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Add New Box Without a Developer (FR-02 / T8.7) */}
          <form
            onSubmit={handleAddProduct}
            className="lg:col-span-5 rounded-[4px] bg-[var(--surface-cream)] p-6 space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold-text)]">
              Add a New Gift Box (FR-02)
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-[0.14em]">
                Box Name
              </label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="The Winter Solstice Box"
                className="w-full rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-[0.14em]">
                Price (CAD Dollars)
              </label>
              <input
                type="number"
                required
                value={newProdPriceDollars}
                onChange={(e) => setNewProdPriceDollars(e.target.value)}
                className="w-full rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-[0.14em]">
                Short Description
              </label>
              <input
                type="text"
                required
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Spiced cedar candle, alpaca throw, and single-origin cocoa."
                className="w-full rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-[0.14em]">
                Contents List (Comma separated)
              </label>
              <textarea
                rows={3}
                value={newProdItems}
                onChange={(e) => setNewProdItems(e.target.value)}
                className="w-full rounded-[4px] bg-[var(--ivory)] px-3.5 py-2 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[4px] bg-[var(--emerald)] py-3 text-xs uppercase tracking-[0.15em] font-medium text-[var(--ivory)]"
            >
              Publish Gift Box to Site
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: HOLIDAY STYLING INQUIRIES PIPELINE (FR-63 / FR-87) */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {store.inquiries.map((inq) => (
            <div
              key={inq.id}
              className="rounded-[4px] bg-[var(--surface-cream)] p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-heading text-2xl text-[var(--emerald)]">
                    {inq.publicId}
                  </span>
                  <span className="rounded-full bg-[var(--emerald)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--ivory)]">
                    {inq.status.replace("_", " ")}
                  </span>
                  <span className="text-sm font-medium text-[var(--emerald)]">
                    {inq.optionName}
                  </span>
                  <span className="text-xs text-[var(--gold-text)]">
                    {inq.slotsRequired} {inq.slotsRequired === 1 ? "slot" : "slots"}{" "}
                    {inq.customQuote ? "(Custom Quote)" : ""}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "consult",
                      "quote_sent",
                      "retainer_paid",
                      "scheduled",
                      "installed",
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={async () => {
                        await fetch("/api/store", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "advance_inquiry_status",
                            payload: { publicId: inq.publicId, status: st },
                          }),
                        });
                        await fetchStore();
                        showToast(`${inq.publicId} moved to ${st}`);
                      }}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        inq.status === st
                          ? "bg-[var(--emerald)] text-[var(--ivory)]"
                          : "bg-[var(--ivory)] text-[var(--ink)]"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Client &amp; Neighbourhood
                  </p>
                  <p className="font-medium text-[var(--emerald)]">
                    {inq.customerName} · {inq.areaAndPostal}
                  </p>
                  <p>
                    {inq.customerEmail} · {inq.customerPhone}
                  </p>
                </div>

                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Palette &amp; Dates
                  </p>
                  <p className="font-medium text-[var(--emerald)]">{inq.palette}</p>
                  <p>Dates: {inq.preferredDates.join(", ")}</p>
                </div>

                <div className="rounded-[4px] bg-[var(--ivory)] p-4 space-y-1">
                  <p className="uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Quote &amp; 40% Retainer (BR-02)
                  </p>
                  <p className="font-medium text-[var(--emerald)]">
                    Total: {formatCents(inq.quoteTotalCents ?? 42500)} · 40% Retainer:{" "}
                    {formatCents(inq.retainerCents ?? 17000)}
                  </p>
                  <p className="opacity-75">
                    60% Balance: {formatCents(inq.balanceCents ?? 25500)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: SETTINGS & FOUR AVAILABILITY SWITCHES (FR-92) */}
      {activeTab === "settings" && (
        <div className="rounded-[4px] bg-[var(--surface-cream)] p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold-text)]">
              Switches, Not Deploys (ADR-007 / FR-92)
            </p>
            <h2 className="font-heading text-2xl text-[var(--emerald)]">
              Live Storefront Availability Switches
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: "giftingOpen",
                label: "Gifting Ordering (gifting_open)",
                active: store.settings.giftingOpen,
              },
              {
                key: "charcuterieOpen",
                label: "Charcuterie Ordering (charcuterie_open)",
                active: store.settings.charcuterieOpen,
              },
              {
                key: "stylingOpen",
                label: "Holiday Styling Inquiries (styling_open)",
                active: store.settings.stylingOpen,
              },
              {
                key: "takedownStorageOpen",
                label: "January Takedown & Storage Add-On",
                active: store.settings.takedownStorageOpen,
              },
            ].map((sw) => (
              <div
                key={sw.key}
                className="rounded-[4px] bg-[var(--ivory)] p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-sm text-[var(--emerald)]">
                    {sw.label}
                  </p>
                  <p className="text-xs opacity-70">
                    Status: {sw.active ? "Live on site" : "Paused with polite notice"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSwitch(sw.key)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium transition-colors ${
                    sw.active
                      ? "bg-[var(--emerald)] text-[var(--ivory)]"
                      : "bg-[var(--surface-sage)] text-[var(--ink)]"
                  }`}
                >
                  {sw.active ? "Live (Turn Off)" : "Paused (Turn On)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phone-First Sticky Bottom Bar (T8.2) */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex md:hidden items-center justify-around bg-[var(--emerald)] text-[var(--ivory)] py-3 px-2 no-print"
      >
        {[
          { id: "orders" as const, label: "Orders" },
          { id: "today" as const, label: "Today" },
          { id: "inventory" as const, label: "Inventory" },
          { id: "inquiries" as const, label: "Inquiries" },
          { id: "settings" as const, label: "Switches" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs rounded-full ${
              activeTab === item.id
                ? "bg-[var(--ivory)] text-[var(--emerald)] font-medium"
                : "opacity-80"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
