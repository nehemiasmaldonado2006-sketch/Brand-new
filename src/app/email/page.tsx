import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { EmptyNote, DarkButton, OutlineButton } from "@/components/ui";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { getInboxQueue, getEmailSummary } from "@/lib/data/email";

export const dynamic = "force-dynamic";

export default async function EmailDeskPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [queue, summary] = userId
    ? await Promise.all([getInboxQueue(userId), getEmailSummary(userId)])
    : [[], null];

  return (
    <>
      <Header
        title="Email Desk"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="grid grid-cols-[1fr_320px] items-start gap-6 px-11 pt-7 pb-[60px]">
        <div className="border border-black/[0.12] bg-panel">
          <div className="flex items-center justify-between px-[26px] py-[18px]">
            <h3 className="m-0 font-serif text-[23px] font-semibold">Queue</h3>
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
              {summary ? `${summary.unreadCount ?? 0} unread · ${summary.draftCount ?? 0} drafts` : "— unread · — drafts"}
            </span>
          </div>
          <div className="h-px bg-black/[0.12]" />
          {queue.length ? (
            queue.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between gap-[18px] border-t border-black/[0.07] px-[26px] py-4 first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium">{e.subject}</div>
                  <div className="mt-[3px] text-[12.5px] text-muted">{e.from}</div>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span
                    className="text-[9.5px] tracking-[0.14em] uppercase"
                    style={{ color: e.color }}
                  >
                    {e.tag}
                  </span>
                  <span className="w-16 text-right text-[11.5px] text-muted">{e.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="border-t border-black/[0.07] px-[26px] py-8">
              <EmptyNote>
                {userId
                  ? "Inbox connected — no unread mail right now."
                  : "Inbox not connected. Unread mail, drafts awaiting approval and flagged threads appear here."}
              </EmptyNote>
            </div>
          )}
        </div>
        <aside className="border border-black/[0.12] bg-panel px-6 py-[22px]">
          <div className="mb-3.5 text-[10px] tracking-[0.16em] text-muted uppercase">
            Needs my voice
          </div>
          <div className="mb-[18px] text-[13px] leading-[1.6] text-muted">
            Contracts, negotiations and disputes are held back from auto-reply and routed here
            for your wording.
          </div>
          <div className="flex flex-col gap-2.5">
            <DarkButton>Review flagged</DarkButton>
            <OutlineButton>Approve drafts</OutlineButton>
          </div>
        </aside>
      </main>
    </>
  );
}
