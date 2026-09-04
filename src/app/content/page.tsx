import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { EmptyNote } from "@/components/ui";
import { getContentIdeas } from "@/lib/data/content";
import { addContentIdea } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATE_COLOR: Record<string, string> = {
  Idea: "#7d7871",
  Drafted: "#b98f4e",
  Scheduled: "#b98f4e",
  Posted: "#141311",
};

export default async function ContentStudioPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const ideas = userId ? await getContentIdeas(userId) : [];

  const counts = {
    Reel: ideas.filter((i) => i.type === "Reel").length,
    Carousel: ideas.filter((i) => i.type === "Carousel").length,
    Caption: ideas.filter((i) => i.type === "Caption").length,
  };

  return (
    <>
      <Header
        title="Content Studio"
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="flex flex-col gap-6 px-11 pt-7 pb-[60px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">
              Batch · this week
            </div>
            <div className="font-serif text-[34px] leading-none">
              {ideas.length ? `${ideas.length} ideas` : "No assets yet"}
            </div>
            <div className="mt-1.5 text-[12.5px] text-muted">
              Reels {counts.Reel} · Carousels {counts.Carousel} · Captions {counts.Caption}
            </div>
          </div>
        </div>

        {userId && (
          <form
            action={addContentIdea}
            className="flex flex-wrap items-end gap-4 border border-black/[0.12] bg-panel px-6 py-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Type</label>
              <select
                name="type"
                className="w-32 border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
              >
                <option>Reel</option>
                <option>Carousel</option>
                <option>Caption</option>
              </select>
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Idea title</label>
              <input
                name="title"
                required
                placeholder="Kitchen reveal walkthrough"
                className="border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
              />
            </div>
            <div className="flex min-w-[280px] flex-[2] flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] text-muted uppercase">Script</label>
              <textarea
                name="script"
                rows={2}
                placeholder="Hook, body, call to action…"
                className="border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer border-none bg-ink px-4 py-2.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
            >
              Add idea
            </button>
          </form>
        )}

        <div className="grid grid-cols-4 gap-[18px]">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/content/${idea.id}`}
              className="flex flex-col border border-black/[0.12] bg-panel"
            >
              <div className="flex aspect-[4/5] items-center justify-center bg-[repeating-linear-gradient(135deg,rgba(20,19,17,0.07)_0_10px,rgba(20,19,17,0.03)_10px_20px)]">
                <span className="font-mono text-[10px] text-muted">{idea.type.toLowerCase()}</span>
              </div>
              <div className="flex flex-col gap-1.5 px-[15px] py-[13px]">
                <span className="text-[12.5px] leading-[1.25] font-medium">{idea.title}</span>
                <span
                  className="text-[10px] tracking-[0.14em] uppercase"
                  style={{ color: STATE_COLOR[idea.status] ?? "#7d7871" }}
                >
                  {idea.status}
                </span>
              </div>
            </Link>
          ))}
          {!ideas.length && (
            <div className="col-span-4">
              <EmptyNote>
                {userId
                  ? "No content batch yet. Add an idea above — click any card to read its full script."
                  : "No content batch. Reels, carousels and captions appear here once a batch is drafted."}
              </EmptyNote>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
