import type { TemplateCard } from "@/lib/marketing/templates";

const photoFill = {
  backgroundColor: "#26241f",
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
};

function LogoLock({ bg }: { bg: string }) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2.5"
      style={{ background: "#0b0b0b", color: "#f6f4f0" }}
    >
      <span className="whitespace-nowrap font-serif text-[16px]" style={{ color: bg === "#0b0b0b" ? "#f6f4f0" : undefined }}>
        TS
      </span>
      <span className="text-[7px] tracking-[0.14em] whitespace-nowrap uppercase opacity-75">
        KW Innovation
      </span>
    </div>
  );
}

export function TemplateCoverThumb({ t }: { t: TemplateCard }) {
  const { bg, fg, accent } = t.scheme;
  const base = "box-border flex aspect-[1/1.35] w-full min-w-0 flex-col overflow-hidden";

  if (t.layout === 0) {
    return (
      <div className={base} style={{ background: bg, color: fg }}>
        <div className="flex flex-1 items-end justify-start p-2" style={photoFill}>
          <span className="font-mono text-[8px] text-white/65">hero exterior</span>
        </div>
        <div className="px-3 py-2.5" style={{ background: accent }}>
          <div
            className="[overflow-wrap:anywhere] text-[13px] leading-[1.02] font-semibold tracking-[0.01em] uppercase"
            style={{ color: bg }}
          >
            {t.name}
          </div>
        </div>
        <div className="px-3 py-2 text-[7.5px] tracking-[0.14em] uppercase opacity-70">
          {t.kicker} · {t.pages}
        </div>
        <LogoLock bg={bg} />
      </div>
    );
  }

  if (t.layout === 1) {
    return (
      <div className={base} style={{ background: bg, color: fg }}>
        <div className="relative flex items-end justify-start p-2" style={{ ...photoFill, height: "42%" }}>
          <span className="font-mono text-[8px] text-white/65">front elevation</span>
          <span
            className="absolute top-0 left-0 px-2.5 py-1 text-[7.5px] font-semibold tracking-[0.16em] uppercase"
            style={{ background: accent, color: bg }}
          >
            {t.tag}
          </span>
        </div>
        <div className="flex-1 p-3">
          <div className="[overflow-wrap:anywhere] text-[14px] leading-[1.02] font-semibold tracking-[0.01em] uppercase">
            {t.name}
          </div>
        </div>
        <div className="grid grid-cols-3" style={{ borderTop: `2px solid ${accent}` }}>
          {["Comps", "Pricing", "Net sheet"].map((s) => (
            <div key={s} className="px-1 py-1.5 text-center text-[7.5px] tracking-[0.1em] uppercase opacity-70">
              {s}
            </div>
          ))}
        </div>
        <LogoLock bg={bg} />
      </div>
    );
  }

  if (t.layout === 2) {
    return (
      <div className={base} style={{ background: bg, color: fg }}>
        <div className="flex min-h-0 flex-1">
          <div
            className="flex w-[34%] flex-col justify-between p-2.5"
            style={{ background: accent, color: bg }}
          >
            <span className="font-serif text-[16px] whitespace-nowrap">TS</span>
            <span className="text-[7.5px] font-semibold tracking-[0.14em] uppercase">{t.tag}</span>
          </div>
          <div className="flex flex-1 items-end justify-start p-2" style={photoFill}>
            <span className="font-mono text-[8px] text-white/65">kitchen</span>
          </div>
        </div>
        <div className="p-3">
          <div className="[overflow-wrap:anywhere] text-[13.5px] leading-[1.02] font-semibold tracking-[0.01em] uppercase">
            {t.name}
          </div>
        </div>
        <LogoLock bg={bg} />
      </div>
    );
  }

  if (t.layout === 3) {
    return (
      <div className={base} style={{ background: bg, color: fg }}>
        <div className="px-3 pt-3.5 pb-2.5">
          <div className="[overflow-wrap:anywhere] text-[16px] leading-[1.02] font-semibold tracking-[0.01em] uppercase">
            {t.name}
          </div>
          <div className="mt-2 h-[3px] w-[64%]" style={{ background: accent }} />
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-[3px] px-3 pb-2.5">
          {["living", "bath", "yard"].map((s) => (
            <div key={s} className="flex items-end justify-start p-2" style={photoFill}>
              <span className="font-mono text-[8px] text-white/65">{s}</span>
            </div>
          ))}
        </div>
        <div className="px-3 pb-2.5 text-[7.5px] tracking-[0.14em] uppercase opacity-70">
          {t.kicker} · {t.pages}
        </div>
        <LogoLock bg={bg} />
      </div>
    );
  }

  if (t.layout === 4) {
    return (
      <div className={base} style={{ background: bg, color: fg, border: `3px solid ${accent}` }}>
        <div className="flex flex-1 items-start justify-start p-2" style={photoFill}>
          <span className="font-mono text-[8px] text-white/65">hero photo</span>
        </div>
        <div className="flex flex-col gap-1.5 px-3 py-2.5" style={{ background: bg }}>
          <span
            className="self-start px-2 py-1 text-[7px] font-semibold tracking-[0.16em] uppercase"
            style={{ background: accent, color: bg }}
          >
            {t.tag}
          </span>
          <div className="[overflow-wrap:anywhere] text-[13.5px] leading-[1.02] font-semibold tracking-[0.01em] uppercase">
            {t.name}
          </div>
        </div>
        <LogoLock bg={bg} />
      </div>
    );
  }

  return (
    <div className={base} style={{ background: bg, color: fg }}>
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5"
        style={{ borderBottom: `2px solid ${accent}` }}
      >
        <span className="font-serif text-[16px] whitespace-nowrap">TS</span>
        <span className="text-[7px] tracking-[0.16em] whitespace-nowrap uppercase opacity-70">
          Tyler Standish Group
        </span>
      </div>
      <div className="px-3 pt-3 pb-2.5">
        <div
          className="[overflow-wrap:anywhere] text-[14.5px] leading-[1.02] font-semibold tracking-[0.01em] uppercase"
          style={{ color: accent }}
        >
          {t.name}
        </div>
      </div>
      <div className="mx-3 mb-2.5 flex min-h-0 flex-1 items-end justify-start p-2" style={photoFill}>
        <span className="font-mono text-[8px] text-white/65">property photo</span>
      </div>
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5"
        style={{ background: "#0b0b0b", color: "#f6f4f0" }}
      >
        <span className="text-[7px] tracking-[0.14em] whitespace-nowrap uppercase opacity-75">
          {t.pages}
        </span>
        <span className="text-[7px] tracking-[0.14em] whitespace-nowrap uppercase opacity-75">
          KW Innovation
        </span>
      </div>
    </div>
  );
}
