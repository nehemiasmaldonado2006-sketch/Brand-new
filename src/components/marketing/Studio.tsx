"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageCanvas, type Theme } from "@/components/marketing/PageCanvas";
import type { CanvasElement, MarketingPage } from "@/lib/marketing/types";
import { PALETTES, PAGE_W, PAGE_H } from "@/lib/marketing/types";
import { seedPage, newElementId } from "@/lib/marketing/seed";
import { exportNodeAsPngBlob, capturePage, buildPdfFromCaptures, downloadBlob, type CapturedPage } from "@/lib/marketing/export";
import { saveDoc, saveDocToLibrary, deleteDocAction } from "@/app/marketing/studio/actions";

type DocKind = "presentation" | "cma";

export type StudioDoc = {
  id: string;
  kind: DocKind;
  name: string;
  pages: MarketingPage[];
  paletteIndex: number | null;
  useCustom: boolean;
  customBg: string | null;
  customFg: string | null;
  customAccent: string | null;
};

const TOOLS = [
  { key: "design", label: "Design", glyph: "◆" },
  { key: "text", label: "Text", glyph: "T" },
  { key: "elements", label: "Elements", glyph: "▭" },
  { key: "photos", label: "Photos", glyph: "▤" },
  { key: "brand", label: "Brand", glyph: "★" },
] as const;

type Tool = (typeof TOOLS)[number]["key"];

const TEXT_PRESETS: { label: string; size: number; weight: 400 | 500 | 600; font: "serif" | "sans" }[] = [
  { label: "Heading", size: 30, weight: 600, font: "serif" },
  { label: "Subheading", size: 16, weight: 500, font: "sans" },
  { label: "Body", size: 12.5, weight: 400, font: "sans" },
  { label: "Caption", size: 9.5, weight: 500, font: "sans" },
];

