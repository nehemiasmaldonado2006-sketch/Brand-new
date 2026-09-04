export type ElementType = "text" | "photo" | "shape" | "logo";

export type CanvasElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  // text
  text?: string;
  size?: number;
  weight?: 400 | 500 | 600;
  font?: "serif" | "sans";
  color?: string;
  dim?: boolean;
  track?: boolean;
  // shape
  shape?: "bar" | "panel";
  // photo / logo image override (e.g. a real headshot or MLS photo URL)
  src?: string;
};

export type MarketingPage = {
  name: string;
  elements: CanvasElement[];
};

export type Palette = { name: string; bg: string; fg: string; accent: string };

export const PALETTES: Palette[] = [
  { name: "Monogram Black", bg: "#100f0e", fg: "#f6f4f0", accent: "#b98f4e" },
  { name: "Warm Gold", bg: "#1c1a17", fg: "#c9b28a", accent: "#f6f4f0" },
  { name: "Editorial Ivory", bg: "#efece6", fg: "#141311", accent: "#8c6a3f" },
  { name: "KW Red", bg: "#141311", fg: "#c8102e", accent: "#f6f4f0" },
  { name: "Coastal Navy", bg: "#101c2c", fg: "#f6f4f0", accent: "#d8b26a" },
];

export const PAGE_W = 520;
export const PAGE_H = 686;
