// Central site / operator configuration.
//
// The legally required operator details shown in the Impressum and
// Datenschutzerklärung are read from environment variables so that anyone who
// deploys their own instance provides their OWN details instead of shipping
// someone else's. The repository intentionally ships only placeholders.
//
// Set these in `.env.local` for local development, or in your hosting
// provider's environment settings for production (see `.env.example`).
// Because these values are rendered in the browser they use the
// `NEXT_PUBLIC_` prefix and are therefore public — that is fine, an Impressum
// is public by nature.

export const operator = {
  /** Full legal name of the site operator (Betreiber / Verantwortlicher). */
  name: process.env.NEXT_PUBLIC_OPERATOR_NAME || 'Your Name',
  /** Optional "c/o" line, e.g. when using an Impressum anonymization service. */
  careOf: process.env.NEXT_PUBLIC_OPERATOR_CO || '',
  /** Street and house number. */
  street: process.env.NEXT_PUBLIC_OPERATOR_STREET || 'Your Street 1',
  /** Postal code and city, e.g. "12345 Your City". */
  city: process.env.NEXT_PUBLIC_OPERATOR_CITY || '12345 Your City',
  /** Country. */
  country: process.env.NEXT_PUBLIC_OPERATOR_COUNTRY || 'Deutschland',
  /** Contact email address. */
  email: process.env.NEXT_PUBLIC_OPERATOR_EMAIL || 'you@example.com',
} as const
