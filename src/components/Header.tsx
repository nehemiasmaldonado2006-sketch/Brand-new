import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function Header({
  title,
  showBack = false,
  status,
  authSlot,
}: {
  title: string;
  showBack?: boolean;
  status?: string;
  authSlot?: ReactNode;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between gap-8 bg-header px-11 py-[18px] text-header-fg">
      <div className="flex items-center gap-[18px]">
        <Image
          src="/brand/ts-monogram.jpg"
          alt="Tyler Standish Group"
          width={58}
          height={58}
          className="block h-[58px] w-[58px] border border-white/[0.18] object-cover"
        />
        <div className="flex flex-col gap-[3px]">
          <div className="font-serif text-[25px] leading-none tracking-[0.01em]">
            {title}
          </div>
          <div className="text-[11px] tracking-[0.16em] text-white/55 uppercase">
            Nehemias Maldonado · Tyler Standish Group · KW Innovation
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[22px]">
        {showBack && (
          <Link
            href="/"
            className="border border-white/35 px-4 py-[10px] font-sans text-[11px] tracking-[0.16em] text-header-fg uppercase hover:border-accent hover:text-accent"
          >
            ← Mission Control
          </Link>
        )}
        <div className="flex flex-col items-end gap-[3px] text-right">
          <div className="font-serif text-[22px] leading-none">{today}</div>
          <div className="text-[11px] tracking-[0.16em] text-white/55 uppercase">
            {status ?? "No sources connected"}
          </div>
          {authSlot}
        </div>
      </div>
    </header>
  );
}
