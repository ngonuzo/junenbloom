"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { SITE } from "@/content/site";

export const TOPICS = [
  { value: "general", label: "A general question" },
  { value: "gift", label: "A gift order" },
  { value: "rush", label: "A board or gift needed soon" },
  { value: "styling", label: "Holiday styling" },
  { value: "delivery", label: "Delivery outside our area" },
  { value: "business", label: "Gifts for a business" },
  { value: "other", label: "Other" },
];

/** Field label with a required-field asterisk. */
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span aria-hidden className="ml-0.5 text-gold-text">
        *
      </span>
    </>
  );
}

/** Contact form (T4.15) with a honeypot; saved before anyone is notified. */
export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS.some((t) => t.value === initialTopic) ? initialTopic! : "general");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [tried, setTried] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Phone is optional; if given, it needs at least 7 digits.
  const phoneOk = phone.trim() === "" || phone.replace(/\D/g, "").length >= 7;
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && message.trim().length > 1 && phoneOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (company) {
      setState("done");
      return;
    }
    if (!valid) return;
    setState("sending");
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contact_message",
          payload: {
            name,
            email,
            phone: phone.trim() || undefined,
            topic: TOPICS.find((t) => t.value === topic)?.label ?? topic,
            message,
          },
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "done" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_LUXE }}
          role="status"
          className="flex min-h-[26rem] flex-col justify-center"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-gold">
            <CheckIcon size={20} />
          </span>
          <h2 className="t-h2 mt-8">Thank you{name ? `, ${name.split(" ")[0]}` : ""}.</h2>
          <p className="mt-4 max-w-md t-body text-ink">
            Your message is with us. {SITE.replyPromise}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="company">Company</label>
            <input id="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="contact-name"
              label={<RequiredLabel>Your name</RequiredLabel>}
              required
              aria-required="true"
              autoComplete="name"
              surface="ivory"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={tried && !name.trim() ? "Please add your name." : undefined}
            />
            <TextField
              id="contact-email"
              type="email"
              label={<RequiredLabel>Email</RequiredLabel>}
              required
              aria-required="true"
              autoComplete="email"
              surface="ivory"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={tried && !/\S+@\S+\.\S+/.test(email) ? "Please add a valid email." : undefined}
            />
            <TextField
              id="contact-phone"
              type="tel"
              label={
                <>
                  Phone number
                  <span className="ml-1.5 font-normal italic text-muted">(optional)</span>
                </>
              }
              autoComplete="tel"
              inputMode="tel"
              surface="ivory"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={tried && !phoneOk ? "Please check the phone number." : undefined}
            />
          </div>
          <SelectField id="contact-topic" label="What is it about" surface="ivory" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
          <TextArea
            id="contact-message"
            label="Message"
            surface="ivory"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="The date, the postal code and anything else that helps."
          />
          {tried && message.trim().length <= 1 && (
            <p className="-mt-3 text-[0.8125rem] text-gold-text">Please write a short message.</p>
          )}
          {state === "error" && (
            <p role="alert" className="t-small text-emerald">
              That did not go through. Please try again, or email {SITE.email}.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
            <p className="text-[0.8125rem] text-muted">
              We use your details only to reply. See our{" "}
              <a href="/policies/privacy" className="link-quiet text-emerald">
                privacy policy
              </a>
              .
            </p>
            <Button type="submit" size="lg" arrow disabled={state === "sending"}>
              {state === "sending" ? "Sending" : "Send message"}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
