import 'server-only';
import crypto from 'node:crypto';

/* Transactional email via Resend (REST — no SDK dependency). Best-effort: a
   send failure never throws, so it can't break the action that triggered it.
   Requires RESEND_API_KEY and a verified sender domain (EMAIL_FROM). */

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || 'Verbadium <hello@verbadium.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verbadium.com';
// HMAC secret for unsubscribe links. Service-role key is always present
// server-side and never shipped to the client; the token is only its digest.
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-only-secret';

export function unsubToken(email: string): string {
  return crypto.createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32);
}
export function verifyUnsubToken(email: string, token: string): boolean {
  const expected = unsubToken(email);
  const a = Buffer.from(token), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}

type Copy = { subject: string; greeting: string; body: string; cheatCta: string; ps: string; courseCta: string; unsub: string };

const COPY: Record<string, Copy> = {
  en: {
    subject: 'Your Catalan IPA cheat sheet',
    greeting: 'Hi,',
    body: 'Thanks for trying the free preview! Here’s your Catalan pronunciation (IPA) cheat sheet — master this one page and you can read almost any Catalan word correctly.',
    cheatCta: 'Open the IPA cheat sheet',
    ps: 'When you’re ready to go from zero to the official A1 exam — native audio, full IPA, 100+ exercises and a mock exam — the full course is a one-time payment with lifetime access.',
    courseCta: 'See the full course',
    unsub: 'Unsubscribe',
  },
  es: {
    subject: 'Tu chuleta de AFI en catalán',
    greeting: 'Hola,',
    body: '¡Gracias por probar la vista previa gratuita! Aquí tienes tu chuleta de pronunciación catalana (AFI) — domina esta página y podrás leer bien casi cualquier palabra en catalán.',
    cheatCta: 'Abrir la chuleta de AFI',
    ps: 'Cuando quieras ir de cero al examen oficial de A1 — con audio nativo, AFI completo, más de 100 ejercicios y un examen de práctica — el curso completo es un pago único con acceso de por vida.',
    courseCta: 'Ver el curso completo',
    unsub: 'Cancelar suscripción',
  },
  fr: {
    subject: 'Votre aide-mémoire API du catalan',
    greeting: 'Bonjour,',
    body: 'Merci d’avoir essayé l’aperçu gratuit ! Voici votre aide-mémoire de prononciation catalane (API) — maîtrisez cette page et vous lirez correctement presque n’importe quel mot catalan.',
    cheatCta: 'Ouvrir l’aide-mémoire API',
    ps: 'Quand vous serez prêt à passer de zéro à l’examen officiel A1 — audio natif, API complet, plus de 100 exercices et un examen blanc — le cours complet est un paiement unique avec accès à vie.',
    courseCta: 'Voir le cours complet',
    unsub: 'Se désabonner',
  },
  ru: {
    subject: 'Ваша шпаргалка по МФА для каталанского',
    greeting: 'Здравствуйте,',
    body: 'Спасибо, что попробовали бесплатный предпросмотр! Вот ваша шпаргалка по каталанскому произношению (МФА) — освойте эту страницу и сможете правильно прочитать почти любое каталанское слово.',
    cheatCta: 'Открыть шпаргалку по МФА',
    ps: 'Когда будете готовы пройти путь с нуля до официального экзамена A1 — с аудио носителей, полным МФА, более чем 100 упражнениями и пробным экзаменом — полный курс покупается один раз и остаётся навсегда.',
    courseCta: 'Посмотреть полный курс',
    unsub: 'Отписаться',
  },
  de: {
    subject: 'Dein katalanischer IPA-Spickzettel',
    greeting: 'Hallo,',
    body: 'Danke, dass du die kostenlose Vorschau ausprobiert hast! Hier ist dein katalanischer Aussprache-Spickzettel (IPA) — beherrsche diese eine Seite und du kannst fast jedes katalanische Wort richtig lesen.',
    cheatCta: 'IPA-Spickzettel öffnen',
    ps: 'Wenn du bereit bist, von null bis zur offiziellen A1-Prüfung zu gehen — mit muttersprachlichem Audio, vollständigem IPA, über 100 Übungen und einer Probeprüfung — ist der komplette Kurs eine einmalige Zahlung mit lebenslangem Zugang.',
    courseCta: 'Den kompletten Kurs ansehen',
    unsub: 'Abmelden',
  },
  ca: {
    subject: 'La teva guia ràpida d’AFI en català',
    greeting: 'Hola,',
    body: 'Gràcies per provar la vista prèvia gratuïta! Aquí tens la teva guia ràpida de pronunciació catalana (AFI) — domina aquesta pàgina i podràs llegir bé gairebé qualsevol paraula en català.',
    cheatCta: 'Obre la guia d’AFI',
    ps: 'Quan vulguis anar de zero a l’examen oficial d’A1 — amb àudio de parlants nadius, AFI complet, més de 100 exercicis i un examen de mostra — el curs complet és un sol pagament amb accés de per vida.',
    courseCta: 'Mira el curs complet',
    unsub: 'Dona’t de baixa',
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(c: Copy, links: { cheat: string; course: string; unsub: string }): string {
  const btn = 'display:inline-block;padding:12px 20px;border-radius:8px;background:#5b3df5;color:#fff;text-decoration:none;font-weight:600';
  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2430">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="font-size:20px;font-weight:700;color:#5b3df5;margin-bottom:20px">Verbadium</div>
    <p style="font-size:16px;line-height:1.5;margin:0 0 8px">${esc(c.greeting)}</p>
    <p style="font-size:16px;line-height:1.5;margin:0 0 20px">${esc(c.body)}</p>
    <p style="margin:0 0 28px"><a href="${links.cheat}" style="${btn}">${esc(c.cheatCta)}</a></p>
    <p style="font-size:14px;line-height:1.5;color:#4a5160;margin:0 0 14px">${esc(c.ps)}</p>
    <p style="margin:0 0 28px"><a href="${links.course}" style="color:#5b3df5;font-weight:600;text-decoration:none">${esc(c.courseCta)} →</a></p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="font-size:12px;color:#9aa1ad;margin:0"><a href="${links.unsub}" style="color:#9aa1ad">${esc(c.unsub)}</a></p>
  </div></body></html>`;
}

/** Send the free-preview welcome email (IPA cheat sheet + course nudge).
    No-op if RESEND_API_KEY is unset; never throws. */
export async function sendLeadWelcome(to: string, locale: string, links: { cheat: string; course: string }): Promise<void> {
  if (!KEY) return;
  const c = COPY[locale] ?? COPY.en;
  const unsub = unsubscribeUrl(to);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to, subject: c.subject,
        html: render(c, { ...links, unsub }),
        headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      }),
    });
  } catch { /* best-effort */ }
}
