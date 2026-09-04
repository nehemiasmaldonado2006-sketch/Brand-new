import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { PanelCard, Row, DarkButton, GoldButton, OutlineButton } from "@/components/ui";
import { EmailIcon, ContentIcon, CalendarIcon, MarketingIcon, RateIcon, MarketIcon } from "@/components/icons";
import { RateDeskPanel } from "@/components/panels/RateDeskPanel";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { getEmailSummary } from "@/lib/data/email";
import { getTodaySummary } from "@/lib/data/calendar";
import { getLatestRate } from "@/lib/data/rate";
import { getLatestMarketEntry } from "@/lib/data/market";
import { getContentIdeas } from "@/lib/data/content";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  const userId = session?.user?.id;

  const [email, calendar, rate, market, content] = userId
    ? await Promise.all([
        getEmailSummary(userId),
        getTodaySummary(userId),
        getLatestRate(userId),
        getLatestMarketEntry(userId),
        getContentIdeas(userId),
      ])
    : [null, null, null, null, []];

  const connected = Boolean(userId);

  return (
    <>
      <Header
        title="Mission Control"
        status={connected ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={connected ? <SignOutButton /> : <SignInButton />}
      />

      <main className="grid grid-cols-3 gap-[22px] px-11 pt-7 pb-[52px]">
        {/* Email Desk */}
        <PanelCard
          icon={<EmailIcon />}
          title="Email Desk"
          kicker="Inbox & approvals"
          badge={email?.connected ? "Connected" : "Not connected"}
          footer={email?.connected ? "Live via Gmail" : "No inbox connected"}
        >
          <Row label="Unread" value={email?.unreadCount ?? "—"} />
          <Row label="Drafts awaiting approval" value={email?.draftCount ?? "—"} soft={false} />
          <div className="flex flex-1 flex-col gap-2.5 pt-3.5">
            <div className="text-[10px] tracking-[0.16em] text-muted uppercase">
              Flagged — needs my voice
            </div>
            {email?.flagged.length ? (
              <ul className="flex flex-col gap-1.5">
                {email.flagged.slice(0, 3).map((f) => (
                  <li key={f.id} className="truncate text-[12.5px] text-ink">
                    {f.subject}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-[12.5px] leading-[1.55] text-muted">
                {email?.connected
                  ? "Nothing flagged right now."
                  : "Nothing flagged. Contracts, negotiations and disputes will appear here once the inbox is connected."}
              </div>
            )}
          </div>
          <DarkButton href="/email" className="mt-4">
            Open Email Desk
          </DarkButton>
        </PanelCard>

        {/* Content Studio */}
        <PanelCard
          icon={<ContentIcon />}
          title="Content Studio"
          kicker="This week"
          badge={content.length ? `${content.length} ideas` : "No batch"}
          footer={content.length ? "Manually logged" : "No content source"}
        >
          <Row label="Reels" value={content.filter((c) => c.type === "Reel").length || "—"} />
          <Row label="Carousels" value={content.filter((c) => c.type === "Carousel").length || "—"} />
          <Row
            label="Captions"
            value={content.filter((c) => c.type === "Caption").length || "—"}
            soft={false}
          />
          <div className="flex flex-1 flex-col gap-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
                Batch completion
              </span>
              <span className="text-[11px] text-muted">
                {content.length
                  ? `${Math.round((content.filter((c) => c.status === "Posted").length / content.length) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div className="h-1 bg-black/[0.09]">
              {content.length > 0 && (
                <div
                  className="h-1 bg-accent"
                  style={{
                    width: `${Math.round((content.filter((c) => c.status === "Posted").length / content.length) * 100)}%`,
                  }}
                />
              )}
            </div>
            <div className="mt-1 text-[12px] text-muted">
              {content.length ? `${content.length} ideas logged` : "No batch scheduled"}
            </div>
          </div>
          <DarkButton href="/content" className="mt-4">
            Open Content Studio
          </DarkButton>
        </PanelCard>

        {/* Calendar & Time */}
        <PanelCard
          icon={<CalendarIcon />}
          title="Calendar & Time"
          kicker="Today"
          badge={calendar?.connected ? "Connected" : "No calendar"}
          footer={calendar?.connected ? "Live via Google Calendar" : "No calendar connected"}
        >
          <div className="flex flex-1 flex-col">
            {calendar?.events.length ? (
              <ul className="flex flex-1 flex-col gap-2 text-[12.5px]">
                {calendar.events.slice(0, 4).map((ev) => (
                  <li key={ev.id} className="flex items-baseline justify-between gap-3">
                    <span className="truncate">{ev.title}</span>
                    <span className="flex-none text-muted">{ev.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 text-[12.5px] leading-[1.55] text-muted">
                {calendar?.connected
                  ? "No events today."
                  : "No events today. Showings, closings and meetings appear here once a calendar is connected."}
              </div>
            )}
          </div>
          <DarkButton href="/calendar" className="mt-4">
            Open Calendar
          </DarkButton>
        </PanelCard>

        {/* Marketing Production */}
        <PanelCard
          icon={<MarketingIcon />}
          title="Marketing Production"
          kicker="Templates & jobs"
          badge="No active jobs"
          footer="No jobs in production"
        >
          <div className="flex items-center justify-between gap-3 pb-3.5">
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium">Flyers</div>
              <div className="text-[12px] text-muted">15 premade · new from blank</div>
            </div>
            <OutlineButton href="/marketing/flyers" className="flex-none">
              Open
            </OutlineButton>
          </div>
          <div className="h-px bg-black/[0.07]" />
          <div className="flex items-center justify-between gap-3 py-3.5">
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium">Presentations</div>
              <div className="text-[12px] text-muted">15 premade · listing &amp; buyer packets</div>
            </div>
            <OutlineButton href="/marketing/presentations" className="flex-none">
              Open
            </OutlineButton>
          </div>
          <div className="h-px bg-black/[0.07]" />
          <div className="flex items-center justify-between gap-3 py-3.5">
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium">CMA</div>
              <div className="text-[12px] text-muted">15 premade · comps &amp; pricing</div>
            </div>
            <OutlineButton href="/marketing/cma" className="flex-none">
              Open
            </OutlineButton>
          </div>
          <div className="h-px bg-black/[0.07]" />
          <div className="flex flex-1 items-baseline justify-between pt-4">
            <span className="text-[12px] text-muted">Delivered this week</span>
            <span className="font-serif text-[28px] leading-none text-muted">—</span>
          </div>
        </PanelCard>

        {/* Rate Desk */}
        <PanelCard
          icon={<RateIcon />}
          title="Rate Desk"
          kicker="Conventional"
          badge={rate ? "Logged" : "No feed"}
          footer={
            <div className="flex items-center justify-between gap-3">
              <span>{rate ? "Manually logged" : "No rate feed"}</span>
              <a
                href="/rate"
                className="border-b border-accent font-sans text-[11px] tracking-[0.14em] text-ink normal-case hover:text-accent"
              >
                Rate detail
              </a>
            </div>
          }
        >
          <RateDeskPanel rate30={rate?.rate30 ?? null} rate15={rate?.rate15 ?? null} />
        </PanelCard>

        {/* Market Desk */}
        <PanelCard
          icon={<MarketIcon />}
          title="Market Desk"
          kicker="Metro"
          badge={market ? "Logged" : "No MLS feed"}
          footer={market ? "Manually logged" : "No MLS connected"}
        >
          <div className="flex flex-1 flex-col gap-[15px]">
            <div className="flex gap-[34px]">
              <div>
                <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">
                  Median price
                </div>
                <div className="font-serif text-[40px] leading-[0.95] font-medium text-muted">
                  {market?.medianList ? `$${Math.round(market.medianList).toLocaleString()}` : "—"}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">
                  Days on market
                </div>
                <div className="font-serif text-[40px] leading-[0.95] font-medium text-muted">
                  {market?.daysOnMarket ?? "—"}
                </div>
              </div>
            </div>
            <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="block h-[60px] w-full">
              <line x1="0" y1="59.5" x2="300" y2="59.5" stroke="rgba(20,19,17,0.12)" strokeWidth="1" />
            </svg>
            <div className="flex items-baseline justify-between gap-3 border-t border-black/[0.07] pt-3.5">
              <span className="text-[12.5px] text-muted">Active inventory · months of supply</span>
              <span className="font-serif text-[24px] text-muted">
                {market?.monthsSupply ?? "—"}
              </span>
            </div>
            <GoldButton href="/market" className="mt-auto">
              Search an area
            </GoldButton>
          </div>
        </PanelCard>
      </main>
    </>
  );
}
