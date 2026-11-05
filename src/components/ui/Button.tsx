import React from "react";
import Link from "next/link";
import { ArrowIcon } from "./Icons";

/**
 * One primary button style per view (DR-13): emerald fill, ivory text.
 * Secondary actions are quiet text links.
 */
const BASE =
  "group/btn relative inline-flex items-center justify-center gap-3 rounded-card bg-emerald text-ivory font-medium transition-[background-color,transform,opacity] duration-300 ease-luxe hover:bg-pine active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40";
const PRIMARY = `${BASE} uppercase tracking-[0.13em]`;
/** Same button with the label as written (sentence case) instead of capitals. */
const PRIMARY_SENTENCE = `${BASE} tracking-[0.01em]`;

const SIZES = {
  sm: "h-10 px-5 text-[0.75rem]",
  md: "h-12 px-7 text-[0.78rem]",
  lg: "h-14 px-8 text-[0.8125rem]",
} as const;

type Size = keyof typeof SIZES;

function Arrow() {
  return (
    <ArrowIcon
      size={20}
      className="text-gold transition-transform duration-500 ease-luxe group-hover/btn:translate-x-1"
    />
  );
}

export function ButtonLink({
  href,
  children,
  size = "md",
  arrow = true,
  sentenceCase = false,
  className = "",
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  /** Pass "" to size the button entirely through className. */
  size?: Size | "";
  arrow?: boolean;
  sentenceCase?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const look = sentenceCase ? PRIMARY_SENTENCE : PRIMARY;
  return (
    <Link href={href} className={`${look} ${size ? SIZES[size] : ""} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  children,
  size = "md",
  arrow = false,
  className = "",
  type = "button",
  ...rest
}: {
  children: React.ReactNode;
  size?: Size;
  arrow?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${PRIMARY} ${SIZES[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}

/** Quiet secondary action with a drawn underline and a fine arrow. */
export function TextLink({
  href,
  children,
  arrow = true,
  className = "",
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={`group/link inline-flex items-center gap-2.5 text-[0.9375rem] font-medium text-emerald transition-colors duration-300 hover:text-gold-text ${className}`}
      {...rest}
    >
      <span className="link-quiet">{children}</span>
      {arrow && (
        <ArrowIcon
          size={18}
          className="transition-transform duration-500 ease-luxe group-hover/link:translate-x-1"
        />
      )}
    </Link>
  );
}

/** Same look as TextLink for in-page actions. */
export function TextButton({
  children,
  arrow = false,
  className = "",
  type = "button",
  ...rest
}: {
  children: React.ReactNode;
  arrow?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`group/link inline-flex items-center gap-2.5 text-[0.9375rem] font-medium text-emerald transition-colors duration-300 hover:text-gold-text disabled:opacity-40 ${className}`}
      {...rest}
    >
      <span className="link-quiet">{children}</span>
      {arrow && (
        <ArrowIcon
          size={18}
          className="transition-transform duration-500 ease-luxe group-hover/link:translate-x-1"
        />
      )}
    </button>
  );
}
