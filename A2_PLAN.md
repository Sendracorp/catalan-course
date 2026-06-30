# Catalan A2 — Unit Map & Build Plan

Blueprint for `course_source_a2.html`, executing `A2_GOAL.md`. Builds on A1 (assumes A1 knowledge — does not re-teach it). Mapped to the official *Certificat de nivell bàsic (A2)* syllabus (CPNL Bàsic 1–3) and exam areas (Appropriateness 15% · Listening 30% · Reading 25% · Speaking 30%).

**Scale targets:** 15 units · ~150 exercises (~10/unit) · ~450 glossary entries (~30/unit) · 1 mock exam (official A2 areas). Unit 1 = free preview.

> ⚠️ **Native review required before go-live.** This Catalan content is authored carefully and cross-checked against official sources, but neither the author nor the operator is a native Catalan speaker — a native/qualified review pass on the Catalan spine (grammar, IPA, answer keys) is a release gate, on top of the per-language translation review.

## Unit map

| # | Title | Can-do (A2) | Grammar focus | Key lexis / functions | Exam-area emphasis |
|---|---|---|---|---|---|
| 1 | **Back into Catalan** (free preview) | Re-enter Catalan; handle classroom/everyday language at A2 | IPA refresher; present tense recap; ser/estar/haver/tenir recap | greetings at A2, classroom language, connectors | Listening, Speaking |
| 2 | **People & descriptions** | Describe people physically and in character | ser vs estar (deepened); adjective agreement & position; comparatives | physical description, personality, clothing, colours | Reading, Speaking |
| 3 | **The recent past — el perfet** | Say what you *have done* (today, recently) | *perfet* (haver + participle); regular & irregular participles | daily activities, "today/this week", time markers | Listening, Speaking |
| 4 | **Narrating events — el passat perifràstic** | Narrate completed past events | *passat perifràstic* (vaig + infinitive); past time markers | yesterday/last…, sequencing, anecdotes | Reading, Speaking |
| 5 | **The way things were — l'imperfet** | Describe past habits, settings, "used to" | *imperfet*; description vs event | childhood, routines-then, places | Reading, Listening |
| 6 | **Telling a story — past-tense contrast** | Choose perfet/perifràstic/imperfet correctly; tell a story | contrast & combination of the three pasts | narrating a trip/day, background vs action | Reading, Speaking |
| 7 | **Weak pronouns I** | Replace objects with clitic pronouns | weak pronouns: el/la/els/les, li/els, em/et/es, **en**, **hi** | avoiding repetition, answering questions | Reading, Listening |
| 8 | **Weak pronouns II — combined** | Use combined pronouns & their position | combined forms (l'hi, els hi, n'hi…); position w/ imperative & infinitive | requests, giving/handing, "there/of it" | Reading, Speaking |
| 9 | **Plans & possibilities** | Talk about the future and hypotheticals; be polite | *futur*; *condicional*; politeness | plans, predictions, wishes, polite requests | Listening, Speaking |
| 10 | **Telling people what to do** | Give instructions, directions, advice | *imperatiu* (affirmative & negative) + pronouns | recipes, directions, instructions, advice | Listening, Appropriateness |
| 11 | **Daily life & routines** | Describe routines and reflexive actions | pronominal/reflexive verbs; frequency adverbs; time | daily routine, household, frequency | Listening, Speaking |
| 12 | **Health & the body** | Handle the doctor's; describe ailments; give advice | imperative/conditional for advice; doldre/fer mal | body parts, symptoms, pharmacy, advice | Appropriateness, Speaking |
| 13 | **Work & studies** | Talk about jobs/studies; manage formal/phone register | formal register; relative pronouns (que/qui); telephone formulas | occupations, workplace, studies, phone | Appropriateness, Reading |
| 14 | **Shopping, services & the city** | Shop, compare, complain, transact | quantifiers; comparatives/superlatives; prepositions of place | shops, quantities, prices, complaints, city/rural | Reading, Appropriateness |
| 15 | **Opinions & getting along** | Give opinions, agree/disagree, suggest, apologise, make plans | expressing opinion; subjunctive *introduction* (vull que…) — recognition only; connectors of opinion | opinions, agreement, suggestions, apologies, social plans | Speaking, Appropriateness |

*(Subjunctive is A2-boundary; introduce for recognition only, full treatment deferred to B1.)*

## Per-unit structure (mirrors A1)
Each unit: **unit-head + can-do → theory tables (grammar paradigms + vocab w/ Catalan/IPA/EN) → 1–2 dialogues (gloss + IPA) → Resources box (live free links) → ~10 exercises** spanning the 13 types, weighted to A2:
- **paradigm** (new tenses), **gap**, **write**, **reorder** (clitic/combined-pronoun order)
- **listen / dictation / listenmatch** (heavier — listening is 30% of the exam)
- **tf / match / choice** (reading + appropriateness)
- **free / personal / model** (speaking & production)

## Mock exam (official A2 areas)
Adapt `MockData` to: **Appropriateness** (15 recorded everyday scenarios, 3 options) · **Listening** (announcements/dialogues; MCQ/short/TF, ~20 items) · **Reading** (ads/news/surveys; MCQ/TF/matching, ~20 items) · **Speaking** (sustained description + 4 role-play situations; self-marked + model). Pass = ≥60% speaking AND ≥60% rest.

## Resource links (per-unit, live-verified)
Topic-matched, from: Parla.cat (Bàsic 1–3), Intercat, CPNL grammar, verbs.cat (conjugation — heavy at A2), talkpal.ai, Easy Catalan (YouTube), LingoHut/loecsen/UPF MOOC where relevant. Every link checked HTTP 200 at authoring time.

## Build order
1. ✅ Unit map (this file).
2. Author `course_source_a2.html` unit-by-unit (content → exercises → dialogues → glossary → mock → answer key → resources), with fidelity-assert counts.
3. Extend `lib/course.ts` parser + asserts; wire `courses.ts` / `content.ts` / 5 variants.
4. `npm run audio:native` (+ Wikimedia Commons) → TTS gaps; report native vs TTS %.
5. Extract `i18n/catalan-a2.en.json` → translate es/fr/ru/de → native-style review.
6. Paddle product + `PADDLE_PRICE_CATALAN_A2` (**ask before creating**); flip `available`; verify catalog/SEO/sitemap/hreflang.
7. Verify all links live; tsc + unit + e2e + build green; PR from `a2`.
