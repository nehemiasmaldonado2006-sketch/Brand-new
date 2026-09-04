import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export async function nodeToPngDataUrl(node: HTMLElement) {
  return toPng(node, { pixelRatio: 2, cacheBust: true });
}

export async function exportNodeAsPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await nodeToPngDataUrl(node);
  const res = await fetch(dataUrl);
  return res.blob();
}

export type CapturedPage = { dataUrl: string; w: number; h: number };

/**
 * Captures one page node right now (dataUrl + its pixel size) — call this
 * once per page, immediately after that page has rendered, since the same
 * off-screen node is reused for every page in sequence.
 */
export async function capturePage(node: HTMLElement): Promise<CapturedPage> {
  const dataUrl = await nodeToPngDataUrl(node);
  return { dataUrl, w: node.offsetWidth, h: node.offsetHeight };
}

/**
 * Builds one multi-page PDF from already-captured pages, sized to each
 * page's own pixel dimensions so nothing gets cropped or rescaled.
 */
export function buildPdfFromCaptures(captures: CapturedPage[]): Blob {
  let pdf: jsPDF | null = null;
  for (const { dataUrl, w, h } of captures) {
    if (!pdf) {
      pdf = new jsPDF({ orientation: w > h ? "l" : "p", unit: "px", format: [w, h] });
    } else {
      pdf.addPage([w, h], w > h ? "l" : "p");
    }
    pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
  }
  if (!pdf) throw new Error("Nothing to export");
  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
