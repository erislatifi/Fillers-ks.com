/**
 * Creates the starting text pages (privacy, terms, shipping, faq) in sq + en.
 * Skips any slug that already exists, so it never overwrites edits made in the admin.
 *
 *   npx tsx scripts/seed-pages.ts
 *
 * The legal texts are drafts — the client should have them reviewed by a lawyer.
 */
import { getPayload } from "payload";
import { readFileSync } from "fs";
import path from "path";

for (const line of readFileSync(path.resolve(".env.local"), "utf-8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
const { default: config } = await import("../src/payload.config");

type Block = string | { h2: string };

// Minimal Lexical document: "## " blocks become headings, everything else paragraphs.
function richText(blocks: Block[]) {
  const text = (t: string) => ({ type: "text", text: t, format: 0, style: "", mode: "normal", detail: 0, version: 1 });
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: blocks.map((b) =>
        typeof b === "string"
          ? { type: "paragraph", format: "" as const, indent: 0, version: 1, direction: "ltr" as const, textFormat: 0, children: [text(b)] }
          : { type: "heading", tag: "h2", format: "" as const, indent: 0, version: 1, direction: "ltr" as const, children: [text(b.h2)] },
      ),
    },
  };
}

type PageSeed = {
  slug: string;
  sq: { title: string; intro: string; content: Block[]; faq?: { q: string; a: string }[] };
  en: { title: string; intro: string; content: Block[]; faq?: { q: string; a: string }[] };
};

const DRAFT_SQ = "Ky tekst është draft dhe duhet të rishikohet nga një jurist para lansimit zyrtar.";
const DRAFT_EN = "This text is a draft and should be reviewed by a legal professional before the official launch.";

