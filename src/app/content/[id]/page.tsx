import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { getContentIdea } from "@/lib/data/content";
import { updateContentStatus, deleteContentIdea } from "@/app/content/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["Idea", "Drafted", "Scheduled", "Posted"];

export default async function ContentIdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const idea = await getContentIdea(session.user.id, id);
  if (!idea) notFound();

  return (
    <>
      <Header
        title="Content Studio"
        showBack
        status={`Connected as ${session.user!.email}`}
        authSlot={<SignOutButton />}
      />
      <main className="grid grid-cols-[1fr_280px] items-start gap-6 px-11 pt-7 pb-[60px]">
        <div className="border border-black/[0.12] bg-panel p-[26px]">
          <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">{idea.type}</div>
          <div className="mb-5 font-serif text-[32px] leading-[1.1]">{idea.title}</div>
          <div className="mb-2.5 text-[10px] tracking-[0.16em] text-muted uppercase">Script</div>
          <div className="border border-black/[0.12] bg-page px-5 py-4 text-[14px] leading-[1.7] whitespace-pre-wrap text-ink">
            {idea.script || "No script written yet."}
          </div>
        </div>

        <aside className="flex flex-col gap-5 border border-black/[0.12] bg-panel p-6">
          <div>
            <div className="mb-2.5 text-[10px] tracking-[0.16em] text-muted uppercase">Status</div>
            <form action={updateContentStatus} className="flex flex-col gap-2.5">
              <input type="hidden" name="id" value={idea.id} />
              <select
                name="status"
                defaultValue={idea.status}
                className="border border-black/25 bg-transparent px-2.5 py-2 text-[13px] text-ink"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="cursor-pointer border-none bg-ink px-3 py-2.5 font-sans text-[10.5px] tracking-[0.14em] text-page uppercase hover:bg-accent"
              >
                Update status
              </button>
            </form>
          </div>
          <form action={deleteContentIdea}>
            <input type="hidden" name="id" value={idea.id} />
            <button
              type="submit"
              className="w-full cursor-pointer border border-black/25 bg-transparent px-3 py-2.5 font-sans text-[10.5px] tracking-[0.14em] text-muted uppercase hover:border-red-800 hover:text-red-800"
            >
              Delete idea
            </button>
          </form>
        </aside>
      </main>
    </>
  );
}
