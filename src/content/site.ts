/**
 * Site-wide copy and contact details (FR-05). Edit here; no component changes needed.
 * Values marked PLACEHOLDER are listed in CONTENT_TODO.md.
 */
export const SITE = {
  name: "June & Bloom Lifestyle Company",
  shortName: "June & Bloom",
  tagline: "memories that inspire",
  description:
    "Signature gift boxes, styled charcuterie boards and holiday styling by two sisters in the Greater Toronto Area.",
  region: "Greater Toronto Area",
  email: "concierge@juneandbloomlifestyle.com",
  instagramHandle: "juneandbloomlifestyle",
  instagramUrl: "https://www.instagram.com/juneandbloomlifestyle",
  /** PLACEHOLDER: international format without spaces, e.g. 14165550100. Hidden while empty. */
  whatsappNumber: "",
  replyPromise: "We reply personally within one business day.",
} as const;

export const PRIMARY_NAV = [
  { href: "/gifting", label: "Gifting" },
  { href: "/charcuterie", label: "Charcuterie" },
  { href: "/holiday-styling", label: "Holiday Styling" },
  { href: "/service-area", label: "Service Area" },
] as const;

export const SECONDARY_NAV = [
  { href: "/our-story", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const POLICY_NAV = [
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/delivery", label: "Delivery and pickup" },
  { href: "/policies/refunds", label: "Refunds" },
  { href: "/policies/allergens", label: "Allergens and food" },
  { href: "/policies/safety", label: "Safety" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/accessibility", label: "Accessibility" },
] as const;

export function whatsappHref(): string | null {
  return SITE.whatsappNumber ? `https://wa.me/${SITE.whatsappNumber}` : null;
}