const pages: PageSeed[] = [
  {
    slug: "privacy",
    sq: {
      title: "Politika e Privatësisë",
      intro: "Si i mbledhim dhe i përdorim të dhënat tuaja.",
      content: [
        "Fillers Kosovo (Alp Estetik SHPK) respekton privatësinë tuaj. Kjo faqe shpjegon cilat të dhëna mbledhim përmes kësaj faqeje dhe si i përdorim.",
        { h2: "Çfarë të dhënash mbledhim" },
        "Kur krijoni llogari, bëni porosi, na shkruani përmes formës së kontaktit ose regjistroheni për newsletter, mbledhim të dhënat që na jepni — emrin, emrin e klinikës, email-in, telefonin, adresën e dërgesës dhe, nëse kërkoni faturë, të dhënat e biznesit (NUI, numri fiskal, numri i TVSH-së).",
        { h2: "Si i përdorim" },
        "I përdorim vetëm për të menaxhuar llogarinë tuaj, për të përpunuar dhe dërguar porositë, për t'ju përgjigjur dhe — vetëm nëse jeni regjistruar — për t'ju dërguar njoftime për produkte dhe oferta. Nuk ua shesim të dhënat tuaja palëve të treta.",
        { h2: "Të drejtat tuaja" },
        "Mund të kërkoni në çdo kohë qasje, korrigjim ose fshirje të të dhënave tuaja duke na kontaktuar përmes faqes së Kontaktit.",
        DRAFT_SQ,
      ],
    },
    en: {
      title: "Privacy Policy",
      intro: "How we collect and use your information.",
      content: [
        "Fillers Kosovo (Alp Estetik SHPK) respects your privacy. This page explains what information we collect through this website and how it is used.",
        { h2: "Information we collect" },
        "When you create an account, place an order, use the contact form or subscribe to our newsletter, we collect the details you provide — your name, clinic name, email, phone, delivery address and, if you request an invoice, your business details (NUI, fiscal number, VAT number).",
        { h2: "How we use it" },
        "We use it only to run your account, process and deliver orders, respond to you and — only if you subscribed — send you product and promotional updates. We do not sell your personal data to third parties.",
        { h2: "Your rights" },
        "You may request access to, correction or deletion of your personal data at any time by contacting us through the Contact page.",
        DRAFT_EN,
      ],
    },
  },
  {
    slug: "terms",
    sq: {
      title: "Kushtet e Shitjes",
      intro: "Kushtet që vlejnë për përdorimin e faqes dhe çdo porosi.",
      content: [
        "Duke krijuar llogari ose duke bërë porosi në fillers-ks.com, pajtoheni me kushtet më poshtë.",
        { h2: "Vetëm për përdorim profesional" },
        "Produktet në këtë faqe janë ekskluzivisht për mjekë të licencuar, dermatologë dhe praktikantë të certifikuar të estetikës. Rezervojmë të drejtën të verifikojmë licencën profesionale para konfirmimit të një porosie.",
        { h2: "Porositë dhe çmimet" },
        "Çmimet, disponueshmëria dhe specifikat mund të ndryshojnë pa njoftim paraprak. Çdo porosi konfirmohet nga ekipi ynë me telefon ose email. Pajisjet e shënuara \"Kërko ofertë\" çmohen individualisht.",
        { h2: "Pagesa" },
        "Pranojmë pagesë në zyrën tonë, me transfer bankar ose cash te korrieri për dërgesat. Për transfer bankar, porosia dërgohet pasi të konfirmohet pagesa.",
        { h2: "Përgjegjësia" },
        "Produktet duhet të ruhen, trajtohen dhe administrohen sipas udhëzimeve zyrtare të prodhuesit. Fillers Kosovo nuk mban përgjegjësi për pasojat e ruajtjes, trajtimit ose administrimit të gabuar.",
        DRAFT_SQ,
      ],
    },
    en: {
      title: "Terms of Sale",
      intro: "The terms that apply to using this website and to every order.",
      content: [
        "By creating an account or placing an order on fillers-ks.com, you agree to the terms below.",
        { h2: "Professional use only" },
        "Products on this site are intended exclusively for licensed doctors, dermatologists and certified aesthetic practitioners. We reserve the right to verify your professional license before confirming an order.",
        { h2: "Orders and pricing" },
        "Prices, availability and specifications may change without notice. Every order is confirmed by our team by phone or email. Devices marked \"Request a quote\" are priced individually.",
        { h2: "Payment" },
        "We accept payment at our office, by bank transfer, or cash on delivery for courier orders. For bank transfers, the order ships once payment is confirmed.",
        { h2: "Liability" },
        "Products must be stored, handled and administered according to the manufacturer's official instructions. Fillers Kosovo is not liable for outcomes resulting from improper storage, handling or administration.",
        DRAFT_EN,
      ],
    },
  },
  {
    slug: "shipping",
    sq: {
      title: "Dërgesa dhe Marrja",
      intro: "Si mund ta merrni porosinë tuaj.",
      content: [
        { h2: "Marrje në zyrën tonë" },
        "Mund ta merrni porosinë në zyrën tonë sapo t'ju njoftojmë që është gati — pa kosto dërgese.",
        { h2: "Dërgesë me korrier" },
        "Dërgojmë kudo në Kosovë dhe Shqipëri me logjistikë të përshtatshme për produkte farmaceutike dhe biologjike. Porositë standarde zakonisht arrijnë brenda 24–48 orëve pas konfirmimit. Nëse keni nevojë për një datë të caktuar, zgjidheni në checkout.",
        { h2: "Ruajtja gjatë transportit" },
        "Produktet e ndjeshme ndaj temperaturës dërgohen me paketim të përshtatshëm (zinxhir i ftohtë). Kontrolloni pakon kur e pranoni dhe na kontaktoni menjëherë nëse paketimi duket i dëmtuar.",
        DRAFT_SQ,
      ],
    },
    en: {
      title: "Delivery and Pickup",
      intro: "How you can receive your order.",
      content: [
        { h2: "Pickup at our office" },
        "You can collect your order at our office as soon as we let you know it's ready — no delivery cost.",
        { h2: "Courier delivery" },
        "We deliver anywhere in Kosovo and Albania with logistics suited to pharmaceutical and biological products. Standard orders usually arrive within 24–48 hours of confirmation. If you need a specific date, choose it at checkout.",
        { h2: "Storage in transit" },
        "Temperature-sensitive products ship with appropriate cold-chain packaging. Please inspect the parcel on arrival and contact us immediately if the packaging looks damaged.",
        DRAFT_EN,
      ],
    },
  },
  {
    slug: "faq",
    sq: {
      title: "Pyetjet e Shpeshta",
      intro: "Përgjigje të shpejta për pyetjet që na bëhen më shpesh.",
      content: [],
      faq: [
        { q: "Kush mund të blejë në këtë faqe?", a: "Vetëm mjekë të licencuar, dermatologë dhe klinika të certifikuara të estetikës. Mund të kërkojmë verifikim të licencës para konfirmimit të porosisë." },
        { q: "A janë produktet origjinale?", a: "Po. Jemi distributor i autorizuar dhe çdo produkt vjen me numër batch-i të gjurmueshëm nga prodhuesi." },
        { q: "Si mund ta marr porosinë?", a: "Mund ta merrni në zyrën tonë ose ta dërgojmë me korrier në adresën tuaj. Te checkout mund të zgjidhni edhe një datë të caktuar." },
        { q: "Si mund të paguaj?", a: "Në zyrën tonë (cash ose kartelë), me transfer bankar, ose cash te korrieri kur porosia dërgohet me korrier." },
        { q: "A mund të marr faturë për biznesin tim?", a: "Po. Te checkout tikoni \"Më duhet faturë për biznes\" dhe shkruani emrin e biznesit dhe NUI-n." },
        { q: "Kam harruar fjalëkalimin e llogarisë. Çfarë të bëj?", a: "Na kontaktoni me telefon ose email dhe ua rivendosim." },
      ],
    },
    en: {
      title: "Frequently Asked Questions",
      intro: "Quick answers to the questions we hear most often.",
      content: [],
      faq: [
        { q: "Who can buy on this website?", a: "Only licensed doctors, dermatologists and certified aesthetic clinics. We may ask to verify your license before confirming an order." },
        { q: "Are the products original?", a: "Yes. We are an authorised distributor and every product comes with a traceable manufacturer batch number." },
        { q: "How can I receive my order?", a: "Pick it up at our office or have it delivered by courier to your address. At checkout you can also choose a specific date." },
        { q: "How can I pay?", a: "At our office (cash or card), by bank transfer, or cash on delivery for courier orders." },
        { q: "Can I get an invoice for my business?", a: "Yes. At checkout tick \"I need a business invoice\" and enter your business name and NUI." },
        { q: "I forgot my account password. What should I do?", a: "Contact us by phone or email and we'll reset it for you." },
      ],
    },
  },
];

const payload = await getPayload({ config });

for (const p of pages) {
  const existing = await payload.find({ collection: "pages", where: { slug: { equals: p.slug } }, limit: 1 });
  if (existing.docs[0]) {
    console.log(`skip pages/${p.slug} (exists)`);
    continue;
  }
  const created = await payload.create({
    collection: "pages",
    locale: "sq",
    data: {
      slug: p.slug,
      title: p.sq.title,
      intro: p.sq.intro,
      content: p.sq.content.length ? richText(p.sq.content) : undefined,
      faq: p.sq.faq?.map((f) => ({ question: f.q, answer: f.a })),
      showInFooter: true,
    },
  });
  // Localized array items keep their ids across locales, so update them in place.
  await payload.update({
    collection: "pages",
    id: created.id,
    locale: "en",
    data: {
      title: p.en.title,
      intro: p.en.intro,
      content: p.en.content.length ? richText(p.en.content) : undefined,
      faq: p.en.faq?.map((f, i) => ({ id: created.faq?.[i]?.id, question: f.q, answer: f.a })),
    },
  });
  console.log(`created pages/${p.slug}`);
}
process.exit(0);
