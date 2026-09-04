import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { getTodaySummary } from "@/lib/data/calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const summary = userId ? await getTodaySummary(userId) : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header
        title="Calendar & Time"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="grid grid-cols-[1fr_320px] items-start gap-6 px-11 pt-7 pb-[60px]">
        <div className="border border-black/[0.12] bg-panel p-[26px]">
          <div className="mb-5 font-serif text-[30px]">{today}</div>
          {summary?.events.length ? (
            summary.events.map((ev) => (
              <div
                key={ev.id}
                className="grid grid-cols-[74px_1px_1fr] items-start border-t border-black/[0.07]"
              >
                <div className="py-[18px] font-serif text-[19px]">{ev.time}</div>
                <div className="h-full w-px bg-black/10" />
                <div className="py-[18px] pl-[18px]">
                  <div className="text-[14px] font-medium">{ev.title}</div>
                  {ev.location && (
                    <div className="mt-[3px] text-[12.5px] text-muted">{ev.location}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="border-t border-black/[0.07] pt-[26px] text-[12.5px] leading-[1.6] text-muted">
              {userId
                ? "No events today."
                : "No events today. Connect a calendar to see showings, closings and meetings with conflict warnings."}
            </div>
          )}
        </div>
        <aside className="border border-black/[0.12] bg-panel px-6 py-[22px]">
          <div className="mb-3.5 text-[10px] tracking-[0.16em] text-muted uppercase">
            Conflicts
          </div>
          {summary?.conflicts.length ? (
            <ul className="flex flex-col gap-2 text-[13px] leading-[1.5] text-ink">
              {summary.conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <div className="text-[13px] leading-[1.6] text-muted">No conflicts to review.</div>
          )}
        </aside>
      </main>
    </>
  );
}
