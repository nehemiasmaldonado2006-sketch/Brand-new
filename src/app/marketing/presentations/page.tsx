import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { MarketingTabs } from "@/components/MarketingTabs";
import { TemplateCoverThumb } from "@/components/marketing/TemplateCoverThumb";
import { PRESENTATION_TEMPLATES } from "@/lib/marketing/templates";
import { getHiddenTemplateKeys } from "@/lib/marketing/hidden";
import { hideTemplate } from "@/app/marketing/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PresentationsLibraryPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const hidden = userId ? await getHiddenTemplateKeys(userId) : new Set<string>();
  const templates = PRESENTATION_TEMPLATES.filter((t) => !hidden.has(t.key));

  return (
    <>
      <Header
        title="Marketing Production — Library"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="flex flex-col gap-[22px] px-11 pt-[26px] pb-[60px]">
        <MarketingTabs active="presentations" />

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">
              Premade library
            </div>
            <div className="font-serif text-[34px] leading-none">Presentations &amp; packets</div>
            <div className="mt-1.5 text-[12.5px] text-muted">
              Listing presentations, buyer presentations and packets. Every cover carries the
              team logo.
            </div>
          </div>
          <Link
            href="/marketing/studio/new?kind=presentation"
            className="cursor-pointer border-none bg-ink px-5 py-3.5 font-sans text-[10.5px] tracking-[0.14em] text-page uppercase hover:bg-accent"
          >
            Generate new
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-5">
          {templates.map((t) => (
            <article key={t.key} className="flex flex-col border border-black/[0.12] bg-panel">
              <TemplateCoverThumb t={t} />
              <div className="flex flex-1 flex-col gap-2.5 px-3.5 py-3">
                <div className="text-[12.5px] leading-[1.25] font-medium">{t.name}</div>
                <div className="text-[10px] tracking-[0.14em] text-muted uppercase">
                  {t.kicker}
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/marketing/studio/new?kind=presentation&template=${t.key}`}
                    className="flex-1 cursor-pointer border border-ink bg-transparent px-2 py-2 text-center font-sans text-[10px] tracking-[0.14em] text-ink uppercase hover:bg-ink hover:text-page"
                  >
                    Open
                  </Link>
                  {userId && (
                    <form action={hideTemplate}>
                      <input type="hidden" name="templateKey" value={t.key} />
                      <input type="hidden" name="returnTo" value="/marketing/presentations" />
                      <button
                        type="submit"
                        title="Remove from my library"
                        className="w-[34px] cursor-pointer border border-black/20 bg-transparent font-sans text-[13px] leading-none text-muted hover:border-red-800 hover:text-red-800"
                      >
                        ×
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
