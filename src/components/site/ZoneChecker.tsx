"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { PinIcon } from "@/components/ui/Icons";
import { EASE_LUXE } from "@/components/ui/Reveal";
import {
  DEFAULT_PREFIX_MAP,
  DEFAULT_ZONES,
  normalizePostalPrefix,
  zoneForPostalCode,
  type DeliveryZone,
} from "@/lib/domain/zones";
import { formatCents } from "@/lib/domain/money";
import { shortDays } from "@/lib/catalog";

function formatPostal(raw: string) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
}

/**
 * Postal code checker (FR-41, T3.2): zone, fee, minimum and delivery days,
 * computed as you type.
 */
export function ZoneChecker({
  zones = DEFAULT_ZONES,
  prefixMap = DEFAULT_PREFIX_MAP,
  surface = "ivory",
}: {
  zones?: DeliveryZone[];
  prefixMap?: Record<string, DeliveryZone["code"]>;
  surface?: "ivory" | "cream";
}) {
  const id = useId();
  const [postal, setPostal] = useState("");
  const prefix = normalizePostalPrefix(postal);
  const result = zoneForPostalCode(postal, zones, prefixMap);
  const zoneIndex = result.zone ? zones.findIndex((z) => z.code === result.zone?.code) + 1 : 0;
  const ready = prefix.length >= 3;

  return (
    <div>
      <label htmlFor={`${id}-postal`} className="block text-[0.875rem] font-medium text-emerald">
        Your postal code
      </label>
      <div
        className={`mt-3 flex h-16 items-center gap-3 rounded-card px-5 transition-shadow duration-300 focus-within:shadow-[0_0_0_2px_var(--emerald)] ${
          surface === "cream" ? "bg-ivory" : "bg-cream"
        }`}
      >
        <PinIcon size={20} className="text-gold-text" />
        <input
          id={`${id}-postal`}
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          maxLength={7}
          value={postal}
          onChange={(e) => setPostal(formatPostal(e.target.value))}
          placeholder="M5V 2T6"
          aria-describedby={`${id}-result`}
          className="w-0 min-w-0 flex-1 bg-transparent font-heading text-[1.5rem] uppercase tracking-[0.08em] text-emerald outline-none placeholder:text-emerald/25"
        />
      </div>

      <div id={`${id}-result`} aria-live="polite" className="min-h-[7.5rem] pt-6">
        <AnimatePresence mode="wait" initial={false}>
          {!ready ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="t-small text-muted"
            >
              The first three characters are enough. Pickup is always free, wherever you are.
            </motion.p>
          ) : result.matched && result.zone ? (
            <motion.div
              key={`zone-${result.zone.code}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
            >
              <p className="t-small text-muted">
                We deliver to <span className="font-medium text-emerald">{prefix}</span>. You are in
                zone {zoneIndex}, {result.zone.name}.
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3">
                <Fact label="Delivery" value={formatCents(result.zone.feeCents)} />
                <Fact label="Minimum order" value={formatCents(result.zone.minOrderCents)} />
                <Fact label="Days" value={shortDays(result.zone.deliveryDays)} />
              </dl>
            </motion.div>
          ) : (
            <motion.div
              key="outside"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
              className="space-y-3"
            >
              <p className="t-small text-ink">{result.message}</p>
              <Link href="/contact" className="inline-block t-small font-medium text-emerald link-quiet">
                Message us about delivery
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-cream px-4 py-3.5">
      <dt className="text-[0.75rem] text-muted">{label}</dt>
      <dd className="mt-1 font-heading text-[1.25rem] leading-tight text-emerald">{value}</dd>
    </div>
  );
}
