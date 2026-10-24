"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Ampersand } from "@/components/brand/Wordmark";

export interface SlotPhoto {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** CSS object-position for the crop, e.g. "50% 40%". */
  focal?: string;
}

export type SlotTone = "emerald" | "moss" | "linen" | "mist";
export type SlotRatio = "4:5" | "3:2" | "1:1" | "5:4";

const RATIO: Record<SlotRatio, string> = {
  "4:5": "aspect-[4/5]",
  "3:2": "aspect-[3/2]",
  "1:1": "aspect-square",
  "5:4": "aspect-[5/4]",
};

const RATIO_VALUE: Record<SlotRatio, number> = {
  "4:5": 4 / 5,
  "3:2": 3 / 2,
  "1:1": 1,
  "5:4": 5 / 4,
};

const PARALLAX_ZOOM = 1.06;

/**
 * object-cover enlarges a photo whose shape differs from its slot, and parallax
 * enlarges it further. Scale the sizes hint by the same amount so the browser
 * downloads a file large enough to stay sharp at the size it is actually drawn.
 */
function coverSizes(sizes: string, photo: SlotPhoto, ratio: SlotRatio, zoom: number): string {
  const slot = RATIO_VALUE[ratio];
  const own = photo.width && photo.height ? photo.width / photo.height : slot;
  // Only a photo wider than its slot is drawn wider than the slot.
  const factor = Math.max(own / slot, 1) * zoom;
  if (factor < 1.02) return sizes;
  const f = factor.toFixed(2);
  return sizes
    .split(",")
    .map((part) => {
      const t = part.trim();
      const m = t.match(/^(\(.*\))\s+(.+)$/);
      return m ? `${m[1]} calc(${m[2]} * ${f})` : `calc(${t} * ${f})`;
    })
    .join(", ");
}

const TONE: Record<SlotTone, { bg: string; text: string; glyph: string; label: string; light: string }> = {
  emerald: {
    bg: "bg-emerald",
    text: "text-ivory",
    glyph: "text-gold",
    label: "text-gold",
    light: "color-mix(in oklab, var(--gold) 22%, transparent)",
  },
  moss: {
    bg: "bg-moss",
    text: "text-emerald",
    glyph: "text-emerald",
    label: "text-emerald",
    light: "color-mix(in oklab, var(--ivory) 55%, transparent)",
  },
  linen: {
    bg: "bg-linen",
    text: "text-emerald",
    glyph: "text-gold-text",
    label: "text-gold-text",
    light: "color-mix(in oklab, var(--ivory) 70%, transparent)",
  },
  mist: {
    bg: "bg-mist",
    text: "text-emerald",
    glyph: "text-emerald",
    label: "text-emerald",
    light: "color-mix(in oklab, var(--ivory) 75%, transparent)",
  },
};

/** Where the oversized ampersand sits, so a grid of slots never repeats exactly. */
const COMPOSITIONS = [
  "right-[-14%] bottom-[-12%] h-[86%]",
  "left-[-16%] top-[-8%] h-[78%]",
  "right-[-6%] top-[6%] h-[70%]",
  "left-[-8%] bottom-[-16%] h-[90%]",
] as const;

/**
 * Intentional image placeholder (DR-18).
 * A tonal panel with paper grain, soft window light, the brand ampersand as a
 * watermark and the subject's name set in the heading face. When owned
 * photography arrives it replaces this slot at the same aspect ratio: pass
 * `photo`, and optionally `hoverPhoto` for a second view on hover.
 */
