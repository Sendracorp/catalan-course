/* Business + contact details used across legal/contact pages and the footer.
   Paddle's seller verification needs the legal name in the Terms, and a
   contact page with both an email and a phone number.

   TODO before going live: fill in legalName, phone and address with your
   real registered details (these are placeholders). */

export const SITE = {
  brand: 'Català from Scratch',
  legalName: 'Sendracorp',                    // TODO: registered business / sole-trader legal name
  email: 'sendracorp@protonmail.com',
  phone: '',                                  // TODO: required by Paddle — add a contact phone number
  address: '',                                // TODO: registered business address
  country: 'Andorra',
  jurisdiction: 'Andorra',
  lastUpdated: '13 June 2026',
};

/** A field value, or a clearly-visible placeholder when not yet filled in. */
export function siteField(value: string, placeholder: string): string {
  return value.trim() ? value : `[${placeholder}]`;
}
