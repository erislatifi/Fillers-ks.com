@AGENTS.md

# Fillers Kosovo — përmbledhje e projektit

Faqe + sistem biznesi për **Fillers Kosovo** (Alp Estetik SHPK), distributor premium i mjekësisë estetike në Kosovë.
Komunikimi me klientin/pronarin (Eris Latifi) bëhet **në shqip** (dialekt gheg). Mos bëj pyetje për punë që janë tashmë të rënë dakord — vepro dhe raporto në milestone.

## Stack

- Next.js 16 (App Router, Turbopack, `src/proxy.ts` në vend të `middleware.ts`) + React 19 + TypeScript + Tailwind v4
- Payload CMS 3.87.1 i integruar në të njëjtin app (route groups `(frontend)` dhe `(payload)`, secili me layout root)
- next-intl: `/sq` (default) dhe `/en`
- Databaza: **Postgres (Supabase)** në prodhim, **SQLite** (`payload.db`, gitignored) lokalisht
- Media: **Supabase Storage (S3)** në prodhim, disk lokal në dev
- Hosting: Hostinger Business → "Deploy Web App" (Node 22, build `npm run build`, start `npm run start`), i lidhur me GitHub `erislatifi/Fillers-ks.com`, branch `main`, **auto-deploy me çdo push**

## Struktura

- `src/app/(frontend)/[locale]/…` — faqet publike: ballina, brands, category, catalog (filtër kategori+brend), products, cart, checkout (+ server action), education, promotions, about, contact, privacy/terms/shipping, account/wishlist (shells)
- `src/app/(payload)/` — admin në `/admin`, `custom.scss` (stilimi i degëzuar + ikonat e sidebar-it)
- `src/collections/` — Users, Media, Brands, Categories, Products, Testimonials, Articles, Promotions, Orders
- `src/globals/` — SiteSettings, Homepage
- `src/components/admin/` — Dashboard (analitikë shitjesh) dhe Logo/Icon të personalizuara
- `src/contexts/CartContext.tsx` — shporta në localStorage
- `src/payload.config.ts` — zgjedh adapter-in sipas env: `POSTGRES_URI` → Postgres, përndryshe SQLite; `S3_BUCKET` → S3 storage
- `scripts/seed.ts` (`npm run seed`) dhe `scripts/migrate-to-postgres.ts` (`npm run migrate:postgres`)
- `messages/sq.json`, `messages/en.json` — tekstet e UI-t

## Çka është bërë

- Faqja e plotë bilingual (sq/en) me 14 brende (përfshirë Jeisys dhe Clarius — klienti është distributor zyrtar për Kosovë + Shqipëri), katalog, faqe produkti/brendi/kategorie me specifika.
- Admin panel (Payload) i stilizuar me brendin, i grupuar (Catalog/Content/Media/Sales), tema e kyçur light, dashboard me porosi, top produkte, top klinika/qytete sipas të ardhurave.
- E-commerce pa gateway pagese: shportë → checkout → dokument `Orders` (numër `FK-YYMMDD-####`, data e dorëzimit, qyteti). Metodat e pagesës: pickup dhe transfer bankar aktive; karta shfaqet "së shpejti". Trust signals + vlerësim dorëzimi në faqen e produktit.
- Deploy në prodhim: Postgres + S3 në Supabase, migrim i të dhënave ekzistuese me skriptin idempotent (përveç `Users` — nga siguria, admini krijohet i ri në prodhim). `next/image` lejon `**.supabase.co`.
- Build i prodhimit dhe `npx tsc --noEmit` kalojnë pastër. Faqja live `https://shop-fillers-ks.com` (sq/en, catalog, admin) u verifikua më 2026-10-22.

## Çka mbetet

1. **Domain-i kryesor**: `fillers-ks.com` ende shërben një faqe tjetër ("Ballina - fillers-ks.com", jo ky app). Aplikacioni jeton në `shop-fillers-ks.com`. Lidhja/ndërrimi i domain-it bëhet në hPanel kur klienti është gati — mos e prek pa pëlqimin e tij.
2. **Rrotullo sekretet**: fjalëkalimi i databazës Supabase dhe çelësat S3 u ngjitën në chat gjatë setup-it. Gjenero të rinj (Supabase → Database/Storage S3) dhe përditëso env vars te Hostinger.
3. **Admin user në prodhim**: `Users` nuk migrohet; konfirmo që ekziston një admin real në `/admin` të prodhimit.
4. **Pagesa me kartë**: nuk ka gateway (klienti s'ka zgjedhur ofrues). Checkout mbledh kërkesa që ekipi i konfirmon manualisht.
5. **Email**: SMTP/`ORDER_EMAIL_TO` nuk janë konfiguruar — porositë ruhen vetëm në admin; forma e kontaktit është statike pa backend.
6. **`/account` dhe `/wishlist`** janë shells "Coming Soon", pa login/regjistrim funksional.
7. **Përmbajtja**: ~15 produkte të seed-uara (synimi 100+; disa kategori kanë 0 produkte) — klienti i shton nga admin. Fakte "Rreth Nesh" dhe teksti Jeisys/Clarius janë draft nga info publike, duhen miratuar. Faqet ligjore (privacy/terms/shipping) janë placeholder dhe duhet t'i shohë jurist.
8. **Logoja**: `src/components/BrandMark.tsx` është rikrijim SVG i përafërt; zëvendëso me skedarin real kur klienti ta dërgojë.
9. **Supabase falas**: projektet në plan falas pauzohen pas ~1 jave pa aktivitet — verifiko/konsidero plan me pagesë para lansimit real.

## Gotchas

- **Mos vendos `POSTGRES_URI`/`S3_*` në `.env.local`**: kjo e kalon edhe dev-in lokal në databazën e prodhimit. Për migrim, ekzekuto skriptin me env vars inline në atë komandë (`$env:POSTGRES_URI=…; npm run migrate:postgres`). `.env.production.example` tregon çfarë vlerash duhen; **kurrë mos commit-o vlera reale**.
- Databaza Postgres e re duhet të ketë skemën para deploy-it të parë: ekzekuto `npm run migrate:postgres` lokalisht (aty Payload sinkronizon skemën) dhe mos mbështet te push automatik në prodhim. Gjithashtu, fotot nga Supabase kërkojnë `images.remotePatterns` te `next.config.ts` (tashmë i shtuar) — pa të, `next/image` hedh gabim.
- Pas shtimit të komponentëve të rinj në admin, rigjenero importMap (`payload generate:importmap`) dhe commit-oje `src/app/(payload)/admin/importMap.js`.
- SQLite dev: shtimi i fushave/koleksioneve ndërsa dev serveri punon mund të lërë `SQLITE_ERROR: index X already exists` në restart. Zgjidhja: ndalo serverin, `DROP INDEX IF EXISTS <emri>` me `@libsql/client`, restart. Mos e fshi kurrë `payload.db` (përmban të dhënat reale lokale).
- Payload Local API me `localized: true`: `create` për locale default (sq), pastaj `update` për `en`. Funksionet ndihmëse mbi koleksione duhen të jenë gjenerike (`<C extends Slug>`) ndryshe TypeScript jep gabime të rreme overload.
- PowerShell `-replace` është case-insensitive si parazgjedhje — kujdes me regex-et mbi kod.
- Next 16 ka ndryshime të mëdha; lexo `node_modules/next/dist/docs/` para se me shkru kod të ri (shih `AGENTS.md`).
