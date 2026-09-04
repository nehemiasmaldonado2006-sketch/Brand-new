import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { EmptyNote, GoldButton, OutlineButton } from "@/components/ui";
import { getMarketEntryByArea, getListings } from "@/lib/data/market";
import { runAreaReport, logMarketStats, addListing, exportMarketData } from "./actions";

export const dynamic = "force-dynamic";

const STAT_FIELDS: { key: "medianList" | "medianClosed" | "daysOnMarket" | "pricePerSqft" | "monthsSupply"; label: string; fmt: (v: number) => string }[] = [
  { key: "medianList", label: "Median list", fmt: (v) => `$${Math.round(v).toLocaleString()}` },
  { key: "medianClosed", label: "Median closed", fmt: (v) => `$${Math.round(v).toLocaleString()}` },
  { key: "daysOnMarket", label: "Days on market", fmt: (v) => `${v}` },
  { key: "pricePerSqft", label: "$ / sq ft", fmt: (v) => `$${v}` },
  { key: "monthsSupply", label: "Months of supply", fmt: (v) => `${v}` },
];

export default async function MarketDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; tab?: string; sheet?: string; sheetError?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const params = await searchParams;
  const area = params.area?.trim() ?? "";
  const tab = params.tab === "closed" ? "closed" : "active";

  const entry = userId && area ? await getMarketEntryByArea(userId, area) : null;
  const listings = entry ? await getListings(entry.id, tab) : [];

  return (
    <>
      <Header
        title="Market Desk — Area Explorer"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="flex flex-col gap-6 px-11 pt-7 pb-[60px]">
        {params.sheet && (
          <div className="border border-accent bg-accent/[0.07] px-[18px] py-3.5 text-[12.5px] text-ink">
            Exported to Google Sheets —{" "}
            <a href={params.sheet} target="_blank" rel="noreferrer" className="text-accent underline">
              open the sheet
            </a>
          </div>
        )}
        {params.sheetError && (
          <div className="border border-black/25 bg-black/[0.03] px-[18px] py-3.5 text-[12.5px] text-muted">
            Couldn&apos;t export: {params.sheetError}
          </div>
        )}
        <form
          action={runAreaReport}
          className="flex flex-wrap items-end gap-[18px] border border-black/[0.12] bg-panel px-[26px] py-6"
        >
          <div className="flex min-w-[280px] flex-1 flex-col gap-2">
            <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
              Area — city, ZIP, neighborhood or school zone
            </label>
            <input
              name="area"
              type="text"
              defaultValue={area}
              className="border border-black/25 bg-transparent px-[13px] py-3 text-[15px] text-ink"
            />
          </div>
          <button
            type="submit"
            className="cursor-pointer border-none bg-ink px-7 py-3.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
          >
            Run area report
          </button>
        </form>

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">
              Area report
            </div>
            <div className="font-serif text-[38px] leading-none">{area || "No area selected"}</div>
          </div>
          <div className="flex gap-2.5">
            {userId && entry && (
              <form action={exportMarketData}>
                <input type="hidden" name="area" value={area} />
                <input type="hidden" name="tab" value={tab} />
                <button
                  type="submit"
                  className="cursor-pointer border border-ink bg-transparent px-4 py-2.5 text-center font-sans text-[9.5px] tracking-[0.14em] text-ink uppercase hover:bg-ink hover:text-page"
                >
                  Export to Sheets
                </button>
              </form>
            )}
            <OutlineButton>Download PDF</OutlineButton>
            <GoldButton>Send to Marketing Production</GoldButton>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-px border border-black/[0.12] bg-black/[0.12]">
          {STAT_FIELDS.map((f) => {
            const v = entry?.[f.key];
            return (
              <div key={f.key} className="bg-panel px-[22px] py-5">
                <div className="mb-1.5 text-[10px] tracking-[0.16em] text-muted uppercase">
                  {f.label}
                </div>
                <div className="font-serif text-[34px] leading-none text-muted">
                  {v != null ? f.fmt(v) : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {userId && (
          <form
            action={logMarketStats}
            className="flex flex-wrap items-end gap-4 border border-black/[0.12] bg-panel px-[26px] py-5"
          >
            <input type="hidden" name="area" value={area} />
            {[
              ["medianList", "Median list $"],
              ["medianClosed", "Median closed $"],
              ["daysOnMarket", "Days on market"],
              ["pricePerSqft", "$ / sq ft"],
              ["monthsSupply", "Months of supply"],
            ].map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] text-muted uppercase">
                  {label}
                </label>
                <input
                  name={key}
                  type="text"
                  className="w-32 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={!area}
              className="cursor-pointer border-none bg-ink px-4 py-2.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent disabled:opacity-40"
            >
              Log stats for this area
            </button>
          </form>
        )}

        <div className="flex items-center border-b border-black/[0.12]">
          <Link
            href={`/market?area=${encodeURIComponent(area)}&tab=active`}
            className={`-mb-px px-[22px] py-3.5 font-sans text-[11px] tracking-[0.16em] uppercase ${
              tab === "active" ? "border-b-2 border-accent text-ink" : "border-b-2 border-transparent text-muted"
            }`}
          >
            Active / listed
          </Link>
          <Link
            href={`/market?area=${encodeURIComponent(area)}&tab=closed`}
            className={`-mb-px px-[22px] py-3.5 font-sans text-[11px] tracking-[0.16em] uppercase ${
              tab === "closed" ? "border-b-2 border-accent text-ink" : "border-b-2 border-transparent text-muted"
            }`}
          >
            Closed — last 6 months
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-[22px]">
          {listings.map((l) => (
            <article key={l.id} className="flex flex-col border border-black/[0.12] bg-panel">
              <div className="relative flex h-[172px] items-center justify-center bg-[repeating-linear-gradient(135deg,rgba(20,19,17,0.07)_0_10px,rgba(20,19,17,0.03)_10px_20px)]">
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-muted">
                  {l.photoUrl ? "photo" : "no photo"}
                </span>
                <span className="absolute top-3 left-3 bg-header px-2.5 py-1 text-[9.5px] tracking-[0.14em] text-header-fg uppercase">
                  {l.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 px-[18px] py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[27px] leading-none">
                    {l.price ? `$${Math.round(l.price).toLocaleString()}` : "—"}
                  </span>
                  <span className="font-mono text-[10.5px] text-muted">MLS {l.mlsNumber || "—"}</span>
                </div>
                <div className="text-[13.5px] font-medium">{l.address}</div>
                <div className="text-[12.5px] text-muted">{l.specs}</div>
                {l.note && (
                  <div className="mt-auto border-t border-black/[0.07] pt-[11px] text-[11.5px] text-muted">
                    {l.note}
                  </div>
                )}
              </div>
            </article>
          ))}
          {!listings.length && (
            <div className="col-span-3">
              <EmptyNote>
                {entry
                  ? `No ${tab} listings logged for ${area} yet.`
                  : "No listings loaded. Enter an area and run the report, then add listings — photos, specs and MLS numbers appear here."}
              </EmptyNote>
            </div>
          )}
        </div>

        {userId && area && (
          <form
            action={addListing}
            className="flex flex-wrap items-end gap-4 border border-black/[0.12] bg-panel px-[26px] py-5"
          >
            <input type="hidden" name="area" value={area} />
            <input type="hidden" name="marketEntryId" value={entry?.id ?? ""} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Status</label>
              <select
                name="status"
                className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Address</label>
              <input name="address" required className="w-56 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">MLS #</label>
              <input name="mlsNumber" className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Price $</label>
              <input name="price" className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Specs</label>
              <input name="specs" placeholder="3bd/2ba · 1,850 sf" className="w-40 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Sold date</label>
              <input name="soldAt" type="date" className="border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink" />
            </div>
            <button
              type="submit"
              className="cursor-pointer border-none bg-ink px-4 py-2.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
            >
              Add listing
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-between gap-6 bg-header px-7 py-[26px] text-header-fg">
          <div className="max-w-[520px]">
            <div className="mb-1.5 font-serif text-[26px] leading-[1.15]">Hand this off</div>
            <div className="text-[13px] leading-[1.55] text-white/60">
              Export the area report as a client-ready PDF, or send the data set to Marketing
              Production to be built into a branded presentation.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="cursor-pointer border border-white/40 bg-transparent px-5 py-3.5 font-sans text-[10.5px] tracking-[0.14em] text-header-fg uppercase hover:border-accent hover:text-accent"
            >
              Download PDF
            </button>
            <button
              type="button"
              className="cursor-pointer border border-white/40 bg-transparent px-5 py-3.5 font-sans text-[10.5px] tracking-[0.14em] text-header-fg uppercase hover:border-accent hover:text-accent"
            >
              Share link with client
            </button>
            <GoldButton href="/marketing/presentations">Build presentation</GoldButton>
          </div>
        </div>
      </main>
    </>
  );
}
