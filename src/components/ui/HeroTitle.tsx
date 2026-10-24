import React from "react";

/**
 * Page title whose words rise from behind a mask on first paint.
 * Rendered on the server with CSS animation, so it never waits for JavaScript.
 */
export function HeroTitle({
  text,
  as: Tag = "h1",
  className = "t-display",
  delay = 120,
  step = 55,
  italicWords = [],
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  delay?: number;
  step?: number;
  /** Words (exact match, punctuation included) set in the italic cut for emphasis. */
  italicWords?: string[];
  id?: string;
}) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={className}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="mask-line">
            <span
              className={`anim-rise ${italicWords.includes(word) ? "italic" : ""}`}
              style={{ "--d": `${delay + i * step}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}
