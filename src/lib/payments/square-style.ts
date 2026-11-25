/**
 * Colours for Square's card form. It renders in Square's own secure frame,
 * which cannot read the site's CSS variables, so these mirror the tokens in
 * src/styles/tokens.css. Change both together.
 */
export const SQUARE_CARD_STYLE = {
  ".input-container": { borderColor: "#7A8B7B", borderRadius: "4px" }, // --sage  design-check-allow-hex
  ".input-container.is-focus": { borderColor: "#122620" }, // --emerald  design-check-allow-hex
  ".input-container.is-error": { borderColor: "#846A28" }, // --gold-text  design-check-allow-hex
  input: { color: "#032A19", fontSize: "16px" }, // --ink  design-check-allow-hex
  "input::placeholder": { color: "#455F4F" }, // --muted  design-check-allow-hex
  ".message-text": { color: "#455F4F" }, // --muted  design-check-allow-hex
  ".message-icon": { color: "#455F4F" }, // --muted  design-check-allow-hex
  ".message-text.is-error": { color: "#846A28" }, // --gold-text  design-check-allow-hex
} as const;
