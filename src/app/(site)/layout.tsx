import React from "react";
import { readStore } from "@/lib/db/store";
import { BrandPreferencesProvider } from "@/components/brand/BrandPreferences";
import { PageWatermark } from "@/components/brand/PageWatermark";
import { CartProvider } from "@/components/site/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { QuickViewDrawer } from "@/components/site/QuickViewDrawer";
import { MotionProvider } from "@/components/ui/MotionProvider";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const store = readStore();
  const banner = store.settings.bannerText.trim();

  return (
    <BrandPreferencesProvider>
      <CartProvider initialProducts={store.products.filter((p) => p.status !== "hidden" && p.status !== "archived")}>
        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-card focus:bg-emerald focus:px-4 focus:py-2.5 focus:text-[0.875rem] focus:text-ivory"
          >
            Skip to content
          </a>
          {banner && (
            <div className="paper on-emerald bg-emerald px-5 py-2.5 text-center text-[0.8125rem] tracking-[0.01em] text-ivory no-print">
              {banner}
            </div>
          )}
          <PageWatermark />
          <Header />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
          <QuickViewDrawer />
        </MotionProvider>
      </CartProvider>
    </BrandPreferencesProvider>
  );
}
