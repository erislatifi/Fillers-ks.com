// How each product of the old WordPress shop (fillers-ks.com) maps onto this catalog.
// WordPress had almost no usable categories (most were "Uncategorized"/"Home") and some
// wrong brands, so every product was classified by hand from its brand and what it is
// (researched 2026-11-07). Used by the admin importer (Administrimi → Importo nga WordPress).
//
// `slug` reuses an existing demo product where one stood in for the same item, so it is
// updated in place instead of duplicated.

export type CategorySlug =
  | "dermal-fillers"
  | "skin-boosters"
  | "biostimulators"
  | "mesotherapy"
  | "cannulas"
  | "needles"
  | "aftercare"
  | "lasers-devices"
  | "hair-treatments";

export type MappedProduct = { slug: string; name: string; brand: string; category: CategorySlug };

/** Brands that didn't exist in the catalog yet. Albanian texts; English falls back to them. */
export const NEW_BRANDS: {
  slug: string;
  name: string;
  origin: string;
  type: "injectable" | "device";
  category: CategorySlug;
  tagline: string;
  description: string;
}[] = [
  { slug: "restylane", name: "Restylane", origin: "Galderma · Suedi", type: "injectable", category: "dermal-fillers", tagline: "Filerë me acid hialuronik me teknologjinë NASHA dhe OBT.", description: "Një nga gamat më të studiuara të filerëve në botë, nga Galderma — për buzë, faqe, mjekër dhe hidratim të lëkurës (Skinboosters)." },
  { slug: "rejuran", name: "Rejuran", origin: "PharmaResearch · Koreja e Jugut", type: "injectable", category: "skin-boosters", tagline: "Polinukleotide (PN) për rigjenerimin e lëkurës.", description: "Rejuran Healer, Rejuran S dhe Rejuran I — trajtime me polinukleotide që riparojnë barrierën e lëkurës, cilësinë e saj, poret, shenjat e akneve dhe zonën e syve." },
  { slug: "sculptra", name: "Sculptra", origin: "Galderma · SHBA", type: "injectable", category: "biostimulators", tagline: "Acid poli-L-laktik për stimulim afatgjatë të kolagjenit.", description: "Biostimulues që rikthen gradualisht volumin dhe strukturën e fytyrës duke nxitur prodhimin natyral të kolagjenit; rezultate që zgjasin deri në 2 vjet." },
  { slug: "jbp", name: "JBP", origin: "Japan Bio Products · Japoni", type: "injectable", category: "cannulas", tagline: "Kanula dhe gjilpëra Nano me precizion japonez.", description: "Kanula me majë të rrumbullakët dhe gjilpëra ultra të holla JBP Nano për injektime më të sigurta, më pak trauma dhe më pak mavijosje." },
  { slug: "bd", name: "BD", origin: "Becton Dickinson · SHBA", type: "injectable", category: "needles", tagline: "Shiringa dhe gjilpëra mjekësore BD Micro-Fine.", description: "Shiringa me gjilpërë të integruar për injektime të sakta me doza të vogla." },
  { slug: "clinisept", name: "Clinisept+", origin: "Clinical Health Technologies · Mbretëria e Bashkuar", type: "injectable", category: "aftercare", tagline: "Pastrim dhe qetësim i lëkurës para dhe pas trajtimit.", description: "Clinisept+ Skin dhe Clinisoothe+ — solucione pa alkool për përgatitjen e lëkurës para procedurave dhe kujdesin pas tyre, të buta edhe për lëkurën e ndjeshme." },
  { slug: "fillmed", name: "Fillmed", origin: "Laboratoires Fillmed · Francë", type: "injectable", category: "mesotherapy", tagline: "NCTF 135HA — koktej polirevitalizues për lëkurën.", description: "Kompleks me mbi 50 përbërës (vitamina, aminoacide, minerale, koenzima) dhe acid hialuronik për shkëlqim, hidratim dhe cilësi të lëkurës." },
  { slug: "aquashine", name: "Aquashine", origin: "Caregen · Koreja e Jugut", type: "injectable", category: "skin-boosters", tagline: "Skin booster me acid hialuronik dhe peptide.", description: "Aquashine PTx kombinon acid hialuronik me peptide biomimetike për hidratim, ndriçim dhe zbutje të linjave të imta." },
  { slug: "seventy-hyal", name: "Seventy Hyal", origin: "Koreja e Jugut", type: "injectable", category: "skin-boosters", tagline: "Acid hialuronik me peshë të lartë molekulare për hidratim të thellë.", description: "Seventy Hyal 2000 — skin booster për rihidratim të thellë, elasticitet dhe përmirësim të teksturës së lëkurës." },
  { slug: "rrs", name: "RRS", origin: "Skin Tech Pharma Group · Spanjë", type: "injectable", category: "skin-boosters", tagline: "Skin boosters me acid hialuronik dhe antioksidantë.", description: "RRS HA Long Lasting, RRS HA Eyes dhe RRS Hyalift — acid hialuronik jo i ndërlidhur me antioksidantë dhe aminoacide, për fytyrë, sy, qafë dhe dekolte." },
  { slug: "celmade", name: "Celmade", origin: "Koreja e Jugut", type: "injectable", category: "dermal-fillers", tagline: "1 Time Filler — filerë me acid hialuronik L, XL dhe XXL.", description: "Gamë filerësh me acid hialuronik me densitete të ndryshme, për linja të imta deri te volumizim i thellë." },
  { slug: "wiqo", name: "WiQo", origin: "WiQo · Itali", type: "injectable", category: "aftercare", tagline: "Kujdes profesional i lëkurës, krijuesit e PRX-T33.", description: "P-Solution — solucion pastrues me pH të balancuar për përgatitjen e lëkurës para trajtimeve biorevitalizuese." },
  { slug: "ejal40", name: "Ejal40", origin: "Medixa · Itali", type: "injectable", category: "skin-boosters", tagline: "Gel biorevitalizues me acid hialuronik jo të ndërlidhur.", description: "Ejal40 (40 mg/2 ml) për hidratim, elasticitet dhe shkëlqim të lëkurës me teknikën 4 pikëshe, plus maska qetësuese pas trajtimit." },
  { slug: "alidya", name: "Alidya", origin: "Marllor Biomedical · Itali", type: "injectable", category: "mesotherapy", tagline: "Trajtimi i parë injektabël kundër celulitit.", description: "Pajisje mjekësore e klasës III, CE, që trajton celulitin duke vepruar mbi indin lidhor dhe retencionin e lëngjeve." },
  { slug: "lumi-pro", name: "LUMI-PRO", origin: "LUMI-PRO / Lumifil · Mbretëria e Bashkuar", type: "injectable", category: "skin-boosters", tagline: "Skin boosters me polinukleotide dhe acid hialuronik.", description: "LUMI-PRO Eyes, Lips dhe Skin Booster — për zonën e syve, buzët dhe rigjenerimin e lëkurës." },
];