export function ImageSlot({
  title,
  caption,
  ratio = "4:5",
  tone = "emerald",
  composition = 0,
  tag,
  size = "md",
  parallax = false,
  ambient = false,
  className = "",
  photo,
  hoverPhoto,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: {
  title: string;
  caption?: string;
  ratio?: SlotRatio;
  tone?: SlotTone;
  composition?: number;
  /** Small label in the top corner, e.g. "Sample styling" (DR-17). */
  tag?: string;
  size?: "sm" | "md" | "lg";
  parallax?: boolean;
  /** Slow drifting light for hero slots. */
  ambient?: boolean;
  className?: string;
  /** Owned photography (DR-17). When present it replaces the placeholder. */
  photo?: SlotPhoto;
  /** Second photograph revealed on hover, e.g. the box opened. */
  hoverPhoto?: SlotPhoto;
  /** Responsive sizes hint for the image optimiser. */
  sizes?: string;
  /** Load eagerly; use for the photograph that is the page's largest paint. */
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glyphY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);
  const [loaded, setLoaded] = useState(priority);
  const t = TONE[tone];

  if (photo) {
    const zoom = parallax && !reduce ? PARALLAX_ZOOM : 1;
    const photoSizes = coverSizes(sizes, photo, ratio, zoom);
    const hoverSizes = hoverPhoto ? coverSizes(sizes, hoverPhoto, ratio, zoom) : sizes;
    return (
      <div
        ref={ref}
        className={`group/slot relative isolate overflow-hidden rounded-card ${RATIO[ratio]} ${t.bg} ${className}`}
      >
        <motion.div
          className="absolute inset-0"
          style={parallax && !reduce ? { y: photoY, scale: PARALLAX_ZOOM } : undefined}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={photoSizes}
            quality={85}
            priority={priority}
            onLoad={() => setLoaded(true)}
            className={`object-cover transition-opacity duration-700 ease-luxe ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ objectPosition: photo.focal ?? "50% 50%" }}
          />
          {hoverPhoto && (
            <Image
              src={hoverPhoto.src}
              alt=""
              aria-hidden
              fill
              sizes={hoverSizes}
              quality={85}
              className="object-cover opacity-0 transition-opacity duration-700 ease-luxe group-hover/slot:opacity-100"
              style={{ objectPosition: hoverPhoto.focal ?? "50% 50%" }}
            />
          )}
        </motion.div>
        {tag && (
          <span className="absolute right-4 top-4 rounded-full bg-ivory/90 px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.04em] text-emerald backdrop-blur-sm sm:right-5 sm:top-5">
            {tag}
          </span>
        )}
      </div>
    );
  }
  const placement = COMPOSITIONS[Math.abs(composition) % COMPOSITIONS.length];

  const titleSize =
    size === "lg"
      ? "text-[1.75rem] sm:text-[2.25rem]"
      : size === "sm"
        ? "text-[1.125rem]"
        : "text-[1.375rem] sm:text-[1.5rem]";

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${title}${caption ? `, ${caption}` : ""}. Photograph to come.`}
      className={`relative isolate overflow-hidden rounded-card ${RATIO[ratio]} ${t.bg} ${className}`}
    >
      {/* Window light */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-[20%] ${ambient ? "anim-light" : ""}`}
        style={{
          background: `radial-gradient(60% 55% at 28% 22%, ${t.light}, transparent 70%)`,
        }}
      />
      {/* Soft vignette for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            tone === "emerald"
              ? "radial-gradient(120% 90% at 70% 110%, color-mix(in oklab, var(--ink) 55%, transparent), transparent 60%)"
              : "radial-gradient(120% 90% at 75% 115%, color-mix(in oklab, var(--sage) 28%, transparent), transparent 60%)",
        }}
      />

      {/* Ampersand watermark */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute ${placement} ${t.glyph} opacity-[0.13] transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.04]`}
        style={parallax && !reduce ? { y: glyphY } : undefined}
      >
        <Ampersand className="!h-full" />
      </motion.div>

      {/* Grain */}
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply" />

      {/* Labels */}
      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`text-[0.6875rem] font-medium uppercase tracking-[0.2em] ${t.label} opacity-90 ${
              size === "sm" ? "invisible" : ""
            }`}
          >
            June &amp; Bloom
          </span>
          {tag && (
            <span
              className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.04em] ${
                tone === "emerald" ? "bg-pine text-gold" : "bg-ivory/80 text-emerald"
              }`}
            >
              {tag}
            </span>
          )}
        </div>
        <div className="max-w-[85%]">
          {caption && (
            <p className={`mb-2 text-[0.75rem] tracking-[0.02em] ${t.text} opacity-75`}>{caption}</p>
          )}
          <p className={`font-heading italic leading-[1.1] tracking-[-0.01em] ${titleSize} ${t.text}`}>
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
