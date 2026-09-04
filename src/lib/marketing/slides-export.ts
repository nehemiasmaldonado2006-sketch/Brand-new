import { slidesClientFor, docsClientFor } from "@/lib/google";
import type { MarketingPage } from "@/lib/marketing/types";

type ExportResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Creates a real Google Slides deck: one slide per document page, with
 * the page name as the title and its text elements as body copy. This is
 * a content export (text only, not a pixel-perfect copy of the canvas
 * layout) meant as an editable, shareable alternative to the in-app
 * editor — not a replacement for it.
 */
export async function exportDocToSlides(userId: string, docName: string, pages: MarketingPage[]): Promise<ExportResult> {
  const slides = await slidesClientFor(userId);
  if (!slides) return { ok: false, error: "Not connected to Google" };

  const created = await slides.presentations.create({ requestBody: { title: docName } });
  const presentationId = created.data.presentationId;
  if (!presentationId) return { ok: false, error: "Could not create presentation" };
  const defaultSlideId = created.data.slides?.[0]?.objectId;

  const createRequests = pages.map((_, i) => ({
    createSlide: {
      objectId: `slide_${i}`,
      insertionIndex: i,
      slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" as const },
    },
  }));
  if (defaultSlideId) createRequests.push({ deleteObject: { objectId: defaultSlideId } } as never);

  await slides.presentations.batchUpdate({ presentationId, requestBody: { requests: createRequests } });

  const pres = await slides.presentations.get({ presentationId });
  const textRequests: object[] = [];
  (pres.data.slides ?? []).forEach((slide, i) => {
    const page = pages[i];
    if (!page) return;
    const titleShape = slide.pageElements?.find(
      (el) => el.shape?.placeholder?.type === "TITLE" || el.shape?.placeholder?.type === "CENTERED_TITLE",
    );
    const bodyShape = slide.pageElements?.find((el) => el.shape?.placeholder?.type === "BODY");
    const bodyText = page.elements
      .filter((e) => e.type === "text" && e.text)
      .map((e) => e.text)
      .join("\n");
    if (titleShape?.objectId) {
      textRequests.push({ insertText: { objectId: titleShape.objectId, text: page.name } });
    }
    if (bodyShape?.objectId && bodyText) {
      textRequests.push({ insertText: { objectId: bodyShape.objectId, text: bodyText } });
    }
  });
  if (textRequests.length) {
    await slides.presentations.batchUpdate({ presentationId, requestBody: { requests: textRequests } });
  }

  return { ok: true, url: `https://docs.google.com/presentation/d/${presentationId}/edit` };
}

/**
 * Creates a real Google Doc containing each page's name as a heading
 * followed by its text elements as body copy — a content export for
 * CMA docs, alongside (not instead of) the in-app editor.
 */
export async function exportDocToDocs(userId: string, docName: string, pages: MarketingPage[]): Promise<ExportResult> {
  const docs = await docsClientFor(userId);
  if (!docs) return { ok: false, error: "Not connected to Google" };

  const created = await docs.documents.create({ requestBody: { title: docName } });
  const documentId = created.data.documentId;
  if (!documentId) return { ok: false, error: "Could not create document" };

  const headingRanges: { start: number; end: number }[] = [];
  let index = 1;
  let fullText = "";
  for (const page of pages) {
    const heading = page.name.toUpperCase();
    const body = page.elements
      .filter((e) => e.type === "text" && e.text)
      .map((e) => e.text)
      .join("\n");
    const block = `${heading}\n${body ? body + "\n" : ""}\n`;
    headingRanges.push({ start: index, end: index + heading.length });
    fullText += block;
    index += block.length;
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        { insertText: { location: { index: 1 }, text: fullText } },
        ...headingRanges.map((r) => ({
          updateTextStyle: {
            range: { startIndex: r.start, endIndex: r.end },
            textStyle: { bold: true, fontSize: { magnitude: 13, unit: "PT" } },
            fields: "bold,fontSize",
          },
        })),
      ],
    },
  });

  return { ok: true, url: `https://docs.google.com/document/d/${documentId}/edit` };
}