/** Every WordPress product (by its WordPress id) → slug, clean name, brand and category. */
export const PRODUCT_MAP: Record<number, MappedProduct> = {
  // Jeisys devices (price on request)
  2695: { slug: "jeisys-tri-beam-premium", name: "Jeisys TRI-BEAM Premium", brand: "jeisys", category: "lasers-devices" },
  2691: { slug: "jeisys-edge-one-co2", name: "Jeisys Edge ONE CO₂", brand: "jeisys", category: "lasers-devices" },
  2687: { slug: "jeisys-cellec-v", name: "Jeisys CELLEC V (IPL)", brand: "jeisys", category: "lasers-devices" },
  2683: { slug: "jeisys-linearz-hifu", name: "Jeisys LinearZ HIFU", brand: "jeisys", category: "lasers-devices" },
  2679: { slug: "jeisys-density", name: "Jeisys Density High-Power", brand: "jeisys", category: "lasers-devices" },
  2674: { slug: "jeisys-lipocel-hifu", name: "Jeisys LIPOCEL HIFU", brand: "jeisys", category: "lasers-devices" },
  2669: { slug: "jeisys-potenza", name: "Jeisys Potenza", brand: "jeisys", category: "lasers-devices" },

  // Sunekos
  3022: { slug: "sunekos-cell-15ml", name: "Sunekos Cell 15ml", brand: "sunekos", category: "mesotherapy" },
  3020: { slug: "sunekos-body-10ml", name: "Sunekos Body 10ml", brand: "sunekos", category: "biostimulators" },
  2235: { slug: "sunekos-1200", name: "Sunekos 1200 (2 × 1.5ml)", brand: "sunekos", category: "biostimulators" },
  2231: { slug: "sunekos-performa", name: "Sunekos Performa (2 × 3.5ml)", brand: "sunekos", category: "biostimulators" },

  // Restylane
  2241: { slug: "restylane-vital-sb-lidocaine-1ml", name: "Restylane Vital SB Lidocaine 1ml", brand: "restylane", category: "skin-boosters" },
  1445: { slug: "restylane-defyne", name: "Restylane Defyne 1ml", brand: "restylane", category: "dermal-fillers" },
  1450: { slug: "restylane-lyft", name: "Restylane Lyft 1ml", brand: "restylane", category: "dermal-fillers" },
  1447: { slug: "restylane-kysse", name: "Restylane Kysse 1ml", brand: "restylane", category: "dermal-fillers" },

  // Profhilo
  2239: { slug: "profhilo-structura-2ml", name: "Profhilo Structura 2ml", brand: "profhilo", category: "skin-boosters" },
  1228: { slug: "profhilo-h", name: "Profhilo H+L 2ml", brand: "profhilo", category: "skin-boosters" },

  // Celmade
  2184: { slug: "celmade-1-time-filler-xxl", name: "Celmade 1 Time Filler XXL 1ml", brand: "celmade", category: "dermal-fillers" },
  1234: { slug: "celmade-1-time-filler-xl", name: "Celmade 1 Time Filler XL 1ml", brand: "celmade", category: "dermal-fillers" },
  1232: { slug: "celmade-1-time-filler-l", name: "Celmade 1 Time Filler L 1ml", brand: "celmade", category: "dermal-fillers" },

  // Needles & cannulas
  1904: { slug: "bd-micro-fine-1ml-29g", name: "BD Micro-Fine+ 1ml 29G", brand: "bd", category: "needles" },
  1902: { slug: "jbp-nano-cannula-25g-50mm", name: "JBP Nano Cannula 25G × 50mm", brand: "jbp", category: "cannulas" },
  1900: { slug: "jbp-nano-cannula-23g-50mm", name: "JBP Nano Cannula 23G × 50mm", brand: "jbp", category: "cannulas" },
  1897: { slug: "jbp-nano-cannula-22g-50mm", name: "JBP Nano Cannula 22G × 50mm", brand: "jbp", category: "cannulas" },
  1884: { slug: "jbp-nano-cannula-27g-40mm", name: "JBP Nano Cannula 27G × 40mm", brand: "jbp", category: "cannulas" },
  1429: { slug: "jbp-nanoneedle-30g-13mm", name: "JBP Nanoneedle 30G × 13mm", brand: "jbp", category: "needles" },
  1427: { slug: "jbp-nanoneedle-30g-8mm", name: "JBP Nanoneedle 30G × 8mm", brand: "jbp", category: "needles" },
  1424: { slug: "jbp-nanoneedle-27g-13mm", name: "JBP Nanoneedle 27G × 13mm", brand: "jbp", category: "needles" },
  1305: { slug: "jbp-nanoneedle-33g-4mm", name: "JBP Nanoneedle 33G × 4mm (Mezoterapi)", brand: "jbp", category: "needles" },

  // Teosyal
  1895: { slug: "teosyal-rha-1-lidocaine", name: "Teosyal RHA 1 Lidocaine 2 × 1ml", brand: "teosyal", category: "dermal-fillers" },
  1295: { slug: "teosyal-rha4", name: "Teosyal RHA 4 1.2ml", brand: "teosyal", category: "dermal-fillers" },
  477: { slug: "teosyal-puresense-kiss", name: "Teosyal PureSense Kiss 1ml", brand: "teosyal", category: "dermal-fillers" },
  475: { slug: "teosyal-rha-3", name: "Teosyal RHA 3 1ml", brand: "teosyal", category: "dermal-fillers" },
  473: { slug: "teosyal-rha-2", name: "Teosyal RHA 2 1ml", brand: "teosyal", category: "dermal-fillers" },

  // Neauvia
  1893: { slug: "neauvia-intense-rheology", name: "Neauvia Intense Rheology 1ml", brand: "neauvia", category: "dermal-fillers" },
  1875: { slug: "neauvia-intense-flux", name: "Neauvia Intense Flux 1ml", brand: "neauvia", category: "dermal-fillers" },
  1168: { slug: "neauvia-intense-lips", name: "Neauvia Intense Lips 1ml", brand: "neauvia", category: "dermal-fillers" },
  513: { slug: "neauvia-intense-sxt", name: "Neauvia Intense SXT 1ml", brand: "neauvia", category: "dermal-fillers" },
  502: { slug: "neauvia-organic-intense-lv", name: "Neauvia Organic Intense LV 1ml", brand: "neauvia", category: "dermal-fillers" },
  1718: { slug: "neauvia-stimulate-man", name: "Neauvia Stimulate Man 1ml", brand: "neauvia", category: "biostimulators" },
  506: { slug: "neauvia-organic-stimulate", name: "Neauvia Organic Stimulate 1ml", brand: "neauvia", category: "biostimulators" },
  510: { slug: "neauvia-organic-hydro-deluxe", name: "Neauvia Organic Hydro Deluxe 2 × 2.5ml", brand: "neauvia", category: "skin-boosters" },

  // Aftercare
  1891: { slug: "wiqo-p-solution-300ml", name: "WiQo P-Solution 300ml", brand: "wiqo", category: "aftercare" },
  1889: { slug: "clinisept-skin-100ml", name: "Clinisept+ Skin 100ml", brand: "clinisept", category: "aftercare" },
  1885: { slug: "clinisept-skin-490ml", name: "Clinisept+ Skin 490ml", brand: "clinisept", category: "aftercare" },
  1881: { slug: "clinisoothe-skin-purifier-100ml", name: "Clinisoothe+ Skin Purifier 100ml", brand: "clinisept", category: "aftercare" },
  1878: { slug: "clinisoothe-skin-purifier-250ml", name: "Clinisoothe+ Skin Purifier 250ml", brand: "clinisept", category: "aftercare" },
  1430: { slug: "ejal-mask", name: "Ejal Mask", brand: "ejal40", category: "aftercare" },

  // Skin boosters / mesotherapy
  1820: { slug: "aquashine-ptx-2ml", name: "Aquashine PTx 2ml", brand: "aquashine", category: "skin-boosters" },
  1817: { slug: "fillmed-nctf-135ha-3ml", name: "Fillmed NCTF 135HA 3ml", brand: "fillmed", category: "mesotherapy" },
  1715: { slug: "rrs-hyalift-75-proactive-3ml", name: "RRS Hyalift 75 Proactive 3ml", brand: "rrs", category: "skin-boosters" },
  1303: { slug: "rrs-ha-eyes-1-5ml", name: "RRS HA Eyes 1.5ml", brand: "rrs", category: "skin-boosters" },
  1301: { slug: "rrs-ha-long-lasting-3ml", name: "RRS HA Long Lasting 3ml", brand: "rrs", category: "skin-boosters" },
  1437: { slug: "rejuran-s-1ml", name: "Rejuran S 1ml", brand: "rejuran", category: "skin-boosters" },
  1435: { slug: "rejuran-i-1ml", name: "Rejuran I 1ml", brand: "rejuran", category: "skin-boosters" },
  1433: { slug: "rejuran-healer-2ml", name: "Rejuran Healer 2ml", brand: "rejuran", category: "skin-boosters" },
  1284: { slug: "ejal-40-2ml", name: "Ejal40 Bio-Revitalising Gel 2ml", brand: "ejal40", category: "skin-boosters" },
  1283: { slug: "seventy-hyal-2000-2ml", name: "Seventy Hyal 2000 2ml", brand: "seventy-hyal", category: "skin-boosters" },
  1140: { slug: "lumi-pro-lips-booster-1-1ml", name: "LUMI-PRO Lips Booster 1.1ml", brand: "lumi-pro", category: "skin-boosters" },
  1022: { slug: "lumi-pro-eyes-pn-1ml", name: "LUMI-PRO Eyes PN Eye Booster 1ml", brand: "lumi-pro", category: "skin-boosters" },
  980: { slug: "lumi-fill-2", name: "LUMI-PRO Skin Booster 2ml", brand: "lumi-pro", category: "skin-boosters" },
  702: { slug: "alidya-5x10ml", name: "Alidya 5 × 10ml + 340mg", brand: "alidya", category: "mesotherapy" },

  // Biostimulators
  1279: { slug: "harmonyca-product", name: "HArmonyCa 1.25ml", brand: "harmonyca", category: "biostimulators" },
  1442: { slug: "nucleofill-soft-plus", name: "Nucleofill Soft Plus", brand: "nucleofill", category: "biostimulators" },
  494: { slug: "nucleofill-25-1-5ml", name: "Nucleofill 25 1.5ml", brand: "nucleofill", category: "biostimulators" },
  500: { slug: "radiesse-plus", name: "Radiesse+ 1.5ml (me gjilpërë)", brand: "radiesse", category: "biostimulators" },
  498: { slug: "sculptra-2x5ml", name: "Sculptra 2 × 5ml", brand: "sculptra", category: "biostimulators" },

  // Juvéderm
  1722: { slug: "juvederm-voluma", name: "Juvéderm Voluma Lidocaine 1ml", brand: "juvederm", category: "dermal-fillers" },
  692: { slug: "juvederm-volift-1ml", name: "Juvéderm Volift 1ml", brand: "juvederm", category: "dermal-fillers" },
  471: { slug: "juvederm-ultra-3", name: "Juvéderm Ultra 3 1ml", brand: "juvederm", category: "dermal-fillers" },
  469: { slug: "juvederm-ultra-smile", name: "Juvéderm Ultra Smile 0.55ml", brand: "juvederm", category: "dermal-fillers" },
  467: { slug: "juvederm-ultra-4", name: "Juvéderm Ultra 4 1ml", brand: "juvederm", category: "dermal-fillers" },

  // Lumi Fill
  1138: { slug: "lumifil-max-1ml", name: "Lumifil Max 1ml", brand: "lumi-fill", category: "dermal-fillers" },
  1001: { slug: "lumifil-lite-1ml", name: "Lumifil Lite 1ml", brand: "lumi-fill", category: "dermal-fillers" },
  997: { slug: "lumifil-kiss-1ml", name: "Lumifil Kiss 1ml", brand: "lumi-fill", category: "dermal-fillers" },

  // Revolax
  485: { slug: "revolax-sub-q", name: "Revolax Sub-Q 1.1ml", brand: "revolax", category: "dermal-fillers" },
  483: { slug: "revolax-fine", name: "Revolax Fine 1.1ml", brand: "revolax", category: "dermal-fillers" },
  480: { slug: "revolax-deep", name: "Revolax Deep 1.1ml", brand: "revolax", category: "dermal-fillers" },
};
