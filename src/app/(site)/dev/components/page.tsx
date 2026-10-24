import React from "react";
import { Wordmark, MonogramMark } from "@/components/brand/Wordmark";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button, ButtonLink, TextLink } from "@/components/ui/Button";
import { Checkbox, TextField } from "@/components/ui/Field";
import { Accordion } from "@/components/ui/Accordion";
import { ZoneChecker } from "@/components/site/ZoneChecker";

const SWATCHES = [
  { name: "ivory", cls: "bg-ivory text-ink", use: "Page background" },
  { name: "cream", cls: "bg-cream text-ink", use: "Quiet panels" },
  { name: "linen", cls: "bg-linen text-ink", use: "Warm surfaces" },
  { name: "mist", cls: "bg-mist text-ink", use: "Notices" },
  { name: "moss", cls: "bg-moss text-emerald", use: "Image tone" },
  { name: "sage", cls: "bg-sage text-ivory", use: "Tags, large only" },
  { name: "gold", cls: "bg-gold text-emerald", use: "Accents on emerald" },
  { name: "gold-text", cls: "bg-gold-text text-ivory", use: "Gold text on ivory" },
  { name: "emerald", cls: "bg-emerald text-ivory", use: "Headings, buttons" },
  { name: "ink", cls: "bg-ink text-ivory", use: "Body text" },
];

/** Component showcase (T1.9): tokens, marks, actions and placeholders, with no divider lines. */
export default function DevComponentsPage() {
  return (
    <div className="container-page space-y-24 pb-24 pt-10 sm:pt-16">
      <header>
        <p className="t-kicker text-gold-text">Design review, step 3 of 3</p>
        <h1 className="t-h1 mt-6 max-w-3xl">Tokens and components.</h1>
        <p className="mt-5 max-w-2xl t-lede text-ink">
          Every colour on the site comes from these tokens. Separation is by space and tone, never by lines.
        </p>
      </header>

      <section>
        <h2 className="t-h3">Colour</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.name} className={`flex aspect-[4/3] flex-col justify-end rounded-card p-4 ${s.cls}`}>
              <p className="font-heading text-[1.125rem]">{s.name}</p>
              <p className="text-[0.75rem] opacity-75">{s.use}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="t-h3">Type</h2>
        <div className="mt-8 space-y-6">
          <p className="t-display">Display, up to 64 px</p>
          <p className="t-h1">Page title</p>
          <p className="t-h2">Section title</p>
          <p className="t-h3">Card heading, 22 px</p>
          <p className="t-lede max-w-2xl">Lede. Warm, composed and specific, with short sentences and no hype.</p>
          <p className="t-body max-w-2xl">Body. Every box holds five or six pieces, each chosen by hand.</p>
          <p className="t-kicker text-gold-text">Kicker</p>
        </div>
      </section>

      <section>
        <h2 className="t-h3">Marks and actions</h2>
        <div className="mt-8 flex flex-wrap items-center gap-10">
          <MonogramMark size={56} />
          <Wordmark size="lg" />
          <ButtonLink href="/gifting">Primary action</ButtonLink>
          <Button size="sm">Small primary</Button>
          <TextLink href="/gifting">Quiet text link</TextLink>
        </div>
      </section>

      <section>
        <h2 className="t-h3">Image placeholders</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ImageSlot title="Emerald, 4:5" caption="Product tile" tone="emerald" composition={0} />
          <ImageSlot title="Linen, 4:5" caption="Product tile" tone="linen" composition={1} />
          <ImageSlot title="Moss, 4:5" caption="Sample styling" tone="moss" composition={2} tag="Sample styling" />
          <ImageSlot title="Mist, 4:5" caption="Product tile" tone="mist" composition={3} />
        </div>
        <div className="mt-6 max-w-3xl">
          <ImageSlot title="Hero and story, 3:2" caption="Landscape" ratio="3:2" tone="emerald" size="lg" ambient />
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="t-h3">Fields</h2>
          <div className="mt-8 space-y-6">
            <TextField id="demo-name" label="Your name" placeholder="Full name" />
            <TextField id="demo-email" label="Email" error="Please add a valid email." defaultValue="hello@" />
            <Checkbox id="demo-check">Send me seasonal letters. Optional.</Checkbox>
          </div>
        </div>
        <div>
          <h2 className="t-h3">Postal code checker</h2>
          <div className="mt-8">
            <ZoneChecker />
          </div>
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="t-h3">Accordion</h2>
        <div className="mt-8">
          <Accordion
            items={[
              { q: "Separated by space", a: "Open items rest on a soft tonal panel instead of between ruled lines." },
              { q: "Keyboard friendly", a: "Each question is a real button with its expanded state announced." },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
