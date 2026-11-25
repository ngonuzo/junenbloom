/**
 * Brand colours for emails. Email apps cannot read the site's CSS variables,
 * so these mirror the tokens in src/styles/tokens.css. Change both together.
 */
export const EMAIL_PALETTE = {
  ivory: "#FDFBF7", // --ivory  design-check-allow-hex
  ink: "#032A19", // --ink  design-check-allow-hex
  emerald: "#122620", // --emerald  design-check-allow-hex
  muted: "#455F4F", // --muted (computed)  design-check-allow-hex
} as const;
