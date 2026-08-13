import { getPayload, type Payload } from "payload";
import { readFileSync } from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const { default: config } = await import("../src/payload.config");

type Locale = "sq" | "en";

function richText(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [
          {
            type: "text",
            format: 0,
            style: "",
            mode: "normal" as const,
            detail: 0,
            version: 1,
            text,
          },
        ],
      })),
    },
  };
}

async function upsertBySlug<C extends "categories" | "brands" | "products" | "articles" | "promotions">(
  payload: Payload,
  collection: C,
  slug: string,
  dataSq: Record<string, unknown>,
  dataEn: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    console.log(`skip ${collection}/${slug} (already exists)`);
    return existing.docs[0];
  }
  const created = await payload.create({
    collection,
    locale: "sq" as Locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- seed data is a loose bag of fields per collection, not worth a full discriminated union here
    data: { ...dataSq, slug } as any,
  });
  await payload.update({
    collection,
    id: created.id,
    locale: "en" as Locale,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: dataEn as any,
  });
  console.log(`created ${collection}/${slug}`);
  return created;
}

async function upsertTestimonial(
  payload: Payload,
  clinic: string,
  city: string,
  roleSq: string,
  roleEn: string,
  quoteSq: string,
  quoteEn: string,
) {
  const existing = await payload.find({
    collection: "testimonials",
    where: { clinic: { equals: clinic } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    console.log(`skip testimonials/${clinic} (already exists)`);
    return;
  }
  const created = await payload.create({
    collection: "testimonials",
    locale: "sq" as Locale,
    data: { clinic, city, role: roleSq, quote: quoteSq },
  });
  await payload.update({
    collection: "testimonials",
    id: created.id,
    locale: "en" as Locale,
    data: { role: roleEn, quote: quoteEn },
  });
  console.log(`created testimonials/${clinic}`);
}

async function run() {
  const payload = await getPayload({ config });

  // ---------- Categories ----------
  const categories = [
    {
      slug: "dermal-fillers",
      icon: "drop",
      sq: { name: "Filerë Dermik", description: "Volumizim dhe konturim me HA" },
      en: { name: "Dermal Fillers", description: "HA volumizing & contouring" },
    },
    {
      slug: "skin-boosters",
      icon: "sparkle",
      sq: { name: "Përforcues Lëkure", description: "Hidratim dhe bio-remodelim" },
      en: { name: "Skin Boosters", description: "Hydration & bio-remodelling" },
    },
    {
      slug: "lasers-devices",
      icon: "laser",
      sq: { name: "Lasera & Pajisje", description: "Sisteme estetike me bazë energjie" },
      en: { name: "Lasers & Devices", description: "Energy-based aesthetic systems" },
    },
    {
      slug: "hair-treatments",
      icon: "hair",
      sq: { name: "Trajtime Flokësh", description: "Terapi për tërheqjen e flokëve" },
      en: { name: "Hair Treatments", description: "Scalp & follicle therapy" },
    },
    {
      slug: "biostimulators",
      icon: "cell",
      sq: { name: "Biostimulues", description: "Nxitje e kolagjenit dhe elastinës" },
      en: { name: "Biostimulators", description: "Collagen & elastin induction" },
    },
    {
      slug: "cannulas",
      icon: "cannula",
      sq: { name: "Kanula", description: "Kanula precize injektimi" },
      en: { name: "Cannulas", description: "Precision injection cannulas" },
    },
    {
      slug: "needles",
      icon: "needle",
      sq: { name: "Gjilpëra", description: "Gjilpëra injektimi me gauge të hollë" },
      en: { name: "Needles", description: "Fine-gauge injection needles" },
    },
    {
      slug: "mesotherapy",
      icon: "meso",
      sq: { name: "Mezoterapi", description: "Koktej mikro-injektimi" },
      en: { name: "Mesotherapy", description: "Micro-injection cocktails" },
    },
    {
      slug: "aftercare",
      icon: "shield",
      sq: { name: "Kujdesi Pas Trajtimit", description: "Kujdes shërimi pas trajtimit" },
      en: { name: "Aftercare", description: "Post-treatment recovery care" },
    },
  ] as const;

  const categoryIds: Record<string, string | number> = {};
  for (const c of categories) {
    const doc = await upsertBySlug(
      payload,
      "categories",
      c.slug,
      { ...c.sq, icon: c.icon },
      c.en,
    );
    categoryIds[c.slug] = doc.id;
  }

  // ---------- Brands ----------
  const brands = [
    {
      slug: "juvederm",
      name: "Juvéderm",
      origin: "USA",
      category: "dermal-fillers",
      sq: {
        tagline: "Filleri HA më i besuar në botë",
        description:
          "Teknologji hyaluronic acid Vycross dhe Hylacross për volumizim dhe konturim natyral afatgjatë.",
      },
      en: {
        tagline: "The world's most trusted HA filler",
        description:
          "Vycross and Hylacross hyaluronic acid technology for natural, long-lasting volumization and contouring.",
      },
    },
    {
      slug: "revolax",
      name: "Revolax",
      origin: "South Korea",
      category: "dermal-fillers",
      sq: {
        tagline: "Filler koreano precizioni HA",
        description:
          "Filerë HA monofazikë të projektuar për integrim të butë dhe rezultate të parashikueshme, të rafinuara.",
      },
      en: {
        tagline: "Precision Korean HA filler",
        description:
          "Monophasic hyaluronic acid fillers engineered for smooth integration and predictable, refined results.",
      },
    },
    {
      slug: "profhilo",
      name: "Profhilo",
      origin: "Italy",
      category: "skin-boosters",
      sq: {
        tagline: "Injektuesi origjinal i bio-remodelimit",
        description:
          "Acid hyaluronik i pastër i stabilizuar që hidraton, forcon dhe remodelon lëkurën nga brenda — pa shenja gjilpëre, pa kohë pushimi.",
      },
      en: {
        tagline: "The original bio-remodelling injectable",
        description:
          "Pure stabilised hyaluronic acid that hydrates, firms and remodels skin from within — no needle marks, no downtime.",
      },
    },
    {
      slug: "teosyal",
      name: "Teosyal",
      origin: "Switzerland",
      category: "dermal-fillers",
      sq: {
        tagline: "Ekselencë zvicerane injektuese",
        description:
          "Një gamë e plotë gelesh HA elastike që mbulojnë nga rrudhat e holla deri te volumizimi i thellë strukturor.",
      },
      en: {
        tagline: "Swiss-engineered injectable excellence",
        description:
          "A full range of resilient hyaluronic acid gels covering fine lines through deep structural volumization.",
      },
    },
    {
      slug: "neauvia",
      name: "Neauvia",
      origin: "Italy",
      category: "dermal-fillers",
      sq: {
        tagline: "Filerë biokompatibël të gjeneratës së re",
        description:
          "Formulime hibride HA të kombinuara me komplekse antioksidante për volumizim të avancuar dhe cilësi të lëkurës.",
      },
      en: {
        tagline: "Next-generation biocompatible fillers",
        description:
          "Hybrid HA formulations combined with antioxidant complexes for advanced volumizing and skin quality outcomes.",
      },
    },
    {
      slug: "lumi-fill",
      name: "Lumi Fill",
      origin: "South Korea",
      category: "dermal-fillers",
      sq: {
        tagline: "Volum natyral dhe i ndritshëm",
        description:
          "Filerë HA të lidhur në formë kryqi, të formuluar për rrjedhje të butë dhe një pamje të freskët e të ndritshme natyrale.",
      },
      en: {
        tagline: "Luminous, natural-looking volume",
        description:
          "Cross-linked HA fillers formulated for smooth flow and a naturally luminous, refreshed finish.",
      },
    },
    {
      slug: "bonetta",
      name: "Bonetta",
      origin: "South Korea",
      category: "biostimulators",
      sq: {
        tagline: "Gamë e avancuar HA dhe biostimulimi",
        description:
          "Një linjë gjithëpërfshirëse që përfshin filerë, përforcues lëkure dhe biostimulues PDLLA për protokolle të plota të fytyrës.",
      },
      en: {
        tagline: "Advanced HA and biostimulation range",
        description:
          "A comprehensive line spanning fillers, skin boosters and PDLLA biostimulators for full-face protocols.",
      },
    },
    {
      slug: "jalupro",
      name: "Jalupro",
      origin: "Italy",
      category: "skin-boosters",
      sq: {
        tagline: "Bio-rivitalizim lëkure me aminoacide",
        description:
          "Përzierje e patentuar e HA me peshë molekulare të ulët dhe të lartë me aminoacide për të stimuluar sintezën natyrale të kolagjenit.",
      },
      en: {
        tagline: "Amino acid skin bio-revitalization",
        description:
          "Patented blend of low and high molecular weight HA with amino acids to stimulate natural collagen synthesis.",
      },
    },
    {
      slug: "sunekos",
      name: "Sunekos",
      origin: "Italy",
      category: "biostimulators",
      sq: {
        tagline: "Terapi biostimulimi kolagjeni",
        description:
          "Formulime acidi hyaluronik dhe aminoacidesh që nxisin prodhimin natyral të kolagjenit dhe elastinës në lëkurë.",
      },
      en: {
        tagline: "Collagen bio-stimulation therapy",
        description:
          "Hyaluronic acid and amino acid formulations that trigger the skin's own collagen and elastin production.",
      },
    },
    {
      slug: "nucleofill",
      name: "Nucleofill",
      origin: "France",
      category: "biostimulators",
      sq: {
        tagline: "Rigjenerim lëkure me polinukleotide",
        description:
          "Gele polinukleotide të pastruara që riparojnë, hidratojnë dhe rigjenerojnë lëkurën në nivel qelizor.",
      },
      en: {
        tagline: "Polynucleotide skin regeneration",
        description:
          "Purified polynucleotide gels that repair, hydrate and regenerate skin at a cellular level.",
      },
    },
    {
      slug: "radiesse",
      name: "Radiesse",
      origin: "USA",
      category: "biostimulators",
      sq: {
        tagline: "Biostimulues kalcium hidroksiapatiti",
        description:
          "Mikrosfera CaHA që ofrojnë volumizim të menjëhershëm ndërkohë që stimulojnë prodhimin natyral afatgjatë të kolagjenit.",
      },
      en: {
        tagline: "Calcium hydroxylapatite biostimulator",
        description:
          "CaHA microspheres that provide immediate volumization while stimulating long-term natural collagen production.",
      },
    },
    {
      slug: "harmonyca",
      name: "HArmonyCa",
      origin: "South Korea",
      category: "dermal-fillers",
      sq: {
        tagline: "Inovacion hibrid HA + CaHA",
        description:
          "Një formulë hibride revolucionare që kombinon acid hyaluronik dhe kalcium hidroksiapatit për volum dhe fortësi.",
      },
      en: {
        tagline: "Hybrid HA + CaHA innovation",
        description:
          "A breakthrough hybrid formula combining hyaluronic acid and calcium hydroxylapatite for volume and firmness.",
      },
    },
    {
      slug: "jeisys",
      name: "Jeisys",
      origin: "South Korea",
      category: "lasers-devices",
      type: "device",
      sq: {
        tagline: "Lider global në pajisje estetike me bazë energjie",
        description:
          "25 vjet R&D pas platformave HIFU, RF microneedling dhe laser — përfshirë Ultraformer dhe Potenza — të instaluara në 70+ vende në mbarë botën.",
        distribution: "Distributor zyrtar për Kosovë dhe Shqipëri",
      },
      en: {
        tagline: "Global leader in energy-based aesthetic devices",
        description:
          "25 years of R&D behind HIFU, RF microneedling and laser platforms — including Ultraformer and Potenza — installed in 70+ countries worldwide.",
        distribution: "Official distributor for Kosovo and Albania",
      },
    },
    {
      slug: "clarius",
      name: "Clarius",
      origin: "Canada",
      category: "lasers-devices",
      type: "device",
      sq: {
        tagline: "Imazhi ultrazë wireless portativ",
        description:
          "Skanerë ultrazë wireless të madhësisë së xhepit, të certifikuar FDA, për imazhi point-of-care dhe injektime të udhëhequra me precizion.",
        distribution: "Distributor zyrtar për Kosovë dhe Shqipëri",
      },
      en: {
        tagline: "Wireless handheld ultrasound imaging",
        description:
          "Pocket-sized, FDA-cleared wireless ultrasound scanners for point-of-care imaging and precise, guided injections.",
        distribution: "Official distributor for Kosovo and Albania",
      },
    },
  ] as const;

  const brandIds: Record<string, string | number> = {};
  for (const b of brands) {
    const doc = await upsertBySlug(
      payload,
      "brands",
      b.slug,
      {
        name: b.name,
        origin: b.origin,
        category: categoryIds[b.category],
        type: "type" in b ? b.type : "injectable",
        ...b.sq,
      },
      b.en,
    );
    brandIds[b.slug] = doc.id;
  }

  // ---------- Products ----------
  const products = [
    {
      slug: "juvederm-voluma",
      name: "Voluma XC",
      brand: "juvederm",
      category: "dermal-fillers",
      size: "1 x 1ml",
      price: 89,
      bestSeller: true,
      sq: { description: "Filler volumizues i thellë për konturim të faqeve dhe pjesës së mesme të fytyrës." },
      en: { description: "Deep volumizing filler for cheeks and midface contouring." },
    },
    {
      slug: "profhilo-h",
      name: "Profhilo H+L",
      brand: "profhilo",
      category: "skin-boosters",
      size: "1 x 2ml",
      price: 95,
      bestSeller: true,
      sq: { description: "HA hibrid kooperativ bio-remodelimi për cilësinë e lëkurës." },
      en: { description: "Bio-remodelling hybrid cooperative HA for skin quality." },
    },
    {
      slug: "teosyal-rha4",
      name: "RHA 4",
      brand: "teosyal",
      category: "dermal-fillers",
      size: "1 x 1ml",
      price: 82,
      bestSeller: true,
      sq: { description: "Filler dinamik i projektuar për zona të fytyrës me lëvizshmëri të lartë." },
      en: { description: "Dynamic filler engineered for high-movement facial areas." },
    },
    {
      slug: "radiesse-plus",
      name: "Radiesse (+)",
      brand: "radiesse",
      category: "biostimulators",
      size: "1 x 1.5ml",
      price: 110,
      bestSeller: true,
      sq: { description: "Biostimulues CaHA për volum dhe mbështetje afatgjatë të kolagjenit." },
      en: { description: "CaHA biostimulator for volume and long-term collagen support." },
    },
    {
      slug: "sunekos-1200",
      name: "Sunekos 1200",
      brand: "sunekos",
      category: "biostimulators",
      size: "5 x 2ml",
      price: 145,
      newArrival: true,
      sq: { description: "Trajtim i thellë remodelimi dermik për rigjenerimin e lëkurës." },
      en: { description: "Deep dermal remodelling treatment for skin regeneration." },
    },
    {
      slug: "revolax-deep",
      name: "Revolax Deep",
      brand: "revolax",
      category: "dermal-fillers",
      size: "1 x 1.1ml",
      price: 64,
      sq: { description: "HA monofazik për mbështetje strukturore dhe rrudha të thella." },
      en: { description: "Monophasic HA for structural support and deep folds." },
    },
    {
      slug: "harmonyca-product",
      name: "HArmonyCa",
      brand: "harmonyca",
      category: "dermal-fillers",
      size: "1 x 1ml",
      price: 118,
      newArrival: true,
      sq: { description: "Formulë hibride HA + CaHA për volum dhe fortësinë e lëkurës." },
      en: { description: "Hybrid HA + CaHA formula for volume and skin firmness." },
    },
    {
      slug: "nucleofill-strong",
      name: "Nucleofill Strong",
      brand: "nucleofill",
      category: "biostimulators",
      size: "1 x 2ml",
      price: 76,
      newArrival: true,
      sq: { description: "Gel polinukleotidesh për rigjenerim dhe hidratim të thellë." },
      en: { description: "Polynucleotide gel for regeneration and deep hydration." },
    },
    {
      slug: "jalupro-classic",
      name: "Jalupro Classic",
      brand: "jalupro",
      category: "skin-boosters",
      size: "5 x 5ml",
      price: 132,
      sq: { description: "Përzierje aminoacidesh dhe HA që nxit kolagjenin natyral." },
      en: { description: "Amino acid and HA blend that stimulates natural collagen." },
    },
    {
      slug: "neauvia-intense",
      name: "Neauvia Intense",
      brand: "neauvia",
      category: "dermal-fillers",
      size: "1 x 1.1ml",
      price: 88,
      sq: { description: "Filler hibrid HA me kompleks antioksidant për volumizim." },
      en: { description: "Hybrid HA filler with antioxidant complex for volumizing." },
    },
    {
      slug: "lumi-fill-2",
      name: "Lumi Fill No.2",
      brand: "lumi-fill",
      category: "dermal-fillers",
      size: "1 x 1.1ml",
      price: 58,
      newArrival: true,
      sq: { description: "Filler HA me rrjedhje të butë për një pamje natyrale të ndritshme." },
      en: { description: "Smooth-flow HA filler for a naturally luminous finish." },
    },
    {
      slug: "bonetta-deep",
      name: "Bonetta Deep Line",
      brand: "bonetta",
      category: "dermal-fillers",
      size: "1 x 1ml",
      price: 61,
      sq: { description: "Formulim i avancuar HA për korrigjimin e rrudhave të thella." },
      en: { description: "Advanced HA formulation for deep line correction." },
    },
    {
      slug: "jeisys-ultraformer-mpt",
      name: "Ultraformer MPT",
      brand: "jeisys",
      category: "lasers-devices",
      size: "Sistem + koka",
      price: 0,
      newArrival: true,
      quoteOnly: true,
      sq: { description: "Platformë HIFU e gjeneratës së 4-t për ngritje dhe fortësim jo-invaziv të lëkurës." },
      en: { description: "4th-gen HIFU platform for non-invasive lifting and skin tightening." },
    },
    {
      slug: "jeisys-potenza",
      name: "Potenza RF Microneedling",
      brand: "jeisys",
      category: "lasers-devices",
      size: "Sistem + majat",
      price: 0,
      newArrival: true,
      quoteOnly: true,
      sq: { description: "Microneedling RF fraksional me mode 1MHz–2MHz dhe funksion dërgimi ilaçesh." },
      en: { description: "Fractional RF microneedling with 1MHz–2MHz modes and drug-delivery function." },
    },
    {
      slug: "clarius-c3-hd3",
      name: "Clarius C3 HD3",
      brand: "clarius",
      category: "lasers-devices",
      size: "Skaner wireless",
      price: 0,
      newArrival: true,
      quoteOnly: true,
      sq: { description: "Ultrazë portativ wireless për injektime të udhëhequra dhe imazhi point-of-care." },
      en: { description: "Wireless handheld ultrasound for guided injections and point-of-care imaging." },
    },
  ] as const;

  for (const p of products) {
    await upsertBySlug(
      payload,
      "products",
      p.slug,
      {
        name: p.name,
        brand: brandIds[p.brand],
        category: categoryIds[p.category],
        size: p.size,
        price: p.price,
        bestSeller: "bestSeller" in p ? p.bestSeller : false,
        newArrival: "newArrival" in p ? p.newArrival : false,
        quoteOnly: "quoteOnly" in p ? p.quoteOnly : false,
        ...p.sq,
      },
      p.en,
    );
  }

  // ---------- Testimonials ----------
  await upsertTestimonial(
    payload,
    "Clinica Bardhi",
    "Prishtinë",
    "Drejtore Mjekësore",
    "Medical Director",
    "Fillers Kosovo është distributori i vetëm të cilit i besojmë me krejt bibliotekën tonë të protokolleve. Produkte autentike, dokumentacion i saktë, çdo porosi.",
    "Fillers Kosovo is the only distributor we trust with our full protocol library. Authentic products, proper documentation, every single order.",
  );
  await upsertTestimonial(
    payload,
    "Aesthetic Studio Nova",
    "Prizren",
    "Mjeke Estetike",
    "Aesthetic Physician",
    "Shpejtësia e dërgesës së tyre e ndryshoi mënyrën se si planifikojmë kalendarin. Ajo që dikur merrte një javë nga jashtë tani mbërrin brenda ditësh, plotësisht e gjurmueshme.",
    "Their delivery speed changed how we plan our calendar. What used to take a week from abroad now arrives in days, fully traceable.",
  );
  await upsertTestimonial(
    payload,
    "DermaLux Clinic",
    "Pejë",
    "Themeluese & Dermatologe",
    "Founder & Dermatologist",
    "Mbështetje profesionale që vërtet i kupton produktet — numra batch, udhëzime ruajtjeje, këshilla protokolli. E rrallë në këtë treg.",
    "Professional support that actually understands the products — batch numbers, storage guidance, protocol advice. Rare in this market.",
  );

  // ---------- Articles ----------
  const articleContent = {
    "ha-fillers-vs-biostimulators": {
      sq: [
        "Filerët me acid hyaluronik (HA) dhe biostimuluesit i përkasin të dyja familjes së injektuesve estetikë, por punojnë në mënyra thelbësisht të ndryshme. HA-ja shton volum menjëherë duke tërhequr dhe mbajtur ujë në indin nën lëkurë — rezultati shihet që në momentin e trajtimit.",
        "Biostimuluesit, si Sunekos, Radiesse apo Nucleofill, nuk mbushin hapësirën në mënyrë të drejtpërdrejtë. Në vend të kësaj, ata nxisin fibroblastet e lëkurës të prodhojnë kolagjen dhe elastinë natyrale — një proces që zhvillohet gradualisht gjatë javëve në vijim.",
        "Zgjedhja mes tyre varet nga qëllimi klinik: HA-ja është e preferuar për konturim dhe volum të menjëhershëm dhe të parashikueshëm, ndërsa biostimuluesit janë më të përshtatshëm për përmirësimin afatgjatë të cilësisë dhe fortësisë së lëkurës. Shumë protokolle moderne i kombinojnë të dyja qasjet për rezultate komplementare.",
      ],
      en: [
        "Hyaluronic acid (HA) fillers and biostimulators both belong to the aesthetic injectable family, but they work in fundamentally different ways. HA adds volume immediately by attracting and holding water in the tissue beneath the skin — the result is visible right at the time of treatment.",
        "Biostimulators, such as Sunekos, Radiesse or Nucleofill, don't fill space directly. Instead, they stimulate the skin's own fibroblasts to produce natural collagen and elastin — a process that unfolds gradually over the following weeks.",
        "The choice between them depends on the clinical goal: HA is preferred for immediate, predictable contouring and volume, while biostimulators are better suited to long-term improvements in skin quality and firmness. Many modern protocols combine both approaches for complementary results.",
      ],
    },
    "profhilo-injection-technique": {
      sq: [
        "Profhilo përdor një teknikë injektimi të veçantë të njohur si BAP (Bio Aesthetic Points) — pesë pika standarde në secilën anë të fytyrës ku produkti depozitohet në një bolus të vogël nënlëkuror.",
        "Ndryshe nga filerët tradicionalë, Profhilo nuk injektohet për të konturuar një zonë specifike, por për t'u shpërndarë në mënyrë të njëtrajtshme nën lëkurë, duke stimuluar prodhimin e kolagjenit tip I dhe III dhe elastinës në një sipërfaqe të gjerë.",
        "Protokolli standard përfshin dy seanca me interval katër javësh, e ndjekur nga trajtime mirëmbajtjeje periodike. Përzgjedhja e saktë e pikave dhe teknika e injektimit duhet të kryhet vetëm nga profesionistë të trajnuar, sipas udhëzimeve zyrtare të prodhuesit.",
      ],
      en: [
        "Profhilo uses a distinctive injection technique known as BAP (Bio Aesthetic Points) — five standardised points on each side of the face where the product is deposited as a small subdermal bolus.",
        "Unlike traditional fillers, Profhilo isn't injected to contour a specific area, but rather to spread evenly beneath the skin, stimulating type I and III collagen and elastin production across a broad surface.",
        "The standard protocol involves two sessions four weeks apart, followed by periodic maintenance treatments. Exact point selection and injection technique should only be performed by trained professionals, in line with the manufacturer's official guidance.",
      ],
    },
    "understanding-molecular-weight": {
      sq: [
        "Jo të gjithë filerët me acid hyaluronik janë të njëjtë — pesha molekulare e HA-së dhe dendësia e lidhjes së kryqëzuar (cross-linking) përcaktojnë se si sillet produkti pasi injektohet.",
        "HA me peshë molekulare të lartë krijon gele më të forta, ideale për volumizim strukturor të thellë. HA me peshë molekulare të ulët depërton më lehtë dhe përdoret zakonisht në përforcuesit e lëkurës për hidratim sipërfaqësor.",
        "Densiteti i cross-linking-ut ndikon drejtpërdrejt qëndrueshmërinë e produktit në ind — sa më i lartë densiteti, aq më gjatë zgjat efekti, por edhe aq më i vështirë integrimi natyral. Kuptimi i këtyre vetive teknike ndihmon profesionistët të zgjedhin produktin e duhur për çdo zonë e nevojë klinike.",
      ],
      en: [
        "Not all hyaluronic acid fillers are the same — the molecular weight of the HA and the density of cross-linking determine how the product behaves once injected.",
        "High molecular weight HA creates firmer gels, ideal for deep structural volumizing. Low molecular weight HA penetrates more easily and is typically used in skin boosters for surface-level hydration.",
        "Cross-linking density directly affects how long the product persists in tissue — the higher the density, the longer the effect lasts, but also the harder natural integration becomes. Understanding these technical properties helps professionals choose the right product for each area and clinical need.",
      ],
    },
  } as const;

  await upsertBySlug(
    payload,
    "articles",
    "ha-fillers-vs-biostimulators",
    {
      title: "HA Filerë vs. Biostimulues: Zgjedhja e Protokollit të Duhur",
      excerpt:
        "Një krahasim klinik i filerëve hyaluronic acid me volum të menjëhershëm kundrejt biostimuluesve që nxisin kolagjenin.",
      tag: "Comparison",
      readTime: "6 min",
      content: richText([...articleContent["ha-fillers-vs-biostimulators"].sq]),
    },
    {
      title: "HA Fillers vs. Biostimulators: Choosing the Right Protocol",
      excerpt:
        "A clinical comparison of immediate-volume hyaluronic acid fillers against collagen-inducing biostimulators.",
      content: richText([...articleContent["ha-fillers-vs-biostimulators"].en]),
    },
  );
  await upsertBySlug(
    payload,
    "articles",
    "profhilo-injection-technique",
    {
      title: "Teknika BAP e Profhilo: Udhëzues Injektimi Hap pas Hapi",
      excerpt: "Teknika me pesë pika bio-estetike për rezultate optimale të remodelimit të lëkurës.",
      tag: "Treatment Guide",
      readTime: "8 min",
      content: richText([...articleContent["profhilo-injection-technique"].sq]),
    },
    {
      title: "Profhilo BAP Technique: A Step-by-Step Injection Guide",
      excerpt: "The five-point bio aesthetic points technique for optimal skin remodelling results.",
      content: richText([...articleContent["profhilo-injection-technique"].en]),
    },
  );
  await upsertBySlug(
    payload,
    "articles",
    "understanding-molecular-weight",
    {
      title: "Kuptimi i Peshës Molekulare në Filerët Hyaluronic Acid",
      excerpt: "Pse dendësia e cross-linking dhe pesha molekulare përcaktojnë qëndrueshmërinë, ngritjen dhe integrimin.",
      tag: "Education",
      readTime: "5 min",
      content: richText([...articleContent["understanding-molecular-weight"].sq]),
    },
    {
      title: "Understanding Molecular Weight in Hyaluronic Acid Fillers",
      excerpt: "Why cross-linking density and molecular weight determine longevity, lift and integration.",
      content: richText([...articleContent["understanding-molecular-weight"].en]),
    },
  );

  // Backfill content for articles created by a previous seed run (upsert skips existing docs)
  for (const [slug, texts] of Object.entries(articleContent)) {
    const existing = await payload.find({
      collection: "articles",
      where: { slug: { equals: slug } },
      limit: 1,
      locale: "sq",
    });
    const doc = existing.docs[0];
    if (doc && !doc.content) {
      await payload.update({
        collection: "articles",
        id: doc.id,
        locale: "sq",
        data: { content: richText([...texts.sq]) },
      });
      await payload.update({
        collection: "articles",
        id: doc.id,
        locale: "en",
        data: { content: richText([...texts.en]) },
      });
      console.log(`backfilled content for articles/${slug}`);
    }
  }

  // ---------- Promotions ----------
  await upsertBySlug(
    payload,
    "promotions",
    "bundle-savings",
    {
      title: "Kurse deri në 15% në paketa shumë-kutish të brendeve",
      badge: "PAKETA KLINIKASH",
      description:
        "Furnizo protokollet e sezonit me çmime të shkallëzuara sipas volumit për Juvéderm, Teosyal dhe Profhilo.",
      ctaLabel: "Eksploro paketat",
      ctaHref: "/promotions/bundle-savings",
      theme: "light",
    },
    {
      title: "Save up to 15% on multi-box brand bundles",
      badge: "CLINIC BUNDLES",
      description:
        "Stock your protocols for the season with tiered volume pricing across Juvéderm, Teosyal and Profhilo.",
      ctaLabel: "Explore bundles",
    },
  );
  await upsertBySlug(
    payload,
    "promotions",
    "new-clinic-offer",
    {
      title: "10% zbritje në porosinë e parë të klinikës suaj",
      badge: "OFERTË E RE PARTNERITETI",
      description:
        "Regjistrohu si klinikë partnere e verifikuar dhe merr një zbritje mirëseardhjeje në blerjen tënde të parë.",
      ctaLabel: "Bëhu partner",
      ctaHref: "/promotions/new-clinic-offer",
      theme: "dark",
    },
    {
      title: "10% off your clinic's first order",
      badge: "NEW PARTNER OFFER",
      description:
        "Register as a verified partner clinic and receive a welcome discount on your first purchase.",
      ctaLabel: "Become a partner",
    },
  );

  // ---------- Globals: Homepage ----------
  const homepage = await payload.findGlobal({ slug: "homepage", locale: "sq" });
  if (!homepage?.hero?.title) {
    await payload.updateGlobal({
      slug: "homepage",
      locale: "sq",
      data: {
        hero: {
          eyebrow: "Distributori i Certifikuar Estetik i Kosovës",
          title: "Mjekësi estetike premium, e besuar nga klinikat kryesore të Kosovës.",
          subtitle:
            "100+ produkte origjinale nga 14 brende botërore të njohura — filerë, përforcues lëkure, biostimulues dhe pajisje estetike, të dorëzuara shpejt me gjurmueshmëri të plotë dhe mbështetje klinike për profesionistë të licencuar.",
          primaryCtaLabel: "Eksploro Katalogun",
          primaryCtaHref: "/catalog",
          secondaryCtaLabel: "Bëhu Klinikë Partnere",
          secondaryCtaHref: "/account/register",
          statsProducts: "100+",
          statsBrands: "14",
          statsClinics: "500+",
        },
        about: {
          title: "Ura e besuar mes inovacionit global estetik dhe klinikave lokale.",
          paragraph1:
            "Fillers Kosovo ekziston për të mbyllur hendekun mes prodhuesve kryesorë botërorë të estetikës dhe klinikave të licencuara që mbështeten tek ta. Punojmë direkt me brendet dhe kanalet e tyre të autorizuara — kurrë me rishitës të tregut gri — kështu që çdo filler, përforcues lëkure, biostimulues dhe pajisje që shpërndajmë vjen me gjurmueshmëri të plotë të batch-it dhe dokumentacion mbi të cilin klinika juaj mund të mbështetet.",
          paragraph2:
            "Përtej injektuesve, jemi zgjeruar në pajisje estetike me bazë energjie — përfshirë linjat Jeisys dhe Clarius — duke i dhënë klinikave në Kosovë dhe Shqipëri një partner të vetëm, të përgjegjshëm për konsumueshme dhe pajisje kapitale, të mbështetur nga mbështetje reale klinike para dhe pas çdo porosie.",
          quote:
            "“Ndriço me ne” — duke ndriçuar klinikat në Kosovë dhe Shqipëri me produkte autentike dhe mbështetje reale.",
          distributionNote: "Distributor zyrtar për Kosovë & Shqipëri",
        },
      },
    });
    await payload.updateGlobal({
      slug: "homepage",
      locale: "en",
      data: {
        hero: {
          eyebrow: "Kosovo's Certified Aesthetic Distributor",
          title: "Premium aesthetic medicine, trusted by Kosovo's leading clinics.",
          subtitle:
            "100+ original products from 14 world-renowned brands — fillers, skin boosters, biostimulators and aesthetic devices, delivered fast with full traceability and clinical support for licensed professionals.",
          primaryCtaLabel: "Explore the Catalog",
          secondaryCtaLabel: "Become a Partner Clinic",
        },
        about: {
          title: "The trusted bridge between global aesthetic innovation and local clinics.",
          paragraph1:
            "Fillers Kosovo exists to close the gap between the world's leading aesthetic manufacturers and the licensed clinics that rely on them. We work directly with brands and their authorized channels — never gray-market resellers — so every filler, skin booster, biostimulator and device we distribute arrives with full batch traceability and documentation your clinic can stand behind.",
          paragraph2:
            "Beyond injectables, we've expanded into energy-based aesthetic devices — including the Jeisys and Clarius lines — giving clinics in Kosovo and Albania a single, accountable partner for both consumables and capital equipment, backed by real clinical support before and after every order.",
          quote:
            "“Ndriço me ne” — illuminating clinics across Kosovo and Albania with authentic products and real support.",
          distributionNote: "Official distributor for Kosovo & Albania",
        },
      },
    });
    console.log("created homepage global (sq + en)");
  } else {
    console.log("skip homepage global (already set)");
  }

  // ---------- Globals: Site Settings ----------
  const siteSettings = await payload.findGlobal({ slug: "site-settings", locale: "sq" });
  if (!siteSettings?.contactEmail) {
    await payload.updateGlobal({
      slug: "site-settings",
      locale: "sq",
      data: {
        contactPhone: "+383 44 000 000",
        contactEmail: "orders@fillers-ks.com",
        address: "Prishtinë, Kosovë",
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "facebook", url: "https://facebook.com" },
          { platform: "linkedin", url: "https://linkedin.com" },
        ],
        seoDefaultTitle: "Fillers Kosovo | Distributor Premium i Mjekësisë Estetike",
        seoDefaultDescription:
          "Distributori kryesor i Kosovës për mjekësi estetike premium — filerë dermik, përforcues lëkure, biostimulues dhe trajtime profesionale nga Juvéderm, Teosyal, Profhilo, Neauvia dhe më shumë. Vetëm për profesionistë të licencuar mjekësorë.",
      },
    });
    await payload.updateGlobal({
      slug: "site-settings",
      locale: "en",
      data: {
        address: "Prishtina, Kosovo",
        seoDefaultTitle: "Fillers Kosovo | Premium Aesthetic Medicine Distributor",
        seoDefaultDescription:
          "Kosovo's leading distributor of premium aesthetic medicine — dermal fillers, skin boosters, biostimulators and professional treatments from Juvederm, Teosyal, Profhilo, Neauvia and more. For licensed medical professionals only.",
      },
    });
    console.log("created site-settings global (sq + en)");
  } else {
    console.log("skip site-settings global (already set)");
  }

  console.log("Seed complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
