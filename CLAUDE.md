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

- `src/app/(frontend)/[locale]/…` — faqet publike: ballina, brands, category, catalog (filtër kategori+brend), products, cart, checkout (+ server action), education, promotions, about, contact, privacy/terms/shipping, account (login/profil/porositë) + account/register, wishlist (shell)
- `src/app/(payload)/` — admin në `/admin`, `custom.scss` (stilimi i degëzuar + ikonat e sidebar-it)
- `src/collections/` — Users (stafi i admin-it), Customers (klinikat nga faqja), Media, Brands, Categories, Products, Testimonials, Articles, Promotions, Orders
- `src/globals/` — SiteSettings, Homepage
- `src/components/admin/` — Dashboard (analitikë shitjesh) dhe Logo/Icon të personalizuara
- `src/contexts/CartContext.tsx` — shporta në localStorage
- `src/payload.config.ts` — zgjedh adapter-in sipas env: `POSTGRES_URI` → Postgres, përndryshe SQLite; `S3_BUCKET` → S3 storage
- `scripts/seed.ts` (`npm run seed`) dhe `scripts/migrate-to-postgres.ts` (`npm run migrate:postgres`)
- `messages/sq.json`, `messages/en.json` — tekstet e UI-t

## Çka është bërë

- Faqja e plotë bilingual (sq/en) me 14 brende (përfshirë Jeisys dhe Clarius — klienti është distributor zyrtar për Kosovë + Shqipëri), katalog, faqe produkti/brendi/kategorie me specifika.
- Admin panel (Payload) i ridizajnuar plotësisht (2026-10-22), **në shqip**: sidebar i errët me brend (`NavTop`/`NavTopLinks` + alarm për porosi në pritje), grupet Shitjet/Katalogu/Media/Përmbajtja/Administrimi, dashboard i ri (KPI, grafik 30-ditor, status porosish, veprime të shpejta, gatishmëria e katalogut), login me dy kolona (`LoginPanel`), forma me etiketa/shpjegime shqip, seksione (tabs/rows) dhe fusha anësore. Stili: `src/app/(payload)/custom.scss` (tokens `--fk-*`, klasat `.fk-*`). Teksti i brendshëm i Payload-it përkthehet përmes `src/i18n/adminTranslations.ts` (Payload s'ka paketë shqipe, ndaj mbishkruhet `en`).
- E-commerce pa gateway pagese: shportë → checkout → dokument `Orders` (numër `FK-YYMMDD-####`). Checkout v2 (2026-10-30, branch `checkout-v2`): 5 hapa — kontakti; marrja (`deliveryMethod`: `pickup` në zyrë ose `courier`, qyteti/adresa vetëm për korrier, data e dorëzimit opsionale me tik); pagesa (pickup → `pickup` = paguaj në zyrë ose `bank_transfer`; korrier → `cash_on_delivery` ose `bank_transfer`; karta "së shpejti"); faturim biznesi me tik (`needsInvoice` + grupi `invoice`: emri, NUI, nr. fiskal, TVSH, adresa); shënime + pranimi i kushteve. Rregullat e pagesës janë te `src/lib/checkout.ts` (`paymentsFor`), të përbashkëta për formën dhe server action-in. Skema e prodhimit: `scripts/sql/2026-10-30-checkout-v2.sql`.
- Deploy në prodhim: Postgres + S3 në Supabase, migrim i të dhënave ekzistuese me skriptin idempotent (përveç `Users` — nga siguria, admini krijohet i ri në prodhim). `next/image` lejon `**.supabase.co`.
- Build i prodhimit dhe `npx tsc --noEmit` kalojnë pastër. Faqja live `https://shop-fillers-ks.com` (sq/en, catalog, admin) u verifikua më 2026-10-22.
- **Admin v2** (2026-10-30, branch `admin-v2`): koleksioni `pages` (privacy/terms/shipping/faq + `/info/<slug>`, sq/en, FAQ; footer-i i merr lidhjet prej tyre), `contact-messages` (forma e kontaktit) dhe `subscribers` (newsletter) me server actions te `src/lib/formActions.ts` + honeypot; Ballina → Seksionet (renditje/ON-OFF/tituj për 12 seksionet, `src/lib/homepage.ts`) dhe → Pse ne; Cilësimet → Dërgesa dhe porositë (kosto korrieri, falas mbi X, opsionet e checkout-it ON/OFF, minimumi, email-i i njoftimeve, emri ligjor) dhe → Tekstet e faqes (shiriti i njoftimeve, slogani, tekstet e header/footer, logoja, fshehja e EN); porositë kanë `shippingCost`/`total`, korrierin + gjurmimin, shënime të brendshme dhe historik statusi (vetëm stafi i lexon), faturë proforma / fletë paketimi te `/print/order/:id`; produktet kanë SKU, çmim të vjetër (zbritje), stok dhe `visible`; rolet admin/redaktor; email-at për porosi/mesazhe (`src/lib/email.ts`) punojnë sapo të vendosen env vars SMTP. Checkout-i merr çmimet nga databaza, jo nga shporta.

## Çka mbetet

1. **Domain-i kryesor**: `fillers-ks.com` ende shërben një faqe tjetër ("Ballina - fillers-ks.com", jo ky app). Aplikacioni jeton në `shop-fillers-ks.com`. Lidhja/ndërrimi i domain-it bëhet në hPanel kur klienti është gati — mos e prek pa pëlqimin e tij.
2. **Rrotullo sekretet**: fjalëkalimi i databazës Supabase dhe çelësat S3 u ngjitën në chat gjatë setup-it. Gjenero të rinj (Supabase → Database/Storage S3) dhe përditëso env vars te Hostinger.
3. **Admin user në prodhim**: `Users` nuk migrohet; konfirmo që ekziston një admin real në `/admin` të prodhimit.
4. **Pagesa me kartë**: nuk ka gateway (klienti s'ka zgjedhur ofrues). Checkout mbledh kërkesa që ekipi i konfirmon manualisht.
5. **Email**: kodi është gati (`src/lib/email.ts`: njoftim te stafi + konfirmim te klienti për porosi, njoftim për mesazhe). Mbetet të vendosen te Hostinger `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (opsionale `ORDER_EMAIL_FROM`). "Kam harruar fjalëkalimin" i Payload-it kërkon gjithashtu një email adapter (`@payloadcms/email-nodemailer`, s'është instaluar).
6. **Llogaritë e klinikave** (branch `account`, 2026-10-27): regjistrim pa aprovim, login/logout, profil + ndërrim fjalëkalimi, historiku i porosive, checkout i parambushur që e lidh porosinë me llogarinë. U testua lokalisht (SQLite). Skema u shtua në Postgres të prodhimit më 2026-10-29 me `scripts/sql/2026-10-29-add-customers.sql` (Supabase SQL Editor) dhe u bë merge në `main`. Mbeten: "kam harruar fjalëkalimin" (kërkon SMTP — tani klienti kontakton ekipin), `/wishlist` ende shell.
7. **Përmbajtja**: ~15 produkte të seed-uara (synimi 100+; disa kategori kanë 0 produkte) — klienti i shton nga admin. Fakte "Rreth Nesh" dhe teksti Jeisys/Clarius janë draft nga info publike, duhen miratuar. Faqet ligjore (privacy/terms/shipping) janë placeholder dhe duhet t'i shohë jurist.
8. **Logoja**: tani ngarkohet te Cilësimet → Tekstet e faqes → Logoja; pa të përdoret `src/components/BrandMark.tsx` (rikrijim SVG i përafërt).
9. **Supabase falas**: projektet në plan falas pauzohen pas ~1 jave pa aktivitet — verifiko/konsidero plan me pagesë para lansimit real.

## Gotchas

- **SQL për prodhimin gjenerohet, mos e shkruaj me dorë**: para ndryshimit të koleksioneve, `npx tsx scripts/schema-sql.ts snapshot <emri>` në `main` (ose përdor snapshot-in e fundit te `scripts/sql/snapshots/`, i cili përputhet me prodhimin), pastaj pas ndryshimit `snapshot` prapë dhe `diff <para> <pas>` → SQL i saktë Postgres (nuk lidhet me asnjë databazë). Testoje me PGlite para se ta japësh (shih 2026-10-30-admin-v2.sql) dhe mbështille në `BEGIN … COMMIT`. `scripts/sql/check-missing-columns.sql` (vetëm lexim) tregon çka mungon në prodhim. Snapshot-i aktual i prodhimit pas admin-v2 është `admin-v2.json`.
- **Rolet e stafit**: `isAdmin`/`isAdminUser` = roli admin (pa role fare = admin, për llogaritë e vjetra); `isStaff` = admin ose redaktor (katalogu/përmbajtja); `hiddenForEditors` fsheh koleksionet e shitjes. Koleksioneve të reja me të dhëna klientësh u duhet `isAdmin` + `hidden: hiddenForEditors`.
- **Produktet e fshehura**: çdo query publik i produkteve duhet `VISIBLE` (`src/lib/payload.ts`) — Local API e anashkalon aksesin. Checkout-i (`checkout/actions.ts`) refuzon produktet e fshehura/pa stok/me ofertë dhe merr çmimin nga databaza; mos u beso kurrë çmimeve nga shporta (localStorage).
- `/print/*` është jashtë next-intl (`src/proxy.ts` matcher) dhe ka root layout-in e vet (`src/app/(print)`); faqja kontrollon vetë që përdoruesi është staf.
- **Dy lloje përdoruesish të kyçur**: `users` (admin) dhe `customers` (klinika). Mos përdor kurrë `Boolean(req.user)` si kontroll aksesi — një klinikë e kyçur do kalonte. Përdor `isAdmin` / `publicReadAdminWrite` nga `src/access/isAdmin.ts` për çdo koleksion/global të ri (pa `access`, Payload lejon shkrim për çdo përdorues të kyçur).
- Sesioni i klientit ruhet në cookie `fk-customer` (`src/lib/customerSession.ts`), jo në `payload-token`, që mos ta nxjerrë adminin jashtë në të njëjtin browser. Komponentëve klient u jepet vetëm `toProfile(customer)`.

- **Mos vendos `POSTGRES_URI`/`S3_*` në `.env.local`**: kjo e kalon edhe dev-in lokal në databazën e prodhimit. Për migrim, ekzekuto skriptin me env vars inline në atë komandë (`$env:POSTGRES_URI=…; npm run migrate:postgres`). `.env.production.example` tregon çfarë vlerash duhen; **kurrë mos commit-o vlera reale**.
- Databaza Postgres e re duhet të ketë skemën para deploy-it të parë: ekzekuto `npm run migrate:postgres` lokalisht (aty Payload sinkronizon skemën) dhe mos mbështet te push automatik në prodhim. Gjithashtu, fotot nga Supabase kërkojnë `images.remotePatterns` te `next.config.ts` (tashmë i shtuar) — pa të, `next/image` hedh gabim.
- Ndryshimet vetëm në `label`, `description`, `admin.position`, `row`/`collapsible`/`tabs` pa emër NUK ndryshojnë skemën e databazës (prodhimi s'ka nevojë për migrim). Shtimi/heqja/riemërtimi i fushave, ose ndryshimi i `required`/opsioneve të `select`, e ndryshon — dhe prodhimi (Postgres) s'sinkronizohet vetë.
- Mos vendos burime të jashtme (p.sh. `@import url(https://fonts.googleapis.com/…)`) në `custom.scss`: ndërtimi i 2026-10-22 te Hostinger u var 15m44s te "Creating an optimized production build" (lokalisht ndërtohej për 8s) dhe dështoi. Fontet Inter/Manrope tani vijnë nga paketat `@fontsource-variable/*`, të importuara te `(payload)/layout.tsx`. Edhe pas kësaj, më 2026-10-29 ndërtimi i Hostinger-it u var prapë saktësisht 15m44s (limiti i tyre) me Turbopack, ndërsa lokalisht kalonte për ~1 min — ndaj `npm run build` tani është `next build --webpack`. Mos e kthe në Turbopack pa e testuar te Hostinger.
- Sidebar-i i Payload-it hapet vetë vetëm në ekran > 1440px; në laptopë më të ngushtë hapet me butonin e menusë (sjellje e Payload-it).
- **importMap dhe S3**: plugin-i `s3Storage` regjistrohet gjithmonë te `payload.config.ts` me `enabled: Boolean(process.env.S3_BUCKET)` — kështu `S3ClientUploadHandler` mbetet në `importMap.js` edhe lokalisht. Mos e kthe në `if (process.env.S3_BUCKET) plugins.push(...)`: atëherë çdo `next dev`/`next build` lokal e heq nga importMap, dhe në prodhim (ku plugin-i e kërkon si provider) i gjithë `/admin` del **bosh** pa asnjë error (ndodhi 2026-10-22 → 10-29). Pas shtimit të komponentëve të rinj në admin, rigjenero importMap (`npx payload generate:importmap`) dhe commit-oje.
- SQLite dev: shtimi i fushave/koleksioneve ndërsa dev serveri punon mund të lërë `SQLITE_ERROR: index X already exists` në restart. Zgjidhja: ndalo serverin, `DROP INDEX IF EXISTS <emri>` me `@libsql/client`, restart. Mos e fshi kurrë `payload.db` (përmban të dhënat reale lokale).
- SQLite dev: kur një fushë humb `required` (NOT NULL) dhe shtohen kolona të reja njëkohësisht, push-i i drizzle-s dështon (`INSERT INTO __new_orders … SELECT <kolona e re> FROM orders` → `no such column`). Zgjidhja: ndalo serverin, bëj backup të `payload.db`, shto kolonat e reja me `ALTER TABLE … ADD COLUMN` (me `@libsql/client`), restart. `getPayloadClient()` e mban në cache gabimin e init-it — pas çdo dështimi të skemës duhet restart i serverit.
- Payload Local API me `localized: true`: `create` për locale default (sq), pastaj `update` për `en`. Funksionet ndihmëse mbi koleksione duhen të jenë gjenerike (`<C extends Slug>`) ndryshe TypeScript jep gabime të rreme overload.
- PowerShell `-replace` është case-insensitive si parazgjedhje — kujdes me regex-et mbi kod.
- Next 16 ka ndryshime të mëdha; lexo `node_modules/next/dist/docs/` para se me shkru kod të ri (shih `AGENTS.md`).
