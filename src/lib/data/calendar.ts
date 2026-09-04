import { calendarClientFor } from "@/lib/google";

export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  startMs: number;
  endMs: number;
  location?: string;
};

export type CalendarSummary = {
  connected: boolean;
  events: CalendarEvent[];
  conflicts: string[];
};

function fmtTime(iso?: string | null) {
  if (!iso) return "All day";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function getTodaySummary(userId: string): Promise<CalendarSummary> {
  const calendar = await calendarClientFor(userId);
  if (!calendar) return { connected: false, events: [], conflicts: [] };

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 25,
  });

  const events: CalendarEvent[] = (res.data.items ?? []).map((e) => {
    const startIso = e.start?.dateTime ?? e.start?.date ?? null;
    const endIso = e.end?.dateTime ?? e.end?.date ?? null;
    return {
      id: e.id!,
      title: e.summary || "(untitled)",
      time: fmtTime(startIso),
      startMs: startIso ? new Date(startIso).getTime() : 0,
      endMs: endIso ? new Date(endIso).getTime() : 0,
      location: e.location ?? undefined,
    };
  });

  const conflicts: string[] = [];
  const timed = events.filter((e) => e.startMs && e.endMs).sort((a, b) => a.startMs - b.startMs);
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].startMs < timed[i - 1].endMs) {
      conflicts.push(`${timed[i - 1].title} overlaps with ${timed[i].title}`);
    }
  }

  return { connected: true, events, conflicts };
}
