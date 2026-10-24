"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ProductImage } from "@/lib/db/store";
import { ImageSlot, type SlotTone } from "@/components/ui/ImageSlot";
import { EASE_LUXE } from "@/components/ui/Reveal";
import { photoRatio } from "@/lib/catalog";

/**
 * Main photograph with thumbnails to switch views. Photos crossfade in place,
 * and the selected thumbnail is marked by tone and a small dot rather than an outline.
 */
export function PhotoGallery({
  photos,
  tone,
  name,
  sizes,
  tag,
}: {
  photos: ProductImage[];
  tone: SlotTone;
  name: string;
  sizes: string;
  tag?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const active = photos[Math.min(index, photos.length - 1)];

  return (
    <div>
      <div className="grid">
        <AnimatePresence initial={false}>
          <motion.div
            key={active.src}
            className="[grid-area:1/1]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_LUXE }}
          >
            <ImageSlot
              title={name}
              tone={tone}
              photo={active}
              ratio={photoRatio(active)}
              sizes={sizes}
              tag={tag}
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label={`Photos of ${name}`}>
          {photos.map((p, i) => {
            const on = p.src === active.src;
            return (
              <li key={p.src} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={on}
                  aria-label={`Photo ${i + 1} of ${photos.length}`}
                  className={`relative block overflow-hidden rounded-card transition-opacity duration-300 ${
                    photoRatio(p) === "3:2" ? "h-14 w-[5.25rem]" : "h-20 w-16"
                  } ${
                    on ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={p.src}
                    alt=""
                    fill
                    sizes="84px"
                    className="object-cover"
                    style={{ objectPosition: p.focal ?? "50% 50%" }}
                  />
                </button>
                <span
                  aria-hidden
                  className={`h-1 w-1 rounded-full bg-emerald transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
