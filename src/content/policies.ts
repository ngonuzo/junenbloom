/**
 * Policy wording (PRD section 12). Starter text for founder and legal review;
 * edit here, no component changes needed.
 */
export interface Policy {
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: string[] }>;
}

export const POLICIES_UPDATED = "October 2026";

export const POLICIES: Record<string, Policy> = {
  terms: {
    title: "Terms",
    summary: "How ordering, payment and bookings work with June & Bloom.",
    sections: [
      {
        heading: "Orders and prices",
        body: [
          "All prices are in Canadian dollars. Gift boxes and charcuterie boards are paid in full when you order, through Stripe's secure checkout. Your order is confirmed once payment is received.",
          "Prices shown as \"from\" depend on the edition or size you choose. The exact amount is always shown before you pay.",
        ],
      },
      {
        heading: "Holiday styling",
        body: [
          "Styling is booked by quote. Your date is held once you accept the quote and pay a 40 percent retainer. The balance is due 48 hours before installation.",
          "Decor we buy on your behalf is listed in your quote and paid for in advance, at cost.",
        ],
      },
      {
        heading: "Substitutions",
        body: [
          "We choose each item with care. If something is unavailable, we will replace it with a piece of equal or greater value and tell you before your order leaves us.",
        ],
      },
    ],
  },
  delivery: {
    title: "Delivery and pickup",
    summary: "Where we deliver, what it costs and how pickup works.",
    sections: [
      {
        heading: "Delivery zones",
        body: [
          "We deliver across the Greater Toronto Area in three zones, set by postal code. Each zone has its own fee, minimum order and delivery days, shown on the Service Area page and calculated at checkout.",
          "Gift boxes are delivered within the window you choose. Boards arrive inside a two-hour window.",
        ],
      },
      {
        heading: "Pickup",
        body: [
          "Pickup is always free and has no minimum. The address and instructions are sent with your order confirmation.",
        ],
      },
      {
        heading: "If no one is home",
        body: [
          "We will call the recipient's number. Boards are never left unattended. For gift boxes, we will agree a safe place with you or arrange a second attempt.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refunds and cancellations",
    summary: "Changing your mind, changing a date, and what happens with retainers.",
    sections: [
      {
        heading: "Gift boxes",
        body: [
          "You may cancel or change the date of a gift box up to 48 hours before the delivery or pickup date for a full refund.",
        ],
      },
      {
        heading: "Charcuterie boards",
        body: [
          "Boards are made fresh for you. Changes and cancellations need at least 48 hours' notice before your window.",
        ],
      },
      {
        heading: "Holiday styling retainers",
        body: [
          "The retainer holds a slot we turn others away for. It is not refundable within 14 days of installation, but we will gladly move you to another open date.",
        ],
      },
    ],
  },
  allergens: {
    title: "Allergens and food",
    summary: "What our kitchen handles, and how we take care with allergies.",
    sections: [
      {
        heading: "Our kitchen",
        body: [
          "Our boards and food boxes are prepared in a kitchen that handles milk, wheat and gluten, tree nuts, peanuts, sesame, mustard and honey. We separate ingredients on request, but we cannot promise a board free of traces.",
          "If you or a guest has a severe allergy, please message us before ordering.",
        ],
      },
      {
        heading: "Storage and serving",
        body: [
          "Keep boards refrigerated until 30 minutes before serving, and enjoy within four hours at room temperature.",
        ],
      },
    ],
  },
  safety: {
    title: "Safety",
    summary: "Candles, small parts and installation in your home.",
    sections: [
      {
        heading: "Candles and small items",
        body: [
          "Never leave a burning candle unattended. Some boxes contain small items that are not suitable for young children.",
        ],
      },
      {
        heading: "In your home",
        body: [
          "For styling, we use your outlets and existing lights only if they are in good order. We will not climb above a safe height without the right equipment, and we leave every room tidy.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    summary: "What we collect, why, and how long we keep it. Aligned with PIPEDA and CASL.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Only what we need to fulfil your order or inquiry: names, contact details, addresses and the message for the card. Card details are handled by Stripe and never reach our servers.",
        ],
      },
      {
        heading: "Email from us",
        body: [
          "We send seasonal letters only if you ask us to, and every letter has a one-click way to stop. We record when and how you agreed.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Photos and notes about your home are deleted 12 months after our last contact unless you ask us to keep them. You can ask for a copy of your data, or for it to be deleted, at any time.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility",
    summary: "Our commitment to a site everyone can use.",
    sections: [
      {
        heading: "Our standard",
        body: [
          "We aim to meet WCAG 2.1 AA. The site works with a keyboard and screen readers, respects reduced-motion settings, and uses colours chosen for legible contrast.",
        ],
      },
      {
        heading: "Tell us",
        body: [
          "If anything gets in your way, email us and we will fix it, and help you place your order in the meantime.",
        ],
      },
    ],
  },
};
