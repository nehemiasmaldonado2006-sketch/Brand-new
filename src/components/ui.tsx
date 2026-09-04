import Link from "next/link";
import type { ReactNode } from "react";

export function PanelCard({
  icon,
  title,
  kicker,
  badge,
  footer,
  children,
}: {
  icon: ReactNode;
  title: string;
  kicker: string;
  badge: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-[372px] flex-col border border-black/[0.12] bg-panel">
      <div className="flex items-start justify-between gap-3.5 px-[22px] pt-5 pb-3.5">
        <div className="flex items-center gap-3">
          {icon}
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 font-serif text-[23px] leading-[1.05] font-semibold">
              {title}
            </h2>
            <div className="text-[10px] tracking-[0.16em] text-muted uppercase">
              {kicker}
            </div>
          </div>
        </div>
        <span className="flex-none border border-black/25 px-2.5 py-[5px] text-[9.5px] tracking-[0.16em] whitespace-nowrap text-muted uppercase">
          {badge}
        </span>
      </div>
      <div className="h-px bg-black/[0.12]" />
      <div className="flex flex-1 flex-col px-[22px] py-[18px]">{children}</div>
      <div className="h-px bg-black/[0.12]" />
      <div className="px-[22px] py-[13px] text-[10.5px] tracking-[0.1em] text-muted uppercase">
        {footer}
      </div>
    </section>
  );
}

export function Row({
  label,
  value,
  soft = true,
}: {
  label: string;
  value: ReactNode;
  soft?: boolean;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4 py-[13px] first:pt-0 first:pb-[13px]">
        <span className="text-[13.5px]">{label}</span>
        <span className="font-serif text-[32px] leading-none font-medium text-muted">
          {value}
        </span>
      </div>
      {soft && <div className="h-px bg-black/[0.07]" />}
    </>
  );
}

export function DarkButton({
  href,
  children,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `w-full cursor-pointer border-none bg-ink px-3 py-3 text-center font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function OutlineButton({
  href,
  children,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `cursor-pointer border border-ink bg-transparent px-4 py-2.5 text-center font-sans text-[9.5px] tracking-[0.14em] text-ink uppercase hover:bg-ink hover:text-page ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function GoldButton({
  href,
  children,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `cursor-pointer border-none bg-accent px-3 py-3 text-center font-sans text-[11px] tracking-[0.16em] text-white uppercase hover:bg-ink ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.16em] text-muted uppercase">
      {children}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-black/25 p-[34px] text-center text-[12.5px] leading-[1.6] text-muted">
      {children}
    </div>
  );
}
