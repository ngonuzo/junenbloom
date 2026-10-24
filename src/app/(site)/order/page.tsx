import React from "react";
import type { Metadata } from "next";
import { readStore } from "@/lib/db/store";
import { OrderForm } from "@/components/site/OrderForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

export default function OrderPage() {
  const store = readStore();
  return (
    <OrderForm
      zones={store.zones}
      prefixMap={store.prefixMap}
      blockedDates={store.settings.blockedDates}
      pickupHours={store.settings.pickupHours}
    />
  );
}
