/* Lightweight i18n for the localized MARKETING surface (home + course landing
   + shell). English stays at root; ca/es/fr are SEO landing pages that funnel
   into the (English-taught) course. No dependency — just typed dictionaries. */

// en/ca/es/fr/ru have marketing landing pages; de is a TEACHING MEDIUM only
// (course content + chrome), with no marketing page — the iterations over
// LOCALES that touch PATHS guard against locales missing a route.
export const LOCALES = ['en', 'ca', 'es', 'fr', 'ru', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<Locale, string> = { en: 'English', ca: 'Català', es: 'Español', fr: 'Français', ru: 'Русский', de: 'Deutsch' };

/* Canonical paths per page, per locale (localized slugs carry the keyword). */
export const PATHS = {
  home: { en: '/', ca: '/ca', es: '/es', fr: '/fr', ru: '/ru', de: '/de' },
  course: {
    en: '/courses/catalan-a1',
    ca: '/ca/curs-de-catala',
    es: '/es/curso-de-catalan',
    fr: '/fr/cours-de-catalan',
    ru: '/ru/kurs-katalanskogo',
    de: '/de/katalanisch-kurs',
  },
  pricing: {
    en: '/pricing',
    ca: '/ca/preus',
    es: '/es/precios',
    fr: '/fr/tarifs',
    ru: '/ru/ceny',
    de: '/de/preise',
  },
} as const;
export type PageKey = keyof typeof PATHS;

/** hreflang map for next/metadata `alternates.languages` (+ x-default = English). */
export function hreflang(page: PageKey): Record<string, string> {
  const out: Record<string, string> = {};
  const map = PATHS[page] as Record<string, string | undefined>;
  for (const l of LOCALES) { const href = map[l]; if (href) out[l] = href; }  // skip mediums without a marketing route (de)
  out['x-default'] = PATHS[page].en;
  return out;
}

export interface Dict {
  nav: { course: string; pricing: string; login: string; signup: string };
  langLabel: string;                 // a11y label for the language switcher
  home: { badge: string; h1: string; sub: string; seeCourse: string };
  card: { level: string; buy: string; preview: string; lifetime: string;
    purchased: string; cont: string; start: string; progress: string };  // progress uses {passed} {total}
  course: {
    name: string; tagline: string; metaTitle: string; metaDesc: string;
    salesHeading: string;            // uses {price}
    bullets: string[];               // uses {units} {exercises} {glossary}
    taughtInEnglish: string;
    previewLead: string; previewLink: string;   // previewLink uses {n}
    alreadyBought: string;
  };
  footer: { tagline: string; learn: string; legal: string; help: string;
    terms: string; refunds: string; privacy: string; cookies: string; contact: string; mor: string };
  pricing: { title: string; sub: string; faqHeading: string; faq: { q: string; a: string }[] };
}

const en: Dict = {
  nav: { course: 'Course', pricing: 'Pricing', login: 'Log in', signup: 'Sign up' },
  langLabel: 'Language',
  home: { badge: 'INTERACTIVE LANGUAGE COURSES', h1: 'Learn Catalan, properly',
    sub: 'Exam-focused Catalan courses with full IPA pronunciation, native-speaker audio, auto-marked exercises and real mock exams.',
    seeCourse: 'See the course' },
  card: { level: 'Beginner · A1', buy: 'Get the course', preview: 'Free preview', lifetime: 'One payment · lifetime access',
    purchased: 'Purchased ✓', cont: 'Continue learning', start: 'Start the course', progress: '{passed} of {total} exercises passed' },
  course: {
    name: 'Catalan from Scratch (A1)',
    tagline: 'A complete beginner’s course in Central Catalan, built to pass the official A1 exam.',
    metaTitle: 'Catalan Course Online (A1) — exam prep with audio & exercises',
    metaDesc: 'Learn Catalan online: an interactive A1 course for the official exam (Certificat de nivell inicial de català), the official language of Andorra. Native audio, full IPA, 100+ exercises, mock exam. Free preview.',
    salesHeading: 'Get the full course — {price}, yours forever',
    bullets: [
      'All {units} units with {exercises} interactive, auto-marked exercises',
      'Full mock A1 exam with timers and attempt history',
      'Complete glossary ({glossary} entries) with native-speaker audio and IPA',
      'Listening, dictation and translation drills',
      'Progress saved to your account — continue on any device',
    ],
    taughtInEnglish: 'Taught in English (explanations and translations in English).',
    previewLead: 'Try before you buy:', previewLink: 'Unit {n} is free — no account needed.',
    alreadyBought: 'Already bought it? Log in',
  },
  footer: { tagline: 'Learn Catalan, properly — interactive courses with full IPA, native-speaker audio, auto-marked exercises and real mock exams.',
    learn: 'Learn', legal: 'Legal', help: 'Help', terms: 'Terms', refunds: 'Refunds', privacy: 'Privacy', cookies: 'Cookies', contact: 'Contact',
    mor: 'Payments & VAT handled by Paddle.com, our merchant of record.' },
  pricing: {
    title: 'Simple, one-time pricing', sub: 'Buy a course once, keep it forever. No subscription.',
    faqHeading: 'Frequently asked questions',
    faq: [
      { q: 'Is this a subscription?', a: 'No. Each course is a one-time payment and yours for life, including future updates. There is no recurring charge.' },
      { q: 'What’s included?', a: 'Everything in the course: all units, every interactive exercise, the full mock exam, the complete glossary with native-speaker audio, and progress synced across your devices.' },
      { q: 'Can I try before I buy?', a: 'Yes — the first unit, the IPA guide and the exam information are free, no account needed.' },
      { q: 'Which taxes apply?', a: 'Prices are shown excluding tax. Any VAT or sales tax for your country is added at checkout by Paddle, our merchant of record.' },
      { q: 'Can I get a refund?', a: 'Courses are digital with immediate lifetime access, so sales are final — please use the free preview first. If something’s broken or you’re charged twice, contact us.' },
    ],
  },
};

const ca: Dict = {
  nav: { course: 'Curs', pricing: 'Preus', login: 'Inicia sessió', signup: 'Crea un compte' },
  langLabel: 'Idioma',
  home: { badge: 'CURSOS D’IDIOMES INTERACTIUS', h1: 'Aprèn català, com cal',
    sub: 'Curs de català enfocat a l’examen, amb pronunciació AFI completa, àudio de parlants nadius, exercicis autocorregits i un examen de mostra real.',
    seeCourse: 'Veure el curs' },
  card: { level: 'Principiant · A1', buy: 'Aconsegueix el curs', preview: 'Prova gratuïta', lifetime: 'Un sol pagament · accés de per vida',
    purchased: 'Comprat ✓', cont: 'Continua aprenent', start: 'Comença el curs', progress: '{passed} de {total} exercicis superats' },
  course: {
    name: 'Català des de zero (A1)',
    tagline: 'Un curs complet per a principiants de català central, fet per aprovar l’examen oficial d’A1.',
    metaTitle: 'Curs de català en línia (A1) — preparació de l’examen oficial',
    metaDesc: 'Aprèn català en línia: curs interactiu d’A1 per a l’examen oficial (Certificat de nivell inicial de català), la llengua oficial d’Andorra. Àudio nadiu, AFI complet, més de 100 exercicis i examen de mostra. Prova gratuïta.',
    salesHeading: 'Aconsegueix el curs complet — {price}, per sempre',
    bullets: [
      'Les {units} unitats amb {exercises} exercicis interactius i autocorregits',
      'Examen de mostra d’A1 complet amb cronòmetres i historial d’intents',
      'Glossari complet ({glossary} entrades) amb àudio de parlants nadius i AFI',
      'Exercicis d’escolta, dictat i traducció',
      'El progrés es desa al teu compte — continua des de qualsevol dispositiu',
    ],
    taughtInEnglish: 'El curs s’imparteix en anglès (explicacions i traduccions en anglès).',
    previewLead: 'Prova-ho abans de comprar:', previewLink: 'la unitat {n} és gratuïta, sense compte.',
    alreadyBought: 'Ja l’has comprat? Inicia sessió',
  },
  footer: { tagline: 'Aprèn català, com cal — cursos interactius amb AFI complet, àudio de parlants nadius, exercicis autocorregits i exàmens de mostra reals.',
    learn: 'Aprèn', legal: 'Legal', help: 'Ajuda', terms: 'Condicions', refunds: 'Devolucions', privacy: 'Privadesa', cookies: 'Galetes', contact: 'Contacte',
    mor: 'Pagaments i IVA gestionats per Paddle.com, el nostre venedor oficial.' },
  pricing: {
    title: 'Preu únic i senzill', sub: 'Compra un curs una vegada i tingue’l per sempre. Sense subscripció.',
    faqHeading: 'Preguntes freqüents',
    faq: [
      { q: 'És una subscripció?', a: 'No. Cada curs és un pagament únic i teu per sempre, incloses les actualitzacions futures. Sense càrrecs recurrents.' },
      { q: 'Què inclou?', a: 'Tot el curs: totes les unitats, cada exercici interactiu, l’examen de mostra complet, el glossari complet amb àudio de parlants nadius i el progrés sincronitzat entre els teus dispositius.' },
      { q: 'Puc provar-ho abans de comprar?', a: 'Sí: la primera unitat, la guia d’AFI i la informació de l’examen són gratuïtes, sense compte.' },
      { q: 'Quins impostos s’apliquen?', a: 'Els preus es mostren sense impostos. L’IVA o impost sobre vendes del teu país s’afegeix en pagar, a través de Paddle, el nostre venedor oficial.' },
      { q: 'Puc demanar un reemborsament?', a: 'Els cursos són digitals amb accés immediat de per vida, així que les vendes són definitives: fes servir primer la prova gratuïta. Si alguna cosa falla o se’t cobra dues vegades, contacta amb nosaltres.' },
    ],
  },
};

const es: Dict = {
  nav: { course: 'Curso', pricing: 'Precios', login: 'Iniciar sesión', signup: 'Crear cuenta' },
  langLabel: 'Idioma',
  home: { badge: 'CURSOS DE IDIOMAS INTERACTIVOS', h1: 'Aprende catalán, de verdad',
    sub: 'Curso de catalán enfocado al examen, con pronunciación AFI completa, audio de hablantes nativos, ejercicios autocorregidos y un examen de prueba real.',
    seeCourse: 'Ver el curso' },
  card: { level: 'Principiante · A1', buy: 'Consigue el curso', preview: 'Prueba gratis', lifetime: 'Un solo pago · acceso de por vida',
    purchased: 'Comprado ✓', cont: 'Continuar aprendiendo', start: 'Empezar el curso', progress: '{passed} de {total} ejercicios superados' },
  course: {
    name: 'Catalán desde cero (A1)',
    tagline: 'Un curso completo para principiantes de catalán central, diseñado para aprobar el examen oficial de A1.',
    metaTitle: 'Curso de catalán online (A1) — preparación del examen oficial',
    metaDesc: 'Aprende catalán online: curso interactivo de A1 para el examen oficial (Certificat de nivell inicial de català), la lengua oficial de Andorra. Audio nativo, AFI completo, más de 100 ejercicios y examen de prueba. Prueba gratis.',
    salesHeading: 'Consigue el curso completo — {price}, para siempre',
    bullets: [
      'Las {units} unidades con {exercises} ejercicios interactivos y autocorregidos',
      'Examen de prueba de A1 completo con cronómetros e historial de intentos',
      'Glosario completo ({glossary} entradas) con audio de hablantes nativos y AFI',
      'Ejercicios de escucha, dictado y traducción',
      'El progreso se guarda en tu cuenta — continúa desde cualquier dispositivo',
    ],
    taughtInEnglish: 'El curso se imparte en español (explicaciones y traducciones en español).',
    previewLead: 'Pruébalo antes de comprar:', previewLink: 'la unidad {n} es gratis, sin cuenta.',
    alreadyBought: '¿Ya lo compraste? Inicia sesión',
  },
  footer: { tagline: 'Aprende catalán, de verdad — cursos interactivos con AFI completo, audio de hablantes nativos, ejercicios autocorregidos y exámenes de prueba reales.',
    learn: 'Aprende', legal: 'Legal', help: 'Ayuda', terms: 'Términos', refunds: 'Reembolsos', privacy: 'Privacidad', cookies: 'Cookies', contact: 'Contacto',
    mor: 'Pagos e IVA gestionados por Paddle.com, nuestro vendedor oficial.' },
  pricing: {
    title: 'Precio único y sencillo', sub: 'Compra un curso una vez y consérvalo para siempre. Sin suscripción.',
    faqHeading: 'Preguntas frecuentes',
    faq: [
      { q: '¿Es una suscripción?', a: 'No. Cada curso es un pago único y tuyo de por vida, incluidas las futuras actualizaciones. Sin cargos recurrentes.' },
      { q: '¿Qué incluye?', a: 'Todo el curso: todas las unidades, cada ejercicio interactivo, el examen de prueba completo, el glosario completo con audio de hablantes nativos y el progreso sincronizado entre tus dispositivos.' },
      { q: '¿Puedo probar antes de comprar?', a: 'Sí: la primera unidad, la guía de AFI y la información del examen son gratuitas, sin necesidad de cuenta.' },
      { q: '¿Qué impuestos se aplican?', a: 'Los precios se muestran sin impuestos. El IVA o impuesto sobre ventas de tu país se añade al pagar, a través de Paddle, nuestro vendedor oficial.' },
      { q: '¿Puedo pedir un reembolso?', a: 'Los cursos son digitales con acceso inmediato de por vida, así que las ventas son definitivas: usa primero la prueba gratuita. Si algo no funciona o se te cobra dos veces, contáctanos.' },
    ],
  },
};

const fr: Dict = {
  nav: { course: 'Cours', pricing: 'Tarifs', login: 'Se connecter', signup: 'Créer un compte' },
  langLabel: 'Langue',
  home: { badge: 'COURS DE LANGUES INTERACTIFS', h1: 'Apprenez le catalan, vraiment',
    sub: 'Cours de catalan axé sur l’examen, avec prononciation API complète, audio de locuteurs natifs, exercices autocorrigés et un examen blanc réel.',
    seeCourse: 'Voir le cours' },
  card: { level: 'Débutant · A1', buy: 'Obtenir le cours', preview: 'Aperçu gratuit', lifetime: 'Un seul paiement · accès à vie',
    purchased: 'Acheté ✓', cont: 'Continuer l’apprentissage', start: 'Commencer le cours', progress: '{passed} sur {total} exercices réussis' },
  course: {
    name: 'Le catalan à partir de zéro (A1)',
    tagline: 'Un cours complet pour débutants en catalan central, conçu pour réussir l’examen officiel A1.',
    metaTitle: 'Cours de catalan en ligne (A1) — préparation à l’examen officiel',
    metaDesc: 'Apprenez le catalan en ligne : cours interactif A1 pour l’examen officiel (Certificat de nivell inicial de català), la langue officielle de l’Andorre. Audio natif, API complet, plus de 100 exercices et examen blanc. Aperçu gratuit.',
    salesHeading: 'Obtenez le cours complet — {price}, pour toujours',
    bullets: [
      'Les {units} unités avec {exercises} exercices interactifs et autocorrigés',
      'Examen blanc A1 complet avec minuteurs et historique des tentatives',
      'Glossaire complet ({glossary} entrées) avec audio de locuteurs natifs et API',
      'Exercices d’écoute, de dictée et de traduction',
      'La progression est enregistrée sur votre compte — continuez sur n’importe quel appareil',
    ],
    taughtInEnglish: 'Cours dispensé en français (explications et traductions en français).',
    previewLead: 'Essayez avant d’acheter :', previewLink: 'l’unité {n} est gratuite, sans compte.',
    alreadyBought: 'Déjà acheté ? Connectez-vous',
  },
  footer: { tagline: 'Apprenez le catalan, vraiment — des cours interactifs avec API complet, audio de locuteurs natifs, exercices autocorrigés et examens blancs réels.',
    learn: 'Apprendre', legal: 'Légal', help: 'Aide', terms: 'Conditions', refunds: 'Remboursements', privacy: 'Confidentialité', cookies: 'Cookies', contact: 'Contact',
    mor: 'Paiements et TVA gérés par Paddle.com, notre revendeur officiel.' },
  pricing: {
    title: 'Un tarif simple et unique', sub: 'Achetez un cours une fois, gardez-le pour toujours. Sans abonnement.',
    faqHeading: 'Questions fréquentes',
    faq: [
      { q: 'Est-ce un abonnement ?', a: 'Non. Chaque cours est un paiement unique, à vous pour toujours, mises à jour comprises. Aucun prélèvement récurrent.' },
      { q: 'Qu’est-ce qui est inclus ?', a: 'Tout le cours : toutes les unités, chaque exercice interactif, l’examen blanc complet, le glossaire complet avec audio de locuteurs natifs, et la progression synchronisée sur tous vos appareils.' },
      { q: 'Puis-je essayer avant d’acheter ?', a: 'Oui — la première unité, le guide API et les informations sur l’examen sont gratuits, sans compte.' },
      { q: 'Quelles taxes s’appliquent ?', a: 'Les prix sont affichés hors taxes. La TVA ou taxe applicable dans votre pays est ajoutée au paiement par Paddle, notre revendeur officiel.' },
      { q: 'Puis-je être remboursé ?', a: 'Les cours sont numériques avec accès à vie immédiat ; les ventes sont donc définitives — utilisez d’abord l’aperçu gratuit. En cas de problème ou de double paiement, contactez-nous.' },
    ],
  },
};

const ru: Dict = {
  nav: { course: 'Курс', pricing: 'Цены', login: 'Войти', signup: 'Создать аккаунт' },
  langLabel: 'Язык',
  home: { badge: 'ИНТЕРАКТИВНЫЕ КУРСЫ ЯЗЫКОВ', h1: 'Учите каталанский как следует',
    sub: 'Курс каталанского с упором на экзамен: полная транскрипция МФА, аудио носителей языка, упражнения с автопроверкой и настоящий пробный экзамен.',
    seeCourse: 'Посмотреть курс' },
  card: { level: 'Начальный · A1', buy: 'Получить курс', preview: 'Бесплатный доступ', lifetime: 'Разовая оплата · доступ навсегда',
    purchased: 'Куплено ✓', cont: 'Продолжить обучение', start: 'Начать курс', progress: '{passed} из {total} упражнений пройдено' },
  course: {
    name: 'Каталанский с нуля (A1)',
    tagline: 'Полный курс центральнокаталанского для начинающих, созданный для сдачи официального экзамена A1.',
    metaTitle: 'Курс каталанского онлайн (A1) — подготовка к официальному экзамену',
    metaDesc: 'Учите каталанский онлайн: интерактивный курс A1 для официального экзамена (Certificat de nivell inicial de català), официального языка Андорры. Аудио носителей языка, полная МФА-транскрипция, более 100 упражнений и пробный экзамен. Бесплатный доступ.',
    salesHeading: 'Получите полный курс — {price}, навсегда',
    bullets: [
      'Все {units} разделов с {exercises} интерактивными упражнениями с автопроверкой',
      'Полный пробный экзамен A1 с таймерами и историей попыток',
      'Полный глоссарий ({glossary} записей) с аудио носителей языка и МФА',
      'Упражнения на аудирование, диктант и перевод',
      'Прогресс сохраняется в вашем аккаунте — продолжайте с любого устройства',
    ],
    taughtInEnglish: 'Преподавание ведётся на русском языке (объяснения и переводы на русском).',
    previewLead: 'Попробуйте перед покупкой:', previewLink: 'раздел {n} бесплатный, без регистрации.',
    alreadyBought: 'Уже купили? Войдите',
  },
  footer: { tagline: 'Учите каталанский как следует — интерактивные курсы с полной МФА-транскрипцией, аудио носителей языка, упражнениями с автопроверкой и настоящими пробными экзаменами.',
    learn: 'Учить', legal: 'Правовая информация', help: 'Помощь', terms: 'Условия', refunds: 'Возвраты', privacy: 'Конфиденциальность', cookies: 'Файлы cookie', contact: 'Контакты',
    mor: 'Платежи и НДС обрабатывает Paddle.com, наш официальный продавец.' },
  pricing: {
    title: 'Простая разовая оплата', sub: 'Купите курс один раз и пользуйтесь им всегда. Без подписки.',
    faqHeading: 'Частые вопросы',
    faq: [
      { q: 'Это подписка?', a: 'Нет. Каждый курс — разовый платёж и остаётся у вас навсегда, включая будущие обновления. Никаких регулярных списаний.' },
      { q: 'Что входит?', a: 'Весь курс: все разделы, каждое интерактивное упражнение, полный пробный экзамен, полный глоссарий с аудио носителей языка и прогресс, синхронизируемый между устройствами.' },
      { q: 'Можно попробовать перед покупкой?', a: 'Да — первый раздел, руководство по МФА и информация об экзамене бесплатны и не требуют аккаунта.' },
      { q: 'Какие налоги применяются?', a: 'Цены указаны без налогов. НДС или налог с продаж вашей страны добавляется при оплате через Paddle, нашего официального продавца.' },
      { q: 'Можно вернуть деньги?', a: 'Курсы цифровые с мгновенным пожизненным доступом, поэтому продажи окончательны — сначала воспользуйтесь бесплатным доступом. Если что-то не работает или списано дважды, напишите нам.' },
    ],
  },
};

// de has no marketing Dict (no landing page); getDict falls back to English.
const de: Dict = {
  nav: { course: 'Kurs', pricing: 'Preise', login: 'Anmelden', signup: 'Konto erstellen' },
  langLabel: 'Sprache',
  home: { badge: 'INTERAKTIVE SPRACHKURSE', h1: 'Katalanisch lernen, richtig',
    sub: 'Prüfungsorientierter Katalanisch-Kurs mit vollständiger IPA-Lautschrift, Audio von Muttersprachlern, automatisch korrigierten Übungen und einer echten Musterprüfung.',
    seeCourse: 'Zum Kurs' },
  card: { level: 'Anfänger · A1', buy: 'Kurs holen', preview: 'Kostenlose Vorschau', lifetime: 'Einmalige Zahlung · lebenslanger Zugang',
    purchased: 'Gekauft ✓', cont: 'Weiterlernen', start: 'Kurs starten', progress: '{passed} von {total} Übungen bestanden' },
  course: {
    name: 'Katalanisch von Grund auf (A1)',
    tagline: 'Ein kompletter Anfängerkurs in Zentralkatalanisch, konzipiert zum Bestehen der offiziellen A1-Prüfung.',
    metaTitle: 'Katalanisch-Kurs online (A1) — Vorbereitung auf die offizielle Prüfung',
    metaDesc: 'Katalanisch online lernen: ein interaktiver A1-Kurs für die offizielle Prüfung (Certificat de nivell inicial de català), die Amtssprache Andorras. Muttersprachler-Audio, vollständige IPA, über 100 Übungen, Musterprüfung. Kostenlose Vorschau.',
    salesHeading: 'Hol dir den kompletten Kurs — {price}, für immer',
    bullets: [
      'Alle {units} Einheiten mit {exercises} interaktiven, automatisch korrigierten Übungen',
      'Komplette A1-Musterprüfung mit Timern und Versuchsverlauf',
      'Vollständiges Glossar ({glossary} Einträge) mit Muttersprachler-Audio und IPA',
      'Hörverstehen-, Diktat- und Übersetzungsübungen',
      'Fortschritt wird in deinem Konto gespeichert — weiter auf jedem Gerät',
    ],
    taughtInEnglish: 'Der Kurs wird auf Deutsch unterrichtet (Erklärungen und Übersetzungen auf Deutsch).',
    previewLead: 'Erst testen, dann kaufen:', previewLink: 'Einheit {n} ist kostenlos — kein Konto nötig.',
    alreadyBought: 'Schon gekauft? Anmelden',
  },
  footer: { tagline: 'Katalanisch lernen, richtig — interaktive Kurse mit vollständiger IPA, Muttersprachler-Audio, automatisch korrigierten Übungen und echten Musterprüfungen.',
    learn: 'Lernen', legal: 'Rechtliches', help: 'Hilfe', terms: 'AGB', refunds: 'Rückerstattungen', privacy: 'Datenschutz', cookies: 'Cookies', contact: 'Kontakt',
    mor: 'Zahlungen und MwSt. werden von Paddle.com abgewickelt, unserem Verkäufer (Merchant of Record).' },
  pricing: {
    title: 'Einfacher Einmalpreis', sub: 'Kauf einen Kurs einmal, behalte ihn für immer. Kein Abo.',
    faqHeading: 'Häufige Fragen',
    faq: [
      { q: 'Ist das ein Abo?', a: 'Nein. Jeder Kurs ist eine einmalige Zahlung und für immer deiner, inklusive künftiger Updates. Keine wiederkehrenden Kosten.' },
      { q: 'Was ist enthalten?', a: 'Der komplette Kurs: alle Einheiten, jede interaktive Übung, die vollständige Musterprüfung, das komplette Glossar mit Muttersprachler-Audio und der auf allen Geräten synchronisierte Fortschritt.' },
      { q: 'Kann ich vor dem Kauf testen?', a: 'Ja — die erste Einheit, der IPA-Leitfaden und die Prüfungsinfos sind kostenlos, ganz ohne Konto.' },
      { q: 'Welche Steuern fallen an?', a: 'Preise verstehen sich ohne Steuern. Die für dein Land geltende MwSt. wird beim Bezahlen von Paddle, unserem Verkäufer (Merchant of Record), hinzugefügt.' },
      { q: 'Kann ich eine Rückerstattung bekommen?', a: 'Kurse sind digital mit sofortigem, lebenslangem Zugang, daher sind Käufe endgültig — nutze zuerst die kostenlose Vorschau. Bei Problemen oder doppelter Abbuchung kontaktiere uns.' },
    ],
  },
};

const DICTS: Partial<Record<Locale, Dict>> = { en, ca, es, fr, ru, de };
export function getDict(locale: Locale): Dict { return DICTS[locale] ?? en; }

/** Fill {key} placeholders. */
export function t(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
