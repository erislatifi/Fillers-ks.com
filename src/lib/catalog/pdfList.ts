// Products from the client's supplier list (EMERTIMI.pdf, 103 rows, received 2026-11-07)
// that weren't on the site yet. The other 68 rows were already in the catalog (WordPress import).
// Added without price ("Kërko ofertë") and without photos — the client fills those in the admin.
// `pdf` is the row number in the PDF. A `slug` that matches an old hidden demo product
// (bonetta-deep, nucleofill-strong, jalupro-classic) turns that product into the real one.

import type { CategorySlug } from "../wordpress/catalogMap";

export type PdfBrand = {
  slug: string;
  name: string;
  origin: string;
  type: "injectable" | "device";
  category: CategorySlug;
  tagline: string;
  description: string;
};

export type PdfProduct = {
  pdf: number;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  size?: string;
  description: string;
};

/** Created only if the slug doesn't exist yet (bonetta, jalupro, clarius usually do). */
export const PDF_BRANDS: PdfBrand[] = [
  { slug: "bonetta", name: "Bonetta", origin: "ExoCoBio · Koreja e Jugut", type: "injectable", category: "dermal-fillers", tagline: "Filerë me acid hialuronik për linja, rrudha dhe volum.", description: "Gama Bonetta nga ExoCoBio — Fine, Deep dhe Volume — filerë me acid hialuronik për çdo thellësi trajtimi, nga linjat e imta deri te rikthimi i volumit." },
  { slug: "jalupro", name: "Jalupro", origin: "Professional Derma · Zvicër", type: "injectable", category: "skin-boosters", tagline: "Aminoacide dhe acid hialuronik për biorevitalizimin e lëkurës.", description: "Jalupro kombinon aminoacidet që nevojiten për sintezën e kolagjenit me acid hialuronik — për lëkurë më të hidratuar, më elastike dhe më të freskët." },
  { slug: "clarius", name: "Clarius", origin: "Clarius Mobile Health · Kanada", type: "device", category: "lasers-devices", tagline: "Skanerë ultratingullorë pa tela, me aplikacion në telefon.", description: "Skanerë ultratingullorë të vegjël dhe pa tela që lidhen me telefonin ose tabletin — për injektime më të sigurta dhe vlerësim të strukturave nën lëkurë." },
  { slug: "aqualyx", name: "Aqualyx", origin: "Marllor Biomedical · Itali", type: "injectable", category: "mesotherapy", tagline: "Zgjidhje injektuese për yndyrën e lokalizuar.", description: "Aqualyx është zgjidhje injektuese për trajtimin e depozitave të vogla të yndyrës së lokalizuar në trup dhe fytyrë, pa ndërhyrje kirurgjikale." },
  { slug: "elasty", name: "Elasty", origin: "Dongbang Medical · Koreja e Jugut", type: "injectable", category: "dermal-fillers", tagline: "Filerë me acid hialuronik nga Dongbang Medical.", description: "Elasty — filerë me acid hialuronik për korrigjimin e rrudhave dhe rikthimin e volumit, me rezultat natyral." },
  { slug: "biorepeel", name: "BioRePeel", origin: "Cmed · Itali", type: "injectable", category: "aftercare", tagline: "Pilling bifazik me TCA për biorevitalizim pa gjilpërë.", description: "BioRePeel është pilling bifazik me TCA që stimulon rigjenerimin e lëkurës pa zhvoshkje të dukshme — për shkëlqim, teksturë dhe pore më të vogla." },
  { slug: "luminous-technology", name: "Luminous Technology", origin: "Luminous Technology", type: "device", category: "lasers-devices", tagline: "Pajisje për trajtime të fytyrës dhe përgatitje PRP.", description: "Pajisje profesionale për klinika estetike — platforma për trajtime të fytyrës dhe centrifuga për përgatitjen e PRP." },
  { slug: "d-med", name: "D-MED", origin: "D-MED", type: "device", category: "lasers-devices", tagline: "Tuba për përgatitjen e PRP.", description: "Tuba të sterilizuara për marrjen dhe ndarjen e plazmës së pasur me trombocite (PRP) në klinikë." },
];

