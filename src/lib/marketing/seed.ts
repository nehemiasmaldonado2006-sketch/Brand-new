import type { CanvasElement, MarketingPage } from "@/lib/marketing/types";

let seq = 0;
function mk(el: Omit<CanvasElement, "id">): CanvasElement {
  seq += 1;
  return { ...el, id: `e${Date.now().toString(36)}${seq}` };
}

export function buildCoverPage(name: string, docName: string): MarketingPage {
  return {
    name,
    elements: [
      mk({ type: "logo", x: 34, y: 28, w: 452, h: 46 }),
      mk({ type: "shape", shape: "bar", x: 34, y: 452, w: 68, h: 3 }),
      mk({
        type: "text",
        text: docName,
        x: 34,
        y: 474,
        w: 440,
        h: 112,
        size: 40,
        weight: 600,
        font: "serif",
      }),
      mk({
        type: "text",
        text: "Subtitle",
        x: 34,
        y: 594,
        w: 440,
        h: 24,
        size: 13,
        weight: 400,
        font: "sans",
        dim: true,
      }),
      mk({
        type: "text",
        text: "NEHEMIAS MALDONADO · KW INNOVATION",
        x: 34,
        y: 632,
        w: 440,
        h: 20,
        size: 9,
        weight: 500,
        font: "sans",
        dim: true,
        track: true,
      }),
    ],
  };
}

export function buildInnerPage(name: string): MarketingPage {
  return {
    name,
    elements: [
      mk({ type: "logo", x: 30, y: 24, w: 460, h: 42 }),
      mk({
        type: "text",
        text: name.toUpperCase(),
        x: 30,
        y: 90,
        w: 420,
        h: 48,
        size: 19,
        weight: 600,
        font: "sans",
        track: true,
      }),
      mk({ type: "shape", shape: "bar", x: 30, y: 142, w: 56, h: 3 }),
      mk({ type: "photo", text: "photo frame", x: 30, y: 168, w: 460, h: 208 }),
      mk({
        type: "text",
        text: "Body copy",
        x: 30,
        y: 396,
        w: 460,
        h: 62,
        size: 12,
        weight: 400,
        font: "sans",
        dim: true,
      }),
      mk({ type: "shape", shape: "panel", x: 30, y: 470, w: 460, h: 74 }),
      mk({
        type: "text",
        text: "Callout",
        x: 44,
        y: 494,
        w: 420,
        h: 30,
        size: 12,
        weight: 500,
        font: "sans",
      }),
      mk({
        type: "text",
        text: "TYLER STANDISH GROUP · KW INNOVATION",
        x: 30,
        y: 636,
        w: 460,
        h: 20,
        size: 8.5,
        weight: 500,
        font: "sans",
        dim: true,
        track: true,
      }),
    ],
  };
}

export function seedPage(name: string, index: number, docName: string): MarketingPage {
  return index === 0 ? buildCoverPage(name, docName) : buildInnerPage(name);
}

/**
 * Builds the starting elements for a new document's pages: an editorial
 * cover (logo, name, subtitle) followed by a repeating inner-page layout
 * (logo, section title, photo frame, body copy, callout, footer).
 */
export function seedPages(pageNames: string[], docName: string): MarketingPage[] {
  return pageNames.map((name, i) => seedPage(name, i, docName));
}

export function newElementId() {
  seq += 1;
  return `e${Date.now().toString(36)}${seq}`;
}
