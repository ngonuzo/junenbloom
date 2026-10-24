"use client";

import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";

export const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

type RevealTag = "div" | "section" | "li" | "article" | "header" | "p" | "span" | "figure";

/** Fade and gentle rise as the block enters the viewport (DR-19). */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  duration = 0.9,
  amount = 0.2,
  as = "div",
  className = "",
  id,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  amount?: number;
  as?: RevealTag;
  className?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE_LUXE }}
    >
      {children}
    </Tag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: (stagger: number = 0.09) => ({ transition: { staggerChildren: stagger } }),
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_LUXE } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className = "",
  stagger = 0.09,
  amount = 0.15,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={staggerParent}
      custom={stagger}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={staggerChild}>
      {children}
    </Tag>
  );
}

const wordParent: Variants = {
  hidden: {},
  show: (delay: number = 0) => ({ transition: { staggerChildren: 0.045, delayChildren: delay } }),
};

const wordChild: Variants = {
  hidden: { y: "130%" },
  show: { y: "0%", transition: { duration: 1, ease: EASE_LUXE } },
};

/**
 * Headline that rises word by word from behind a mask.
 * Words stay real text, so the heading reads normally to assistive technology.
 */
export function RevealWords({
  text,
  as = "h2",
  className = "",
  delay = 0,
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(" ");
  return (
    <Tag
      id={id}
      className={className}
      variants={wordParent}
      custom={delay}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="mask-line">
            <motion.span className="inline-block" variants={wordChild}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/** Image slot that opens like a curtain and settles from a slight zoom. */
export function RevealMask({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  // The viewport trigger lives on an unclipped wrapper: a fully clipped element
  // never reports an intersection, so it could never open itself.
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="h-full w-full overflow-hidden rounded-[inherit]"
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)" },
          show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, delay, ease: EASE_LUXE } },
        }}
      >
        <motion.div
          className="h-full w-full"
          variants={{
            hidden: { scale: 1.08 },
            show: { scale: 1, transition: { duration: 2, delay, ease: EASE_LUXE } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Slow vertical drift tied to scroll position. Disabled for reduced motion. */
export function Parallax({
  children,
  className = "",
  distance = 40,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