const POTENZA_TIP = (code: string, pins: number) =>
  `Kokë (cartridge) njëpërdorimshe ${code} me ${pins} mikrogjilpëra për pajisjen Jeisys Potenza (mikrogjilpëra me radiofrekuencë). Përdoret për rinovimin e lëkurës, poret, shenjat e akneve dhe shtrëngimin e lëkurës. Zgjedhja e kokës varet nga zona dhe thellësia e trajtimit.`;

export const PDF_PRODUCTS: PdfProduct[] = [
  // ── Filerë dermik
  { pdf: 4, slug: "bonetta-fine", name: "Bonetta Fine 2 × 1.1ml", brand: "bonetta", category: "dermal-fillers", size: "2 × 1.1ml", description: "Filer me acid hialuronik për linjat e imta dhe rrudhat sipërfaqësore — p.sh. rreth syve, ballit dhe buzëve. Paketim me 2 shiringa nga 1.1ml." },
  { pdf: 5, slug: "bonetta-deep", name: "Bonetta Deep 2 × 1.1ml", brand: "bonetta", category: "dermal-fillers", size: "2 × 1.1ml", description: "Filer me acid hialuronik për rrudhat e mesme deri të thella, si palat nazolabiale dhe linjat e marionetës. Paketim me 2 shiringa nga 1.1ml." },
  { pdf: 6, slug: "bonetta-volume", name: "Bonetta Volume 2 × 1.1ml", brand: "bonetta", category: "dermal-fillers", size: "2 × 1.1ml", description: "Filer me acid hialuronik me densitet të lartë për rikthimin e volumit dhe konturimin — mollëzat, mjekra dhe linja e nofullës. Paketim me 2 shiringa nga 1.1ml." },
  { pdf: 37, slug: "teosyal-rha-kiss-lidocaine", name: "Teosyal RHA Kiss Lidocaine 2 × 0.7ml", brand: "teosyal", category: "dermal-fillers", size: "2 × 0.7ml", description: "Filer RHA® nga Teoxane i krijuar për buzët — përcakton konturin dhe shton volum të lehtë duke ruajtur lëvizjen natyrale. Me lidokainë për më shumë rehati. Paketim me 2 shiringa nga 0.7ml." },
  { pdf: 74, slug: "teosyal-puresense-redensity-2", name: "Teosyal PureSense Redensity 2 1ml", brand: "teosyal", category: "dermal-fillers", size: "1ml", description: "Filer me acid hialuronik nga Teoxane, i krijuar posaçërisht për zonën nën sy (gropat e lotëve) — zbut hijet dhe pamjen e lodhur. Me lidokainë (PureSense)." },
  { pdf: 88, slug: "elasty-g-plus", name: "Elasty G Plus", brand: "elasty", category: "dermal-fillers", description: "Filer me acid hialuronik me lidokainë nga Dongbang Medical, për rrudhat e thella dhe rikthimin e volumit në fytyrë." },

  // ── Përforcues lëkure (skin boosters)
  { pdf: 20, slug: "lumi-pro-skin-booster-3x2ml", name: "LUMI-PRO Skin Booster 40mg HA/2ml (3 × 2ml)", brand: "lumi-pro", category: "skin-boosters", size: "3 × 2ml", description: "Skin booster me acid hialuronik (40mg/2ml) për hidratim të thellë, shkëlqim dhe elasticitet të lëkurës. Paketim me 3 shiringa nga 2ml." },
  { pdf: 31, slug: "lumi-eyes-1ml", name: "Lumi Eyes 1ml", brand: "lumi-pro", category: "skin-boosters", size: "1ml", description: "Booster për zonën delikate të syve nga BNC — përmirëson cilësinë e lëkurës nën sy, linjat e imta dhe pamjen e lodhur." },
  { pdf: 72, slug: "jalupro-super-hydro", name: "Jalupro Super Hydro 2.5ml", brand: "jalupro", category: "skin-boosters", size: "2.5ml", description: "Acid hialuronik me aminoacide dhe peptide për lëkurën e dehidratuar dhe të lodhur — rikthen hidratimin, elasticitetin dhe trashësinë e lëkurës në fytyrë, qafë dhe dekolte." },
  { pdf: 73, slug: "jalupro-young-eye", name: "Jalupro Young Eye 1ml", brand: "jalupro", category: "skin-boosters", size: "1ml", description: "Trajtim me aminoacide dhe acid hialuronik për zonën rreth syve — zbut linjat e imta, rrathët e errët dhe pamjen e lodhur." },
  { pdf: 80, slug: "jalupro-hmw-15ml", name: "Jalupro HMW 15ml", brand: "jalupro", category: "skin-boosters", size: "15ml", description: "Acid hialuronik me peshë të lartë molekulare (HMW) me aminoacide për biorevitalizim, hidratim dhe elasticitet të lëkurës." },
  { pdf: 103, slug: "jalupro-classic", name: "Jalupro 3ml (2 flakon)", brand: "jalupro", category: "skin-boosters", size: "2 flakon · 3ml", description: "Jalupro Classic — aminoacide dhe acid hialuronik për biorevitalizimin e lëkurës: nxit prodhimin e kolagjenit dhe përmirëson elasticitetin. Paketim me 2 flakonë." },
  { pdf: 76, slug: "restylane-vital-light-sb-lidocaine", name: "Restylane Vital Light SB Lidocaine 1ml", brand: "restylane", category: "skin-boosters", size: "1ml", description: "Skin booster Restylane me teknologji NASHA për zonat me lëkurë të hollë — qafa, dekolteja dhe duart. Përmirëson hidratimin dhe cilësinë e lëkurës. Me lidokainë." },
  { pdf: 79, slug: "rrs-hyalift-75-proactive-5ml-6", name: "RRS Hyalift 75 Proactive 5ml (6 flakona)", brand: "rrs", category: "skin-boosters", size: "6 × 5ml", description: "Acid hialuronik për mezoterapi dhe hidratim të thellë të lëkurës, për fytyrë, qafë dhe dekolte. Paketim me 6 flakonë nga 5ml." },

  // ── Biostimulues
  { pdf: 57, slug: "nucleofill-strong", name: "Nucleofill Strong 1.5ml", brand: "nucleofill", category: "biostimulators", size: "1.5ml", description: "Polinukleotide (PN) me koncentrim të lartë për biorevitalizimin e lëkurës së lodhur dhe me humbje elasticiteti — nxit rigjenerimin dhe cilësinë e lëkurës." },

  // ── Mezoterapi
  { pdf: 7, slug: "aqualyx-10x8ml", name: "Aqualyx 10 × 8ml", brand: "aqualyx", category: "mesotherapy", size: "10 × 8ml", description: "Zgjidhje injektuese për trajtimin e depozitave të vogla të yndyrës së lokalizuar (p.sh. bark, ijë, krahë), pa kirurgji. Paketim me 10 flakonë nga 8ml." },
  { pdf: 101, slug: "aqualyx-face-kit", name: "Aqualyx Face Kit", brand: "aqualyx", category: "mesotherapy", description: "Set Aqualyx për fytyrën — për depozitat e vogla të yndyrës, si mjekra e dyfishtë dhe linja e nofullës." },

  // ── Kujdesi pas trajtimit / pillingje
  { pdf: 23, slug: "wiqo-prx-t33-4ml", name: "WiQo PRX-T33 4ml", brand: "wiqo", category: "aftercare", size: "4ml", description: "Biorevitalizues pa gjilpërë me TCA 33%, peroksid hidrogjeni dhe acid kojik — stimulon rigjenerimin e lëkurës pa zhvoshkje të dukshme. Për shkëlqim, teksturë, shenja akneje dhe strie." },
  { pdf: 102, slug: "biorepeel-cl3-fnd-6ml", name: "BioRePeel Cl3 FND 6ml", brand: "biorepeel", category: "aftercare", size: "6ml", description: "Pilling bifazik me TCA për fytyrë dhe qafë — biorevitalizim pa gjilpërë, me shkëlqim dhe teksturë më të mirë të lëkurës, pa kohë të gjatë rikuperimi." },
  { pdf: 56, slug: "clinisept-skin-pump-490ml", name: "Clinisept+ Skin me pompë 490ml", brand: "clinisept", category: "aftercare", size: "490ml", description: "Clinisept+ Skin në shishe me pompë — solucion pa alkool për pastrimin e lëkurës para procedurave dhe kujdesin pas tyre, i butë edhe për lëkurën e ndjeshme." },

  // ── Kanula dhe gjilpëra
  { pdf: 98, slug: "jbp-nano-cannula-21g-50mm", name: "JBP Nano Cannula 21G × 50mm", brand: "jbp", category: "cannulas", size: "21G × 50mm", description: "Kanulë JBP Nano me majë të rrumbullakët, 21G × 50mm — për injektime më të sigurta me më pak trauma dhe mavijosje." },
  { pdf: 100, slug: "jbp-nanoneedle-30g-4mm", name: "JBP Nanoneedle 30G × 4mm", brand: "jbp", category: "needles", size: "30G × 4mm", description: "Gjilpërë ultra e hollë JBP Nanoneedle 30G × 4mm për injektime sipërfaqësore dhe mezoterapi, me më pak dhimbje." },

  // ── Pajisje dhe aksesorë
  { pdf: 82, slug: "jeisys-potenza-demo", name: "Jeisys Potenza (DEMO)", brand: "jeisys", category: "lasers-devices", description: "Njësi demo e pajisjes Jeisys Potenza — mikrogjilpëra me radiofrekuencë për rinovimin e lëkurës. Na kontaktoni për gjendjen dhe ofertën." },
  { pdf: 83, slug: "jeisys-edge-one-demo", name: "Jeisys Edge ONE (DEMO)", brand: "jeisys", category: "lasers-devices", description: "Njësi demo e lazerit Jeisys Edge ONE CO₂ për rinovimin e lëkurës. Na kontaktoni për gjendjen dhe ofertën." },
  { pdf: 84, slug: "jeisys-potenza-tip-s-25", name: "Kokë për Potenza S-25", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("S-25", 25) },
  { pdf: 85, slug: "jeisys-potenza-tip-i-25", name: "Kokë për Potenza I-25", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("I-25", 25) },
  { pdf: 89, slug: "jeisys-potenza-tip-i-49", name: "Kokë për Potenza I-49", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("I-49", 49) },
  { pdf: 90, slug: "jeisys-potenza-tip-s-49", name: "Kokë për Potenza S-49", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("S-49", 49) },
  { pdf: 91, slug: "jeisys-potenza-tip-cp-21", name: "Kokë për Potenza CP-21", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("CP-21", 21) },
  { pdf: 92, slug: "jeisys-potenza-tip-cp-25", name: "Kokë për Potenza CP-25", brand: "jeisys", category: "lasers-devices", description: POTENZA_TIP("CP-25", 25) },
  { pdf: 93, slug: "clarius-l15-hd3", name: "Clarius L15 HD3 Wireless Scanner", brand: "clarius", category: "lasers-devices", description: "Skaner ultratingullor linear pa tela me frekuencë të lartë, që lidhet me telefon ose tablet. Për pamje të qarta të strukturave sipërfaqësore — enët e gjakut, filerët dhe injektimet e drejtuara me ultratingull." },
  { pdf: 94, slug: "clarius-l20-hd3", name: "Clarius L20 HD3 Wireless Scanner", brand: "clarius", category: "lasers-devices", description: "Skaner ultratingullor linear pa tela me frekuencë shumë të lartë, për strukturat më sipërfaqësore të lëkurës — ideal për mjekësinë estetike dhe dermatologjinë. Lidhet me telefon ose tablet." },
  { pdf: 95, slug: "hydrafacial-14-in-1", name: "Hydrafacial 14 në 1", brand: "luminous-technology", category: "lasers-devices", description: "Platformë shumëfunksionale për trajtime të fytyrës me 14 doreza/funksione — pastrim i thellë, hidrodermabrazion, hidratim dhe kujdes i lëkurës në një pajisje." },
  { pdf: 96, slug: "centrifuga-prp", name: "Centrifugë për PRP", brand: "luminous-technology", category: "lasers-devices", description: "Centrifugë për klinika estetike për përgatitjen e plazmës së pasur me trombocite (PRP) — për trajtime të lëkurës dhe të flokëve." },
  { pdf: 81, slug: "d-med-prp-tubes", name: "PRP Tubes", brand: "d-med", category: "lasers-devices", description: "Tuba të sterilizuara për marrjen e gjakut dhe ndarjen e PRP-së me centrifugë — për trajtime të lëkurës dhe të flokëve." },
];
