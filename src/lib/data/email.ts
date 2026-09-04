import { gmailClientFor } from "@/lib/google";

export type FlaggedThread = {
  id: string;
  subject: string;
  from: string;
  time: string;
};

export type EmailSummary = {
  connected: boolean;
  unreadCount: number | null;
  draftCount: number | null;
  flagged: FlaggedThread[];
};

// Contracts, negotiations and disputes get held back from auto-reply and
// routed to "needs my voice" — this heuristic mirrors that intent using a
// Gmail search query rather than a real auto-reply pipeline.
const NEEDS_VOICE_QUERY =
  "is:unread (contract OR negotiation OR counteroffer OR addendum OR dispute OR \"under contract\" OR closing)";

function decodeHeader(headers: { name?: string | null; value?: string | null }[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function getEmailSummary(userId: string): Promise<EmailSummary> {
  const gmail = await gmailClientFor(userId);
  if (!gmail) {
    return { connected: false, unreadCount: null, draftCount: null, flagged: [] };
  }

  const [unread, drafts, flagged] = await Promise.all([
    gmail.users.messages.list({ userId: "me", q: "is:unread", maxResults: 1 }),
    gmail.users.drafts.list({ userId: "me", maxResults: 1 }),
    gmail.users.messages.list({ userId: "me", q: NEEDS_VOICE_QUERY, maxResults: 5 }),
  ]);

  const flaggedMessages = flagged.data.messages ?? [];
  const details = await Promise.all(
    flaggedMessages.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      }),
    ),
  );

  return {
    connected: true,
    unreadCount: unread.data.resultSizeEstimate ?? 0,
    draftCount: drafts.data.resultSizeEstimate ?? 0,
    flagged: details.map((d) => {
      const headers = d.data.payload?.headers ?? [];
      const date = decodeHeader(headers, "Date");
      return {
        id: d.data.id!,
        subject: decodeHeader(headers, "Subject") || "(no subject)",
        from: decodeHeader(headers, "From"),
        time: date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      };
    }),
  };
}

export type InboxMessage = {
  id: string;
  subject: string;
  from: string;
  time: string;
  tag: "Flagged" | "Unread" | "Draft";
  color: string;
};

export async function getInboxQueue(userId: string, limit = 20): Promise<InboxMessage[]> {
  const gmail = await gmailClientFor(userId);
  if (!gmail) return [];

  const list = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults: limit,
  });
  const messages = list.data.messages ?? [];
  const flaggedList = await gmail.users.messages.list({
    userId: "me",
    q: NEEDS_VOICE_QUERY,
    maxResults: limit,
  });
  const flaggedIds = new Set((flaggedList.data.messages ?? []).map((m) => m.id));

  const details = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      }),
    ),
  );

  return details.map((d) => {
    const headers = d.data.payload?.headers ?? [];
    const date = decodeHeader(headers, "Date");
    const isFlagged = flaggedIds.has(d.data.id);
    return {
      id: d.data.id!,
      subject: decodeHeader(headers, "Subject") || "(no subject)",
      from: decodeHeader(headers, "From"),
      time: date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      tag: isFlagged ? "Flagged" : "Unread",
      color: isFlagged ? "#b98f4e" : "#7d7871",
    };
  });
}
