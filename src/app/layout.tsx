import type { Metadata, Viewport } from "next";
import {
  Bodoni_Moda,
  Hanken_Grotesk,
  Libre_Caslon_Display,
  Albert_Sans,
  Instrument_Serif,
  Figtree,
} from "next/font/google";
import "@/styles/tokens.css";
import { SITE } from "@/content/site";

// Default pairing (DR-16). Bodoni Moda ships its optical-size axis so display
// sizes get the fine hairlines and text sizes stay sturdy.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

// Alternates for the /dev/type review only; never preloaded on public pages.
const caslon = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caslon",
  display: "swap",
  preload: false,
});

const albert = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
  preload: false,
});

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://juneandbloomlifestyle.com"),
  title: {
    default: `${SITE.name} | Gifting, Charcuterie and Holiday Styling in the GTA`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/jb-monogram.svg",
    apple: "/brand/jb-monogram.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7", // design-check-allow-hex (browser chrome colour must be a literal)
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      className={`${bodoni.variable} ${hanken.variable} ${caslon.variable} ${albert.variable} ${instrument.variable} ${figtree.variable}`}
    >
      <body className="relative min-h-dvh">
        {/* Paper-grain undertone (DR-12) is painted on the page background in tokens.css,
            beneath the text rather than over it. */}
        {children}
      </body>
    </html>
  );
}