export function Studio({ doc, libraryHref }: { doc: StudioDoc; libraryHref: string }) {
  const [name, setName] = useState(doc.name);
  const [pages, setPages] = useState<MarketingPage[]>(doc.pages);
  const [pageIdx, setPageIdx] = useState(0);
  const [selId, setSelId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("design");
  const [paletteIndex, setPaletteIndex] = useState<number | null>(doc.paletteIndex);
  const [useCustom, setUseCustom] = useState(doc.useCustom);
  const [custom, setCustom] = useState({
    bg: doc.customBg ?? "#100f0e",
    fg: doc.customFg ?? "#f6f4f0",
    accent: doc.customAccent ?? "#b98f4e",
  });
  const [showCustom, setShowCustom] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendMessage, setSendMessage] = useState(
    "Attached is the piece we discussed — happy to walk you through it.",
  );
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError, setSendError] = useState("");
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const [captureIdx, setCaptureIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    ow: number;
    oh: number;
  } | null>(null);

  const theme: Theme = useCustom
    ? custom
    : paletteIndex != null
      ? PALETTES[paletteIndex]
      : { bg: "#f6f4f0", fg: "#141311", accent: "#b98f4e" };

  const page = pages[pageIdx];
  const selEl = page?.elements.find((e) => e.id === selId) ?? null;

  const patchEl = useCallback((id: string, patch: Partial<CanvasElement>) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i !== pageIdx ? p : { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) },
      ),
    );
  }, [pageIdx]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (d.mode === "move") {
        patchEl(d.id, {
          x: Math.max(0, Math.min(PAGE_W - d.ow, d.ox + dx)),
          y: Math.max(0, Math.min(PAGE_H - d.oh, d.oy + dy)),
        });
      } else {
        patchEl(d.id, {
          w: Math.max(24, Math.min(PAGE_W - d.ox, d.ow + dx)),
          h: Math.max(16, Math.min(PAGE_H - d.oy, d.oh + dy)),
        });
      }
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [patchEl]);

  function grabStart(id: string, e: React.MouseEvent) {
    const el = page.elements.find((x) => x.id === id);
    if (!el) return;
    dragRef.current = { id, mode: "move", sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h };
  }
  function resizeStart(id: string, e: React.MouseEvent) {
    const el = page.elements.find((x) => x.id === id);
    if (!el) return;
    dragRef.current = { id, mode: "resize", sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, ow: el.w, oh: el.h };
  }

  function addElement(el: Omit<CanvasElement, "id">) {
    const newEl: CanvasElement = { ...el, id: newElementId() };
    setPages((prev) => prev.map((p, i) => (i !== pageIdx ? p : { ...p, elements: [...p.elements, newEl] })));
    setSelId(newEl.id);
  }

  function removeElement(id: string) {
    setPages((prev) =>
      prev.map((p, i) => (i !== pageIdx ? p : { ...p, elements: p.elements.filter((e) => e.id !== id) })),
    );
    if (selId === id) setSelId(null);
  }

  function resetPage() {
    setPages((prev) => prev.map((p, i) => (i !== pageIdx ? p : seedPage(p.name, i, name))));
    setSelId(null);
  }

  function addPage() {
    setPages((prev) => [...prev, seedPage(`Page ${prev.length + 1}`, prev.length, name)]);
    setPageIdx(pages.length);
  }

  function deletePage() {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== pageIdx));
    setPageIdx((i) => Math.max(0, i - 1));
    setSelId(null);
  }

  async function handleSave() {
    setSaveState("saving");
    await saveDoc(doc.id, {
      name,
      paletteIndex: useCustom ? null : paletteIndex,
      useCustom,
      customBg: custom.bg,
      customFg: custom.fg,
      customAccent: custom.accent,
      pages,
    });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1800);
  }

  async function handleSaveToLibrary() {
    await handleSave();
    await saveDocToLibrary(doc.id);
  }

  function waitFrame() {
    return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }

  async function handleDownloadPng() {
    if (!canvasRef.current) return;
    setExporting("png");
    try {
      const blob = await exportNodeAsPngBlob(canvasRef.current);
      downloadBlob(blob, `${name || "document"}-page-${pageIdx + 1}.png`);
    } finally {
      setExporting(null);
    }
  }

  async function handleDownloadPdf() {
    setExporting("pdf");
    try {
      const captures: CapturedPage[] = [];
      for (let i = 0; i < pages.length; i++) {
        setCaptureIdx(i);
        // eslint-disable-next-line no-await-in-loop
        await waitFrame();
        if (!captureRef.current) continue;
        // capture this page's pixels now, before captureIdx moves on and
        // re-renders the same off-screen node with the next page's content
        // eslint-disable-next-line no-await-in-loop
        captures.push(await capturePage(captureRef.current));
      }
      const pdfBlob = buildPdfFromCaptures(captures);
      downloadBlob(pdfBlob, `${name || "document"}.pdf`);
    } finally {
      setCaptureIdx(null);
      setExporting(null);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canvasRef.current) return;
    setSendStatus("sending");
    setSendError("");
    try {
      const blob = await exportNodeAsPngBlob(canvasRef.current);
      const form = new FormData();
      form.set("to", sendTo);
      form.set("subject", name);
      form.set("message", sendMessage);
      form.set("file", new File([blob], `${name || "document"}.png`, { type: "image/png" }));
      const res = await fetch("/api/marketing/send", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setSendStatus("error");
        setSendError(json.error ?? "Send failed");
      } else {
        setSendStatus("sent");
      }
    } catch {
      setSendStatus("error");
      setSendError("Send failed");
    }
  }

  const ghostBtn =
    "cursor-pointer border border-black/20 bg-transparent px-2.5 py-2 font-sans text-[9.5px] tracking-[0.12em] text-ink uppercase whitespace-nowrap hover:border-accent hover:text-accent";
  const miniBtn =
    "cursor-pointer border border-black/20 bg-transparent px-2 py-1.5 font-sans text-[9.5px] tracking-[0.1em] text-ink uppercase whitespace-nowrap hover:border-accent hover:text-accent";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#e9e6e0]">
      {/* top bar */}
      <div className="flex flex-none flex-nowrap items-center gap-2.5 overflow-hidden border-b border-black/[0.14] bg-panel px-3 py-1.5">
        <Link href={libraryHref} className={ghostBtn}>
          ← Library
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[60px] flex-1 border-none bg-transparent py-px font-serif text-[19px] text-ink"
        />
        <div className="flex flex-none items-center gap-1.5">
          <button type="button" onClick={resetPage} title="Reset this page to the template" className={ghostBtn}>
            Reset page
          </button>
          <button type="button" onClick={handleSaveToLibrary} className={ghostBtn}>
            Save to premade
          </button>
          <div className="flex gap-1 border-l border-black/[0.12] pl-2">
            <button type="button" onClick={handleDownloadPng} disabled={!!exporting} className={ghostBtn}>
              {exporting === "png" ? "…" : "PNG"}
            </button>
            <button type="button" onClick={handleDownloadPdf} disabled={!!exporting} className={ghostBtn}>
              {exporting === "pdf" ? "…" : "PDF"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="flex-none cursor-pointer border border-ink bg-transparent px-3 py-2 font-sans text-[9.5px] tracking-[0.12em] text-ink uppercase whitespace-nowrap hover:bg-ink hover:text-page"
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setSendOpen(true)}
            className="flex-none cursor-pointer border-none bg-ink px-3 py-2.5 font-sans text-[9.5px] tracking-[0.12em] text-page uppercase whitespace-nowrap hover:bg-accent"
          >
            Send
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* tool rail */}
        <div className="flex w-[58px] flex-none flex-col gap-0.5 bg-ink py-2">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTool(t.key);
                setLeftOpen(true);
              }}
              className={`flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent py-2.5 font-sans text-[8px] tracking-[0.1em] uppercase ${
                tool === t.key ? "text-accent" : "text-page/70"
              }`}
            >
              <span className="text-[17px] leading-none">{t.glyph}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* left panel */}
        {leftOpen && (
          <div className="w-[250px] flex-none overflow-y-auto border-r border-black/10 bg-panel p-3.5">
            <div className="mb-4 flex items-center justify-between gap-2.5">
              <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                {TOOLS.find((t) => t.key === tool)?.label}
              </span>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                title="Hide panel"
                className="h-6 w-6 flex-none cursor-pointer border border-black/20 bg-transparent text-[12px] text-muted"
              >
                ‹
              </button>
            </div>

            {tool === "design" && (
              <div className="flex flex-col gap-2.5">
                {PALETTES.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setPaletteIndex(i);
                      setUseCustom(false);
                    }}
                    className="flex cursor-pointer items-center gap-3 border px-2.5 py-2 text-left font-sans"
                    style={{
                      borderColor: paletteIndex === i && !useCustom ? "#b98f4e" : "rgba(20,19,17,0.12)",
                    }}
                  >
                    <span className="flex gap-1">
                      <span className="block h-5 w-5" style={{ background: p.bg }} />
                      <span className="block h-5 w-5" style={{ background: p.fg }} />
                      <span className="block h-5 w-5" style={{ background: p.accent }} />
                    </span>
                    <span className="text-[12px] text-ink">{p.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustom((s) => !s)}
                  className="cursor-pointer border border-dashed border-accent/70 bg-transparent px-2.5 py-2 text-[11px] text-accent"
                >
                  + Add colour
                </button>
                {showCustom && (
                  <div className="flex flex-col gap-2.5 border border-black/[0.12] p-3">
                    {(["bg", "fg", "accent"] as const).map((k) => (
                      <div key={k} className="flex items-center justify-between gap-2.5">
                        <span className="text-[11.5px] text-muted capitalize">
                          {k === "bg" ? "Background" : k === "fg" ? "Text" : "Accent"}
                        </span>
                        <input
                          type="color"
                          value={custom[k]}
                          onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))}
                          className="h-[26px] w-11 cursor-pointer border border-black/20 bg-none p-0"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseCustom(true)}
                      className="cursor-pointer border-none bg-ink px-2.5 py-2 text-[10px] text-page uppercase"
                    >
                      Apply custom palette
                    </button>
                  </div>
                )}
              </div>
            )}

            {tool === "text" && (
              <div className="flex flex-col gap-2.5">
                {TEXT_PRESETS.map((tp) => (
                  <button
                    key={tp.label}
                    type="button"
                    onClick={() =>
                      addElement({
                        type: "text",
                        text: tp.label,
                        x: 40,
                        y: 40,
                        w: 300,
                        h: tp.size + 20,
                        size: tp.size,
                        weight: tp.weight,
                        font: tp.font,
                      })
                    }
                    className="cursor-pointer border border-black/[0.15] bg-transparent px-3 py-2.5 text-left font-sans text-[12.5px] text-ink hover:border-accent"
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            )}

            {tool === "elements" && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => addElement({ type: "shape", shape: "bar", x: 40, y: 40, w: 68, h: 4 })}
                  className="flex cursor-pointer flex-col items-center gap-2 border border-black/[0.15] bg-transparent px-2 py-3.5 font-sans"
                >
                  <span className="h-1 w-8" style={{ background: theme.accent }} />
                  <span className="text-[10px] tracking-[0.1em] text-muted uppercase">Accent bar</span>
                </button>
                <button
                  type="button"
                  onClick={() => addElement({ type: "shape", shape: "panel", x: 40, y: 40, w: 200, h: 100 })}
                  className="flex cursor-pointer flex-col items-center gap-2 border border-black/[0.15] bg-transparent px-2 py-3.5 font-sans"
                >
                  <span className="h-6 w-10" style={{ background: `${theme.fg}1a` }} />
                  <span className="text-[10px] tracking-[0.1em] text-muted uppercase">Panel</span>
                </button>
              </div>
            )}

            {tool === "photos" && (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => addElement({ type: "photo", text: "photo frame", x: 40, y: 40, w: 240, h: 160 })}
                  className="cursor-pointer border-none bg-ink px-3 py-3 font-sans text-[10px] tracking-[0.14em] text-page uppercase"
                >
                  + Add photo frame
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {["/brand/headshot-nehemias-maldonado.jpg", "/brand/headshot-tyler-standish.jpg"].map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => addElement({ type: "photo", src, x: 40, y: 40, w: 160, h: 200 })}
                      className="cursor-pointer border border-black/[0.15] bg-transparent p-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-16 w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] leading-[1.5] text-muted">
                  Selecting a photo frame shows a paste-a-URL field on the right for MLS photos.
                </div>
              </div>
            )}

            {tool === "brand" && (
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3 border border-black/[0.12] p-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/ts-monogram-official.jpg"
                    alt="Tyler Standish Group"
                    className="h-[46px] w-[46px] object-cover"
                  />
                  <div>
                    <div className="text-[12px] font-medium">Tyler Standish Group</div>
                    <div className="text-[11px] text-muted">KW Innovation</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addElement({ type: "logo", x: 30, y: 24, w: 460, h: 42 })}
                  className="cursor-pointer border-none bg-ink px-3 py-3 font-sans text-[10px] tracking-[0.14em] text-page uppercase"
                >
                  + Place logo lock
                </button>
              </div>
            )}
          </div>
        )}

        {/* canvas */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-none flex-wrap items-center gap-2 border-b border-black/10 bg-panel px-3 py-2">
            {!leftOpen && (
              <button type="button" onClick={() => setLeftOpen(true)} className={miniBtn}>
                ›
              </button>
            )}
            <button type="button" onClick={() => setPageIdx((i) => Math.max(0, i - 1))} className={miniBtn}>
              ←
            </button>
            <div className="text-[10px] tracking-[0.12em] whitespace-nowrap text-muted uppercase">
              {pageIdx + 1}/{pages.length}
            </div>
            <button
              type="button"
              onClick={() => setPageIdx((i) => Math.min(pages.length - 1, i + 1))}
              className={miniBtn}
            >
              →
            </button>
            <div className="flex-1" />
            {selEl && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9.5px] tracking-[0.12em] text-muted uppercase">{selEl.type}</span>
                {selEl.type === "text" && (
                  <>
                    <button
                      type="button"
                      onClick={() => patchEl(selEl.id, { size: (selEl.size ?? 14) + 2 })}
                      className={miniBtn}
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => patchEl(selEl.id, { size: Math.max(8, (selEl.size ?? 14) - 2) })}
                      className={miniBtn}
                    >
                      A−
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    addElement({ ...selEl, x: Math.min(PAGE_W - selEl.w, selEl.x + 14), y: Math.min(PAGE_H - selEl.h, selEl.y + 14) })
                  }
                  className={miniBtn}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => removeElement(selEl.id)}
                  className="cursor-pointer border border-red-800/40 bg-transparent px-2 py-1.5 font-sans text-[9.5px] tracking-[0.1em] text-red-800 uppercase hover:bg-red-800 hover:text-white"
                >
                  Delete
                </button>
              </div>
            )}
            {!rightOpen && (
              <button type="button" onClick={() => setRightOpen(true)} className={miniBtn}>
                ‹
              </button>
            )}
          </div>

          <div className="flex flex-1 items-start justify-center overflow-auto p-4">
            <div ref={canvasRef}>
              <PageCanvas
                page={page}
                theme={theme}
                interactive
                selId={selId}
                onSelect={setSelId}
                onGrabStart={grabStart}
                onResizeStart={resizeStart}
              />
            </div>
          </div>

          {/* page filmstrip */}
          <div className="flex flex-none items-center gap-2.5 overflow-x-auto border-t border-black/10 bg-panel px-3.5 py-2">
            {pages.map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-1 border px-2 py-1.5"
                style={{ borderColor: i === pageIdx ? "#b98f4e" : "rgba(20,19,17,0.15)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setPageIdx(i);
                    setSelId(null);
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 font-sans text-[10px] tracking-[0.08em] whitespace-nowrap text-ink uppercase"
                >
                  {i + 1}. {p.name}
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={addPage}
              className="flex-none cursor-pointer border border-dashed border-accent/70 bg-transparent px-2.5 py-1.5 font-sans text-[10px] tracking-[0.1em] whitespace-nowrap text-accent uppercase"
            >
              + Add page
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={deletePage}
              className="flex-none cursor-pointer border border-black/20 bg-transparent px-3 py-1.5 font-sans text-[10px] tracking-[0.12em] whitespace-nowrap text-muted uppercase hover:border-red-800 hover:text-red-800"
            >
              Delete page
            </button>
          </div>
        </div>

        {/* right panel */}
        {rightOpen && (
          <div className="w-[230px] flex-none overflow-y-auto border-l border-black/10 bg-panel p-3.5">
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setRightOpen(false)}
                title="Hide panel"
                className="h-6 w-6 cursor-pointer border border-black/20 bg-transparent text-[12px] text-muted"
              >
                ›
              </button>
            </div>
            {selEl ? (
              <div className="flex flex-col gap-3.5">
                <div className="text-[10px] tracking-[0.18em] text-muted uppercase">{selEl.type} selected</div>
                {selEl.type === "text" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] text-muted">Text</label>
                      <input
                        value={selEl.text ?? ""}
                        onChange={(e) => patchEl(selEl.id, { text: e.target.value })}
                        className="border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10.5px] text-muted">Size · {selEl.size ?? 14}px</label>
                      <input
                        type="range"
                        min={8}
                        max={60}
                        value={selEl.size ?? 14}
                        onChange={(e) => patchEl(selEl.id, { size: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[11.5px] text-muted">Colour</span>
                      <input
                        type="color"
                        value={selEl.color ?? theme.fg}
                        onChange={(e) => patchEl(selEl.id, { color: e.target.value })}
                        className="h-[26px] w-11 cursor-pointer border border-black/20 bg-none p-0"
                      />
                    </div>
                  </>
                )}
                {selEl.type === "photo" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-muted">Image URL</label>
                    <input
                      value={selEl.src ?? ""}
                      onChange={(e) => patchEl(selEl.id, { src: e.target.value })}
                      placeholder="https://…"
                      className="border border-black/25 bg-transparent px-2.5 py-2 text-[12.5px] text-ink"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-muted">Width</label>
                    <input
                      type="number"
                      value={Math.round(selEl.w)}
                      onChange={(e) => patchEl(selEl.id, { w: Math.max(8, Number(e.target.value)) })}
                      className="border border-black/25 bg-transparent px-2 py-2 text-[12.5px] text-ink"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-muted">Height</label>
                    <input
                      type="number"
                      value={Math.round(selEl.h)}
                      onChange={(e) => patchEl(selEl.id, { h: Math.max(8, Number(e.target.value)) })}
                      className="border border-black/25 bg-transparent px-2 py-2 text-[12.5px] text-ink"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeElement(selEl.id)}
                  className="cursor-pointer border border-black/[0.22] bg-transparent px-2.5 py-2.5 font-sans text-[10px] tracking-[0.14em] text-muted uppercase hover:border-red-800 hover:text-red-800"
                >
                  Delete element
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3.5 text-[10px] tracking-[0.18em] text-muted uppercase">Layers</div>
                <div className="flex flex-col gap-2">
                  {page.elements.length === 0 && (
                    <div className="text-[12px] leading-[1.5] text-muted">
                      Empty page. Add text, elements or photos from the left rail.
                    </div>
                  )}
                  {page.elements.map((ly) => (
                    <div key={ly.id} className="flex items-center gap-2.5 border border-black/[0.12] px-2.5 py-2">
                      <button
                        type="button"
                        onClick={() => setSelId(ly.id)}
                        className="min-w-0 flex-1 cursor-pointer overflow-hidden border-none bg-transparent p-0 text-left font-sans text-[11.5px] text-ellipsis whitespace-nowrap text-ink"
                      >
                        {ly.type === "text" ? ly.text || "Text" : ly.type}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeElement(ly.id)}
                        title="Delete"
                        className="h-[22px] w-[22px] flex-none cursor-pointer border border-black/[0.18] bg-transparent text-[11px] text-muted hover:border-red-800 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* off-screen capture stage for multi-page PDF export */}
      {captureIdx != null && (
        <div style={{ position: "fixed", left: -99999, top: 0 }}>
          <div ref={captureRef}>
            <PageCanvas page={pages[captureIdx]} theme={theme} />
          </div>
        </div>
      )}

      {sendOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#100f0e]/60 p-6">
          <div className="w-[460px] max-w-full border border-black/[0.15] bg-panel">
            <div className="flex items-center justify-between gap-3.5 bg-header px-6 py-4.5 text-header-fg">
              <span className="whitespace-nowrap font-serif text-[22px]">Send to client</span>
              <button
                type="button"
                onClick={() => {
                  setSendOpen(false);
                  setSendStatus("idle");
                }}
                className="h-7 w-7 cursor-pointer border border-white/35 bg-transparent text-[13px] text-header-fg"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSend} className="flex flex-col gap-4 p-6">
              <div className="text-[12.5px] leading-[1.55] text-muted">
                Sending <span className="text-ink">{name}</span> as a PNG image from your Gmail.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">Client email</label>
                <input
                  type="email"
                  required
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="name@email.com"
                  className="border border-black/25 bg-transparent px-3 py-2.5 text-[14px] text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">Message</label>
                <input
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="border border-black/25 bg-transparent px-3 py-2.5 text-[14px] text-ink"
                />
              </div>
              {sendStatus === "sent" && (
                <div className="border border-accent bg-accent/[0.08] px-3.5 py-3 text-[12.5px] text-ink">
                  Sent to <span className="text-accent">{sendTo}</span>.
                </div>
              )}
              {sendStatus === "error" && (
                <div className="border border-black/25 bg-black/[0.03] px-3.5 py-3 text-[12.5px] text-muted">
                  Couldn&apos;t send: {sendError}
                </div>
              )}
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={sendStatus === "sending"}
                  className="flex-1 cursor-pointer border-none bg-ink px-3 py-3 font-sans text-[10.5px] tracking-[0.14em] text-page uppercase hover:bg-accent"
                >
                  {sendStatus === "sending" ? "Sending…" : "Send"}
                </button>
                <button
                  type="button"
                  onClick={() => setSendOpen(false)}
                  className="cursor-pointer border border-black/25 bg-transparent px-4.5 py-3 font-sans text-[10.5px] tracking-[0.14em] text-muted uppercase hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form action={deleteDocAction} className="hidden" id="delete-doc-form">
        <input type="hidden" name="docId" value={doc.id} />
        <input type="hidden" name="kind" value={doc.kind} />
      </form>
    </div>
  );
}
