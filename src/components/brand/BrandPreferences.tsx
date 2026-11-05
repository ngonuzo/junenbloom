"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AmpersandVariant } from "./ampersand-paths";

export type FontPairingKey = "newsreader" | "bodoni" | "caslon" | "instrument";

interface BrandPreferences {
  fontPairing: FontPairingKey;
  setFontPairing: (pairing: FontPairingKey) => void;
  ampersandVariant: AmpersandVariant;
  setAmpersandVariant: (variant: AmpersandVariant) => void;
}

// v2: the default pairing changed to Newsreader, so earlier saved choices (which
// recorded the old default) are not carried over.
const STORAGE_KEY = "jb_design_review_v2";

const BrandPreferencesContext = createContext<BrandPreferences | null>(null);

/**
 * Holds the founders' choices from /dev/type and /dev/ampersand (DR-03, DR-16)
 * so a selection previews across the whole site for that browser.
 */
export function BrandPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [fontPairing, setFontPairing] = useState<FontPairingKey>("newsreader");
  const [ampersandVariant, setAmpersandVariant] = useState<AmpersandVariant>("italic");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved?.fontPairing) setFontPairing(saved.fontPairing);
      if (saved?.ampersandVariant) setAmpersandVariant(saved.ampersandVariant);
    } catch {
      // Storage unavailable: defaults apply.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (fontPairing === "newsreader") {
      document.documentElement.removeAttribute("data-font-pairing");
    } else {
      document.documentElement.setAttribute("data-font-pairing", fontPairing);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontPairing, ampersandVariant }));
    } catch {
      // Ignore storage failures.
    }
  }, [fontPairing, ampersandVariant, loaded]);

  return (
    <BrandPreferencesContext.Provider
      value={{ fontPairing, setFontPairing, ampersandVariant, setAmpersandVariant }}
    >
      {children}
    </BrandPreferencesContext.Provider>
  );
}

export function useBrandPreferences(): BrandPreferences {
  const ctx = useContext(BrandPreferencesContext);
  if (!ctx) {
    return {
      fontPairing: "newsreader",
      setFontPairing: () => {},
      ampersandVariant: "italic",
      setAmpersandVariant: () => {},
    };
  }
  return ctx;
}
