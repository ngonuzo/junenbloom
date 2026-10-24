import React from "react";
import { CheckIcon, ChevronIcon } from "./Icons";

/**
 * Form controls: tonal fields with no outlines (DR-14), a clear focus ring (DR-20)
 * and labels that stay visible above every input.
 */

const CONTROL =
  "block w-full rounded-card px-4 text-[1rem] text-ink transition-[background-color,box-shadow] duration-300 ease-luxe outline-none focus-visible:outline-none focus:shadow-[0_0_0_2px_var(--emerald)] aria-[invalid=true]:shadow-[0_0_0_1.5px_var(--gold-text)]";

const SURFACE = {
  cream: "bg-cream hover:bg-linen/70 focus:bg-ivory",
  ivory: "bg-ivory hover:bg-ivory focus:bg-ivory",
} as const;

export type FieldSurface = keyof typeof SURFACE;

export function FieldLabel({
  htmlFor,
  children,
  hint,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[0.875rem] font-medium text-emerald">
        {children}
        {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </label>
      {hint && <span className="text-[0.8125rem] text-muted">{hint}</span>}
    </div>
  );
}

export function TextField({
  id,
  label,
  hint,
  optional,
  surface = "cream",
  className = "",
  error,
  ...rest
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  optional?: boolean;
  surface?: FieldSurface;
  className?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} hint={hint} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={rest.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL} ${SURFACE[surface]} h-12`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-gold-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  id,
  label,
  hint,
  optional,
  surface = "cream",
  className = "",
  ...rest
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  optional?: boolean;
  surface?: FieldSurface;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} hint={hint} optional={optional}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        name={rest.name ?? id}
        className={`${CONTROL} ${SURFACE[surface]} min-h-[7.5rem] resize-y py-3.5 leading-relaxed`}
        {...rest}
      />
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  optional,
  surface = "cream",
  className = "",
  children,
  ...rest
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  optional?: boolean;
  surface?: FieldSurface;
  className?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} hint={hint} optional={optional}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select
          id={id}
          name={rest.name ?? id}
          className={`${CONTROL} ${SURFACE[surface]} h-12 cursor-pointer appearance-none pr-11`}
          {...rest}
        >
          {children}
        </select>
        <ChevronIcon
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-text"
        />
      </div>
    </div>
  );
}

/** Custom checkbox: tonal square, emerald when checked, real input underneath. */
export function Checkbox({
  id,
  children,
  className = "",
  surface = "cream",
  ...rest
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  surface?: FieldSurface;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label htmlFor={id} className={`group flex cursor-pointer items-start gap-3 ${className}`}>
      <span className="relative mt-[0.15rem] inline-flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[3px] outline-none"
          {...rest}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[3px] transition-colors duration-300 ease-luxe peer-checked:bg-emerald peer-focus-visible:shadow-[0_0_0_2px_var(--ivory),0_0_0_4px_var(--emerald)] ${
            surface === "cream" ? "bg-linen group-hover:bg-moss/50" : "bg-ivory group-hover:bg-mist"
          }`}
        />
        <CheckIcon
          size={14}
          className="pointer-events-none absolute left-[3px] top-[3px] text-ivory opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
        />
      </span>
      <span className="t-small text-ink">{children}</span>
    </label>
  );
}

/**
 * Large selectable option (radio). Selected state fills emerald.
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  title,
  detail,
  aside,
  disabled,
  className = "",
  surface = "cream",
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: React.ReactNode;
  detail?: React.ReactNode;
  aside?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  surface?: FieldSurface;
}) {
  const idle =
    surface === "cream" ? "bg-cream hover:bg-linen/80 text-ink" : "bg-ivory hover:bg-mist text-ink";
  return (
    <label
      className={`relative flex cursor-pointer items-start justify-between gap-4 rounded-card px-4 py-4 transition-colors duration-300 ease-luxe has-[:focus-visible]:shadow-[0_0_0_2px_var(--ivory),0_0_0_4px_var(--emerald)] ${
        checked ? "bg-emerald text-ivory" : idle
      } ${disabled ? "pointer-events-none opacity-45" : ""} ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="min-w-0">
        <span className={`block text-[0.9375rem] font-medium ${checked ? "text-ivory" : "text-emerald"}`}>
          {title}
        </span>
        {detail && (
          <span className={`mt-1 block text-[0.8125rem] leading-snug ${checked ? "text-ivory-soft" : "text-muted"}`}>
            {detail}
          </span>
        )}
      </span>
      {aside && (
        <span className={`shrink-0 text-[0.9375rem] ${checked ? "text-gold" : "text-emerald"}`}>{aside}</span>
      )}
    </label>
  );
}
