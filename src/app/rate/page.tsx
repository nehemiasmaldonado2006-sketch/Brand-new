import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { PaymentCalculator } from "@/components/panels/PaymentCalculator";
import { getLatestRate, getRateHistory } from "@/lib/data/rate";
import { sparklinePoints } from "@/lib/chart";
import { logRate } from "./actions";

export const dynamic = "force-dynamic";

export default async function RateDeskPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [latest, history] = userId
    ? await Promise.all([getLatestRate(userId), getRateHistory(userId)])
    : [null, []];

  const chronological = [...history].reverse();
  const points30 = sparklinePoints(chronological.map((h) => h.rate30), 600, 160);
  const points15 = sparklinePoints(chronological.map((h) => h.rate15), 600, 160);

  return (
    <>
      <Header
        title="Rate Desk"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="grid grid-cols-[1fr_340px] items-start gap-6 px-11 pt-7 pb-[60px]">
        <div className="border border-black/[0.12] bg-panel p-[26px]">
          <div className="mb-[26px] flex gap-[52px]">
            <div>
              <div className="mb-1.5 text-[10px] tracking-[0.16em] text-muted uppercase">
                30-year fixed
              </div>
              <div className="font-serif text-[56px] leading-[0.95] text-muted">
                {latest ? `${latest.rate30.toFixed(3)}%` : "—"}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] tracking-[0.16em] text-muted uppercase">
                15-year fixed
              </div>
              <div className="font-serif text-[56px] leading-[0.95] text-muted">
                {latest ? `${latest.rate15.toFixed(3)}%` : "—"}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] tracking-[0.16em] text-muted uppercase">
                FHA 30
              </div>
              <div className="font-serif text-[56px] leading-[0.95] text-muted">
                {latest?.fha30 ? `${latest.fha30.toFixed(3)}%` : "—"}
              </div>
            </div>
          </div>
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="block h-[200px] w-full">
            <line x1="0" y1="159.5" x2="600" y2="159.5" stroke="rgba(20,19,17,0.12)" />
            <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(20,19,17,0.06)" />
            <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(20,19,17,0.06)" />
            {points30 && (
              <polyline points={points30} fill="none" stroke="#141311" strokeWidth="1.5" />
            )}
            {points15 && (
              <polyline points={points15} fill="none" stroke="#b98f4e" strokeWidth="1.5" />
            )}
          </svg>
          <div className="mt-3.5 flex gap-[22px] text-[11.5px] text-muted">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-3.5 bg-ink" />
              30-year
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-3.5 bg-accent" />
              15-year
            </span>
          </div>

          {userId && (
            <form action={logRate} className="mt-8 flex flex-wrap items-end gap-4 border-t border-black/[0.07] pt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  30-yr rate %
                </label>
                <input
                  name="rate30"
                  type="text"
                  required
                  defaultValue={latest?.rate30 ?? ""}
                  className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  15-yr rate %
                </label>
                <input
                  name="rate15"
                  type="text"
                  required
                  defaultValue={latest?.rate15 ?? ""}
                  className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  FHA 30 %
                </label>
                <input
                  name="fha30"
                  type="text"
                  defaultValue={latest?.fha30 ?? ""}
                  className="w-28 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer border-none bg-ink px-4 py-2.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
              >
                Log today&apos;s rate
              </button>
            </form>
          )}
        </div>

        <aside className="border border-black/[0.12] bg-panel p-6">
          <div className="mb-3.5 text-[10px] tracking-[0.16em] text-muted uppercase">
            Payment calculator
          </div>
          <PaymentCalculator
            defaultRate30={latest?.rate30 ?? null}
            defaultRate15={latest?.rate15 ?? null}
          />
          <button
            type="button"
            className="mt-[22px] w-full cursor-pointer border-none bg-ink px-3 py-3 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
          >
            Send buyer a rate sheet
          </button>
        </aside>
      </main>
    </>
  );
}
