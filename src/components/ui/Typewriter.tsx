"use client";

import React, { useEffect, useState } from "react";

/**
 * Types a phrase, holds it, erases it and types the next, on a loop.
 * The first phrase is rendered in full on the server, so the heading reads
 * correctly before JavaScript loads. The longest phrase reserves its space
 * underneath, so the layout never jumps while letters come and go.
 * Reduced-motion users see the first phrase, still and complete.
 */
export function Typewriter({
  phrases,
  className = "",
  typeMs = 65,
  eraseMs = 32,
  holdMs = 2400,
}: {
  phrases: string[];
  className?: string;
  typeMs?: number;
  eraseMs?: number;
  holdMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phrases[0] ?? "");
  const [phase, setPhase] = useState<"hold" | "erase" | "type">("hold");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced || phrases.length < 2) return;
    const target = phrases[index];
    let timer: number | undefined;

    if (phase === "hold") {
      timer = window.setTimeout(() => setPhase("erase"), holdMs);
    } else if (phase === "erase") {
      if (text.length === 0) {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase("type");
      } else {
        timer = window.setTimeout(() => setText((t) => t.slice(0, -1)), eraseMs);
      }
    } else if (text === target) {
      setPhase("hold");
    } else {
      timer = window.setTimeout(() => setText(target.slice(0, text.length + 1)), typeMs);
    }

    return () => window.clearTimeout(timer);
  }, [phase, text, index, reduced, phrases, typeMs, eraseMs, holdMs]);

  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");
  const caret = (
    <span
      aria-hidden
      className="anim-caret ml-[0.06em] inline-block h-[0.82em] w-[0.06em] translate-y-[0.08em] bg-gold-text"
    />
  );

  return (
    <span className={`grid ${className}`}>
      {/* Reserves the height of the longest phrase */}
      <span aria-hidden className="invisible [grid-area:1/1]">
        {longest}
        {caret}
      </span>
      <span aria-hidden className="[grid-area:1/1]">
        {reduced ? phrases[0] : text}
        {!reduced && caret}
      </span>
      <span className="sr-only">{phrases.join(" ")}</span>
    </span>
  );
}
