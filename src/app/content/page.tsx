import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { EmptyNote, GoldButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const session = await auth();
  const userId = session?.user?.id;

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
            <div className="font-serif text-[34px] leading-none text-muted">No assets yet</div>
          </div>
          <GoldButton>Approve batch</GoldButton>
        </div>
        <div className="grid grid-cols-4 gap-[18px]">
          <div className="col-span-4">
            <EmptyNote>
              No content batch. Reels, carousels and captions appear here once a batch is
              drafted. This panel isn&apos;t wired to a content source yet — say the word if
              you want it connected to a specific tool.
            </EmptyNote>
          </div>
        </div>
      </main>
    </>
  );
}
