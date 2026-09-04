import type { CSSProperties } from "react";
import type { CanvasElement, MarketingPage } from "@/lib/marketing/types";
import { PAGE_H, PAGE_W } from "@/lib/marketing/types";

export type Theme = { bg: string; fg: string; accent: string };

const photoFill = {
  backgroundColor: "#26241f",
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 8px, rgba(255,255,255,0.03) 8px 16px)",
};

function ElementBody({ el, theme }: { el: CanvasElement; theme: Theme }) {
  if (el.type === "text") {
    const style: CSSProperties = {
      fontFamily: el.font === "serif" ? "var(--font-serif), Georgia, serif" : "var(--font-sans), sans-serif",
      fontSize: el.size ?? 14,
      fontWeight: el.weight ?? 400,
      color: el.color ?? (el.dim ? `${theme.fg}b3` : theme.fg),
      letterSpacing: el.track ? "0.12em" : undefined,
      textTransform: el.track ? "uppercase" : undefined,
      lineHeight: 1.15,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      wordBreak: "break-word",
    };
    return <div style={style}>{el.text}</div>;
  }
  if (el.type === "photo") {
    if (el.src) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={el.src} alt="" className="h-full w-full object-cover" draggable={false} />
      );
    }
    return (
      <div className="flex h-full w-full items-end justify-start p-2" style={photoFill}>
        <span className="font-mono text-[10px] text-white/65">{el.text ?? "photo frame"}</span>
      </div>
    );
  }
  if (el.type === "shape") {
    if (el.shape === "bar") {
      return <div className="h-full w-full" style={{ background: theme.accent }} />;
    }
    return <div className="h-full w-full" style={{ background: `${theme.fg}0d` }} />;
  }
  // logo
  return (
    <div
      className="flex h-full w-full items-center justify-between gap-2 px-3"
      style={{ background: "#0b0b0b", color: "#f6f4f0" }}
    >
      <span className="font-serif text-[22px] whitespace-nowrap">TS</span>
      <span className="text-[8px] tracking-[0.16em] whitespace-nowrap uppercase">
        Tyler Standish Group · KW Innovation
      </span>
    </div>
  );
}

export function PageCanvas({
  page,
  theme,
  interactive = false,
  selId,
  onSelect,
  onGrabStart,
  onResizeStart,
}: {
  page: MarketingPage;
  theme: Theme;
  interactive?: boolean;
  selId?: string | null;
  onSelect?: (id: string | null) => void;
  onGrabStart?: (id: string, e: React.MouseEvent) => void;
  onResizeStart?: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={() => onSelect?.(null)}
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: theme.bg,
        color: theme.fg,
        position: "relative",
        overflow: "hidden",
        flex: "none",
      }}
    >
      {page.elements.map((el) => {
        const selected = interactive && selId === el.id;
        return (
          <div
            key={el.id}
            onMouseDown={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onSelect?.(el.id);
              onGrabStart?.(el.id, e);
            }}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              cursor: interactive ? "grab" : undefined,
              outline: selected ? "1.5px solid #b98f4e" : undefined,
              outlineOffset: 3,
            }}
          >
            <ElementBody el={el} theme={theme} />
            {selected && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart?.(el.id, e);
                }}
                title="Resize"
                style={{
                  position: "absolute",
                  right: -5,
                  bottom: -5,
                  width: 11,
                  height: 11,
                  background: "#b98f4e",
                  cursor: "nwse-resize",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
