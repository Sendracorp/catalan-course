/* Client-safe i18n runtime: just the placeholder interpolator and the dict
   type. Deliberately holds NO string data, so importing it into a client
   component does not pull the full multi-locale UI map (lib/ui.ts) into the
   browser bundle — the active locale's dict is handed to the client via props
   (see CourseLocaleProvider). */

export type Strings = Record<string, string>;

/** The handful of chrome strings <BuyButton> needs, resolved server-side and
    passed in as a prop so the client component never imports the full UI map.
    `buy` is a template containing {price}. */
export interface BuyLabels { errStart: string; errLoad: string; errConn: string; opening: string; buy: string }

/** Replace {name} placeholders in a chrome string. */
export function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
