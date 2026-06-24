'use client';
import { createContext, useContext } from 'react';
import { interpolate, type Strings } from '@/lib/ui-runtime';
import type { Locale } from '@/lib/i18n';

/* Carries the chosen teaching medium + its (already English-filled) chrome
   dictionary to client components in the course shell. The server resolves the
   dict once via uiDict(locale) and passes it in, so only the active locale's
   strings cross to the browser. Server components take a `locale` prop and call
   tUI() directly instead. */
interface LocaleCtx { locale: Locale; dict: Strings }
const Ctx = createContext<LocaleCtx>({ locale: 'en', dict: {} });

export function CourseLocaleProvider({ locale, dict, children }:
  { locale: Locale; dict: Strings; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, dict }}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx).locale;
}

/** Bound chrome translator: t('btn.check') / t('nav.unit', { n: 3 }). */
export function useUI() {
  const { dict } = useContext(Ctx);
  return (key: string, vars?: Record<string, string | number>) => interpolate(dict[key] ?? key, vars);
}
