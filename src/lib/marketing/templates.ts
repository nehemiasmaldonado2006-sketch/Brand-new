export type DocKind = "presentation" | "cma";

export type ColorScheme = { bg: string; fg: string; accent: string };

export type TemplateCard = {
  key: string;
  kind: DocKind;
  name: string;
  tag: string;
  pages: string;
  kicker: string;
  scheme: ColorScheme;
  layout: 0 | 1 | 2 | 3 | 4 | 5;
};

const GOLD = "#b98f4e";

// Ported from the Claude Design prototype's 30 individually-designed
// covers: six structural layouts x thirty distinct color palettes, so no
// two templates in the library look alike.
const PRES_NAMES: [string, string, string][] = [
  ["Listing Presentation — Editorial", "Listing", "18 pages"],
  ["Listing Presentation — Luxury", "Listing", "22 pages"],
  ["Listing Presentation — Concise", "Listing", "10 pages"],
  ["Listing Presentation — Data First", "Listing", "16 pages"],
  ["Listing Presentation — Story", "Listing", "20 pages"],
  ["Pre-Listing Packet", "Listing", "12 pages"],
  ["Expired Listing Pitch", "Listing", "9 pages"],
  ["FSBO Conversion Deck", "Listing", "11 pages"],
  ["Buyer Presentation — Editorial", "Buyer", "16 pages"],
  ["Buyer Presentation — First Home", "Buyer", "14 pages"],
  ["Buyer Packet — Relocation", "Buyer", "20 pages"],
  ["Buyer Packet — Investor", "Buyer", "18 pages"],
  ["Buyer Consultation Deck", "Buyer", "12 pages"],
  ["Offer Strategy Packet", "Buyer", "8 pages"],
  ["Closing Day Packet", "Buyer", "10 pages"],
];

const CMA_NAMES: [string, string, string][] = [
  ["CMA — Editorial Standard", "Seller", "14 pages"],
  ["CMA — One Page Summary", "Seller", "1 page"],
  ["CMA — Luxury Estate", "Seller", "20 pages"],
  ["CMA — Condo & Townhome", "Seller", "12 pages"],
  ["CMA — Rental Comparison", "Investor", "10 pages"],
  ["CMA — Net Sheet Focus", "Seller", "8 pages"],
  ["CMA — Pricing Strategy", "Seller", "16 pages"],
  ["CMA — Neighborhood Deep Dive", "Seller", "18 pages"],
  ["CMA — Investor Return", "Investor", "15 pages"],
  ["CMA — Pre-Renovation", "Seller", "12 pages"],
  ["CMA — Buyer Offer Support", "Buyer", "9 pages"],
  ["CMA — Expired Reprice", "Seller", "11 pages"],
  ["CMA — New Construction", "Seller", "13 pages"],
  ["CMA — Land & Lot", "Seller", "10 pages"],
  ["CMA — Quick Text Version", "Seller", "2 pages"],
];

const PRES_SCHEMES: ColorScheme[] = [
  { bg: "#100f0e", fg: "#f6f4f0", accent: GOLD },
  { bg: "#f4f1ea", fg: "#1a1815", accent: "#8c6a3f" },
  { bg: "#101c2c", fg: "#eef2f7", accent: "#d8b26a" },
  { bg: "#1f2a24", fg: "#eef3ef", accent: "#a8b79a" },
  { bg: "#2b1a1a", fg: "#f6efe9", accent: "#c98b5e" },
  { bg: "#eae6df", fg: "#22201c", accent: "#3f5a4a" },
  { bg: "#161616", fg: "#ededed", accent: "#9aa0a6" },
  { bg: "#f7f4ef", fg: "#3a2f26", accent: "#b0402f" },
  { bg: "#1a1524", fg: "#efeaf5", accent: "#9b8ac4" },
  { bg: "#0f1f1e", fg: "#e8f2f0", accent: "#6fae9f" },
  { bg: "#f2ede4", fg: "#2c2418", accent: "#7d5a2e" },
  { bg: "#241c17", fg: "#f1e7db", accent: "#d1a05a" },
  { bg: "#e9eef2", fg: "#16222c", accent: "#2f5d7c" },
  { bg: "#20140f", fg: "#f3e6dc", accent: "#a9603c" },
  { bg: "#fbf9f5", fg: "#141311", accent: "#141311" },
];

const CMA_SCHEMES: ColorScheme[] = [
  { bg: "#f6f4f0", fg: "#141311", accent: GOLD },
  { bg: "#141311", fg: "#f6f4f0", accent: "#e2c68d" },
  { bg: "#eceef0", fg: "#1b2430", accent: "#4a6b8a" },
  { bg: "#1b1f1a", fg: "#eef1ea", accent: "#8fa87d" },
  { bg: "#f5efe6", fg: "#3d2b1f", accent: "#96562f" },
  { bg: "#26221d", fg: "#f4eee5", accent: "#c2a06a" },
  { bg: "#f0f0ee", fg: "#26262a", accent: "#6b6f76" },
  { bg: "#2a1e2a", fg: "#f3ecf3", accent: "#b78bb0" },
  { bg: "#e8f0ee", fg: "#12312c", accent: "#2f7d6c" },
  { bg: "#1d1a15", fg: "#f2ece0", accent: "#d8b26a" },
  { bg: "#faf7f2", fg: "#432c1c", accent: "#7a4a24" },
  { bg: "#101418", fg: "#e6edf3", accent: "#5b8fb9" },
  { bg: "#f4eeea", fg: "#2e1f1c", accent: "#8c3f36" },
  { bg: "#22252b", fg: "#e9ecf1", accent: "#a3adbb" },
  { bg: "#fdfbf7", fg: "#1a1a18", accent: "#9c8452" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCards(
  kind: DocKind,
  names: [string, string, string][],
  schemes: ColorScheme[],
  layoutOffset: number,
): TemplateCard[] {
  return names.map(([name, tag, pages], i) => ({
    key: `${kind}-${slugify(name)}`,
    kind,
    name,
    tag,
    pages,
    kicker: kind === "cma" ? `CMA · ${tag}` : `${tag} presentation`,
    scheme: schemes[i],
    layout: ((i + layoutOffset) % 6) as TemplateCard["layout"],
  }));
}

export const PRESENTATION_TEMPLATES = buildCards("presentation", PRES_NAMES, PRES_SCHEMES, 0);
export const CMA_TEMPLATES = buildCards("cma", CMA_NAMES, CMA_SCHEMES, 3);

export function getTemplate(key: string): TemplateCard | undefined {
  return [...PRESENTATION_TEMPLATES, ...CMA_TEMPLATES].find((t) => t.key === key);
}

export function pageSet(kind: DocKind): string[] {
  if (kind === "cma") {
    return [
      "Cover",
      "Subject property",
      "Active comparables",
      "Pending comparables",
      "Closed comparables · 6 mo",
      "Adjustment grid",
      "Pricing recommendation",
      "Market trends",
      "Inventory & absorption",
      "Seller net sheet",
      "About your agent",
      "Next steps",
    ];
  }
  return [
    "Cover",
    "Meet Nehemias",
    "Why Tyler Standish Group",
    "Market snapshot",
    "Pricing strategy",
    "Comparable sales",
    "Marketing plan",
    "Listing timeline",
    "Recent sales",
    "Client testimonials",
    "Net proceeds",
    "Next steps",
  ];
}
