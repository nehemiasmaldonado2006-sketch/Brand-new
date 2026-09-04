import Link from "next/link";

export function MarketingTabs({ active }: { active: "flyers" | "presentations" | "cma" }) {
  const tabs: { key: typeof active; label: string; href: string }[] = [
    { key: "flyers", label: "Flyers · 13", href: "/marketing/flyers" },
    { key: "presentations", label: "Presentations · 15", href: "/marketing/presentations" },
    { key: "cma", label: "CMA · 15", href: "/marketing/cma" },
  ];
  return (
    <div className="flex items-center border-b border-black/[0.12]">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px px-[22px] py-3.5 font-sans text-[11px] tracking-[0.16em] uppercase ${
            active === t.key
              ? "border-b-2 border-accent text-ink"
              : "border-b-2 border-transparent text-muted"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
