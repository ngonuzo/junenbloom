import React from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/site/PageIntro";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, gift boxes, charcuterie boards, holiday styling, delivery and pickup.",
};

const GROUPS = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        q: "How do I order?",
        a: "Open any box or board to see what is inside, then tap Order. On the next page you choose delivery or pickup, a date and the words for the card. Payment is handled securely by Stripe.",
      },
      {
        q: "How far ahead should I order?",
        a: "Gift boxes need at least three days, boards at least two. For anything sooner, message us and we will tell you honestly whether we can make it.",
      },
      {
        q: "Can I send gifts to more than one address?",
        a: "Yes. For two or three gifts, place separate orders. For a larger list, message us and we will arrange it with one invoice.",
      },
    ],
  },
  {
    id: "gifting",
    title: "Gift boxes",
    items: [
      {
        q: "Is the card really written by hand?",
        a: "Yes. One of us writes your message on a heavy cream card and seals it before the box is closed. We copy it exactly as you type it, up to 200 characters.",
      },
      {
        q: "Will the price show on the gift?",
        a: "No. There is no receipt or price anywhere in the box. Your receipt comes to you by email.",
      },
    ],
  },
  {
    id: "charcuterie",
    title: "Charcuterie boards",
    items: [
      {
        q: "When is my board made?",
        a: "On the day it leaves us. It arrives inside the two-hour window you chose, or is ready for pickup at that time.",
      },
      {
        q: "How do you handle allergies?",
        a: "Every board order asks about allergies and diet, and your answer is printed on the slip we work from. We can pack nuts and crisps separately or leave them out. Our kitchen handles milk, wheat, tree nuts and sesame, so we cannot promise a trace-free board.",
      },
      {
        q: "How long will it keep?",
        a: "Keep it in the fridge until 30 minutes before serving, and enjoy it within four hours at room temperature.",
      },
    ],
  },
  {
    id: "styling",
    title: "Holiday styling",
    items: [
      {
        q: "How do I book a date?",
        a: "Send an inquiry and we will reply within 1-2 business days. After a short call we send a written quote. Accepting it and paying a 40% retainer holds your date. The balance is due 48 hours before we arrive.",
      },
      {
        q: "What if my tree is taller than 9 ft?",
        a: "We would love to dress it. Tall trees take two installation slots and are always quoted personally.",
      },
      {
        q: "Do you take the decorations down in January?",
        a: "When takedown is offered for the season, we remove everything, wrap each ornament and label the boxes for next year.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery and pickup",
    items: [
      {
        q: "Where do you deliver?",
        a: "Across the Greater Toronto Area in three zones. Each zone has its own fee, minimum order and delivery days. Check your postal code on the Service Area page.",
      },
      {
        q: "Where is pickup?",
        a: "Pickup is free and has no minimum. We share the address and instructions in your order confirmation rather than publishing it here.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro
        kicker="Questions"
        title="Plain answers to good questions."
        italicWords={["questions."]}
        lede={`If yours is not here, write to us. ${SITE.replyPromise}`}
      />

      <section className="container-page pb-24 sm:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <nav aria-label="Topics" className="lg:col-span-3">
            <ul className="flex flex-wrap gap-2 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:flex-col lg:gap-1">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="inline-flex h-10 items-center rounded-full bg-cream px-4 text-[0.875rem] text-ink transition-colors hover:text-emerald lg:rounded-card lg:bg-transparent lg:px-0 lg:hover:text-gold-text"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16 lg:col-span-8 lg:col-start-5">
            {GROUPS.map((g) => (
              <Reveal as="section" key={g.id} id={g.id} className="scroll-mt-[calc(var(--header-h)+2rem)]">
                <h2 className="t-kicker mb-4 px-5 text-gold-text sm:px-6">{g.title}</h2>
                <Accordion items={g.items} defaultOpen={null} />
              </Reveal>
            ))}
            <Reveal className="rounded-card bg-cream px-6 py-8 sm:px-8">
              <p className="font-heading text-[1.5rem] text-emerald">Still wondering?</p>
              <p className="mt-2 t-body text-ink">{SITE.replyPromise}</p>
              <div className="mt-6">
                <TextLink href="/contact">Ask us directly</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
