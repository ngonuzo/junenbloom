import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, className = "", ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className: `shrink-0 ${className}`,
    ...rest,
  };
}

/** Long, fine arrow used on primary actions and quiet links. */
export function ArrowIcon({ size = 18, className = "", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 22 10"
      width={size}
      height={(size * 10) / 22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.15}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      className={`shrink-0 ${className}`}
      {...rest}
    >
      <path d="M1 5h19.5M16 1l4.5 4-4.5 4" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base(props)}>
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base(props)}>
      <path d="M2.5 8h11" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base(props)}>
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base(props)}>
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(props)}>
      <path d="M4 7h12l-.9 10H4.9L4 7z" />
      <path d="M7.2 7V5.6a2.8 2.8 0 015.6 0V7" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(props)}>
      <path d="M10 18s5.5-5.2 5.5-9.4A5.5 5.5 0 004.5 8.6C4.5 12.8 10 18 10 18z" />
      <circle cx="10" cy="8.6" r="1.9" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base(props)}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}
